import { AppDataSource } from '../config/database.ts';
import { BaseRepository } from '../database/BaseRepository.ts';
import { Payment } from '../entities/Payment.ts';

export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super(AppDataSource.getRepository(Payment));
  }
}
