import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  rating!: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
