import { In } from 'typeorm';
import type { z } from 'zod';

import { OrderRepository } from '../repositories/order.repository.ts';
import { orderSchema } from '../schema/order.schema.ts';
import type { QueryOptions } from '../database/query.types.ts';
import type { Order } from '../entities/Order.ts';

type OrderInput = z.infer<typeof orderSchema>;

export class OrderService {
  private readonly order: OrderRepository;

  constructor() {
    this.order = new OrderRepository();
  }

  async createOrder(data: OrderInput) {
    return this.order.create(data);
  }

  async createOrders(data: OrderInput[]) {
    return this.order.createMany(data);
  }

  async getOrder(id: number) {
    return this.order.findOne({ where: { id } });
  }

  async getOrders(option: QueryOptions<Order>) {
    return this.order.findPaginated(option);
  }

  async updateOrder(id: number, data: Partial<OrderInput>) {
    return this.order.update({ id }, data);
  }

  async updateOrders(ids: number[], data: Partial<OrderInput>) {
    return this.order.updateMany({ id: In(ids) }, data);
  }

  async deleteOrder(id: number) {
    return this.order.delete({ id });
  }

  async deleteOrders(ids: number[]) {
    return this.order.deleteMany({ id: In(ids) });
  }
}
