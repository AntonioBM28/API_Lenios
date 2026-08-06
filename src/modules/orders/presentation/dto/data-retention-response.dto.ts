import { ApiProperty } from '@nestjs/swagger';
import { AnonymizeInactiveCustomersResult } from '../../application/use-cases/anonymize-inactive-customers.use-case';

export class DataRetentionResponseDto {
  @ApiProperty({
    example: 2,
    description: 'Número de clientes anonimizados en esta ejecución',
  })
  anonimizados!: number;

  @ApiProperty({
    example: 365,
    description: 'Período de retención (días) usado para esta ejecución',
  })
  retentionDays!: number;

  static fromResult(
    result: AnonymizeInactiveCustomersResult,
  ): DataRetentionResponseDto {
    const dto = new DataRetentionResponseDto();
    dto.anonimizados = result.anonimizados;
    dto.retentionDays = result.retentionDays;
    return dto;
  }
}
