import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TbrService } from '../tbr.service';

@Injectable()
export class TbrAutoCreateJob {
  private readonly logger = new Logger(TbrAutoCreateJob.name);

  constructor(private readonly tbrService: TbrService) {}

  @Cron('5 0 * * *')
  async handleDailyAutoCreate(): Promise<void> {
    const created = await this.tbrService.runAutoCreateJobForAllUsers();
    if (created > 0) {
      this.logger.log(`Auto-created ${created} monthly TBR list(s)`);
    }
  }
}
