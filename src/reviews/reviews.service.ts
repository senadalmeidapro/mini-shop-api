import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { PaginationDto, PaginatedResult, buildPaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(User)
    private readonly user: Repository<User>,

    @InjectRepository(Review)
    private readonly review: Repository<Review>,

    @InjectRepository(Product)
    private readonly product: Repository<Product>,

    @InjectRepository(Order)
    private readonly order: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItem: Repository<OrderItem>,
  ) {}

  async create(userId: string, productId: string, createReviewDto: CreateReviewDto) {
    const existingUser = await this.user.findOneBy({ id: userId });
    if (!existingUser) throw new NotFoundException('User not found');

    const existingProduct = await this.product.findOneBy({ id: productId });
    if (!existingProduct) throw new NotFoundException('Product not found');

    // Un seul avis par produit par utilisateur
    const existingReview = await this.review.findOneBy({ userId, productId });
    if (existingReview) {
      throw new ConflictException('Vous avez déjà avisé ce produit');
    }

    // Vérifier que l'utilisateur a bien acheté ce produit (commande livrée ou complétée)
    const hasPurchased = await this.orderItem
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .where('oi.productId = :productId', { productId })
      .andWhere('o.userId = :userId', { userId })
      .andWhere('o.status IN (:...statuses)', {
        statuses: [OrderStatus.DELIVERED, OrderStatus.COMPLETED],
      })
      .getCount();

    if (hasPurchased === 0) {
      throw new ForbiddenException('Vous devez avoir acheté ce produit pour laisser un avis');
    }

    const review = this.review.create({
      ...createReviewDto,
      user: existingUser,
      product: existingProduct,
    });
    return await this.review.save(review);
  }

  async findAll(pagination: PaginationDto = {}): Promise<PaginatedResult<Review>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const [data, total] = await this.review.findAndCount({
      relations: { user: true, product: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    const existingReview = await this.review.findOneBy({ id });
    if (!existingReview) throw new NotFoundException('Review not found');

    return existingReview;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string) {
    const existingReview = await this.review.findOneBy({ id });
    if (!existingReview) throw new NotFoundException('Review not found');

    if (existingReview.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this review');
    }

    await this.review.update(id, updateReviewDto);
    return await this.review.findOneBy({ id });
  }

  async remove(id: string, userId: string, admin: boolean = false) {
    const existingReview = await this.review.findOneBy({ id });
    if (!existingReview) throw new NotFoundException('Review not found');

    if (!admin && existingReview.userId !== userId) {
      throw new ForbiddenException('You are not the owner of this review');
    }

    return await this.review.delete(id);
  }
}
