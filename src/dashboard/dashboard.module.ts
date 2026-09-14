import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { Product } from '../products/entities/product.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { DashboardService } from './dashboard.service';
import { SupplierDashboardController, AdminDashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop, Product, OrderItem, Order, User, Category, Notification]),
  ],
  controllers: [SupplierDashboardController, AdminDashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
