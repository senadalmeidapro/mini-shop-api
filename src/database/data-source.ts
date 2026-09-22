import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_NAME ?? 'db.sqlite',
  entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: true,
});
