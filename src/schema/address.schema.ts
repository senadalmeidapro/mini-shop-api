import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(2),
  city: z.string().min(2),
  country: z.string().min(2),
  postal_code: z.string().min(4).max(6),
});
