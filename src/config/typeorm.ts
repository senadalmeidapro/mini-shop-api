import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

export default new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_NAME ?? 'database.sqlite',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: true,
});
