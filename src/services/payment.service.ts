import { In } from 'typeorm';
import type { z } from 'zod';

import { PaymentRepository } from '../repositories/payment.repository.ts';
import { paymentSchema } from '../schema/payment.schema.ts';
import type { QueryOptions } from '../database/query.types.ts';
import type { Payment } from '../entities/Payment.ts';

type PaymentInput = z.infer<typeof paymentSchema>;

export class PaymentService {
  private readonly payment: PaymentRepository;

  constructor() {
    this.payment = new PaymentRepository();
  }

  async createPayment(data: PaymentInput) {
    return this.payment.create(data);
  }

  async createPayments(data: PaymentInput[]) {
    return this.payment.createMany(data);
  }

  async getPayment(id: number) {
    return this.payment.findOne({ where: { id } });
  }

  async getPayments(option: QueryOptions<Payment>) {
    return this.payment.findPaginated(option);
  }

  async updatePayment(id: number, data: Partial<PaymentInput>) {
    return this.payment.update({ id }, data);
  }

  async updatePayments(ids: number[], data: Partial<PaymentInput>) {
    return this.payment.updateMany({ id: In(ids) }, data);
  }

  async deletePayment(id: number) {
    return this.payment.delete({ id });
  }

  async deletePayments(ids: number[]) {
    return this.payment.deleteMany({ id: In(ids) });
  }
}
