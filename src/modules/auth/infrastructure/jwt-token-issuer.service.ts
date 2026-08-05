import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AdminTokenPayload } from '../domain/admin-token-payload';
import { IssuedToken, TokenIssuer } from '../domain/token-issuer.interface';

@Injectable()
export class JwtTokenIssuer implements TokenIssuer {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  issue(payload: AdminTokenPayload): IssuedToken {
    const expiresIn =
      this.configService.get<string>('auth.jwtExpiration') ?? '12h';
    const token = this.jwtService.sign(payload, {
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    });
    return { token, expiresIn };
  }
}
