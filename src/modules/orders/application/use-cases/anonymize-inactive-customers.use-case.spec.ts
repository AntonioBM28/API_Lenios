import { ConfigService } from '@nestjs/config';
import { AnonymizeInactiveCustomersUseCase } from './anonymize-inactive-customers.use-case';
import { Customer } from '../../domain/customer.entity';
import { CustomerRepository } from '../../domain/customer.repository.interface';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

function makeCustomer(id: string): Customer {
  return new Customer({
    id,
    nombre: 'Juan Pérez',
    telefono: '5512345678',
    ubicacion: 'Av. Siempre Viva 742',
    fechaRegistro: new Date('2025-01-01'),
    bloqueado: false,
  });
}

describe('AnonymizeInactiveCustomersUseCase', () => {
  let customerRepository: jest.Mocked<
    Pick<CustomerRepository, 'findInactiveSince' | 'anonymize'>
  >;
  let recordAuditLogUseCase: jest.Mocked<Pick<RecordAuditLogUseCase, 'execute'>>;
  let configService: ConfigService;
  let useCase: AnonymizeInactiveCustomersUseCase;

  beforeEach(() => {
    customerRepository = { findInactiveSince: jest.fn(), anonymize: jest.fn() };
    recordAuditLogUseCase = { execute: jest.fn() };
    configService = {
      get: jest.fn().mockReturnValue(365),
    } as unknown as ConfigService;

    useCase = new AnonymizeInactiveCustomersUseCase(
      customerRepository as unknown as CustomerRepository,
      configService,
      recordAuditLogUseCase as unknown as RecordAuditLogUseCase,
    );
  });

  it('no hace nada si no hay clientes inactivos', async () => {
    customerRepository.findInactiveSince.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual({ anonimizados: 0, retentionDays: 365 });
    expect(customerRepository.anonymize).not.toHaveBeenCalled();
    expect(recordAuditLogUseCase.execute).not.toHaveBeenCalled();
  });

  it('anonimiza cada cliente inactivo y registra auditoría sin datos personales', async () => {
    const clientes = [makeCustomer('c1'), makeCustomer('c2')];
    customerRepository.findInactiveSince.mockResolvedValue(clientes);

    const result = await useCase.execute();

    expect(result.anonimizados).toBe(2);
    expect(customerRepository.anonymize).toHaveBeenCalledWith('c1');
    expect(customerRepository.anonymize).toHaveBeenCalledWith('c2');
    expect(recordAuditLogUseCase.execute).toHaveBeenCalledTimes(2);

    const [primeraLlamada] = recordAuditLogUseCase.execute.mock.calls[0];
    expect(primeraLlamada).toMatchObject({
      accion: 'CUSTOMER_DATA_ANONYMIZED',
      entidad: 'cliente',
      entidadId: 'c1',
      actor: 'sistema',
    });
    // Regresión: el log nunca debe llevar nombre/teléfono/dirección reales.
    expect(JSON.stringify(primeraLlamada)).not.toContain('Juan Pérez');
    expect(JSON.stringify(primeraLlamada)).not.toContain('5512345678');
  });

  it('usa el cutoff calculado a partir de DATA_RETENTION_DAYS', async () => {
    customerRepository.findInactiveSince.mockResolvedValue([]);

    await useCase.execute();

    const [cutoffUsado] = customerRepository.findInactiveSince.mock.calls[0];
    const esperado = new Date();
    esperado.setDate(esperado.getDate() - 365);

    // Comparación con tolerancia de segundos (Date.now() avanza entre el
    // cálculo del test y el del use case).
    expect(
      Math.abs(cutoffUsado.getTime() - esperado.getTime()),
    ).toBeLessThan(5000);
  });
});
