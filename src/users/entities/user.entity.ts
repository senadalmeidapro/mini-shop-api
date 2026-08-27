import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ name: 'full_name', nullable: true, length: 255 })
  fullName?: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role!: 'user' | 'admin';

  @Column({ nullable: true, select: false })
  token?: string | null;

  @OneToMany(() => Address, (addresses) => addresses.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  addresses!: Address[];

  @OneToMany(() => Cart, (carts) => carts.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  carts!: Cart[];

  @OneToMany(() => Order, (order) => order.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  orders!: Order[];

  @OneToMany(() => Review, (review) => review.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  reviews!: Review[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
