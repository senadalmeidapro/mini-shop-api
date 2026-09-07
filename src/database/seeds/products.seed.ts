import { DataSource } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';

export async function seedProducts(ds: DataSource): Promise<Product[]> {
  const categories = await ds.getRepository(Category).find();

  const bySlug = (slug: string) => categories.find((c) => c.slug === slug)?.id ?? '';

  const repo = ds.getRepository(Product);

  const products = repo.create([
    {
      categoryId: bySlug('electronics'),
      name: 'Wireless Headphones',
      description: 'Over-ear Bluetooth headphones with active noise cancellation.',
      price: 89.99,
      stock: 50,
    },
    {
      categoryId: bySlug('electronics'),
      name: 'Smart Watch',
      description: 'Fitness tracker with heart rate monitor and GPS.',
      price: 149.5,
      stock: 30,
    },
    {
      categoryId: bySlug('electronics'),
      name: 'USB-C Hub',
      description: '7-in-1 USB-C hub with HDMI, ethernet and SD card reader.',
      price: 39.99,
      stock: 120,
    },
    {
      categoryId: bySlug('clothing'),
      name: 'Cotton T-Shirt',
      description: 'Soft 100% organic cotton t-shirt, unisex fit.',
      price: 19.99,
      stock: 200,
    },
    {
      categoryId: bySlug('clothing'),
      name: 'Denim Jacket',
      description: 'Classic classic-fit denim jacket with button closure.',
      price: 79.0,
      stock: 40,
    },
    {
      categoryId: bySlug('books'),
      name: 'The Innovators',
      description: 'How a group of hackers, geniuses and geeks created the digital revolution.',
      price: 24.99,
      stock: 80,
    },
    {
      categoryId: bySlug('books'),
      name: 'Clean Code',
      description: 'A handbook of agile software craftsmanship.',
      price: 34.95,
      stock: 60,
    },
    {
      categoryId: bySlug('home-kitchen'),
      name: 'Stainless Steel Pan',
      description: 'Frying pan with non-stick coating, dishwasher safe.',
      price: 42.5,
      stock: 75,
    },
    {
      categoryId: bySlug('home-kitchen'),
      name: 'Coffee Maker',
      description: 'Drip coffee maker with programmable timer and carafe.',
      price: 59.99,
      stock: 25,
    },
    {
      categoryId: bySlug('sports-outdoors'),
      name: 'Yoga Mat',
      description: 'Non-slip exercise yoga mat with carrying strap.',
      price: 29.9,
      stock: 90,
    },
  ]);

  return repo.save(products);
}
