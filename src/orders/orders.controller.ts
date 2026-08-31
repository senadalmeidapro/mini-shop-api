import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { currentUser } from '../common/decorators';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(@currentUser('sub') sub: string, @currentUser('role') role: 'user' | 'admin') {
    return this.ordersService.findAll(role === 'admin', sub);
  }

  @Get(':id')
  findOne(@currentUser('sub') sub: string, @Param('id') id: string) {
    return this.ordersService.findOne(id, sub);
  }

  @Patch(':id')
  update(
    @currentUser('sub') sub: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto, sub);
  }
}
