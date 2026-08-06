import { registerAs } from '@nestjs/config';

/**
 * Configuración tipada de la aplicación.
 * Agrupa las variables de entorno en namespaces para acceso limpio vía ConfigService.
 *
 * Uso: configService.get('database.host')
 */

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env['SUPABASE_DB_HOST'],
  port: parseInt(process.env['SUPABASE_DB_PORT'] ?? '5432', 10),
  username: process.env['SUPABASE_DB_USER'],
  password: process.env['SUPABASE_DB_PASSWORD'],
  name: process.env['SUPABASE_DB_NAME'],
  // true en Supabase/producción; false para el Postgres local de
  // docker-compose (no soporta SSL). Ver DB_SSL en env.validation.ts.
  ssl: (process.env['DB_SSL'] ?? 'true') !== 'false',
}));

export const supabaseConfig = registerAs('supabase', () => ({
  url: process.env['SUPABASE_URL'],
  anonKey: process.env['SUPABASE_ANON_KEY'],
}));

export const whatsappConfig = registerAs('whatsapp', () => ({
  businessNumber: process.env['WHATSAPP_BUSINESS_NUMBER'],
}));

export const authConfig = registerAs('auth', () => ({
  // Hash bcrypt del PIN de acceso del admin — nunca el PIN en texto plano.
  // Generado con `npm run hash:pin -- <tu-pin>` (ver scripts/hash-pin.ts).
  adminAccessCodeHash: process.env['ADMIN_ACCESS_CODE_HASH'],
  jwtSecret: process.env['JWT_SECRET'],
  jwtExpiration: process.env['JWT_ADMIN_EXPIRATION'] ?? '12h',
}));

export const aiConfig = registerAs('ai', () => ({
  // Groq (https://console.groq.com) — API compatible con OpenAI, tier
  // gratuito sin tarjeta. Usado por el módulo `ai` (buscador inteligente
  // del menú + "Sugerencia del Chef").
  groqApiKey: process.env['GROQ_API_KEY'],
}));

export const privacyConfig = registerAs('privacy', () => ({
  // Días sin pedidos activos tras los cuales un cliente se anonimiza
  // automáticamente (ver AnonymizeInactiveCustomersUseCase). 365 por
  // defecto — configurable para poder demostrar el mecanismo con un
  // valor bajo (ej. 0) sin esperar un año real.
  retentionDays: parseInt(process.env['DATA_RETENTION_DAYS'] ?? '365', 10),
}));
