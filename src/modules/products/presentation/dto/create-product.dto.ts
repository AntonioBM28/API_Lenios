import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { Sanitize } from '../../../../common/decorators/sanitize.decorator';

export class CreateProductDto {
  @ApiProperty({ example: 'Leño Sabor Salchicha', maxLength: 100 })
  @Sanitize()
  @IsString()
  @MinLength(1)
  nombre!: string;

  @ApiProperty({
    example:
      'Jugosa salchicha artesanal con queso oaxaca, jalapeños y mostaza dijon.',
  })
  @Sanitize()
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiProperty({ example: 185.0, description: 'Precio en MXN' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precio!: number;

  @ApiPropertyOptional({
    example: 'https://placehold.co/400x300/1C110A/F97316?text=Salchicha',
  })
  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  categoriaId!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  disponible?: boolean;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    default: false,
    description: 'Si aparece en la sección "Sabores Destacados" del Home',
  })
  @IsOptional()
  @IsBoolean()
  destacado?: boolean;
}
