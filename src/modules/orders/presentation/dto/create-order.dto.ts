import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateOrderClienteDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  nombre!: string;

  @ApiProperty({ example: '5512345678', description: 'Exactamente 10 dígitos' })
  @Matches(/^[0-9]{10}$/, {
    message: 'telefono debe ser un número válido de 10 dígitos',
  })
  telefono!: string;

  @ApiProperty({ example: 'Av. Siempre Viva 742, Col. Centro' })
  @IsString()
  @MinLength(5)
  direccion!: string;
}

export class CreateOrderItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  productoId!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @IsPositive()
  cantidad!: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: CreateOrderClienteDto })
  @ValidateNested()
  @Type(() => CreateOrderClienteDto)
  cliente!: CreateOrderClienteDto;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1)
  items!: CreateOrderItemDto[];

  @ApiPropertyOptional({ example: 'Domicilio' })
  @IsOptional()
  @IsString()
  metodoEnvio?: string;

  @ApiPropertyOptional({ example: 'Tocar el timbre, no hay número visible' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiProperty({
    example: true,
    description:
      'Consentimiento explícito del cliente (Aviso de Privacidad) para procesar sus datos ' +
      'y transferirlos vía WhatsApp al confirmar el pedido. Debe ser true — el backend ' +
      'rechaza con 400 si es false, no basta con la validación del checkbox en el frontend.',
  })
  @IsBoolean()
  consentimientoAceptado!: boolean;
}
