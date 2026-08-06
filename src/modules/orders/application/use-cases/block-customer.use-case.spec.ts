import { NotFoundException } from '@nestjs/common';
import { BlockCustomerUseCase } from './block-customer.use-case';
import { Customer } from '../../domain/customer.entity';
import { CustomerRepository } from '../../domain/customer.repository.interface';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return new Customer({
    id: 'c1',
    nombre: 'Juan Pérez',
    telefono: '5512345678',
    ubicacion: 'Av. Siempre Viva 742',
    fechaRegistro: new Date('2025-01-01'),
    bloqueado: false,
    ...overrides,
  });
}

describe('BlockCustomerUseCase', () => {
  let customerRepository: jest.Mocked<
    Pick<CustomerRepository, 'findById' | 'block'>
  >;
  let recordAuditLogUseCase: jest.Mocked<Pick<RecordAuditLogUseCase, 'execute'>>;
  let useCase: BlockCustomerUseCase;

  beforeEach(() => {
    customerRepository = { findById: jest.fn(), block: jest.fn() };
    recordAuditLogUseCase = { execute: jest.fn() };
    useCase = new BlockCustomerUseCase(
      customerRepository as unknown as CustomerRepository,
      recordAuditLogUseCase as unknown as RecordAuditLogUseCase,
    );
  });

  it('lanza NotFoundException si el cliente no existe', async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('c1', null)).rejects.toThrow(
      NotFoundException,
    );
    expect(customerRepository.block).not.toHaveBeenCalled();
  });

  it('bloquea al cliente y registra auditoría sin datos personales', async () => {
    customerRepository.findById.mockResolvedValue(makeCustomer());

    await useCase.execute('c1', '203.0.113.1');

    expect(customerRepository.block).toHaveBeenCalledWith('c1');
    expect(recordAuditLogUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'CUSTOMER_ARCO_BLOCKED',
        entidadId: 'c1',
        actor: 'admin',
      }),
    );
    const [llamada] = recordAuditLogUseCase.execute.mock.calls[0];
    expect(JSON.stringify(llamada)).not.toContain('Juan Pérez');
  });
});
