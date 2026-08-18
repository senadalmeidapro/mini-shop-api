import type { NextFunction, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service.ts';

export class PaymentController {
  private readonly payment: PaymentService;

  constructor() {
    this.payment = new PaymentService();
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await this.payment.createPayment(req.validated.body);

      return res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  }

  async createMany(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await this.payment.createPayments(req.validated.body);

      return res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);

      const payment = await this.payment.getPayment(id);

      if (!payment) {
        return res.status(404).json({
          message: 'Payment not found',
        });
      }

      return res.status(200).json(payment);
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

      const payments = await this.payment.getPayments(query);

      return res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);
      const data = req.validated.body;

      const payment = await this.payment.updatePayment(id, data);

      if (!payment) {
        return res.status(400).json({
          message: 'Payment not found',
        });
      }

      return res.status(200).json(payment);
    } catch (error) {
      next(error);
    }
  }

  async updateMany(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = req.validated.body.ids as number[];
      const data = req.validated.body.data;

      const payments = await this.payment.updatePayments(ids, data);

      return res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);

      const result = await this.payment.deletePayment(id);

      if (!result) {
        return res.status(400).json({ message: 'Payment not found' });
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteMany(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = req.validated.body.ids as number[];

      const result = await this.payment.deletePayments(ids);

      if (!result) {
        return res.status(400).json({ message: 'Payment not found' });
      }
    } catch (error) {
      next(error);
    }
  }
}
