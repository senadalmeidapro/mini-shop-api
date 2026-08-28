import { IsOptional, IsString } from 'class-validator';

export class AddressDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  city!: string;

  @IsString()
  country!: string;

  @IsString()
  @IsOptional()
  zip?: string;
}
