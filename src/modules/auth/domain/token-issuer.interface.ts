import { AdminTokenPayload } from './admin-token-payload';

export const TOKEN_ISSUER = Symbol('TOKEN_ISSUER');

export interface IssuedToken {
  token: string;
  expiresIn: string;
}

/**
 * Patrón: Strategy.
 * Puerto de emisión de tokens de sesión. Implementado en infrastructure/
 * con @nestjs/jwt (JwtTokenIssuer). El caso de uso (LoginAdminUseCase)
 * depende solo de esta interfaz, no de una estrategia concreta — se
 * podría cambiar la implementación (p. ej. otro firmante o algoritmo)
 * sin tocar la lógica de negocio. No hay estado de sesión en base de
 * datos: el JWT firmado y su expiración corta son suficientes para este
 * caso de uso (un único operador, sin necesidad de revocación).
 */
export interface TokenIssuer {
  issue(payload: AdminTokenPayload): IssuedToken;
}
