import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AnonymizeCustomerOnRequestUseCase } from './anonymize-customer-on-request.use-case';
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

describe('AnonymizeCustomerOnRequestUseCase', () => {
  let customerRepository: jest.Mocked<
    Pick<CustomerRepository, 'findById' | 'anonymize'>
  >;
  let recordAuditLogUseCase: jest.Mocked<Pick<RecordAuditLogUseCase, 'execute'>>;
  let useCase: AnonymizeCustomerOnRequestUseCase;

  beforeEach(() => {
    customerRepository = { findById: jest.fn(), anonymize: jest.fn() };
    recordAuditLogUseCase = { execute: jest.fn() };
    useCase = new AnonymizeCustomerOnRequestUseCase(
      customerRepository as unknown as CustomerRepository,
      recordAuditLogUseCase as unknown as RecordAuditLogUseCase,
    );
  });

  it('lanza NotFoundException si el cliente no existe', async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('c1', null)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rechaza anonimizar si el cliente no está bloqueado (paso 1 pendiente)', async () => {
    customerRepository.findById.mockResolvedValue(
      makeCustomer({ bloqueado: false }),
    );

    await expect(useCase.execute('c1', null)).rejects.toThrow(
      BadRequestException,
    );
    expect(customerRepository.anonymize).not.toHaveBeenCalled();
  });

  it('anonimiza al cliente ya bloqueado y registra auditoría', async () => {
    customerRepository.findById.mockResolvedValue(
      makeCustomer({ bloqueado: true }),
    );

    await useCase.execute('c1', '203.0.113.1');

    expect(customerRepository.anonymize).toHaveBeenCalledWith('c1');
    expect(recordAuditLogUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'CUSTOMER_DATA_ANONYMIZED',
        entidadId: 'c1',
        actor: 'admin',
        metadata: { motivo: 'solicitud_arco' },
      }),
    );
  });
});
