import { DataSource } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Payment, PaymentMethod, PaymentStatus } from '../../payments/entities/payment.entity';

export async function seedPayments(ds: DataSource): Promise<Payment[]> {
  const orders = await ds.getRepository(Order).find();

  const repo = ds.getRepository(Payment);

  const payments = repo.create(
    orders.map((order, index) => ({
      orderId: order.id,
      amount: Number(order.total),
      status:
        order.status === 'completed'
          ? PaymentStatus.SUCCEEDED
          : order.status === 'cancelled'
            ? PaymentStatus.CANCELLED
            : PaymentStatus.PENDING,
      method: [PaymentMethod.CARD, PaymentMethod.PAYPAL, PaymentMethod.CRYPTO][index % 3],
      transactionId: `tx-${order.id.slice(0, 8)}`,
    })),
  );

  return repo.save(payments);
}
