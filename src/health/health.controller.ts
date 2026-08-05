import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * Health Check Controller
 * GET /health
 *
 * Verifica que:
 * 1. La API está corriendo correctamente.
 * 2. La conexión a la base de datos (Supabase/Postgres) está activa.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Verifica el estado de la API y la base de datos' })
  @ApiResponse({
    status: 200,
    description: 'La API y la base de datos están activas',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        database: 'connected',
        uptime: 12.345,
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Servicio no disponible' })
  async check(): Promise<Record<string, unknown>> {
    let dbStatus = 'disconnected';

    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        dbStatus = 'connected';
      }
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
    };
  }
}
