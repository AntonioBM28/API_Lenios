import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AUDIT_ACTIONS, AuditAction } from '../../domain/audit-action';

export class ListAuditLogsQueryDto {
  @ApiPropertyOptional({
    enum: AUDIT_ACTIONS,
    description: 'Filtra por tipo de acción',
  })
  @IsOptional()
  @IsIn(AUDIT_ACTIONS)
  accion?: AuditAction;

  @ApiPropertyOptional({
    example: 'pedido',
    description: 'Filtra por entidad afectada',
  })
  @IsOptional()
  @IsString()
  entidad?: string;

  @ApiPropertyOptional({
    example: '2026-08-01T00:00:00.000Z',
    description: 'Fecha inicial (ISO 8601), inclusive',
  })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiPropertyOptional({
    example: '2026-08-31T23:59:59.999Z',
    description: 'Fecha final (ISO 8601), inclusive',
  })
  @IsOptional()
  @IsDateString()
  hasta?: string;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
