import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @IsEnum([
    OrderStatus.CONFIRMED,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
    OrderStatus.COMPLETED,
  ])
  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  trackingNumber?: string;
}
