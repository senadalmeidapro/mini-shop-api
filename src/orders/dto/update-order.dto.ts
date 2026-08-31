import { IsEnum } from 'class-validator';

export class UpdateOrderDto {
  @IsEnum(['cancelled', 'completed'])
  status!: 'cancelled' | 'completed';
}
