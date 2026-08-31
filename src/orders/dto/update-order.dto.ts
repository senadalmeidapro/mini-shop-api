import { IsEnum } from 'class-validator';

export class UpdateOrderDto {
  @IsEnum(['completed'])
  status!: 'completed';
}
