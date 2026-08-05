import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { AuthController } from './presentation/auth.controller';
import { AdminGuard } from './presentation/guards/admin.guard';
import { LoginAdminUseCase } from './application/use-cases/login-admin.use-case';
import { TOKEN_ISSUER } from './domain/token-issuer.interface';
import { JwtTokenIssuer } from './infrastructure/jwt-token-issuer.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

/**
 * AuthModule – Acceso simple de un único operador (RF8).
 *
 * No hay usuarios, roles ni registro: solo un código de acceso (PIN)
 * verificado contra el hash bcrypt en ADMIN_ACCESS_CODE_HASH (ver
 * LoginAdminUseCase), que emite un JWT de vida corta.
 *
 * Global para que AdminGuard esté disponible en cualquier controller
 * (products, categories, business-hours, orders) sin que cada módulo
 * tenga que importar AuthModule explícitamente.
 */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>(
            'auth.jwtExpiration',
          ) as JwtSignOptions['expiresIn'],
        },
      }),
      inject: [ConfigService],
    }),
    // Rate limiting aplicado solo en POST /auth/admin/login (vía @UseGuards(ThrottlerGuard)
    // en el controller), no como guard global — el resto de la API no se limita aquí.
    ThrottlerModule.forRoot([{ ttl: seconds(60), limit: 5 }]),
    AuditLogModule,
  ],
  controllers: [AuthController],
  providers: [
    LoginAdminUseCase,
    { provide: TOKEN_ISSUER, useClass: JwtTokenIssuer },
    AdminGuard,
  ],
  exports: [AdminGuard],
})
export class AuthModule {}
