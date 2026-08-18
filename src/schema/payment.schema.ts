import { z } from 'zod';

export const paymentSchema = z.object({
  amount: z.number().int().positive(),
  status: z.enum(['pending', 'canceled', 'completed']).default('pending'),
  method: z.enum(['card', 'paypal', 'stripe']),
});
