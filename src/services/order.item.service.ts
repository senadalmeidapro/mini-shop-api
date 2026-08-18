import { In } from 'typeorm';
import type { z } from 'zod';

import { OrderItemRepository } from '../repositories/order.item.repository.ts';
import { orderItemSchema } from '../schema/orderItem.schema.ts';
import type { QueryOptions } from '../database/query.types.ts';
import type { OrderItem } from '../entities/OrderItem.ts';

type OrderItemInput = z.infer<typeof orderItemSchema>;

export class OrderItemService {
  private readonly orderItem: OrderItemRepository;

  constructor() {
    this.orderItem = new OrderItemRepository();
  }

  async createOrderItem(data: OrderItemInput) {
    return this.orderItem.create(data);
  }

  async createOrderItems(data: OrderItemInput[]) {
    return this.orderItem.createMany(data);
  }

  async getOrderItem(id: number) {
    return this.orderItem.findOne({ where: { id } });
  }

  async getOrderItems(option: QueryOptions<OrderItem>) {
    return this.orderItem.findPaginated(option);
  }

  async updateOrderItem(id: number, data: Partial<OrderItemInput>) {
    return this.orderItem.update({ id }, data);
  }

  async updateOrderItems(ids: number[], data: Partial<OrderItemInput>) {
    return this.orderItem.updateMany({ id: In(ids) }, data);
  }

  async deleteOrderItem(id: number) {
    return this.orderItem.delete({ id });
  }

  async deleteOrderItems(ids: number[]) {
    return this.orderItem.deleteMany({ id: In(ids) });
  }
}
