import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

const config = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: config.getOrThrow<string>('DB_HOST'),
  port: config.getOrThrow<number>('DB_PORT'),
  username: config.getOrThrow<string>('DB_USERNAME'),
  password: config.getOrThrow<string>('DB_PASSWORD'),
  database: config.getOrThrow<string>('DB_NAME'),

  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],

  migrations: [join(__dirname, '../../migrations/*{.ts,.js}')],

  migrationsRun: true,
  migrationsTableName: 'migrations',
  synchronize: false,
});
