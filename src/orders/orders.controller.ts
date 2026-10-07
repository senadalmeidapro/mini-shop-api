import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  StreamableFile,
  Query,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { currentUser, type RoleLike } from '../common/decorators';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
  ) {
    // Contrôle d'accès : propriétaire, fournisseur concerné ou admin
    // Génération à la demande si la facture n'existe pas encore.
    const filePath = await this.ordersService.prepareInvoice(id, sub, role);

    return new StreamableFile(createReadStream(filePath), {
      type: 'application/pdf',
      disposition: `attachment; filename="invoice-${id}.pdf"`,
    });
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
