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
        lock: { mode: 'pessimistic_write' },
      });
      if (!existingProduct) throw new NotFoundException('Product not found');

      // Même produit déjà dans le panier : on incrémente la quantité (pas de doublon)
      const existingItem = await manager.findOne(CartItem, {
        where: { cart: { id: cart.id }, product: { id: existingProduct.id } },
      });

      // Le total (déjà dans le panier + ajout) ne doit pas dépasser le stock restant
      const finalQuantity = (existingItem?.quantity ?? 0) + createCartItemDto.quantity;
      if (finalQuantity > existingProduct.stock) {
        throw new BadRequestException("Product stock isn't enough");
      }

      if (existingItem) {
        await manager.increment(
          CartItem,
          { id: existingItem.id },
          'quantity',
          createCartItemDto.quantity,
        );
        await manager.decrement(Product, { id: productId }, 'stock', createCartItemDto.quantity);
        return await manager.findOneByOrFail(CartItem, { id: existingItem.id });
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

  async findMyCart(userId: string) {
    const cart = await this.cart.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: { cartItems: { product: true } },
    });
    if (!cart) return null;
    cart.cartItems.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return cart;
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
    return this.dataSource.transaction(async (manager) => {
      const existingCartItem = await manager.findOne(CartItem, {
        where: { id },
        relations: { cart: true, product: true },
      });
      if (!existingCartItem) throw new NotFoundException('Cart item not found');

      if (existingCartItem.cart.userId !== userId) {
        throw new ForbiddenException('You are not the owner of this cart');
      }

      const newQuantity = updateCartItemDto.quantity;
      if (newQuantity === undefined) {
        return await manager.findOneBy(Cart, { id: existingCartItem.cart.id });
      }

      const delta = newQuantity - existingCartItem.quantity;
      if (delta !== 0) {
        const product = existingCartItem.product;
        if (product) {
          if (delta > 0) {
            // Verrou pessimiste : sérialise les mises à jour concurrentes du même produit
            const lockedProduct = await manager.findOne(Product, {
              where: { id: product.id },
              lock: { mode: 'pessimistic_write' },
            });
            const available = lockedProduct?.stock ?? 0;
            if (available < delta) {
              throw new BadRequestException("Product stock isn't enough");
            }
            await manager.decrement(Product, { id: product.id }, 'stock', delta);
          } else {
            await manager.increment(Product, { id: product.id }, 'stock', -delta);
          }
        }
        await manager.update(CartItem, { id: existingCartItem.id }, { quantity: newQuantity });
      }

      return await manager.findOneBy(Cart, { id: existingCartItem.cart.id });
    });
  }

  async remove(id: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const existingCartItem = await manager.findOne(CartItem, {
        where: { id },
        relations: { cart: true, product: true },
      });
      if (!existingCartItem) throw new NotFoundException('Cart item not found');

      if (existingCartItem.cart.userId !== userId) {
        throw new ForbiddenException('You are not the owner of this cart');
      }

      // Restitution du stock réservé au retrait du panier
      const product = existingCartItem.product;
      if (product) {
        await manager.increment(Product, { id: product.id }, 'stock', existingCartItem.quantity);
      }

      return await manager.delete(CartItem, { id: existingCartItem.id });
    });
  }
}
