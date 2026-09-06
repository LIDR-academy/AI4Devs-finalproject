import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    const body = await this.metricsService.getMetricsText();
    res.setHeader('Content-Type', this.metricsService.getContentType());
    res.status(200).send(body);
  }
}
