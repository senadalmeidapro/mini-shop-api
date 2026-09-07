import { DataSource } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

export async function seedCategories(ds: DataSource): Promise<Category[]> {
  const repo = ds.getRepository(Category);

  const categories = repo.create([
    { name: 'Électronique', slug: 'electronics' },
    { name: 'Vêtements', slug: 'clothing' },
    { name: 'Livres', slug: 'books' },
    { name: 'Maison & Cuisine', slug: 'home-kitchen' },
    { name: 'Sports & Plein air', slug: 'sports-outdoors' },
  ]);

  return repo.save(categories);
}
