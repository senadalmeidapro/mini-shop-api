import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { User } from '../../users/entities/user.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total!: number;

  @Column({ type: 'jsonb', name: 'shipping_address', nullable: true })
  shippingAddress?: Record<string, string>;

  @Column({ type: 'varchar', name: 'tracking_number', nullable: true, length: 255 })
  trackingNumber?: string | null;

  @Column({ type: 'timestamp', name: 'estimated_delivery', nullable: true })
  estimatedDelivery?: Date | null;

  @Column({ type: 'timestamp', name: 'shipped_at', nullable: true })
  shippedAt?: Date | null;

  @Column({ type: 'timestamp', name: 'delivered_at', nullable: true })
  deliveredAt?: Date | null;

  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  orderItems!: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
