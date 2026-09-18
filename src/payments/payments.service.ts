import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Cart } from '../cart/entities/cart.entity';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { CartItem } from '../cart/entities/cart-item.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderPaidEvent } from '../events/order-paid.event';
import { PaginationDto, PaginatedResult, buildPaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cart: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItem: Repository<CartItem>,

    @InjectRepository(Order)
    private readonly order: Repository<Order>,

    @InjectRepository(Payment)
    private readonly payment: Repository<Payment>,

    private readonly orderService: OrdersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, cartId: string, createPaymentDto: CreatePaymentDto) {
    const existingCart = await this.cart.findOne({
      where: { id: cartId },
      relations: { cartItems: { product: true } },
    });
    if (!existingCart) throw new NotFoundException('Order not found');
    if (userId !== existingCart.userId) {
      throw new ForbiddenException('You are not the owner of this order');
    }

    if (existingCart.cartItems.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    const total = existingCart.cartItems.reduce(
      (sum, ci) => sum + ci.quantity * ci.product.price,
      0,
    );

    const orderDto: CreateOrderDto = {
      status: OrderStatus.PENDING,
      total,
      shippingAddress: createPaymentDto.shippingAddress as Record<string, string>,
      orderItems: existingCart.cartItems.map((ci) => ({
        productId: ci.productId,
        quantity: ci.quantity,
        unitPrice: ci.product.price,
      })),
    };

    const order = await this.orderService.create(userId, orderDto);

    const payment = this.payment.create({
      ...createPaymentDto,
      amount: order.total,
      order,
    });
    const savedPayment = await this.payment.save(payment);
    await this.cartItem.delete({ cartId: existingCart.id });
    return savedPayment;
  }

  async findAll(pagination: PaginationDto = {}): Promise<PaginatedResult<Payment>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const [data, total] = await this.payment.findAndCount({
      relations: { order: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return buildPaginatedResult(data, total, page, limit);
  }

  async findMine(
    userId: string,
    pagination: PaginationDto = {},
  ): Promise<PaginatedResult<Payment>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const [data, total] = await this.payment.findAndCount({
      where: { order: { userId } },
      relations: { order: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string, userId: string, admin: boolean = false) {
    const existingPayment = await this.payment.findOne({
      where: { id },
      relations: { order: true },
    });
    if (!existingPayment) throw new NotFoundException('Payment not found');

    if (!admin && existingPayment.order.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this payment');
    }

    return existingPayment;
  }

  async update(id: string, updatePaymentDto: CreatePaymentDto, userId: string) {
    const existingPayment = await this.payment.findOne({
      where: { id },
      relations: { order: true },
    });
    if (!existingPayment) throw new NotFoundException('Payment not found');

    if (existingPayment.order.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this payment');
    }

    if ([PaymentStatus.SUCCEEDED, PaymentStatus.CANCELLED].includes(existingPayment.status)) {
      throw new BadRequestException('Invalid payment');
    }

    await this.payment.update(id, updatePaymentDto);

    // Payment validated by the customer -> trigger notifications + invoice
    if (updatePaymentDto.status === PaymentStatus.SUCCEEDED) {
      this.eventEmitter.emit(
        'order.paid',
        new OrderPaidEvent(
          existingPayment.orderId,
          userId,
          updatePaymentDto.shippingAddress as Record<string, string> | undefined,
        ),
      );
    }

    return await this.payment.findOne({
      where: { id },
      relations: { order: true },
    });
  }

  async cancel(id: string, userId: string, admin: boolean = false) {
    const existingPayment = await this.payment.findOne({
      where: { id },
      relations: { order: true },
    });
    if (!existingPayment) throw new NotFoundException('Payment not found');

    if (!admin && existingPayment.order.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this payment');
    }

    if ([PaymentStatus.SUCCEEDED, PaymentStatus.CANCELLED].includes(existingPayment.status)) {
      throw new BadRequestException('Invalid payment');
    }

    await this.orderService.cancelOrder(existingPayment.orderId);
    return await this.payment.update(id, { status: PaymentStatus.CANCELLED });
  }
}
