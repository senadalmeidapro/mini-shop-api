import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class ShippingAddressDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  zip?: string;
}

export class CreatePaymentDto {
  @IsEnum([PaymentStatus.PENDING, PaymentStatus.SUCCEEDED, PaymentStatus.FAILED])
  @IsOptional()
  status: PaymentStatus = PaymentStatus.PENDING;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;
}
