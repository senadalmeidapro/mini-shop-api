import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, Shop]), InvoicesModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
