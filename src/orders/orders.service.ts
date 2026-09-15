import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';
import { PaginationDto, PaginatedResult, buildPaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly order: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItem: Repository<OrderItem>,

    @InjectRepository(Product)
    private readonly product: Repository<Product>,

    @InjectRepository(Shop)
    private readonly shop: Repository<Shop>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const { orderItems, ...data } = createOrderDto;
    const order = this.order.create({
      ...data,
      userId,
      orderItems: orderItems.map((ci) => ({ ...ci })),
    });
    return await this.order.save(order);
  }

  async findAll(
    userId: string,
    role: 'user' | 'admin',
    pagination: PaginationDto = {},
  ): Promise<PaginatedResult<Order>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    if (role === 'admin') {
      const [data, total] = await this.order.findAndCount({
        relations: { user: true, orderItems: true },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      return buildPaginatedResult(data, total, page, limit);
    }

    // Supplier: orders that contain products from their shop
    const shop = await this.shop.findOneBy({ ownerId: userId });
    if (shop) {
      const supplierOrderIds = await this.orderItem
        .createQueryBuilder('oi')
        .innerJoin('oi.product', 'p')
        .select('oi.order_id', 'orderId')
        .where('p.shop_id = :shopId', { shopId: shop.id })
        .distinct(true)
        .getRawMany<{ orderId: string }>();

      if (supplierOrderIds.length === 0) {
        return buildPaginatedResult([], 0, page, limit);
      }

      const [data, total] = await this.order.findAndCount({
        where: { id: In(supplierOrderIds.map((o) => o.orderId)) },
        relations: { orderItems: { product: true }, user: true },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      return buildPaginatedResult(data, total, page, limit);
    }

    // Customer: own orders
    const [data, total] = await this.order.findAndCount({
      where: { userId },
      relations: { orderItems: { product: true } },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string, userId: string, role: 'user' | 'admin') {
    const order = await this.order.findOne({
      where: { id },
      relations: { orderItems: { product: true }, user: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (role === 'admin') return order;
    if (order.userId === userId) return order;

    // Supplier: check if order contains their shop products
    const shop = await this.shop.findOneBy({ ownerId: userId });
    if (shop) {
      const hasShopProduct = order.orderItems.some((i) => i.product?.shopId === shop.id);
      if (hasShopProduct) return order;
    }

    throw new ForbiddenException('Access denied');
  }

  async update(id: string, userId: string, role: 'user' | 'admin', dto: UpdateOrderDto) {
    const order = await this.order.findOne({
      where: { id },
      relations: { orderItems: { product: true } },
    });
    if (!order) throw new NotFoundException('Order not found');

    const shop = role !== 'admin' ? await this.shop.findOneBy({ ownerId: userId }) : null;
    const isSupplier = !!shop && order.orderItems.some((i) => i.product?.shopId === shop.id);
    const isOwner = order.userId === userId;

    if (role !== 'admin' && !isOwner && !isSupplier) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.status) {
      this.validateStatusTransition(order.status, dto.status, { isOwner, isSupplier });
    }

    // L'annulation restitue toujours le stock réservé (transactionnel)
    if (dto.status === OrderStatus.CANCELLED) {
      await this.cancelWithRestock(id);
      return await this.findOne(id, userId, role);
    }

    const updateData: {
      status?: OrderStatus;
      trackingNumber?: string;
      shippedAt?: Date;
      deliveredAt?: Date;
    } = {};

    if (dto.status) {
      updateData.status = dto.status;
    }
    if (dto.trackingNumber) {
      updateData.trackingNumber = dto.trackingNumber;
      updateData.shippedAt = new Date();
    }
    if (dto.status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    await this.order.update(id, updateData);
    return await this.order.findOne({
      where: { id },
      relations: { orderItems: { product: true }, user: true },
    });
  }

  async cancelOrder(id: string) {
    return this.cancelWithRestock(id);
  }

  private async cancelWithRestock(orderId: string) {
    return this.dataSource.transaction(async (manager) => {
      const existingOrder = await manager.findOne(Order, {
        where: { id: orderId },
        relations: { orderItems: true },
      });
      if (!existingOrder) throw new NotFoundException('Order not found');

      if (
        existingOrder.status === OrderStatus.CANCELLED ||
        existingOrder.status === OrderStatus.COMPLETED
      ) {
        throw new BadRequestException('Order cannot be cancelled');
      }

      for (const item of existingOrder.orderItems) {
        await manager.increment(Product, { id: item.productId }, 'stock', item.quantity);
      }

      existingOrder.status = OrderStatus.CANCELLED;
      return manager.save(Order, existingOrder);
    });
  }

  private validateStatusTransition(
    current: OrderStatus,
    next: OrderStatus,
    ctx: { isOwner: boolean; isSupplier: boolean },
  ) {
    const allowed: Record<string, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const transitions = allowed[current] ?? [];
    if (!transitions.includes(next)) {
      throw new BadRequestException(`Cannot transition from "${current}" to "${next}"`);
    }

    // Customer can only cancel pending orders
    if (ctx.isOwner && !ctx.isSupplier && next !== OrderStatus.CANCELLED) {
      throw new ForbiddenException('Customers can only cancel orders');
    }
  }
}
