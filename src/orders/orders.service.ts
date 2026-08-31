import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
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

  create(createOrderDto: CreateOrderDto) {
    const { orderItems, ...data } = createOrderDto;
    const order = this.order.create({ ...data, orderItems: orderItems.map((ci) => ({ ...ci })) });

    return this.dataSource.transaction(async (manager) => {
      const savedOrder = await manager.save(Order, order);

      for (const item of savedOrder.orderItems) {
        const result = await manager.decrement(
          Product,
          { id: item.productId, stock: MoreThanOrEqual(item.quantity) },
          'stock',
          item.quantity,
        );

        if (result.affected === 0) {
          throw new BadRequestException(`Insufficient stock for product ${item.productId}`);
        }
      }

      return savedOrder;
    });
  }

  async findAll() {
    return await this.order.find();
  }

  async findOne(id: string, userId: string) {
    const existingOrder = await this.order.findOneBy({ id });
    if (!existingOrder) throw new NotFoundException('Order not found');

    if (existingOrder.userId != userId) {
      throw new ForbiddenException('Yu are not the owner of this order');
    }

    return existingOrder;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, userId: string) {
    const existingOrder = await this.order.findOneBy({ id });
    if (!existingOrder) throw new NotFoundException('Order not found');

    if (existingOrder.userId != userId) {
      throw new ForbiddenException('Yu are not the owner of this order');
    }

    await this.order.update(id, updateOrderDto);
    return await this.order.findOneBy({ id });
  }
}
