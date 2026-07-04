import { CloudWatchMetricsService } from "../../integrations/aws-cloudwatch/cloudwatch-metrics.service";
import { MetricsService } from "./metrics.service";

function makeCloudWatchMock(): jest.Mocked<Pick<CloudWatchMetricsService, "emit">> {
  return { emit: jest.fn() };
}

describe("MetricsService — increment", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("still updates the in-process counter unconditionally (no regression to GET /api/metrics)", () => {
    process.env.NODE_ENV = "development";
    const cloudWatch = makeCloudWatchMock();
    const service = new MetricsService(cloudWatch as unknown as CloudWatchMetricsService);

    service.increment("item_create");
    service.increment("item_create", 2);

    expect(service.getCounter("item_create")).toBe(3);
  });

  it("calls CloudWatchMetricsService.emit() only when NODE_ENV is production", () => {
    process.env.NODE_ENV = "development";
    const cloudWatch = makeCloudWatchMock();
    const service = new MetricsService(cloudWatch as unknown as CloudWatchMetricsService);

    service.increment("login_success");
    expect(cloudWatch.emit).not.toHaveBeenCalled();

    process.env.NODE_ENV = "production";
    service.increment("login_success");
    expect(cloudWatch.emit).toHaveBeenCalledWith("login_success", 1);
  });

  it("still updates the in-process counter even when CloudWatchMetricsService.emit() throws", () => {
    process.env.NODE_ENV = "production";
    const cloudWatch = makeCloudWatchMock();
    cloudWatch.emit.mockImplementation(() => {
      throw new Error("CloudWatch unreachable");
    });
    const service = new MetricsService(cloudWatch as unknown as CloudWatchMetricsService);

    expect(() => service.increment("receipt_upload_success_total")).not.toThrow();
    expect(service.getCounter("receipt_upload_success_total")).toBe(1);
  });
});
