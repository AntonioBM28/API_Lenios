import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogOrmEntity } from './infrastructure/audit-log.orm-entity';
import { TypeOrmAuditLogRepository } from './infrastructure/typeorm-audit-log.repository';
import { AUDIT_LOG_REPOSITORY } from './domain/audit-log.repository.interface';
import { RecordAuditLogUseCase } from './application/use-cases/record-audit-log.use-case';
import { ListAuditLogsUseCase } from './application/use-cases/list-audit-logs.use-case';
import { AuditLogController } from './presentation/audit-log.controller';

/**
 * AuditLogModule – Trazabilidad y Bitácoras de Auditoría + evidencia de
 * Transferencias de Datos.
 *
 * Exporta RecordAuditLogUseCase para que orders/products/business-hours/auth
 * lo consuman sin acoplarse a AuditLogOrmEntity ni a TypeOrmAuditLogRepository
 * — cada módulo solo importa AuditLogModule y usa el caso de uso.
 */
@Module({
  imports: [TypeOrmModule.forFeature([AuditLogOrmEntity])],
  controllers: [AuditLogController],
  providers: [
    { provide: AUDIT_LOG_REPOSITORY, useClass: TypeOrmAuditLogRepository },
    RecordAuditLogUseCase,
    ListAuditLogsUseCase,
  ],
  exports: [RecordAuditLogUseCase],
})
export class AuditLogModule {}
