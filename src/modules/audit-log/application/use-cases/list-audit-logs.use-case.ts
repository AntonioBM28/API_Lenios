import { Inject, Injectable } from '@nestjs/common';
import {
  AUDIT_LOG_REPOSITORY,
  AuditLogListResult,
  AuditLogRepository,
} from '../../domain/audit-log.repository.interface';
import { ListAuditLogsFilters } from '../audit-log.dto';

@Injectable()
export class ListAuditLogsUseCase {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(filters: ListAuditLogsFilters): Promise<AuditLogListResult> {
    return this.auditLogRepository.findAll(filters);
  }
}
