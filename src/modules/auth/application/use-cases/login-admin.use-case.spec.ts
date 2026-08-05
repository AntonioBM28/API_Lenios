import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginAdminUseCase } from './login-admin.use-case';
import { TokenIssuer } from '../../domain/token-issuer.interface';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

describe('LoginAdminUseCase', () => {
  const PIN_CORRECTO = '1234';
  let pinHash: string;

  let tokenIssuer: jest.Mocked<TokenIssuer>;
  let recordAuditLogUseCase: jest.Mocked<
    Pick<RecordAuditLogUseCase, 'execute'>
  >;
  let configService: Pick<ConfigService, 'get'>;

  beforeAll(async () => {
    // Hash real (no mockeado) para probar la comparación bcrypt de verdad,
    // no solo que se haya "llamado a algo".
    pinHash = await bcrypt.hash(PIN_CORRECTO, 10);
  });

  function buildUseCase(): LoginAdminUseCase {
    tokenIssuer = {
      issue: jest.fn().mockReturnValue({ token: 'jwt-fake', expiresIn: '12h' }),
    };
    recordAuditLogUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    configService = {
      get: jest.fn().mockReturnValue(pinHash),
    };

    return new LoginAdminUseCase(
      tokenIssuer,
      configService as ConfigService,
      recordAuditLogUseCase as unknown as RecordAuditLogUseCase,
    );
  }

  it('lanza un error de arranque si ADMIN_ACCESS_CODE_HASH no está configurado', () => {
    const brokenConfigService = { get: jest.fn().mockReturnValue(undefined) };

    expect(
      () =>
        new LoginAdminUseCase(
          { issue: jest.fn() },
          brokenConfigService as unknown as ConfigService,
          { execute: jest.fn() } as unknown as RecordAuditLogUseCase,
        ),
    ).toThrow(/ADMIN_ACCESS_CODE_HASH/);
  });

  it('con el PIN correcto: emite un token y audita ADMIN_LOGIN_SUCCESS', async () => {
    const useCase = buildUseCase();

    const result = await useCase.execute(PIN_CORRECTO, '127.0.0.1');

    expect(result).toEqual({ token: 'jwt-fake', expiresIn: '12h' });
    expect(tokenIssuer.issue).toHaveBeenCalledWith({ role: 'admin' });
    expect(recordAuditLogUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ accion: 'ADMIN_LOGIN_SUCCESS' }),
    );
  });

  it('con el PIN incorrecto: rechaza con 401 y audita ADMIN_LOGIN_FAILED (sin emitir token)', async () => {
    const useCase = buildUseCase();

    await expect(useCase.execute('0000', '127.0.0.1')).rejects.toThrow(
      UnauthorizedException,
    );

    expect(tokenIssuer.issue).not.toHaveBeenCalled();
    expect(recordAuditLogUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ accion: 'ADMIN_LOGIN_FAILED' }),
    );
  });

  it('nunca registra el PIN en texto plano en la bitácora de auditoría', async () => {
    const useCase = buildUseCase();

    await useCase.execute('0000', '127.0.0.1').catch(() => undefined);

    const auditCall = recordAuditLogUseCase.execute.mock.calls[0][0];
    expect(JSON.stringify(auditCall)).not.toContain('0000');
  });
});
