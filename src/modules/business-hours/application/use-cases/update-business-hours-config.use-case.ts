import { Inject, Injectable } from '@nestjs/common';
import { BusinessHoursConfig } from '../../domain/business-hours-config.entity';
import {
  BUSINESS_HOURS_REPOSITORY,
  BusinessHoursRepository,
} from '../../domain/business-hours.repository.interface';
import { UpdateBusinessHoursInput } from '../business-hours.dto';
import { RecordAuditLogUseCase } from '../../../audit-log/application/use-cases/record-audit-log.use-case';

@Injectable()
export class UpdateBusinessHoursConfigUseCase {
  constructor(
    @Inject(BUSINESS_HOURS_REPOSITORY)
    private readonly businessHoursRepository: BusinessHoursRepository,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
  ) {}

  async execute(
    input: UpdateBusinessHoursInput,
    ip: string | null,
  ): Promise<BusinessHoursConfig> {
    const updated = await this.businessHoursRepository.updateConfig({
      horarios: input.horarios?.map((h) => ({
        ...h,
        cerrado: h.cerrado ?? false,
      })),
      cierreManual: input.cierreManual,
    });

    await this.recordAuditLogUseCase.execute({
      accion: 'BUSINESS_HOURS_UPDATED',
      entidad: 'business_hours',
      entidadId: updated.id,
      actor: 'admin',
      ip,
      metadata: { cierreManual: updated.cierreManual },
    });

    return updated;
  }
}
