import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { Product } from './entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product, Shop])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
