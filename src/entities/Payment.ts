import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './Order.ts';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'order_id', type: 'integer' })
  order_id!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: ['pending', 'canceled', 'completed'], default: 'pending' })
  status!: 'pending' | 'canceled' | 'completed';

  @Column({ type: 'enum', enum: ['card', 'paypal', 'stripe'] })
  method!: 'card' | 'paypal' | 'stripe';

  @OneToOne(() => Order, (order) => order.payment, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order!: typeof Order;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
