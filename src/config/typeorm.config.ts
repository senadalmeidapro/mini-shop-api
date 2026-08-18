import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { envConfig } from './env.config.ts';

export default new DataSource({
  type: 'postgres',

  host: envConfig.database.host,
  port: envConfig.database.port,
  username: envConfig.database.username,
  password: envConfig.database.password,
  database: envConfig.database.database,

  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],

  synchronize: false,
  logging: true,
});
