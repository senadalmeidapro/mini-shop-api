import { In } from 'typeorm';
import type { z } from 'zod';

import { ProductRepository } from '../repositories/product.repository.ts';
import { productSchema } from '../schema/product.schema.ts';
import type { QueryOptions } from '../database/query.types.ts';
import type { Product } from '../entities/Product.ts';

type ProductInput = z.infer<typeof productSchema>;

export class ProductService {
  private readonly product: ProductRepository;

  constructor() {
    this.product = new ProductRepository();
  }

  async createProduct(data: ProductInput) {
    return this.product.create(data);
  }

  async createProducts(data: ProductInput[]) {
    return this.product.createMany(data);
  }

  async getProduct(id: number) {
    return this.product.findOne({ where: { id } });
  }

  async getProducts(option: QueryOptions<Product>) {
    return this.product.findPaginated(option);
  }

  async updateProduct(id: number, data: Partial<ProductInput>) {
    return this.product.update({ id }, data);
  }

  async updateProducts(ids: number[], data: Partial<ProductInput>) {
    return this.product.updateMany({ id: In(ids) }, data);
  }

  async deleteProduct(id: number) {
    return this.product.delete({ id });
  }

  async deleteProducts(ids: number[]) {
    return this.product.deleteMany({ id: In(ids) });
  }
}
