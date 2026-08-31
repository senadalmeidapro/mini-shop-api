import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async addCartItem(userId: string, productId: string, createCartItemDto: CreateCartItemDto) {
    return this.dataSource.transaction(async (manager) => {
      let cart = await manager.findOne(Cart, { where: { userId } });
      if (!cart) {
        cart = manager.create(Cart, { userId });
        cart = await manager.save(Cart, cart);
      }

      const existingProduct = await manager.findOne(Product, {
        where: { id: productId },
      });
      if (!existingProduct) throw new NotFoundException('Product not found');

      if (createCartItemDto.quantity > existingProduct.stock) {
        throw new BadRequestException("Product stock isn't enough");
      }

      const cartItem = manager.create(CartItem, {
        ...createCartItemDto,
        cart,
        product: existingProduct,
      });

      const savedItem = await manager.save(CartItem, cartItem);

      await manager.decrement(Product, { id: productId }, 'stock', createCartItemDto.quantity);
      return savedItem;
    });
  }

  async findAllCart() {
    return await this.cart.find();
  }

  async findOneCart(id: string, userId: string) {
    const existingCart = await this.cart.findOneBy({ id });
    if (!existingCart) throw new NotFoundException('Cart not found');

    if (existingCart.userId !== userId)
      throw new ForbiddenException('You are not the owner of this cart');
    return existingCart;
  }

  async updateCartItem(id: string, updateCartItemDto: UpdateCartItemDto, userId: string) {
    const existingCartItem = await this.cartItem.findOne({
      where: { id },
      relations: { cart: true },
    });
    if (!existingCartItem) throw new NotFoundException('Cart item not found');

    if (existingCartItem.cart.userId !== userId) {
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

    if (existingCartItem.cart.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this cart');
    }

    return await this.cartItem.delete(id);
  }
}
