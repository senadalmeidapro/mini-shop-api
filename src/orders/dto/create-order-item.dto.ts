import { IsDecimal, IsInt, IsString, IsUUID } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  @IsUUID()
  productId!: string;

  @IsInt()
  quantity!: number;

  @IsDecimal()
  unitPrice!: number;
}
