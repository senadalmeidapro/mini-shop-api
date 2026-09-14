import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  StreamableFile,
  NotFoundException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { currentUser } from '../common/decorators';
import { InvoicesService } from '../invoices/invoices.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly invoicesService: InvoicesService,
  ) {}

  @Post()
  create(@currentUser('sub') sub: string, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(sub, createOrderDto);
  }

  @Get()
  findAll(@currentUser('sub') sub: string, @currentUser('role') role: 'user' | 'admin') {
    return this.ordersService.findAll(sub, role);
  }

  @Get(':id')
  findOne(
    @currentUser('sub') sub: string,
    @currentUser('role') role: 'user' | 'admin',
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.findOne(id, sub, role);
  }

  @Get(':id/invoice')
  getInvoice(@Param('id', ParseUUIDPipe) id: string, @Res({ passthrough: true }) res: Response) {
    const filePath = this.invoicesService.getInvoicePath(id);
    if (!filePath) throw new NotFoundException('Invoice not found');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
    });
    return new StreamableFile(createReadStream(filePath));
  }

  @Patch(':id')
  update(
    @currentUser('sub') sub: string,
    @currentUser('role') role: 'user' | 'admin',
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, sub, role, updateOrderDto);
  }
}
