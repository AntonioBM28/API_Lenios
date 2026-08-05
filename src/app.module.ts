import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Config
import {
  appConfig,
  databaseConfig,
  supabaseConfig,
  whatsappConfig,
  authConfig,
} from './config/app.config';
import { envValidationSchema } from './config/env.validation';

// Database
import { DatabaseModule } from './database/database.module';

// Health
import { HealthModule } from './health/health.module';

// Business Modules
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BusinessHoursModule } from './modules/business-hours/business-hours.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';

/**
 * AppModule – Módulo raíz de la aplicación Leños Rellenos API.
 *
 * Registra:
 *   - ConfigModule global con validación de variables de entorno (Joi)
 *   - DatabaseModule global (TypeORM → Supabase/Postgres)
 *   - HealthModule (GET /health)
 *   - Módulos de negocio: products, categories, orders, business-hours, auth
 */
@Module({
  imports: [
    // ── Configuración global ──────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        appConfig,
        databaseConfig,
        supabaseConfig,
        whatsappConfig,
        authConfig,
      ],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false, // muestra TODOS los errores de env, no solo el primero
      },
    }),

    // ── Base de datos ─────────────────────────────────────────────────────────
    DatabaseModule,

    // ── Utilidades ────────────────────────────────────────────────────────────
    HealthModule,

    // ── Módulos de negocio ────────────────────────────────────────────────────
    AuditLogModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    BusinessHoursModule,
    AuthModule,
  ],
})
export class AppModule {}
