import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminProtected } from '../../../common/decorators/admin-protected.decorator';
import { ListAuditLogsUseCase } from '../application/use-cases/list-audit-logs.use-case';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';
import { AuditLogListResponseDto } from './dto/audit-log-response.dto';

/**
 * Trazabilidad y Bitácoras de Auditoría: consulta de solo lectura sobre
 * `audit_logs`. No hay endpoints de escritura/edición/borrado aquí — la
 * bitácora se alimenta únicamente desde RecordAuditLogUseCase, llamado por
 * los demás módulos (nunca directamente desde HTTP).
 */
@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly listAuditLogsUseCase: ListAuditLogsUseCase) {}

  @Get()
  @AdminProtected()
  @ApiOperation({
    summary: 'Bitácora de auditoría (solo lectura)',
    description:
      'Registro de quién, cuándo y qué acción se realizó sobre datos personales/recursos ' +
      'sensibles. Nunca contiene nombre, teléfono ni dirección — solo IDs de referencia y ' +
      'metadata técnica.',
  })
  @ApiResponse({ status: 200, type: AuditLogListResponseDto })
  async findAll(
    @Query() query: ListAuditLogsQueryDto,
  ): Promise<AuditLogListResponseDto> {
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    const result = await this.listAuditLogsUseCase.execute({
      accion: query.accion,
      entidad: query.entidad,
      desde: query.desde ? new Date(query.desde) : undefined,
      hasta: query.hasta ? new Date(query.hasta) : undefined,
      limit,
      offset,
    });

    return AuditLogListResponseDto.fromResult(result, limit, offset);
  }
}
