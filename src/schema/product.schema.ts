import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  price: z.number().int().positive(),
  stock: z.number().int().positive(),
  isActive: z.boolean().default(true),
});
