import { Global, Module } from "@nestjs/common";
import { CloudWatchMetricsService } from "../../integrations/aws-cloudwatch/cloudwatch-metrics.service";
import { MetricsController } from "./metrics.controller";
import { MetricsService } from "./metrics.service";

@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService, CloudWatchMetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
