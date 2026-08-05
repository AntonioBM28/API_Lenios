import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Sanitize } from '../../../../common/decorators/sanitize.decorator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Clásicos', maxLength: 100 })
  @Sanitize()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Los favoritos de siempre' })
  @IsOptional()
  @Sanitize()
  @IsString()
  descripcion?: string;
}
