import { AppDataSource } from '../config/database.ts';
import { BaseRepository } from '../database/BaseRepository.ts';
import { User } from '../entities/User.ts';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(AppDataSource.getRepository(User));
  }
}
