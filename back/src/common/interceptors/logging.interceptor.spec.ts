import type { CallHandler, ExecutionContext } from "@nestjs/common";
import type { PinoLogger } from "nestjs-pino";
import { of, throwError, firstValueFrom } from "rxjs";
import { LoggingInterceptor } from "./logging.interceptor";

const ALLOWED_LOG_FIELDS = new Set([
  "time",
  "level",
  "requestId",
  "method",
  "url",
  "statusCode",
  "durationMs",
  "userId",
  "module",
  "message",
  "err",
]);

function makeLoggerMock(): jest.Mocked<Pick<PinoLogger, "info" | "error" | "setContext">> {
  return {
    info: jest.fn(),
    error: jest.fn(),
    setContext: jest.fn(),
  };
}

function makeContext(options: {
  method?: string;
  url?: string;
  statusCode?: number;
  userId?: string;
  body?: Record<string, unknown>;
}): { context: ExecutionContext; request: Record<string, unknown> } {
  const request: Record<string, unknown> = {
    method: options.method ?? "POST",
    originalUrl: options.url ?? "/api/pantry/items",
    user: options.userId ? { id: options.userId } : undefined,
    body: options.body ?? {},
  };
  const response = { statusCode: options.statusCode ?? 201 };

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
    getClass: () => ({ name: "PantryController" }),
  } as unknown as ExecutionContext;

  return { context, request };
}

describe("LoggingInterceptor", () => {
  it("generates a requestId, attaches it to the request, and logs completion fields", async () => {
    const logger = makeLoggerMock();
    const interceptor = new LoggingInterceptor(logger as unknown as PinoLogger);
    const { context, request } = makeContext({ userId: "usr_12345" });
    const handler: CallHandler = { handle: () => of({ id: "item-1" }) };

    await firstValueFrom(interceptor.intercept(context, handler));

    expect(request.requestId).toEqual(expect.any(String));
    expect(logger.info).toHaveBeenCalledTimes(1);
    const [loggedFields] = logger.info.mock.calls[0] as [Record<string, unknown>, string];
    expect(loggedFields.requestId).toBe(request.requestId);
    expect(loggedFields.method).toBe("POST");
    expect(loggedFields.url).toBe("/api/pantry/items");
    expect(loggedFields.statusCode).toBe(201);
    expect(typeof loggedFields.durationMs).toBe("number");
    expect(loggedFields.userId).toBe("usr***");
  });

  it("produces an error log with the same requestId, a module field, and err.stack", async () => {
    const logger = makeLoggerMock();
    const interceptor = new LoggingInterceptor(logger as unknown as PinoLogger);
    const { context, request } = makeContext({});
    const thrown = new Error("Item not found");
    const handler: CallHandler = { handle: () => throwError(() => thrown) };

    await expect(firstValueFrom(interceptor.intercept(context, handler))).rejects.toThrow(
      "Item not found",
    );

    expect(logger.error).toHaveBeenCalledTimes(1);
    const [loggedFields] = logger.error.mock.calls[0] as [Record<string, unknown>, string];
    expect(loggedFields.requestId).toBe(request.requestId);
    expect(loggedFields.module).toBe("PantryController");
    expect((loggedFields.err as { stack?: string }).stack).toContain("Item not found");
  });

  it("never logs fields outside the documented allow-list, even when the request body carries email/notes", async () => {
    const logger = makeLoggerMock();
    const interceptor = new LoggingInterceptor(logger as unknown as PinoLogger);
    const { context } = makeContext({
      userId: "usr_12345",
      body: { email: "user@example.com", notes: "gift card 1234-5678" },
    });
    const handler: CallHandler = { handle: () => of({ email: "user@example.com" }) };

    await firstValueFrom(interceptor.intercept(context, handler));

    const [loggedFields] = logger.info.mock.calls[0] as [Record<string, unknown>, string];
    for (const key of Object.keys(loggedFields)) {
      expect(ALLOWED_LOG_FIELDS.has(key)).toBe(true);
    }
    expect(JSON.stringify(loggedFields)).not.toContain("user@example.com");
    expect(JSON.stringify(loggedFields)).not.toContain("gift card");
  });
});
