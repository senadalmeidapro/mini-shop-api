import type { NextFunction, Request, Response } from 'express';
import { OrderService } from '../services/order.service.ts';

export class OrderController {
  private readonly order: OrderService;

  constructor() {
    this.order = new OrderService();
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await this.order.createOrder(req.validated.body);

      return res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  async createMany(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await this.order.createOrders(req.validated.body);

      return res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);

      const order = await this.order.getOrder(id);

      if (!order) {
        return res.status(404).json({
          message: 'Order not found',
        });
      }

      return res.status(200).json(order);
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

      const orders = await this.order.getOrders(query);

      return res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);
      const data = req.validated.body;

      const order = await this.order.updateOrder(id, data);

      if (!order) {
        return res.status(400).json({
          message: 'Order not found',
        });
      }

      return res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }

  async updateMany(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = req.validated.body.ids as number[];
      const data = req.validated.body.data;

      const orders = await this.order.updateOrders(ids, data);

      return res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);

      const result = await this.order.deleteOrder(id);

      if (!result) {
        return res.status(400).json({ message: 'Order not found' });
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteMany(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = req.validated.body.ids as number[];

      const result = await this.order.deleteOrders(ids);

      if (!result) {
        return res.status(400).json({ message: 'Order not found' });
      }
    } catch (error) {
      next(error);
    }
  }
}
