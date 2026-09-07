import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Order, OrderStatus } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

export async function seedOrders(ds: DataSource): Promise<Order[]> {
  const users = await ds.getRepository(User).find();
  const products = await ds.getRepository(Product).find();

  const orderRepo = ds.getRepository(Order);
  const itemRepo = ds.getRepository(OrderItem);

  const orders: Order[] = [];

  for (let index = 0; index < Math.min(users.length, 4); index++) {
    const user = users[index];
    if (!user) continue;

    const productA = products[index * 2];
    const productB = products[index * 2 + 1];

    const status =
      index % 3 === 0
        ? OrderStatus.PENDING
        : index % 3 === 1
          ? OrderStatus.COMPLETED
          : OrderStatus.CANCELLED;

    const order = await orderRepo.save(
      orderRepo.create({
        userId: user.id,
        status,
        total: 0,
      }),
    );

    const orderItems = itemRepo.create(
      [
        productA
          ? {
              orderId: order.id,
              productId: productA.id,
              quantity: 1 + index,
              unitPrice: productA.price,
            }
          : null,
        productB
          ? {
              orderId: order.id,
              productId: productB.id,
              quantity: 2,
              unitPrice: productB.price,
            }
          : null,
      ].filter(
        (
          item,
        ): item is { orderId: string; productId: string; quantity: number; unitPrice: number } =>
          item !== null,
      ),
    );

    const total = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    await itemRepo.save(orderItems);
    await orderRepo.update(order.id, { total });

    orders.push(await orderRepo.findOneByOrFail({ id: order.id }));
  }

  return orders;
}
