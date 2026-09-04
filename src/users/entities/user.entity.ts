import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Order } from '../../orders/entities/order.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ type: 'varchar', name: 'full_name', nullable: true, length: 255 })
  fullName?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: 'varchar', nullable: true, select: false })
  token?: string | null;

  @OneToMany(() => Address, (addresses) => addresses.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  addresses!: Address[];

  @OneToOne(() => Cart, (cart) => cart.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  cart!: Cart;

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
