import { IsInt, Min } from 'class-validator';

export class CreateCartItemDto {
  @IsInt()
  @Min(1)
  quantity!: number;
}
