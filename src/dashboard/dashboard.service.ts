import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { Product } from '../products/entities/product.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Notification } from '../notifications/entities/notification.entity';

export interface StatusCountRow {
  status: string;
  count: string;
}

export interface RecentOrderRow {
  id: string;
  status: string;
  total: string;
  createdAt: Date;
  customerName: string | null;
}

export interface TopProductRow {
  productId: string;
  name: string;
  quantitySold: string;
  revenue: string;
}

export interface TopShopRow {
  shopId: string;
  shopName: string;
  revenue: string;
  orderCount: string;
}

interface RevenueRow {
  revenue: string;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Shop)
    private readonly shop: Repository<Shop>,
    @InjectRepository(Product)
    private readonly product: Repository<Product>,
    @InjectRepository(OrderItem)
    private readonly orderItem: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly order: Repository<Order>,
    @InjectRepository(User)
    private readonly user: Repository<User>,
    @InjectRepository(Category)
    private readonly category: Repository<Category>,
    @InjectRepository(Notification)
    private readonly notification: Repository<Notification>,
  ) {}

  async supplier(ownerId: string) {
    const shop = await this.shop.findOneBy({ ownerId });
    if (!shop) throw new NotFoundException('You do not have a shop yet');

    const [totalProducts, lowStockProducts, recentNotifications] = await Promise.all([
      this.product.count({ where: { shopId: shop.id } }),
      this.product
        .createQueryBuilder('p')
        .where('p.shopId = :shopId', { shopId: shop.id })
        .andWhere('p.stock <= p.lowStockThreshold')
        .orderBy('p.stock', 'ASC')
        .take(10)
        .getMany(),
      this.notification.find({
        where: { userId: ownerId },
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);

    const unreadNotifications = await this.notification.count({
      where: { userId: ownerId, read: false },
    });

    const revenueRow = await this.orderItem
      .createQueryBuilder('oi')
      .innerJoin('oi.product', 'p')
      .innerJoin('oi.order', 'o')
      .select('COALESCE(SUM(oi.unitPrice * oi.quantity), 0)', 'revenue')
      .where('p.shopId = :shopId', { shopId: shop.id })
      .andWhere('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .getRawOne<RevenueRow | null>();

    const ordersByStatusRows = await this.orderItem
      .createQueryBuilder('oi')
      .innerJoin('oi.product', 'p')
      .innerJoin('oi.order', 'o')
      .select('o.status', 'status')
      .addSelect('COUNT(DISTINCT o.id)', 'count')
      .where('p.shopId = :shopId', { shopId: shop.id })
      .groupBy('o.status')
      .getRawMany<StatusCountRow>();

    const recentOrders = await this.orderItem
      .createQueryBuilder('oi')
      .innerJoin('oi.product', 'p')
      .innerJoin('oi.order', 'o')
      .innerJoin('o.user', 'u')
      .select('o.id', 'id')
      .addSelect('o.status', 'status')
      .addSelect('o.createdAt', 'createdAt')
      .addSelect('u.fullName', 'customerName')
      .addSelect('COALESCE(SUM(oi.unitPrice * oi.quantity), 0)', 'total')
      .where('p.shopId = :shopId', { shopId: shop.id })
      .groupBy('o.id')
      .addGroupBy('u.fullName')
      .orderBy('o.createdAt', 'DESC')
      .take(5)
      .getRawMany<RecentOrderRow>();

    return {
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        logoUrl: shop.logoUrl,
        isActive: shop.isActive,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
      },
      revenue: Number(revenueRow?.revenue ?? 0),
      ordersByStatus: ordersByStatusRows.reduce<Record<string, number>>((acc, r) => {
        acc[r.status] = Number(r.count);
        return acc;
      }, {}),
      recentOrders: recentOrders.map((r) => ({
        id: r.id,
        status: r.status,
        total: Number(r.total),
        customerName: r.customerName,
        createdAt: r.createdAt,
      })),
      notifications: {
        unread: unreadNotifications,
        recent: recentNotifications,
      },
    };
  }

  async admin() {
    const [users, shops, products, categories, orders, lowStockProducts] = await Promise.all([
      this.user.count(),
      this.shop.count(),
      this.product.count(),
      this.category.count(),
      this.order.count(),
      this.product.createQueryBuilder('p').where('p.stock <= p.lowStockThreshold').getCount(),
    ]);

    const revenueRow = await this.order
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'revenue')
      .where('o.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .getRawOne<RevenueRow | null>();

    const ordersByStatusRows = await this.order
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(o.id)', 'count')
      .groupBy('o.status')
      .getRawMany<StatusCountRow>();

    const topProducts = await this.orderItem
      .createQueryBuilder('oi')
      .innerJoin('oi.product', 'p')
      .select('p.id', 'productId')
      .addSelect('p.name', 'name')
      .addSelect('SUM(oi.quantity)', 'quantitySold')
      .addSelect('COALESCE(SUM(oi.unitPrice * oi.quantity), 0)', 'revenue')
      .groupBy('p.id')
      .addGroupBy('p.name')
      .orderBy('quantitySold', 'DESC')
      .take(5)
      .getRawMany<TopProductRow>();

    const topShops = await this.orderItem
      .createQueryBuilder('oi')
      .innerJoin('oi.product', 'p')
      .innerJoin('p.shop', 's')
      .select('s.id', 'shopId')
      .addSelect('s.name', 'shopName')
      .addSelect('COALESCE(SUM(oi.unitPrice * oi.quantity), 0)', 'revenue')
      .addSelect('COUNT(DISTINCT oi.orderId)', 'orderCount')
      .groupBy('s.id')
      .addGroupBy('s.name')
      .orderBy('revenue', 'DESC')
      .take(5)
      .getRawMany<TopShopRow>();

    const recentOrders = await this.order
      .createQueryBuilder('o')
      .innerJoin('o.user', 'u')
      .select('o.id', 'id')
      .addSelect('o.status', 'status')
      .addSelect('o.total', 'total')
      .addSelect('o.createdAt', 'createdAt')
      .addSelect('u.fullName', 'customerName')
      .addSelect('u.email', 'customerEmail')
      .orderBy('o.createdAt', 'DESC')
      .take(10)
      .getRawMany<RecentOrderRow>();

    return {
      totals: {
        users,
        shops,
        products,
        categories,
        orders,
        lowStockProducts,
        revenue: Number(revenueRow?.revenue ?? 0),
      },
      ordersByStatus: ordersByStatusRows.reduce<Record<string, number>>((acc, r) => {
        acc[r.status] = Number(r.count);
        return acc;
      }, {}),
      topProducts,
      topShops,
      recentOrders,
    };
  }
}
