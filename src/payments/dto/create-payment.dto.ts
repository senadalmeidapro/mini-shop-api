import { IsEnum } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsEnum([PaymentStatus.PENDING, PaymentStatus.SUCCEEDED, PaymentStatus.FAILED])
  status: PaymentStatus = PaymentStatus.PENDING;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
