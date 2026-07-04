import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class CloudWatchMetricsService {
  private readonly logger = new Logger(CloudWatchMetricsService.name);
  private readonly client: CloudWatchClient;
  private readonly namespace: string;

  constructor() {
    this.client = new CloudWatchClient({ region: process.env.AWS_REGION ?? "eu-west-1" });
    this.namespace = `${process.env.CLOUDWATCH_NAMESPACE ?? "RealSaveFooding"}/${process.env.NODE_ENV}`;
  }

  emit(metricName: string, value = 1, dimensions?: Record<string, string>): void {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    this.client
      .send(
        new PutMetricDataCommand({
          Namespace: this.namespace,
          MetricData: [
            {
              MetricName: metricName,
              Value: value,
              Unit: "Count",
              ...(dimensions && {
                Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })),
              }),
            },
          ],
        }),
      )
      .catch((error: unknown) => {
        this.logger.warn(
          `cloudwatch_put_metric_failed metric=${metricName}: ${error instanceof Error ? error.message : String(error)}`,
        );
      });
  }
}
