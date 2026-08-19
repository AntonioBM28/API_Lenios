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
  @IsString({ message: 'El nombre del producto debe ser texto' })
  @MinLength(1, { message: 'El nombre del producto es obligatorio' })
  nombre!: string;

  @ApiProperty({
    example:
      'Jugosa salchicha artesanal con queso oaxaca, jalapeños y mostaza dijon.',
  })
  @Sanitize()
  @IsString({ message: 'La descripción debe ser texto' })
  @IsNotEmpty({ message: 'La descripción del producto es obligatoria' })
  descripcion!: string;

  @ApiProperty({ example: 185.0, description: 'Precio en MXN' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido (máx. 2 decimales)' })
  @IsPositive({ message: 'El precio debe ser mayor a cero' })
  precio!: number;

  @ApiPropertyOptional({
    example: 'https://placehold.co/400x300/1C110A/F97316?text=Salchicha',
  })
  @IsOptional()
  @IsString({ message: 'La URL de la imagen debe ser texto' })
  imagenUrl?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID('all', { message: 'El ID de categoría no es válido' })
  categoriaId!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean({ message: 'La disponibilidad debe ser verdadero o falso' })
  disponible?: boolean;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;

  @ApiPropertyOptional({
    default: false,
    description: 'Si aparece en la sección "Sabores Destacados" del Home',
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo "destacado" debe ser verdadero o falso' })
  destacado?: boolean;
}
