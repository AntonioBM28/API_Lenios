import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '../../domain/category.entity';

export class CategoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Clásicos' })
  nombre!: string;

  @ApiPropertyOptional({ example: 'Los favoritos de siempre', nullable: true })
  descripcion!: string | null;

  static fromDomain(category: Category): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = category.id;
    dto.nombre = category.nombre;
    dto.descripcion = category.descripcion;
    return dto;
  }
}
