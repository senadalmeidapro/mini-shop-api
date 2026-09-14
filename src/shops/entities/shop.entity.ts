import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'owner_id', unique: true })
  ownerId!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 255, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', name: 'logo_url', nullable: true })
  logoUrl?: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @OneToOne(() => User, (user) => user.shop, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @OneToMany(() => Product, (products) => products.shop, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  products!: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
