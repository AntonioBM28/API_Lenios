import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 3000;
  const nodeEnv = configService.get<string>('app.nodeEnv') ?? 'development';

  // ── Helmet ──────────────────────────────────────────────────────────────────
  // Cabeceras HTTP de seguridad estándar (X-Content-Type-Options: nosniff,
  // Strict-Transport-Security, X-Frame-Options, oculta X-Powered-By, etc.).
  // contentSecurityPolicy se desactiva: esta API solo sirve JSON + Swagger UI
  // en no-producción; una CSP genérica rompería los assets propios de Swagger
  // (swagger-ui-express) sin aportar protección real (no servimos HTML de
  // usuarios). El resto de cabeceras de helmet quedan activas.
  app.use(helmet({ contentSecurityPolicy: false }));

  // ── CORS ────────────────────────────────────────────────────────────────────
  // Permite que el frontend React+Vite (otro origen) consuma esta API.
  // En producción, reemplazar '*' con el dominio real del frontend.
  app.enableCors({
    origin: nodeEnv === 'production' ? process.env['FRONTEND_URL'] : '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Prefijo global de API ───────────────────────────────────────────────────
  // Todos los endpoints (excepto /health) estarán bajo /api/v1
  // Nota: /health no usa el prefijo — se registra fuera del prefix
  // Para excluir /health del prefijo, se define en su propio módulo sin /api/v1
  // Si deseas prefijo: descomentar la línea de abajo y ajustar el HealthController
  // app.setGlobalPrefix('api/v1', { exclude: ['health'] });

  // ── ValidationPipe global ───────────────────────────────────────────────────
  // whitelist: elimina propiedades no definidas en el DTO
  // forbidNonWhitelisted: lanza error si llegan propiedades extra
  // transform: convierte automáticamente los tipos (string → number, etc.)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Filtro de excepciones global ────────────────────────────────────────────
  // Convierte CUALQUIER error en { statusCode, message, error, timestamp, path }
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── Interceptor de contexto de request (trazabilidad/auditoría) ────────────
  // Captura IP/método/ruta de cada request y los deja en `request.auditContext`
  // para que los controllers los reenvíen a RecordAuditLogUseCase vía @AuditContext().
  app.useGlobalInterceptors(new RequestContextInterceptor());

  // ── Swagger / OpenAPI ───────────────────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Leños Rellenos API')
      .setDescription(
        'API REST para la gestión del negocio de comida artesanal Leños Rellenos. ' +
          'Documentación interactiva de todos los endpoints disponibles.',
      )
      .setVersion('1.0.0')
      .addTag('Health', 'Estado de la API y la base de datos')
      .addTag('Products', 'Catálogo de productos del menú')
      .addTag('Categories', 'Categorías del menú')
      .addTag('Orders', 'Gestión de pedidos')
      .addTag('Business Hours', 'Horarios de atención del negocio')
      .addTag(
        'Audit Logs',
        'Bitácora de auditoría (trazabilidad y transferencias de datos)',
      )
      .addTag('Auth', 'Autenticación del panel de administrador')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════╗
║          🪵  Leños Rellenos API  🪵               ║
╠═══════════════════════════════════════════════════╣
║  Environment : ${nodeEnv.padEnd(33)}║
║  API running : http://localhost:${port}/           ║
║  Health check: http://localhost:${port}/health     ║
║  Swagger docs: http://localhost:${port}/api/docs   ║
╚═══════════════════════════════════════════════════╝
  `);
}

void bootstrap();
