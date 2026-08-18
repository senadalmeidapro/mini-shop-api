import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from './Address.ts';
import { Order } from './Order.ts';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'enum', enum: ['user', 'manager', 'admin'], default: 'user' })
  role!: 'user' | 'manager' | 'admin';

  @OneToMany(() => Address, (address) => address.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  addresses!: typeof Address[];

  @OneToMany(() => Order, (order) => order.user, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  orders!: typeof Order[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
