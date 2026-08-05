import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  IssuedToken,
  TOKEN_ISSUER,
  TokenIssuer,
} from '../../domain/token-issuer.interface';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

/**
 * Hashing de contraseñas (criterio de seguridad): el PIN de acceso del
 * admin se trata con el mismo cuidado que una contraseña — nunca se
 * almacena ni se compara en texto plano, aunque no exista una tabla de
 * usuarios (acceso de un único operador, ver AuthModule).
 *
 * ADMIN_ACCESS_CODE_HASH guarda el hash bcrypt del PIN (generado con
 * `npm run hash:pin -- <pin>`), no el PIN en sí. bcrypt.compare() recalcula
 * el hash del código recibido con la misma sal ya embebida en el hash
 * guardado y compara en tiempo constante — el PIN real nunca se reconstruye
 * ni queda expuesto en memoria más allá del request en curso.
 *
 * Se eligió bcrypt sobre Argon2 porque no requiere un binario nativo
 * adicional más allá de `bcrypt` (paquete maduro y ampliamente usado en el
 * ecosistema Node/NestJS) y su costo configurable (factor 12 aquí) es más
 * que suficiente para un solo intento de login humano — no hay necesidad
 * del ajuste de memoria/paralelismo que ofrece Argon2 para este caso de uso.
 *
 * Trazabilidad: cada intento (éxito o fallo) queda en audit_logs con
 * actor 'publico' — todavía no hay sesión válida en el momento del intento.
 * Nunca se registra el PIN ni ningún dato personal, solo el resultado.
 */
@Injectable()
export class LoginAdminUseCase {
  private readonly adminAccessCodeHash: string;

  constructor(
    @Inject(TOKEN_ISSUER)
    private readonly tokenIssuer: TokenIssuer,
    private readonly configService: ConfigService,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
  ) {
    // Se lee y valida una sola vez, al construirse el use case (arranque de
    // la app) — así un ADMIN_ACCESS_CODE_HASH faltante/mal configurado
    // tumba el arranque en vez de fallar silenciosamente en cada login.
    const hash = this.configService.get<string>('auth.adminAccessCodeHash');
    if (!hash) {
      throw new Error(
        'ADMIN_ACCESS_CODE_HASH no está configurado. Genera uno con ' +
          '"npm run hash:pin -- <tu-pin>" y agrégalo a tu .env.',
      );
    }
    this.adminAccessCodeHash = hash;
  }

  async execute(code: string, ip: string | null): Promise<IssuedToken> {
    const matches = await bcrypt.compare(code, this.adminAccessCodeHash);

    if (!matches) {
      await this.recordAuditLogUseCase.execute({
        accion: 'ADMIN_LOGIN_FAILED',
        actor: 'publico',
        ip,
      });
      throw new UnauthorizedException('Código incorrecto');
    }

    await this.recordAuditLogUseCase.execute({
      accion: 'ADMIN_LOGIN_SUCCESS',
      actor: 'publico',
      ip,
    });

    return this.tokenIssuer.issue({ role: 'admin' });
  }
}
