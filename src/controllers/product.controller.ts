import type { NextFunction, Request, Response } from 'express';
import { ProductService } from '../services/product.service.ts';

export class ProductController {
  private readonly product: ProductService;

  constructor() {
    this.product = new ProductService();
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await this.product.createProduct(req.validated.body);

      return res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async createMany(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await this.product.createProducts(req.validated.body);

      return res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);

      const product = await this.product.getProduct(id);

      if (!product) {
        return res.status(404).json({
          message: 'Product not found',
        });
      }

      return res.status(200).json(product);
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

      const products = await this.product.getProducts(query);

      return res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);
      const data = req.validated.body;

      const product = await this.product.updateProduct(id, data);

      if (!product) {
        return res.status(400).json({
          message: 'Product not found',
        });
      }

      return res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  async updateMany(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = req.validated.body.ids as number[];
      const data = req.validated.body.data;

      const products = await this.product.updateProducts(ids, data);

      return res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);

      const result = await this.product.deleteProduct(id);

      if (!result) {
        return res.status(400).json({ message: 'Product not found' });
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteMany(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = req.validated.body.ids as number[];

      const result = await this.product.deleteProducts(ids);

      if (!result) {
        return res.status(400).json({ message: 'Product not found' });
      }
    } catch (error) {
      next(error);
    }
  }
}
