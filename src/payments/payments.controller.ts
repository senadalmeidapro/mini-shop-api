import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { currentUser, roles, type RoleLike } from '../common/decorators';
import { PaginationDto } from '../common/dto/pagination.dto';

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
  @roles('admin')
  findAll(@Query() pagination: PaginationDto) {
    return this.paymentsService.findAll(pagination);
  }

  @Get('me')
  findMine(@currentUser('sub') sub: string, @Query() pagination: PaginationDto) {
    return this.paymentsService.findMine(sub, pagination);
  }

  @Get(':id')
  findOne(
    @currentUser('sub') sub: string,
    @currentUser('role') role: RoleLike,
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
    @currentUser('role') role: RoleLike,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.cancel(id, sub, role === 'admin');
  }
}
