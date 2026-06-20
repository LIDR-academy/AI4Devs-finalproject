import { Controller, Get } from "@nestjs/common";
import { MetricsService, type MetricsSnapshot } from "./metrics.service";

@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  getMetrics(): MetricsSnapshot {
    return this.metricsService.snapshot();
  }
}
