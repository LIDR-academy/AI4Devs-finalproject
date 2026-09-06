import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthLiveResponseDto } from './dto/health-live-response.dto';
import { HealthReadyResponseDto } from './dto/health-ready-response.dto';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  getLive(): HealthLiveResponseDto {
    return this.healthService.getLiveStatus();
  }

  @Get('ready')
  async getReady(@Res() res: Response): Promise<void> {
    const result: HealthReadyResponseDto =
      await this.healthService.getReadyStatus();

    if (result.status === 'error') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json(result);
      return;
    }

    res.status(HttpStatus.OK).json(result);
  }
}
