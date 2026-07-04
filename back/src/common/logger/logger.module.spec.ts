import type { Options } from "pino-http";
import { buildLoggerModuleParams } from "./logger.module";

describe("buildLoggerModuleParams", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalLogLevel = process.env.LOG_LEVEL;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.LOG_LEVEL = originalLogLevel;
  });

  it("reads the pino level from LOG_LEVEL", () => {
    process.env.LOG_LEVEL = "debug";
    const params = buildLoggerModuleParams();
    expect((params.pinoHttp as Options).level).toBe("debug");
  });

  it("defaults the pino level to info when LOG_LEVEL is unset", () => {
    delete process.env.LOG_LEVEL;
    const params = buildLoggerModuleParams();
    expect((params.pinoHttp as Options).level).toBe("info");
  });

  it("configures a pino-pretty transport when NODE_ENV is not production", () => {
    process.env.NODE_ENV = "development";
    const params = buildLoggerModuleParams();
    expect((params.pinoHttp as Options).transport).toEqual({ target: "pino-pretty" });
  });

  it("configures no transport (raw JSON to stdout) when NODE_ENV is production", () => {
    process.env.NODE_ENV = "production";
    const params = buildLoggerModuleParams();
    expect((params.pinoHttp as Options).transport).toBeUndefined();
  });

  it("disables pino-http's automatic req/res logging, since LoggingInterceptor owns the allow-listed request log (FR-003)", () => {
    const params = buildLoggerModuleParams();
    expect((params.pinoHttp as Options).autoLogging).toBe(false);
  });

  it("disables the quiet-logger opt-out so the ambient logger never carries the raw req/res bindings (FR-003)", () => {
    const params = buildLoggerModuleParams();
    expect((params.pinoHttp as Options).quietReqLogger).toBe(true);
    expect((params.pinoHttp as Options).quietResLogger).toBe(true);
  });
});
