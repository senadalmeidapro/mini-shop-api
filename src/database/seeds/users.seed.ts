import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/entities/user.entity';

export async function seedUsers(ds: DataSource): Promise<User[]> {
  const repo = ds.getRepository(User);

  const password = await bcrypt.hash('Password!123', 10);

  const users = repo.create([
    {
      email: 'admin@minishop.com',
      password,
      fullName: 'Admin Principal',
      emailVerified: true,
      role: UserRole.ADMIN,
    },
    {
      email: 'johndoe@minishop.com',
      password,
      fullName: 'John Doe',
      emailVerified: true,
      role: UserRole.USER,
    },
    {
      email: 'janedoe@minishop.com',
      password,
      fullName: 'Jane Doe',
      emailVerified: true,
      role: UserRole.USER,
    },
    {
      email: 'bob@minishop.com',
      password,
      fullName: 'Bob Martin',
      emailVerified: true,
      role: UserRole.USER,
    },
    {
      email: 'alice@minishop.com',
      password,
      fullName: 'Alice Cooper',
      emailVerified: true,
      role: UserRole.USER,
    },
  ]);

  return repo.save(users);
}
