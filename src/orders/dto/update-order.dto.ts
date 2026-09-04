import { IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @IsEnum([OrderStatus.COMPLETED])
  status: OrderStatus = OrderStatus.COMPLETED;
}
