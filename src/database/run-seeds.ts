import 'reflect-metadata';
import 'dotenv/config';
import dataSource from './data-source';

import { seedUsers } from './seeds/users.seed';
import { seedShops } from './seeds/shops.seed';
import { seedCategories } from './seeds/categories.seed';
import { seedProducts } from './seeds/products.seed';
import { seedAddresses } from './seeds/addresses.seed';
import { seedCarts, seedCartItems } from './seeds/carts.seed';
import { seedOrders } from './seeds/orders.seed';
import { seedPayments } from './seeds/payments.seed';
import { seedReviews } from './seeds/reviews.seed';

async function run(): Promise<void> {
  await dataSource.initialize();

  console.log('Clearing existing data...');
  await dataSource.query('PRAGMA foreign_keys = OFF');

  const tables = [
    'notification',
    'payment',
    'order_item',
    'review',
    'order',
    'cart_item',
    'cart',
    'product',
    'shop',
    'address',
    'category',
    'user',
  ];
  for (const table of tables) {
    await dataSource.query(`DELETE FROM "${table}"`);
  }

  await dataSource.query('PRAGMA foreign_keys = ON');

  console.log('Seeding users...');
  const users = await seedUsers(dataSource);

  console.log('Seeding shops...');
  await seedShops(dataSource, users);

  console.log('Seeding categories...');
  await seedCategories(dataSource);

  console.log('Seeding products...');
  await seedProducts(dataSource);

  console.log('Seeding addresses...');
  await seedAddresses(dataSource);

  console.log('Seeding carts...');
  const carts = await seedCarts(dataSource);
  await seedCartItems(dataSource, carts);

  console.log('Seeding orders...');
  await seedOrders(dataSource);

  console.log('Seeding payments...');
  await seedPayments(dataSource);

  console.log('Seeding reviews...');
  await seedReviews(dataSource);

  await dataSource.destroy();
  console.log('Seeding complete.');
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
