import { Type } from 'class-transformer';
import { IsArray, IsDecimal, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsEnum([OrderStatus.PENDING, OrderStatus.CANCELLED, OrderStatus.COMPLETED])
  @IsOptional()
  status: OrderStatus = OrderStatus.PENDING;

  @IsDecimal()
  total!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems!: CreateOrderItemDto[];

  @IsOptional()
  shippingAddress?: Record<string, string>;
}
