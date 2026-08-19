import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Sanitize } from '../../../../common/decorators/sanitize.decorator';
import {
  ArrayMinSize,
  IsBoolean,
  IsInt,
  IsLatitude,
  IsLongitude,
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
  @Sanitize()
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre!: string;

  @ApiProperty({ example: '5512345678', description: 'Exactamente 10 dígitos' })
  @Matches(/^[0-9]{10}$/, {
    message: 'El teléfono debe ser un número válido de 10 dígitos',
  })
  telefono!: string;

  @ApiProperty({ example: 'Av. Siempre Viva 742, Col. Centro' })
  @Sanitize()
  @IsString({ message: 'La dirección debe ser texto' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  direccion!: string;
}

export class CreateOrderItemDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID('all', { message: 'El ID de producto no es válido' })
  productoId!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser mayor a cero' })
  cantidad!: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: CreateOrderClienteDto })
  @ValidateNested({ message: 'Los datos del cliente no son válidos' })
  @Type(() => CreateOrderClienteDto)
  cliente!: CreateOrderClienteDto;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @ValidateNested({ each: true, message: 'Uno o más productos tienen datos inválidos' })
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1, { message: 'El pedido debe incluir al menos un producto' })
  items!: CreateOrderItemDto[];

  @ApiPropertyOptional({ example: 'Domicilio' })
  @IsOptional()
  @Sanitize()
  @IsString({ message: 'El método de envío debe ser texto' })
  metodoEnvio?: string;

  @ApiPropertyOptional({ example: 'Tocar el timbre, no hay número visible' })
  @IsOptional()
  @Sanitize()
  @IsString({ message: 'Las observaciones deben ser texto' })
  observaciones?: string;

  @ApiProperty({
    example: true,
    description:
      'Consentimiento explícito del cliente (Aviso de Privacidad) para procesar sus datos ' +
      'y transferirlos vía WhatsApp al confirmar el pedido. Debe ser true — el backend ' +
      'rechaza con 400 si es false, no basta con la validación del checkbox en el frontend.',
  })
  @IsBoolean({ message: 'El consentimiento debe ser verdadero o falso' })
  consentimientoAceptado!: boolean;

  @ApiPropertyOptional({
    example: 19.4326,
    description:
      'Latitud fijada a mano por el cliente en el mapa del checkout (MapPicker, opcional). ' +
      'Si viene junto con entregaLon, el backend la usa directo y NO geocodifica `direccion` — ' +
      'evita una llamada innecesaria a Nominatim y es más precisa que geocodificar texto libre.',
  })
  @IsOptional()
  @IsLatitude({ message: 'La latitud de entrega no es válida' })
  entregaLat?: number;

  @ApiPropertyOptional({
    example: -99.1332,
    description: 'Longitud correspondiente a entregaLat (ver descripción de entregaLat).',
  })
  @IsOptional()
  @IsLongitude({ message: 'La longitud de entrega no es válida' })
  entregaLon?: number;
}
