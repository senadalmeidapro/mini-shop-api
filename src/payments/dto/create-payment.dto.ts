import { IsDecimal, IsEnum } from 'class-validator';

export class CreatePaymentDto {
  @IsDecimal()
  amount!: number;

  @IsEnum(['pending', 'succeeded', 'failed', 'cancelled'])
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled' = 'pending';

  @IsEnum(['card', 'paypal', 'crypto'])
  method!: 'card' | 'paypal' | 'crypto';
}
