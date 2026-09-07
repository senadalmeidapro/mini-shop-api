import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../users/entities/address.entity';

export async function seedAddresses(ds: DataSource): Promise<Address[]> {
  const users = await ds.getRepository(User).find();
  const repo = ds.getRepository(Address);

  const addresses = repo.create([
    {
      userId: users[0]?.id ?? '',
      street: '1 Main Street',
      city: 'New York',
      country: 'USA',
      zip: '10001',
    },
    {
      userId: users[0]?.id ?? '',
      street: '2 Second Avenue',
      city: 'Brooklyn',
      country: 'USA',
      zip: '11201',
    },
    {
      userId: users[1]?.id ?? '',
      street: '10 Rue de la Paix',
      city: 'Paris',
      country: 'France',
      zip: '75002',
    },
    {
      userId: users[2]?.id ?? '',
      street: '5 Karl-Marx-Strasse',
      city: 'Berlin',
      country: 'Germany',
      zip: '10178',
    },
  ]);

  return repo.save(addresses);
}
