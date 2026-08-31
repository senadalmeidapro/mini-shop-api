import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cart: Repository<Cart>,

    @InjectRepository(Product)
    private readonly product: Repository<Product>,

    @InjectRepository(CartItem)
    private readonly cartItem: Repository<CartItem>,
  ) {}

  async addCartItem(userId: string, productId: string, createCartItemDto: CreateCartItemDto) {
    let cart = await this.cart.findOneBy({ userId });
    if (!cart) {
      const cartCreate = this.cart.create({ userId });
      cart = await this.cart.save(cartCreate);
    }

    const existingProduct = await this.product.findOneBy({ id: productId });
    if (!existingProduct) throw new NotFoundException('Product not found');
    if (createCartItemDto.quantity > existingProduct.stock) {
      throw new BadRequestException("Product stock isn't enought");
    }

    const cartItem = this.cartItem.create({
      ...createCartItemDto,
      cart,
      product: existingProduct,
      quantity: createCartItemDto.quantity,
    });
    return await this.cartItem.save(cartItem);
  }

  async findAllCart() {
    return await this.cart.find();
  }

  async findOneCart(id: string, userId: string) {
    const existingCart = await this.cart.findOneBy({ id });
    if (!existingCart) throw new NotFoundException('Cart not found');

    if (existingCart.userId != userId)
      throw new ForbiddenException('You are not the owner of this cart');
    return existingCart;
  }

  async updateCartItem(id: string, updateCartItemDto: UpdateCartItemDto, userId: string) {
    const existingCartItem = await this.cartItem.findOne({
      where: { id },
      relations: { cart: true },
    });
    if (!existingCartItem) throw new NotFoundException('Cart item not found');

    if (existingCartItem.cart.userId != userId) {
      throw new ForbiddenException('You are not the owner of this cart');
    }

    await this.cartItem.update(id, updateCartItemDto);
    return await this.cart.findOneBy({ id: existingCartItem.cart.id });
  }

  async remove(id: string, userId: string) {
    const existingCartItem = await this.cartItem.findOne({
      where: { id },
      relations: { cart: true },
    });
    if (!existingCartItem) throw new NotFoundException('Cart item not found');

    if (existingCartItem.cart.userId != userId) {
      throw new ForbiddenException('You are not the owner of this cart');
    }

    return await this.cartItem.delete(id);
  }
}
