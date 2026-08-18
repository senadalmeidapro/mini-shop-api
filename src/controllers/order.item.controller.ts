import type { NextFunction, Request, Response } from 'express';
import { OrderItemService } from '../services/order.item.service.ts';

export class OrderItemController {
  private readonly orderItem: OrderItemService;

  constructor() {
    this.orderItem = new OrderItemService();
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const orderItem = await this.orderItem.createOrderItem(req.validated.body);

      return res.status(201).json(orderItem);
    } catch (error) {
      next(error);
    }
  }

  async createMany(req: Request, res: Response, next: NextFunction) {
    try {
      const orderItem = await this.orderItem.createOrderItems(req.validated.body);

      return res.status(201).json(orderItem);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);

      const orderItem = await this.orderItem.getOrderItem(id);

      if (!orderItem) {
        return res.status(404).json({
          message: 'OrderItem not found',
        });
      }

      return res.status(200).json(orderItem);
    } catch (error) {
      next(error);
    }
  }

  async getMany(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, ...data } = req.validated.query;

      const query = {
        data,
        page: Number(page),
        take: Number(limit),
      };

      const orderItems = await this.orderItem.getOrderItems(query);

      return res.status(200).json(orderItems);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);
      const data = req.validated.body;

      const orderItem = await this.orderItem.updateOrderItem(id, data);

      if (!orderItem) {
        return res.status(400).json({
          message: 'OrderItem not found',
        });
      }

      return res.status(200).json(orderItem);
    } catch (error) {
      next(error);
    }
  }

  async updateMany(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = req.validated.body.ids as number[];
      const data = req.validated.body.data;

      const orderItems = await this.orderItem.updateOrderItems(ids, data);

      return res.status(200).json(orderItems);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);

      const result = await this.orderItem.deleteOrderItem(id);

      if (!result) {
        return res.status(400).json({ message: 'OrderItem not found' });
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteMany(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = req.validated.body.ids as number[];

      const result = await this.orderItem.deleteOrderItems(ids);

      if (!result) {
        return res.status(400).json({ message: 'OrderItem not found' });
      }
    } catch (error) {
      next(error);
    }
  }
}
