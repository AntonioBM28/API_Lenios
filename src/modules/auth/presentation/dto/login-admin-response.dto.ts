import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminResponseDto {
  @ApiProperty({
    description: 'JWT de sesión para usar en Authorization: Bearer <token>',
  })
  token!: string;

  @ApiProperty({
    example: '12h',
    description: 'Tiempo de expiración del token',
  })
  expiresIn!: string;
}
