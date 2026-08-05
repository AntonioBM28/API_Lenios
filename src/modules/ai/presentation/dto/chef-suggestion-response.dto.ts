import { ApiProperty } from '@nestjs/swagger';

export class ChefSuggestionResponseDto {
  @ApiProperty({ example: 'Dúo Picante Artesanal' })
  titulo!: string;

  @ApiProperty({
    example:
      'La combinación perfecta de nuestro leño de salchicha con el picosito de jalapeño, ideal para compartir.',
  })
  descripcion!: string;

  @ApiProperty({
    example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
    type: [String],
  })
  productoIds!: string[];
}
