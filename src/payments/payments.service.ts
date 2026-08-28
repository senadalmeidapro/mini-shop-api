import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Order)
    private readonly order: Repository<Order>,

    @InjectRepository(Payment)
    private readonly payment: Repository<Payment>,
  ) {}

  async create(userId: string, orderId: string, createPaymentDto: CreatePaymentDto) {
    const existingOrder = await this.order.findOneBy({ id: orderId });
    if (!existingOrder) throw new NotFoundException('Order not found');
    if (userId != existingOrder.userId) {
      throw new ForbiddenException('You are not the owner of this order');
    }

    const payment = this.payment.create({ ...createPaymentDto, order: existingOrder });
    return await this.payment.save(payment);
  }

  async findAll() {
    return await this.payment.find();
  }

  async findOne(id: string) {
    const existingOrder = await this.order.findOneBy({ id });
    if (!existingOrder) throw new NotFoundException('Order not found');
    return existingOrder;
  }

  async update(id: string, updatePaymentDto: Pick<CreatePaymentDto, 'status'>) {
    const existingOrder = await this.order.findOneBy({ id });
    if (!existingOrder) throw new NotFoundException('Order not found');

    await this.payment.update(id, updatePaymentDto);
    return await this.payment.findOneBy({ id });
  }

  async cancel(id: string) {
    const existingOrder = await this.order.findOneBy({ id });
    if (!existingOrder) throw new NotFoundException('Order not found');

    await this.payment.update(id, { status: 'cancelled' });
  }
}
