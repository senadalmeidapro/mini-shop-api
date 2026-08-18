import { z } from 'zod';

export const orderSchema = z.object({
  status: z.enum(['pending', 'canceled', 'completed']).default('pending'),
  totalAmount: z.number().int().positive(),
});
