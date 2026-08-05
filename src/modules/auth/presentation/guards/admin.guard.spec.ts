import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminGuard } from './admin.guard';

function makeContext(authHeader?: string): ExecutionContext {
  const request = { headers: { authorization: authHeader } };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('AdminGuard', () => {
  let jwtService: jest.Mocked<Pick<JwtService, 'verify'>>;
  let guard: AdminGuard;

  beforeEach(() => {
    jwtService = { verify: jest.fn() };
    guard = new AdminGuard(jwtService as unknown as JwtService);
  });

  it('401 — sin header Authorization', () => {
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(
      UnauthorizedException,
    );
    expect(jwtService.verify).not.toHaveBeenCalled();
  });

  it('401 — header sin esquema Bearer', () => {
    expect(() => guard.canActivate(makeContext('Basic algo'))).toThrow(
      UnauthorizedException,
    );
  });

  it('401 — token con firma inválida o expirado', () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    expect(() => guard.canActivate(makeContext('Bearer un-token-cualquiera'))).toThrow(
      UnauthorizedException,
    );
  });

  it('403 — token con firma válida pero rol distinto de admin', () => {
    jwtService.verify.mockReturnValue({ role: 'otro-rol' });

    expect(() => guard.canActivate(makeContext('Bearer token-valido'))).toThrow(
      ForbiddenException,
    );
  });

  it('200 (deja pasar) — token válido con role: admin', () => {
    jwtService.verify.mockReturnValue({ role: 'admin' });

    expect(guard.canActivate(makeContext('Bearer token-valido'))).toBe(true);
  });
});
