import { AppDataSource } from '../config/database.ts';
import { BaseRepository } from '../database/BaseRepository.ts';
import { Address } from '../entities/Address.ts';

export class AddressRepository extends BaseRepository<Address> {
  constructor() {
    super(AppDataSource.getRepository(Address));
  }
}
