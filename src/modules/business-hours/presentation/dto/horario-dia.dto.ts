import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, Matches } from 'class-validator';

const HHMM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class HorarioDiaDto {
  @ApiProperty({
    enum: [0, 1, 2, 3, 4, 5, 6],
    example: 1,
    description: '0 = Domingo ... 6 = Sábado',
  })
  @IsIn([0, 1, 2, 3, 4, 5, 6], {
    message: 'El día debe ser un valor entre 0 (Domingo) y 6 (Sábado)',
  })
  dia!: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  @ApiProperty({ example: '13:00' })
  @Matches(HHMM_REGEX, { message: 'El horario de apertura debe tener formato HH:mm (ej. 13:00)' })
  abre!: string;

  @ApiProperty({ example: '21:00' })
  @Matches(HHMM_REGEX, { message: 'El horario de cierre debe tener formato HH:mm (ej. 21:00)' })
  cierra!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean({ message: 'El campo "cerrado" debe ser verdadero o falso' })
  cerrado?: boolean;
}
