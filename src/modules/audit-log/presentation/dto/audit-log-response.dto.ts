import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditLogEntry } from '../../domain/audit-log-entry.entity';
import {
  AUDIT_ACTIONS,
  AUDIT_ACTORS,
  AuditAction,
  AuditActor,
} from '../../domain/audit-action';
import { AuditLogListResult } from '../../domain/audit-log.repository.interface';

export class AuditLogResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ enum: AUDIT_ACTIONS, example: 'ORDER_CREATED' })
  accion!: AuditAction;

  @ApiPropertyOptional({ example: 'pedido', nullable: true })
  entidad!: string | null;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    nullable: true,
  })
  entidadId!: string | null;

  @ApiProperty({ enum: AUDIT_ACTORS, example: 'publico' })
  actor!: AuditActor;

  @ApiPropertyOptional({ example: '127.0.0.1', nullable: true })
  ip!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
    example: { estadoAnterior: 'recibido', estadoNuevo: 'en_preparacion' },
  })
  metadata!: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-08-04T20:00:00.000Z' })
  createdAt!: string;

  static fromDomain(entry: AuditLogEntry): AuditLogResponseDto {
    const dto = new AuditLogResponseDto();
    dto.id = entry.id;
    dto.accion = entry.accion;
    dto.entidad = entry.entidad;
    dto.entidadId = entry.entidadId;
    dto.actor = entry.actor;
    dto.ip = entry.ip;
    dto.metadata = entry.metadata;
    dto.createdAt = entry.createdAt.toISOString();
    return dto;
  }
}

export class AuditLogListResponseDto {
  @ApiProperty({ type: [AuditLogResponseDto] })
  data!: AuditLogResponseDto[];

  @ApiProperty({
    example: 137,
    description: 'Total de registros que coinciden con el filtro',
  })
  total!: number;

  @ApiProperty({ example: 50 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;

  static fromResult(
    result: AuditLogListResult,
    limit: number,
    offset: number,
  ): AuditLogListResponseDto {
    const dto = new AuditLogListResponseDto();
    dto.data = result.items.map((item) => AuditLogResponseDto.fromDomain(item));
    dto.total = result.total;
    dto.limit = limit;
    dto.offset = offset;
    return dto;
  }
}
