import { DataSource } from 'typeorm';

import { Category } from '../../categories/entities/category.entity';

import { Product } from '../../products/entities/product.entity';
import { Shop } from '../../shops/entities/shop.entity';

export async function seedProducts(ds: DataSource): Promise<Product[]> {
  const categories = await ds.getRepository(Category).find();

  const bySlug = (slug: string) => categories.find((c) => c.slug === slug)?.id ?? '';

  const shops = await ds.getRepository(Shop).find();
  const shopBySlug = (slug: string) => shops.find((s) => s.slug === slug)?.id ?? '';

  const repo = ds.getRepository(Product);

  const products = repo.create([
    {
      shopId: shopBySlug('techstore'),
      categoryId: bySlug('electronics'),
      name: 'Casque sans fil',
      description: 'Casque Bluetooth circum-aural avec réduction active du bruit.',
      price: 55000,
      stock: 50,
    },

    {
      shopId: shopBySlug('techstore'),
      categoryId: bySlug('electronics'),
      name: 'Montre connectée',
      description:
        'Montre connectée avec suivi de la condition physique, mesure du rythme cardiaque et GPS.',
      price: 10000,
      stock: 30,
    },

    {
      shopId: shopBySlug('techstore'),
      categoryId: bySlug('electronics'),
      name: 'Hub USB-C',
      description: 'Hub USB-C 7-en-1 avec HDMI, Ethernet et lecteur de carte SD.',
      price: 15000,
      stock: 120,
    },

    {
      shopId: shopBySlug('lifestyle-books'),
      categoryId: bySlug('clothing'),
      name: 'T-shirt en coton',
      description: 'T-shirt doux en coton biologique 100 %, coupe unisexe.',
      price: 2500,
      stock: 200,
    },

    {
      shopId: shopBySlug('lifestyle-books'),
      categoryId: bySlug('clothing'),
      name: 'Veste en jean',
      description: 'Veste classique en jean avec fermeture à boutons.',
      price: 50000,
      stock: 40,
    },

    {
      shopId: shopBySlug('lifestyle-books'),
      categoryId: bySlug('books'),
      name: 'Les Innovateurs',
      description:
        'L’histoire des hackers, génies et passionnés qui ont créé la révolution numérique.',
      price: 15000,
      stock: 80,
    },

    {
      shopId: shopBySlug('lifestyle-books'),
      categoryId: bySlug('books'),
      name: 'Clean Code',
      description:
        'Manuel pratique sur les bonnes pratiques et l’art de développer un logiciel propre.',
      price: 20000,
      stock: 60,
    },

    {
      shopId: shopBySlug('lifestyle-books'),
      categoryId: bySlug('home-kitchen'),
      name: 'Poêle en acier inoxydable',
      description: 'Poêle avec revêtement antiadhésif, compatible avec le lave-vaisselle.',
      price: 25000,
      stock: 75,
    },

    {
      shopId: shopBySlug('lifestyle-books'),
      categoryId: bySlug('home-kitchen'),
      name: 'Cafetière',
      description: 'Cafetière filtre avec minuterie programmable et carafe.',
      price: 35000,
      stock: 25,
    },

    {
      shopId: shopBySlug('lifestyle-books'),
      categoryId: bySlug('sports-outdoors'),
      name: 'Tapis de yoga',
      description: 'Tapis de yoga antidérapant avec sangle de transport.',
      price: 18000,
      stock: 90,
    },
  ]);

  return repo.save(products);
}
