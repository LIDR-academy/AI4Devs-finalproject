import type { ArgumentsHost, HttpServer } from "@nestjs/common";
import * as Sentry from "@sentry/node";
import { SentryExceptionFilter } from "./sentry-exception.filter";

jest.mock("@sentry/node", () => ({
  captureException: jest.fn(),
}));

function makeHost(options: {
  requestId?: string;
  userId?: string;
  method?: string;
  url?: string;
}): ArgumentsHost {
  const request = {
    requestId: options.requestId ?? "req-1",
    method: options.method ?? "GET",
    originalUrl: options.url ?? "/api/pantry/items",
    user: options.userId ? { id: options.userId } : undefined,
  };
  const response = {};

  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
    getArgByIndex: (index: number) => (index === 1 ? response : request),
  } as unknown as ArgumentsHost;
}

function makeApplicationRef(): HttpServer {
  return {
    isHeadersSent: () => false,
    reply: jest.fn(),
    end: jest.fn(),
  } as unknown as HttpServer;
}

describe("SentryExceptionFilter", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("captures the exception with an allow-listed request context (requestId, endpoint, masked userId)", () => {
    const applicationRef = makeApplicationRef();
    const filter = new SentryExceptionFilter(applicationRef);
    const host = makeHost({ requestId: "req-abc", userId: "usr_12345", method: "POST", url: "/api/pantry/items" });

    filter.catch(new Error("boom"), host);

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    const [, captureOptions] = (Sentry.captureException as jest.Mock).mock.calls[0] as [
      unknown,
      { contexts: { request: Record<string, unknown> } },
    ];
    expect(captureOptions.contexts.request).toEqual({
      requestId: "req-abc",
      endpoint: "POST /api/pantry/items",
      userId: "usr***",
    });
  });

  it("still delivers the normal error response when Sentry.captureException itself throws", () => {
    (Sentry.captureException as jest.Mock).mockImplementation(() => {
      throw new Error("Sentry unreachable");
    });
    const applicationRef = makeApplicationRef();
    const filter = new SentryExceptionFilter(applicationRef);
    const host = makeHost({});

    expect(() => filter.catch(new Error("boom"), host)).not.toThrow();
    expect(applicationRef.reply).toHaveBeenCalledTimes(1);
  });
});
