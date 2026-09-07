import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Product } from '../../products/entities/product.entity';

export async function seedCarts(ds: DataSource): Promise<Cart[]> {
  const users = await ds.getRepository(User).find();

  const cartRepo = ds.getRepository(Cart);
  const itemRepo = ds.getRepository(CartItem);

  const carts: Cart[] = [];

  for (const user of users.slice(0, users.length)) {
    if (!user) continue;

    const cart = await cartRepo.save(
      cartRepo.create({
        userId: user.id,
      }),
    );

    carts.push(cart);
  }

  return carts;
}

export async function seedCartItems(ds: DataSource, carts: Cart[]): Promise<CartItem[]> {
  const productRepo = ds.getRepository(Product);
  const products = await productRepo.find();

  const itemRepo = ds.getRepository(CartItem);
  const items: CartItem[] = [];

  for (let index = 0; index < carts.length; index++) {
    const cart = carts[index];
    if (!cart) continue;

    const productA = products[index * 2];
    const productB = products[index * 2 + 1];

    if (productA) {
      items.push(
        itemRepo.create({
          cartId: cart.id,
          productId: productA.id,
          quantity: 1 + index,
        }),
      );
    }

    if (productB) {
      items.push(
        itemRepo.create({
          cartId: cart.id,
          productId: productB.id,
          quantity: 2,
        }),
      );
    }
  }

  return itemRepo.save(items);
}
