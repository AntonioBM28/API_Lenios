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
  @IsIn(AUDIT_ACTIONS, {
    message: `La acción debe ser una de las siguientes: ${AUDIT_ACTIONS.join(', ')}`,
  })
  accion?: AuditAction;

  @ApiPropertyOptional({
    example: 'pedido',
    description: 'Filtra por entidad afectada',
  })
  @IsOptional()
  @IsString({ message: 'La entidad debe ser texto' })
  entidad?: string;

  @ApiPropertyOptional({
    example: '2026-08-01T00:00:00.000Z',
    description: 'Fecha inicial (ISO 8601), inclusive',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha inicial debe estar en formato ISO 8601 (ej. 2026-08-01T00:00:00.000Z)' })
  desde?: string;

  @ApiPropertyOptional({
    example: '2026-08-31T23:59:59.999Z',
    description: 'Fecha final (ISO 8601), inclusive',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha final debe estar en formato ISO 8601 (ej. 2026-08-31T23:59:59.999Z)' })
  hasta?: string;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser al menos 1' })
  @Max(200, { message: 'El límite no puede superar 200' })
  limit?: number;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El desplazamiento debe ser un número entero' })
  @Min(0, { message: 'El desplazamiento no puede ser negativo' })
  offset?: number;
}
