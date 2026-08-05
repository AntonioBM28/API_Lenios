import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({ example: '1234', description: 'Código de acceso del admin' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}
