import { registerAs } from '@nestjs/config';
import * as winston from 'winston';

export default registerAs('logger', () => ({
  level: process.env.LOG_LEVEL || 'debug',
  format: process.env.LOG_FORMAT || 'json',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        process.env.LOG_FORMAT === 'json'
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(
                ({ timestamp, level, message, context, ...meta }) => {
                  const contextStr = context ? `[${context}]` : '';
                  const metaStr = Object.keys(meta).length
                    ? ` ${JSON.stringify(meta)}`
                    : '';
                  return `${timestamp} ${level} ${contextStr} ${message}${metaStr}`;
                },
              ),
            ),
      ),
    }),
  ],
}));
