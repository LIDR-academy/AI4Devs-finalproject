import pino from "pino";
import { env } from "../config/env.js";

const transport =
  env.NODE_ENV === "development"
    ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } }
    : undefined;

export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : "info",
  transport,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: { ...req.headers, authorization: "[Redacted]" },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.body.password",
      "req.body.refreshToken",
      "req.body.bankAccount",
      "req.body.ssn",
      "req.body.dni",
    ],
    censor: "[Redacted]",
  },
});
