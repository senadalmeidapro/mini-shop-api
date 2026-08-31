import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Cart } from '../cart/entities/cart.entity';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { CartItem } from '../cart/entities/cart-item.entity';

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

    const total = existingCart.cartItems.reduce(
      (sum, ci) => sum + ci.quantity * ci.product.price,
      0,
    );

    const orderDto: CreateOrderDto = {
      status: 'pending',
      total,
      orderItems: existingCart.cartItems.map((ci) => ({
        productId: ci.productId,
        quantity: ci.quantity,
        unitPrice: ci.product.price,
      })),
    };

    const order = await this.orderService.create(orderDto);

    const payment = this.payment.create({
      ...createPaymentDto,
      amount: order.total,
      order,
    });
    const savedPayment = await this.payment.save(payment);
    await this.cartItem.delete({ cartId: existingCart.id });
    return savedPayment;
  }

  async findAll() {
    return await this.payment.find();
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

    if (['succeeded', 'cancelled'].includes(existingPayment.status)) {
      throw new BadRequestException('Invalid payment');
    }

    await this.payment.update(id, updatePaymentDto);
    return await this.payment.findOneBy({ id });
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

    if (['succeeded', 'cancelled'].includes(existingPayment.status)) {
      throw new BadRequestException('Invalid payment');
    }

    await this.orderService.cancelOrder(existingPayment.orderId);
    return await this.payment.update(id, { status: 'cancelled' });
  }
}
