import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Sanitize } from '../../../../common/decorators/sanitize.decorator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Clásicos', maxLength: 100 })
  @Sanitize()
  @IsString({ message: 'El nombre de la categoría debe ser texto' })
  @MinLength(1, { message: 'El nombre de la categoría es obligatorio' })
  @MaxLength(100, { message: 'El nombre de la categoría no puede superar los 100 caracteres' })
  nombre!: string;

  @ApiPropertyOptional({ example: 'Los favoritos de siempre' })
  @IsOptional()
  @Sanitize()
  @IsString({ message: 'La descripción de la categoría debe ser texto' })
  descripcion?: string;
}
