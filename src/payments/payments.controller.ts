import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { currentUser } from '../common/decorators';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':cartId')
  create(
    @currentUser('sub') sub: string,
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(sub, cartId, createPaymentDto);
  }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  findOne(
    @currentUser('sub') sub: string,
    @currentUser('role') role: 'user' | 'admin',
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.findOne(id, sub, role === 'admin');
  }

  @Patch(':id')
  update(
    @currentUser('sub') sub: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.update(id, updatePaymentDto, sub);
  }

  @Delete(':id')
  remove(
    @currentUser('sub') sub: string,
    @currentUser('role') role: 'user' | 'admin',
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.cancel(id, sub, role === 'admin');
  }
}
