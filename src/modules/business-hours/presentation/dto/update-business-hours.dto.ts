import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  Validate,
  ValidateNested,
} from 'class-validator';
import { HorarioDiaDto } from './horario-dia.dto';
import { UniqueDiasConstraint } from '../validators/unique-dias.validator';

export class UpdateBusinessHoursDto {
  @ApiPropertyOptional({
    type: [HorarioDiaDto],
    description:
      'Horario semanal completo: exactamente 7 entradas, una por día (0-6)',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HorarioDiaDto)
  @Validate(UniqueDiasConstraint)
  horarios?: HorarioDiaDto[];

  @ApiPropertyOptional({
    description: 'Override manual para cerrar el negocio inesperadamente',
  })
  @IsOptional()
  @IsBoolean()
  cierreManual?: boolean;
}
