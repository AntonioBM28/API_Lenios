import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class ListProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtra productos por categoría',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID('all', { message: 'El ID de categoría no es válido' })
  categoriaId?: string;

  @ApiPropertyOptional({
    description:
      'Filtra por disponibilidad. Útil para que el catálogo público pida solo productos disponibles.',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean({ message: 'El valor de disponibilidad debe ser verdadero o falso' })
  disponible?: boolean;
}
