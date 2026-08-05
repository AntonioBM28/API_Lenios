import { ApiProperty } from '@nestjs/swagger';

export class SmartSearchResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  productoId!: string;

  @ApiProperty({ example: 'Tiene jalapeños y es de nuestros más económicos' })
  razon!: string;
}
