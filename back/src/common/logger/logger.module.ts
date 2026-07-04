import { Module } from "@nestjs/common";
import { LoggerModule as PinoLoggerModule, type Params } from "nestjs-pino";

export function buildLoggerModuleParams(): Params {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL ?? "info",
      transport: isProduction ? undefined : { target: "pino-pretty" },
      // Disables pino-http's own automatic request/response completion log — LoggingInterceptor
      // owns that log line. quietReqLogger/quietResLogger stop pino-http from binding the full
      // raw `req`/`res` objects (headers, body, etc.) onto the ambient logger every app-level log
      // call picks up during a request — without this, LoggingInterceptor's own allow-listed log
      // call would still get `req` merged in, defeating the allow-list (FR-003).
      autoLogging: false,
      quietReqLogger: true,
      quietResLogger: true,
    },
  };
}

@Module({
  imports: [PinoLoggerModule.forRoot(buildLoggerModuleParams())],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
