import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { OrderPaidListener } from './order-paid.listener';
import { InvoicesModule } from '../invoices/invoices.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Shop, User, Notification]),
    InvoicesModule,
    MailModule,
  ],
  providers: [OrderPaidListener],
})
export class EventsModule {}
