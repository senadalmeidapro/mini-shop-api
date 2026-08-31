import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

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

  async findAll() {
    return await this.categry.find();
  }

  async findOne(slug: string) {
    const category = await this.categry
      .createQueryBuilder('category')
      .innerJoin('category.products', 'product')
      .where('category.slug = :slug', { slug })
      .getOne();

    if (!category) throw new NotFoundException(`Category ${slug} not found.`);
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
