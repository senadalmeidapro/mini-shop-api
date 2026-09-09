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
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Review } from '../../reviews/entities/review.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'category_id' })
  categoryId!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'varchar', name: 'image_url', nullable: true })
  imageUrl?: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column({ type: 'integer' })
  stock!: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @OneToMany(() => CartItem, (cartItems) => cartItems.product, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  cartItems!: CartItem[];

  @OneToMany(() => Review, (reviews) => reviews.product, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  reviews!: Review[];

  @OneToMany(() => OrderItem, (orderItems) => orderItems.product, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  orderItems!: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
