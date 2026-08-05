import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessHoursConfigOrmEntity } from './infrastructure/business-hours-config.orm-entity';
import { TypeOrmBusinessHoursRepository } from './infrastructure/typeorm-business-hours.repository';
import { BUSINESS_HOURS_REPOSITORY } from './domain/business-hours.repository.interface';
import { GetBusinessStatusUseCase } from './application/use-cases/get-business-status.use-case';
import { GetBusinessHoursConfigUseCase } from './application/use-cases/get-business-hours-config.use-case';
import { UpdateBusinessHoursConfigUseCase } from './application/use-cases/update-business-hours-config.use-case';
import { BusinessHoursController } from './presentation/business-hours.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

/**
 * BusinessHoursModule – Módulo de Horarios de Negocio (RF6)
 *
 * Gestiona la configuración única de horarios del negocio (jsonb de 7 días
 * + cierre manual) y expone si el negocio está abierto ahora mismo.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessHoursConfigOrmEntity]),
    AuditLogModule,
  ],
  controllers: [BusinessHoursController],
  providers: [
    {
      provide: BUSINESS_HOURS_REPOSITORY,
      useClass: TypeOrmBusinessHoursRepository,
    },
    GetBusinessStatusUseCase,
    GetBusinessHoursConfigUseCase,
    UpdateBusinessHoursConfigUseCase,
  ],
  exports: [BUSINESS_HOURS_REPOSITORY],
})
export class BusinessHoursModule {}
