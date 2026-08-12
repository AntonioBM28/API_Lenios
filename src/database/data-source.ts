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
  // Igual que en DatabaseModule: Supabase exige SSL, pero el Postgres local
  // de docker-compose no lo soporta. Antes esto estaba fijo en `true` y
  // rompía `npm run migration:run` / `npm run seed` contra el entorno local.
  ssl:
    process.env['DB_SSL'] === 'false' ? false : { rejectUnauthorized: false },
});
