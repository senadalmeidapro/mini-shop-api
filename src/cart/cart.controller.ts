import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { currentUser } from '../common/decorators';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post(':productId')
  create(
    @currentUser('sub') sub: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    return this.cartService.addCartItem(sub, productId, createCartItemDto);
  }

  @Get()
  findAll() {
    return this.cartService.findAllCart();
  }

  @Get(':id')
  findOne(@currentUser('sub') sub: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.cartService.findOneCart(id, sub);
  }

  @Patch(':id')
  update(
    @currentUser('sub') sub: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(id, updateCartItemDto, sub);
  }

  @Delete(':id')
  remove(@currentUser('sub') sub: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.cartService.remove(id, sub);
  }
}
