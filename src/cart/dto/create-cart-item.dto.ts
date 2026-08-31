import { IsInt } from 'class-validator';

export class CreateCartItemDto {
  @IsInt()
  quantity!: number;
}
