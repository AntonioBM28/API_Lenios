import { NotFoundException } from '@nestjs/common';
import { UnblockCustomerUseCase } from './unblock-customer.use-case';
import { Customer } from '../../domain/customer.entity';
import { CustomerRepository } from '../../domain/customer.repository.interface';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

function makeCustomer(): Customer {
  return new Customer({
    id: 'c1',
    nombre: 'Juan Pérez',
    telefono: '5512345678',
    ubicacion: 'Av. Siempre Viva 742',
    fechaRegistro: new Date('2025-01-01'),
    bloqueado: true,
  });
}

describe('UnblockCustomerUseCase', () => {
  let customerRepository: jest.Mocked<
    Pick<CustomerRepository, 'findById' | 'unblock'>
  >;
  let recordAuditLogUseCase: jest.Mocked<Pick<RecordAuditLogUseCase, 'execute'>>;
  let useCase: UnblockCustomerUseCase;

  beforeEach(() => {
    customerRepository = { findById: jest.fn(), unblock: jest.fn() };
    recordAuditLogUseCase = { execute: jest.fn() };
    useCase = new UnblockCustomerUseCase(
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

  it('desbloquea al cliente y registra auditoría', async () => {
    customerRepository.findById.mockResolvedValue(makeCustomer());

    await useCase.execute('c1', null);

    expect(customerRepository.unblock).toHaveBeenCalledWith('c1');
    expect(recordAuditLogUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'CUSTOMER_ARCO_UNBLOCKED',
        entidadId: 'c1',
        actor: 'admin',
      }),
    );
  });
});
