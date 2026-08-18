import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { envConfig } from './env.config.ts';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: envConfig.database.host,
  port: envConfig.database.port,
  username: envConfig.database.username,
  password: envConfig.database.password,
  database: envConfig.database.database,

  entities: ['dist/entities/**/*.js'],
  migrations: ['dist/migrations/**/*.js'],

  synchronize: false,
  logging: false,
});
