import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, ''),
  email: z.email('Invalid adress email'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
    ),
  role: z.enum(['user', 'manager', 'admin']).default('user'),
});
