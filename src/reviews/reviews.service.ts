import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(User)
    private readonly user: Repository<User>,

    @InjectRepository(Review)
    private readonly review: Repository<Review>,

    @InjectRepository(Product)
    private readonly product: Repository<Product>,
  ) {}

  async create(userId: string, productId: string, createReviewDto: CreateReviewDto) {
    const existingUser = await this.user.findOneBy({ id: userId });
    if (!existingUser) throw new NotFoundException('User not found');

    const existingProduct = await this.product.findOneBy({ id: productId });
    if (!existingProduct) throw new NotFoundException('Product not found');

    const review = this.review.create({
      ...createReviewDto,
      user: existingUser,
      product: existingProduct,
    });
    return await this.review.save(review);
  }

  async findAll() {
    return await this.review.find();
  }

  async findOne(id: string) {
    const existingReview = await this.review.findOneBy({ id });
    if (!existingReview) throw new NotFoundException('Review not found');

    return existingReview;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string) {
    const existingReview = await this.review.findOneBy({ id });
    if (!existingReview) throw new NotFoundException('Review not found');

    if (existingReview.userId != userId) {
      throw new ForbiddenException('You are not the owner of this review');
    }

    await this.review.update(id, updateReviewDto);
    return await this.review.findOneBy({ id });
  }

  async remove(id: string, userId: string, admin: boolean = false) {
    const existingReview = await this.review.findOneBy({ id });
    if (!existingReview) throw new NotFoundException('Review not found');

    if (!admin && existingReview.userId != userId) {
      throw new ForbiddenException('You are not the owner of this review');
    }

    return await this.review.delete(id);
  }
}
