import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { envs } from '../config';
import * as winston from 'winston';
import { GeneralConstant } from 'src/constant';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.initializeLogger();
  }

  private initializeLogger(): void {
    const { level, format } = envs.logging;

    const logFormat = format === 'json'
      ? winston.format.json()
      : winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, trace }) => {
          return `${timestamp} [${level}] ${context ? `[${context}] ` : ''}${message}${trace ? `\n${trace}` : ''}`;
        })
      );

    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        logFormat
      ),
      defaultMeta: { service: GeneralConstant.appAbr },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });

    // Handle uncaught exceptions
    this.logger.exceptions.handle(
      new winston.transports.File({ filename: 'logs/exceptions.log' })
    );

    // Handle unhandled promise rejections
    this.logger.rejections.handle(
      new winston.transports.File({ filename: 'logs/rejections.log' })
    );
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }

  // Métodos adicionales para logging específico
  logDatabaseQuery(sql: string, params?: any[], duration?: number, context?: string): void {
    this.logger.info('Database query executed', {
      context: context || 'Database',
      sql,
      params,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  logDatabaseError(error: Error, sql?: string, params?: any[], context?: string): void {
    this.logger.error('Database error occurred', {
      context: context || 'Database',
      error: error.message,
      stack: error.stack,
      sql,
      params,
    });
  }

  logHttpRequest(method: string, url: string, statusCode: number, duration: number, context?: string): void {
    this.logger.info('HTTP request processed', {
      context: context || 'HTTP',
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
    });
  }

  logSecurityEvent(event: string, details: any, context?: string): void {
    this.logger.warn('Security event detected', {
      context: context || 'Security',
      event,
      details,
    });
  }
}

