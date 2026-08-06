import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../domain/customer.entity';

export class CustomerResponseDto {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  id!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  nombre!: string;

  @ApiProperty({ example: '5512345678' })
  telefono!: string;

  @ApiProperty({ example: 'Av. Siempre Viva 742, Col. Centro' })
  ubicacion!: string;

  @ApiProperty({ example: '2026-06-10T14:22:01.000Z' })
  fechaRegistro!: string;

  @ApiProperty({
    example: false,
    description:
      'true si el cliente fue bloqueado por una solicitud ARCO en curso ' +
      '— no puede generar nuevos pedidos mientras esté en este estado.',
  })
  bloqueado!: boolean;

  static fromDomain(customer: Customer): CustomerResponseDto {
    const dto = new CustomerResponseDto();
    dto.id = customer.id;
    dto.nombre = customer.nombre;
    dto.telefono = customer.telefono;
    dto.ubicacion = customer.ubicacion;
    dto.fechaRegistro = customer.fechaRegistro.toISOString();
    dto.bloqueado = customer.bloqueado;
    return dto;
  }
}
