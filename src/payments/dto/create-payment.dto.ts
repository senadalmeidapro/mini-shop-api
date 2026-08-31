import { IsEnum } from 'class-validator';

export class CreatePaymentDto {
  @IsEnum(['pending', 'succeeded', 'failed'])
  status: 'pending' | 'succeeded' | 'failed' = 'pending';

  @IsEnum(['card', 'paypal', 'crypto'])
  method!: 'card' | 'paypal' | 'crypto';
}
