import { Inject, Injectable } from '@nestjs/common';
import { BusinessHoursConfig } from '../../domain/business-hours-config.entity';
import {
  BUSINESS_HOURS_REPOSITORY,
  BusinessHoursRepository,
} from '../../domain/business-hours.repository.interface';

@Injectable()
export class GetBusinessHoursConfigUseCase {
  constructor(
    @Inject(BUSINESS_HOURS_REPOSITORY)
    private readonly businessHoursRepository: BusinessHoursRepository,
  ) {}

  async execute(): Promise<BusinessHoursConfig> {
    return this.businessHoursRepository.getConfig();
  }
}
