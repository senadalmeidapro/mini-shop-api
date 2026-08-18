import { AppDataSource } from '../config/database.ts';
import { BaseRepository } from '../database/BaseRepository.ts';
import { OrderItem } from '../entities/OrderItem.ts';

export class OrderItemRepository extends BaseRepository<OrderItem> {
  constructor() {
    super(AppDataSource.getRepository(OrderItem));
  }
}
