import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  StreamableFile,
  NotFoundException,
  Res,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { currentUser, type RoleLike } from '../common/decorators';
import { InvoicesService } from '../invoices/invoices.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly invoicesService: InvoicesService,
  ) {}

  // Les commandes sont créées exclusivement via le flux de paiement (PaymentsService)

  @Get()
  findAll(
    @currentUser('sub') sub: string,
    @currentUser('role') role: RoleLike,
    @Query() pagination: PaginationDto,
  ) {
    return this.ordersService.findAll(sub, role, pagination);
  }

  @Get(':id')
  findOne(
    @currentUser('sub') sub: string,
    @currentUser('role') role: RoleLike,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.findOne(id, sub, role);
  }

  @Get(':id/invoice')
  async getInvoice(
    @currentUser('sub') sub: string,
    @currentUser('role') role: RoleLike,
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Contrôle d'accès : propriétaire, fournisseur concerné ou admin
    await this.ordersService.findOne(id, sub, role);

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
    @currentUser('role') role: RoleLike,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, sub, role, updateOrderDto);
  }
}
