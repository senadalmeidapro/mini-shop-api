import { IsDecimal, IsEnum } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsEnum(['pending', 'cancelled', 'completed'])
  status: 'pending' | 'cancelled' | 'completed' = 'pending';

  @IsDecimal()
  total!: number;

  @IsEnum(CreateOrderItemDto)
  orderItems!: CreateOrderItemDto[];
}
