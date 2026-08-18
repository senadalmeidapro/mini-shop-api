import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.ts';
import { Payment } from './Payment.ts';
import { OrderItem } from './OrderItem.ts';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @Column({ type: 'enum', enum: ['pending', 'canceled', 'completed'], default: 'pending' })
  status!: 'pending' | 'canceled' | 'completed';

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @OneToOne(() => Payment, (payment) => payment.order, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  payment!: Payment;

  @OneToMany(() => OrderItem, (orderItems) => orderItems.order, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  orderItems!: typeof OrderItem[];

  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: typeof User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
