import { ApiProperty } from '@nestjs/swagger';
import { BusinessHoursConfig } from '../../domain/business-hours-config.entity';
import { HorarioDiaDto } from './horario-dia.dto';

/**
 * Forma de respuesta alineada 1:1 con `ConfiguracionHorario` del frontend
 * (App_Lenios/src/features/business-hours/types/index.ts).
 */
export class BusinessHoursConfigResponseDto {
  @ApiProperty({ type: [HorarioDiaDto] })
  horarios!: HorarioDiaDto[];

  @ApiProperty({ example: false })
  cierreManual!: boolean;

  static fromDomain(
    config: BusinessHoursConfig,
  ): BusinessHoursConfigResponseDto {
    const dto = new BusinessHoursConfigResponseDto();
    dto.horarios = config.horarios;
    dto.cierreManual = config.cierreManual;
    return dto;
  }
}
