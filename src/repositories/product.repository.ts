import { AppDataSource } from '../config/database.ts';
import { BaseRepository } from '../database/BaseRepository.ts';
import { Product } from '../entities/Product.ts';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(AppDataSource.getRepository(Product));
  }
}
