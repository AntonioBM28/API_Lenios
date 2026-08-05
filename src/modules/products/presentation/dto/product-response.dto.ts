import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../../domain/product.entity';

/**
 * Forma de respuesta alineada 1:1 con el tipo `Producto` del frontend
 * (App_Lenios/src/shared/types/index.ts) para que la integración futura
 * no requiera transformar nada del lado del cliente.
 */
export class ProductResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Leño Sabor Salchicha' })
  nombre!: string;

  @ApiProperty({
    example:
      'Jugosa salchicha artesanal con queso oaxaca, jalapeños y mostaza dijon.',
  })
  descripcion!: string;

  @ApiProperty({ example: 185.0 })
  precio!: number;

  @ApiPropertyOptional({
    example: 'https://placehold.co/400x300/1C110A/F97316?text=Salchicha',
    nullable: true,
  })
  imagenUrl!: string | null;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  categoriaId!: string;

  @ApiProperty({ example: true })
  disponible!: boolean;

  @ApiProperty({ example: 20 })
  stock!: number;

  @ApiProperty({ example: false })
  destacado!: boolean;

  static fromDomain(product: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = product.id;
    dto.nombre = product.nombre;
    dto.descripcion = product.descripcion;
    dto.precio = product.precio;
    dto.imagenUrl = product.imagenUrl;
    dto.categoriaId = product.categoriaId;
    dto.disponible = product.disponible;
    dto.stock = product.stock;
    dto.destacado = product.destacado;
    return dto;
  }
}
