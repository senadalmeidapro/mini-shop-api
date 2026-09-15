import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Shop } from '../shops/entities/shop.entity';
import { PaginationDto, PaginatedResult, buildPaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Category)
    private readonly category: Repository<Category>,

    @InjectRepository(Shop)
    private readonly shop: Repository<Shop>,

    @InjectRepository(Product)
    private readonly product: Repository<Product>,
  ) {}

  async create(
    ownerId: string,
    categoryId: string,
    createProductDto: CreateProductDto,
    imageUrl?: string,
  ) {
    const shop = await this.shop.findOneBy({ ownerId });
    if (!shop) throw new ForbiddenException('You must create a shop before adding products');

    const existingCategory = await this.category.findOneBy({ id: categoryId });
    if (!existingCategory) throw new NotFoundException('Category not found');

    const product = this.product.create({
      ...createProductDto,
      imageUrl,
      shop,
      category: existingCategory,
    });
    return await this.product.save(product);
  }

  async findAll(pagination: PaginationDto = {}): Promise<PaginatedResult<Product>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const [data, total] = await this.product.findAndCount({
      relations: { shop: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return buildPaginatedResult(data, total, page, limit);
  }

  async findMine(ownerId: string) {
    const shop = await this.shop.findOneBy({ ownerId });
    if (!shop) throw new NotFoundException('You do not have a shop yet');
    return await this.findByShop(shop.id);
  }

  async findByShop(shopId: string) {
    return await this.product.find({ where: { shopId } });
  }

  async findOne(id: string) {
    const existingProduct = await this.product.findOne({
      where: { id },
      relations: { shop: true },
    });
    if (!existingProduct) throw new NotFoundException('Product not found');
    return existingProduct;
  }

  async update(
    id: string,
    ownerId: string,
    updateProductDto: UpdateProductDto,
    admin = false,
    imageUrl?: string,
  ) {
    const existingProduct = await this.product.findOne({
      where: { id },
      relations: { shop: true },
    });
    if (!existingProduct) throw new NotFoundException('Product not found');

    if (!admin && existingProduct.shop.ownerId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this product');
    }

    await this.product.update(id, {
      ...updateProductDto,
      ...(imageUrl ? { imageUrl } : {}),
    });
    return await this.findOne(id);
  }

  async adjustStock(id: string, ownerId: string, quantity: number, admin = false) {
    const existingProduct = await this.product.findOne({
      where: { id },
      relations: { shop: true },
    });
    if (!existingProduct) throw new NotFoundException('Product not found');

    if (!admin && existingProduct.shop.ownerId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this product');
    }

    const newStock = existingProduct.stock + quantity;
    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    await this.product.update(id, { stock: newStock });
    return await this.findOne(id);
  }

  async remove(id: string, ownerId: string, admin = false) {
    const existingProduct = await this.product.findOne({
      where: { id },
      relations: { shop: true },
    });
    if (!existingProduct) throw new NotFoundException('Product not found');

    if (!admin && existingProduct.shop.ownerId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this product');
    }

    return await this.product.delete(id);
  }
}
