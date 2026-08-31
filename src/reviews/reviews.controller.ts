import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { currentUser } from '../common/decorators';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':productId')
  create(
    @currentUser('sub') sub: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(sub, productId, createReviewDto);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  update(
    @currentUser('sub') sub: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, updateReviewDto, sub);
  }

  @Delete(':id')
  remove(
    @currentUser('sub') sub: string,
    @currentUser('role') role: 'user' | 'admin',
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reviewsService.remove(id, sub, role === 'admin');
  }
}
