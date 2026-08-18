import { In } from 'typeorm';
import type { z } from 'zod';

import { UserRepository } from '../repositories/user.repository.ts';
import { userSchema } from '../schema/user.schema.ts';
import type { QueryOptions } from '../database/query.types.ts';
import type { User } from '../entities/User.ts';

type UserInput = z.infer<typeof userSchema>;

export class UserService {
  private readonly user: UserRepository;

  constructor() {
    this.user = new UserRepository();
  }

  async createUser(data: UserInput) {
    return this.user.create(data);
  }

  async createUsers(data: UserInput[]) {
    return this.user.createMany(data);
  }

  async getUser(id: number) {
    return this.user.findOne({ where: { id } });
  }

  async getUsers(option: QueryOptions<User>) {
    return this.user.findPaginated(option);
  }

  async updateUser(id: number, data: Partial<UserInput>) {
    return this.user.update({ id }, data);
  }

  async updateUsers(ids: number[], data: Partial<UserInput>) {
    return this.user.updateMany({ id: In(ids) }, data);
  }

  async deleteUser(id: number) {
    return this.user.delete({ id });
  }

  async deleteUsers(ids: number[]) {
    return this.user.deleteMany({ id: In(ids) });
  }
}
