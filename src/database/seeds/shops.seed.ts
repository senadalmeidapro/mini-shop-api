import { DataSource } from 'typeorm';

import { User, UserRole } from '../../users/entities/user.entity';
import { Shop } from '../../shops/entities/shop.entity';

export async function seedShops(ds: DataSource, users: User[]): Promise<Shop[]> {
  const userRepo = ds.getRepository(User);
  const shopRepo = ds.getRepository(Shop);

  const byEmail = (email: string) => users.find((u) => u.email === email)?.id ?? '';

  const shopSpecs = [
    {
      ownerId: byEmail('johndoe@minishop.com'),
      name: 'TechStore',
      slug: 'techstore',
      description: 'Électronique et high-tech.',
    },
    {
      ownerId: byEmail('janedoe@minishop.com'),
      name: 'Lifestyle & Books',
      slug: 'lifestyle-books',
      description: 'Mode, livres, maison et sport.',
    },
  ];

  for (const spec of shopSpecs) {
    if (spec.ownerId) {
      await userRepo.update(spec.ownerId, { role: UserRole.SUPPLIER });
    }
  }

  const shops = shopRepo.create(shopSpecs);
  return shopRepo.save(shops);
}
