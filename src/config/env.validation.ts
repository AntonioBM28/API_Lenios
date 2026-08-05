import * as Joi from 'joi';

/**
 * Schema de validación de variables de entorno con Joi.
 * La aplicación falla rápido (fail-fast) si alguna variable requerida falta o es inválida.
 */
export const envValidationSchema = Joi.object({
  // Servidor
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Base de datos (Supabase / Postgres)
  SUPABASE_DB_HOST: Joi.string().required(),
  SUPABASE_DB_PORT: Joi.number().default(5432),
  SUPABASE_DB_USER: Joi.string().required(),
  SUPABASE_DB_PASSWORD: Joi.string().required(),
  SUPABASE_DB_NAME: Joi.string().required(),
  // Supabase siempre requiere SSL. El Postgres local de docker-compose
  // (desarrollo) no lo soporta, así que se puede desactivar con DB_SSL=false
  // en ese entorno — en producción se deja el default (true).
  DB_SSL: Joi.boolean().default(true),

  // Supabase client (para uso futuro con storage/realtime/auth)
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),

  // Número de WhatsApp del negocio (formato E.164 sin "+", ej. 5215512345678)
  // usado para armar la URL wa.me al crear un pedido.
  WHATSAPP_BUSINESS_NUMBER: Joi.string()
    .pattern(/^[0-9]+$/)
    .required(),

  // Acceso simple del panel admin (RF8): un único código de acceso (PIN)
  // comparado en el servidor, sin usuarios ni roles.
  //
  // ADMIN_ACCESS_CODE_HASH es el hash bcrypt del PIN — NUNCA el PIN en texto
  // plano. Se genera con `npm run hash:pin -- <tu-pin>` (ver scripts/hash-pin.ts).
  // El patrón valida el formato estándar de un hash bcrypt: $2a$/$2b$/$2y$,
  // costo de 2 dígitos y 53 caracteres de salt+hash (60 caracteres en total).
  ADMIN_ACCESS_CODE_HASH: Joi.string()
    .pattern(/^\$2[aby]\$\d{2}\$[A-Za-z0-9./]{53}$/)
    .required()
    .messages({
      'string.pattern.base':
        'ADMIN_ACCESS_CODE_HASH debe ser un hash bcrypt válido (generado con "npm run hash:pin -- <pin>"), no el PIN en texto plano.',
    }),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_ADMIN_EXPIRATION: Joi.string().default('12h'),

  // Origen del frontend en producción, usado por CORS (main.ts). En
  // development CORS acepta cualquier origen ('*'), así que esto solo
  // es obligatorio cuando NODE_ENV=production.
  FRONTEND_URL: Joi.string().uri().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});
