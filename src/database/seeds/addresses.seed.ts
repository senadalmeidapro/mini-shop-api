import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../users/entities/address.entity';
export async function seedAddresses(ds: DataSource): Promise<Address[]> {
  const users = await ds.getRepository(User).find();
  const repo = ds.getRepository(Address);
  const addresses = repo.create([
    {
      userId: users[0]?.id ?? '',
      street: 'Rue 125, Quartier Zongo',
      city: 'Cotonou',
      country: 'Bénin',
      zip: '01 BP 1234',
    },
    {
      userId: users[0]?.id ?? '',
      street: 'Rue 456, Quartier Haie Vive',
      city: 'Cotonou',
      country: 'Bénin',
      zip: '01 BP 2345',
    },
    {
      userId: users[1]?.id ?? '',
      street: 'Rue du Marché, Quartier Gbèdjromèdé',
      city: 'Porto-Novo',
      country: 'Bénin',
      zip: '01 BP 3456',
    },
    {
      userId: users[2]?.id ?? '',
      street: 'Rue 789, Quartier Agla',
      city: 'Abomey-Calavi',
      country: 'Bénin',
      zip: '01 BP 4567',
    },
  ]);
  return repo.save(addresses);
}
