import 'reflect-metadata';
import 'dotenv/config';
import dataSource from './src/database/data-source';

async function main(): Promise<void> {
  await dataSource.initialize();

  for (const table of [
    'user',
    'category',
    'product',
    'address',
    'cart',
    'cart_item',
    'order',
    'order_item',
    'payment',
    'review',
  ]) {
    const [row] = await dataSource.query(`SELECT count(*)::int AS c FROM "${table}"`);
    console.log(table, row.c);
  }

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
