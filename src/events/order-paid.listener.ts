import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderPaidEvent } from './order-paid.event';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { Notification, NotificationType } from '../notifications/entities/notification.entity';
import { InvoicesService } from '../invoices/invoices.service';
import { MailService } from '../mail/mail.service';

export class OrderPaidListener {
  private readonly logger = new Logger(OrderPaidListener.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Shop)
    private readonly shopRepo: Repository<Shop>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly invoicesService: InvoicesService,
    private readonly mailService: MailService,
  ) {}

  @OnEvent('order.paid')
  async handleOrderPaid(event: OrderPaidEvent) {
    const order = await this.orderRepo.findOne({
      where: { id: event.orderId },
      relations: { user: true },
    });
    if (!order) {
      this.logger.error(`Order ${event.orderId} not found for order.paid event`);
      return;
    }

    const items = await this.orderItemRepo.find({
      where: { orderId: order.id },
      relations: { product: true },
    });

    // Group items by shop (via product.shopId)
    const shopItemsMap = new Map<string, OrderItem[]>();
    for (const item of items) {
      const shopId = item.product?.shopId;
      if (shopId) {
        const list = shopItemsMap.get(shopId) ?? [];
        list.push(item);
        shopItemsMap.set(shopId, list);
      }
    }

    // Notify each supplier
    for (const [shopId, supplierItems] of shopItemsMap.entries()) {
      const shop = await this.shopRepo.findOne({
        where: { id: shopId },
        relations: { owner: true },
      });
      if (!shop?.owner) continue;

      const itemsHtml = supplierItems
        .map(
          (i) =>
            `<tr><td>${i.product?.name ?? 'N/A'}</td><td>${i.quantity}</td><td>${Number(i.unitPrice).toFixed(2)} €</td></tr>`,
        )
        .join('');

      const supplierTotal = supplierItems.reduce(
        (sum, i) => sum + i.quantity * Number(i.unitPrice),
        0,
      );

      // In-app notification
      await this.notificationRepo.save(
        this.notificationRepo.create({
          userId: shop.ownerId,
          type: NotificationType.NEW_ORDER,
          title: `New order #${order.id.slice(0, 8).toUpperCase()}`,
          message: `Order of ${supplierTotal.toFixed(2)} € (${supplierItems.length} item${supplierItems.length > 1 ? 's' : ''})`,
          data: { orderId: order.id, total: supplierTotal },
        }),
      );

      // Email to supplier
      await this.mailService.sendNewOrderToSupplier(
        shop.owner.email,
        shop.owner.fullName ?? shop.owner.email,
        {
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          customerName: order.user.fullName ?? order.user.email,
          itemsHtml,
          total: supplierTotal.toFixed(2),
          createdAt: order.createdAt.toISOString().split('T')[0],
        },
      );
    }

    // Generate invoice
    const mainShop = shopItemsMap.keys().next().value as string | undefined;
    const firstShop = mainShop ? await this.shopRepo.findOne({ where: { id: mainShop } }) : null;

    const invoice = await this.invoicesService.generateInvoice(
      order,
      items,
      firstShop ?? ({ name: 'mini-shop', description: '' } as Shop),
      { email: order.user.email, fullName: order.user.fullName },
    );

    // Notify customer (in-app)
    await this.notificationRepo.save(
      this.notificationRepo.create({
        userId: event.userId,
        type: NotificationType.PAYMENT_SUCCEEDED,
        title: `Payment confirmed for order #${order.id.slice(0, 8).toUpperCase()}`,
        message: `Your payment of ${Number(order.total).toFixed(2)} € has been confirmed. Invoice attached.`,
        data: { orderId: order.id },
      }),
    );

    // Email to customer with invoice + delivery info
    const itemsHtmlCustomer = items
      .map(
        (i) =>
          `<tr><td>${i.product?.name ?? 'N/A'}</td><td>${i.quantity}</td><td>${Number(i.unitPrice).toFixed(2)} €</td></tr>`,
      )
      .join('');

    await this.mailService.sendOrderConfirmationToCustomer(order.user.email, {
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      customerName: order.user.fullName ?? order.user.email,
      itemsHtml: itemsHtmlCustomer,
      total: Number(order.total).toFixed(2),
      shippingAddress: event.shippingAddress,
      estimatedDelivery: order.estimatedDelivery?.toISOString().split('T')[0],
      attachmentPath: invoice.filePath,
    });

    this.logger.log(`Order ${event.orderId} payment processing completed`);
  }
}
