import { CloudWatchClient } from "@aws-sdk/client-cloudwatch";
import { CloudWatchMetricsService } from "./cloudwatch-metrics.service";

jest.mock("@aws-sdk/client-cloudwatch", () => ({
  CloudWatchClient: jest.fn().mockImplementation(() => ({ send: jest.fn().mockResolvedValue({}) })),
  PutMetricDataCommand: jest.fn().mockImplementation((input) => input),
}));

function getClientSendMock(): jest.Mock {
  const ClientClass = CloudWatchClient as jest.MockedClass<typeof CloudWatchClient>;
  const instance = ClientClass.mock.results[ClientClass.mock.results.length - 1].value as {
    send: jest.Mock;
  };
  return instance.send;
}

describe("CloudWatchMetricsService — emit", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.clearAllMocks();
  });

  it("sends a PutMetricDataCommand with the configured namespace, metric name, value, and Unit: Count in production", () => {
    process.env.NODE_ENV = "production";
    process.env.CLOUDWATCH_NAMESPACE = "RealSaveFooding";
    const service = new CloudWatchMetricsService();
    const send = getClientSendMock();

    service.emit("item_create", 2, { environment: "prod" });

    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0][0] as {
      Namespace: string;
      MetricData: Array<{ MetricName: string; Value: number; Unit: string }>;
    };
    expect(command.Namespace).toBe("RealSaveFooding/production");
    expect(command.MetricData[0]).toMatchObject({
      MetricName: "item_create",
      Value: 2,
      Unit: "Count",
    });
  });

  it("is a no-op (no send call) when NODE_ENV is not production", () => {
    process.env.NODE_ENV = "development";
    const service = new CloudWatchMetricsService();
    const send = getClientSendMock();

    service.emit("item_create");

    expect(send).not.toHaveBeenCalled();
  });

  it("catches a rejected send() call and never throws", async () => {
    process.env.NODE_ENV = "production";
    const service = new CloudWatchMetricsService();
    const send = getClientSendMock();
    send.mockRejectedValue(new Error("CloudWatch unavailable"));

    expect(() => service.emit("login_failure")).not.toThrow();
  });
});
