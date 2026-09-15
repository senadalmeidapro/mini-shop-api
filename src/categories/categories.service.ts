import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { PaginationDto, PaginatedResult, buildPaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categry: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categry.findOneBy({ slug: createCategoryDto.slug });
    if (existingCategory) throw new ConflictException('This product slug is already in use');

    const category = this.categry.create(createCategoryDto);
    return await this.categry.save(category);
  }

  async findAll(pagination: PaginationDto = {}): Promise<PaginatedResult<Category>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const [data, total] = await this.categry.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    const category = await this.categry.findOne({
      where: { id },
      relations: { products: true },
    });

    if (!category) throw new NotFoundException(`Category ${id} not found.`);
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categry.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found.');

    await this.categry.update(id, updateCategoryDto);
    return await this.categry.findOneBy({ id });
  }

  async remove(id: string) {
    const category = await this.categry.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found.');

    return await this.categry.delete(id);
  }
}
