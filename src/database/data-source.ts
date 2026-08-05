import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * DataSource para TypeORM CLI.
 * Usado por los scripts de migración en package.json:
 *
 *   npm run migration:generate --name=CreateProductsTable
 *   npm run migration:run
 *   npm run migration:revert
 *
 * IMPORTANTE: Este archivo NO se importa en la app NestJS.
 * La app usa DatabaseModule (TypeOrmModule.forRootAsync).
 * Este DataSource es SOLO para el CLI de TypeORM.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env['SUPABASE_DB_HOST'],
  port: parseInt(process.env['SUPABASE_DB_PORT'] ?? '5432', 10),
  username: process.env['SUPABASE_DB_USER'],
  password: process.env['SUPABASE_DB_PASSWORD'],
  database: process.env['SUPABASE_DB_NAME'],
  entities: [__dirname + '/../**/*.orm-entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
});
