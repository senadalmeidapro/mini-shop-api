import { AppDataSource } from '../config/database.ts';
import { BaseRepository } from '../database/BaseRepository.ts';
import { Order } from '../entities/Order.ts';

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(AppDataSource.getRepository(Order));
  }
}
