import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Category)
    private readonly category: Repository<Category>,

    @InjectRepository(Product)
    private readonly product: Repository<Product>,
  ) {}

  async create(categoryId: string, createProductDto: CreateProductDto, imageUrl?: string) {
    const existingCategory = await this.category.findOneBy({ id: categoryId });
    if (!existingCategory) throw new NotFoundException('Category not found');

    const product = this.product.create({
      ...createProductDto,
      imageUrl,
      category: existingCategory,
    });
    return await this.product.save(product);
  }

  async findAll() {
    return await this.product.find();
  }

  async findOne(id: string) {
    const existingProduct = await this.product.findOneBy({ id });
    if (!existingProduct) throw new NotFoundException('Product not found');

    return existingProduct;
  }

  async update(id: string, updateProductDto: UpdateProductDto, imageUrl?: string) {
    const existingProduct = await this.product.findOneBy({ id });
    if (!existingProduct) throw new NotFoundException('Product not found');

    await this.product.update(id, { ...updateProductDto, imageUrl });
    return await this.product.findOneBy({ id });
  }

  async remove(id: string) {
    const existingProduct = await this.product.findOneBy({ id });
    if (!existingProduct) throw new NotFoundException('Product not found');

    return await this.product.delete(id);
  }
}
