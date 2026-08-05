import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Módulo global de base de datos.
 * Configura la conexión TypeORM a Supabase/Postgres de forma asíncrona,
 * leyendo las credenciales desde ConfigService (variables de entorno validadas).
 *
 * Entidades: se registrarán automáticamente cuando se definan en los módulos
 * de negocio con TypeOrmModule.forFeature([...]).
 *
 * synchronize: false en producción — usamos migraciones explícitas.
 *
 * Patrón: Factory Method.
 * `useFactory` construye el objeto de configuración de conexión en tiempo
 * de ejecución a partir de ConfigService (host, credenciales, SSL), en vez
 * de un objeto estático. NestJS invoca esta fábrica una sola vez al
 * arrancar y reutiliza la conexión resultante para todo el proceso.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [__dirname + '/../**/*.orm-entity{.ts,.js}'],
        migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: configService.get<string>('app.nodeEnv') === 'development',
        // Supabase exige SSL; el Postgres local de docker-compose no lo
        // soporta. DB_SSL=false (solo en desarrollo local) lo desactiva.
        ssl: configService.get<boolean>('database.ssl')
          ? { rejectUnauthorized: false }
          : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
