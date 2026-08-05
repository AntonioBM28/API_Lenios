import { Inject, Injectable } from '@nestjs/common';
import { BusinessStatus, isBusinessOpen } from '../../domain/is-business-open';
import {
  BUSINESS_HOURS_REPOSITORY,
  BusinessHoursRepository,
} from '../../domain/business-hours.repository.interface';

@Injectable()
export class GetBusinessStatusUseCase {
  constructor(
    @Inject(BUSINESS_HOURS_REPOSITORY)
    private readonly businessHoursRepository: BusinessHoursRepository,
  ) {}

  async execute(now: Date = new Date()): Promise<BusinessStatus> {
    const config = await this.businessHoursRepository.getConfig();
    return isBusinessOpen(config, now);
  }
}
