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
import { DataSource, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly order: Repository<Order>,

    @InjectRepository(Product)
    private readonly product: Repository<Product>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { orderItems, ...data } = createOrderDto;
    const order = this.order.create({ ...data, orderItems: orderItems.map((ci) => ({ ...ci })) });

    return await this.order.save(order);
  }

  async findAll(admin: boolean = false, userId: string) {
    if (admin) {
      return await this.order.find();
    }
    return await this.order.find({ where: { userId } });
  }

  async findOne(id: string, userId: string, admin: boolean = false) {
    const existingOrder = await this.order.findOneBy({ id });
    if (!existingOrder) throw new NotFoundException('Order not found');

    if (!admin && existingOrder.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this order');
    }

    return existingOrder;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, userId: string) {
    const existingOrder = await this.order.findOneBy({ id });
    if (!existingOrder) throw new NotFoundException('Order not found');

    if (existingOrder.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this order');
    }

    if (existingOrder.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be updated');
    }

    await this.order.update(id, updateOrderDto);
    return await this.order.findOneBy({ id });
  }

  async cancelOrder(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const existingOrder = await manager.findOne(Order, {
        where: { id },
        relations: { orderItems: true },
      });
      if (!existingOrder) throw new NotFoundException('Order not found');

      if (existingOrder.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Only pending orders can be cancelled');
      }

      for (const item of existingOrder.orderItems) {
        await manager.increment(Product, { id: item.productId }, 'stock', item.quantity);
      }

      existingOrder.status = OrderStatus.CANCELLED;
      return manager.save(Order, existingOrder);
    });
  }
}
