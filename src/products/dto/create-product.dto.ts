import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  price!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  stock!: number;
}
