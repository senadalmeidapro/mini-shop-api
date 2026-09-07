import { DataSource } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

export async function seedCategories(ds: DataSource): Promise<Category[]> {
  const repo = ds.getRepository(Category);

  const categories = repo.create([
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Clothing', slug: 'clothing' },
    { name: 'Books', slug: 'books' },
    { name: 'Home & Kitchen', slug: 'home-kitchen' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors' },
  ]);

  return repo.save(categories);
}
