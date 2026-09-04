import { IsDecimal, IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsEnum([OrderStatus.PENDING, OrderStatus.CANCELLED, OrderStatus.COMPLETED])
  status: OrderStatus = OrderStatus.PENDING;

  @IsDecimal()
  total!: number;

  @IsEnum(CreateOrderItemDto)
  orderItems!: CreateOrderItemDto[];
}
