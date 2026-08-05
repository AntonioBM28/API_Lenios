import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { BusinessStatus } from '../../domain/is-business-open';
import { HorarioDiaDto } from './horario-dia.dto';

/**
 * Forma de respuesta alineada 1:1 con el resultado de `isBusinessOpen()`
 * ya usado en el frontend (App_Lenios/.../utils/businessHoursUtils.ts).
 */
export class BusinessStatusResponseDto {
  @ApiProperty({ example: true })
  abierto!: boolean;

  @ApiPropertyOptional({ type: HorarioDiaDto })
  horarioHoy?: HorarioDiaDto;

  static fromDomain(status: BusinessStatus): BusinessStatusResponseDto {
    const dto = new BusinessStatusResponseDto();
    dto.abierto = status.abierto;
    dto.horarioHoy = status.horarioHoy;
    return dto;
  }
}
