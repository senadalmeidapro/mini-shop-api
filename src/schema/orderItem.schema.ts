import { z } from 'zod';

export const orderItemSchema = z.object({
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().positive(),
});
