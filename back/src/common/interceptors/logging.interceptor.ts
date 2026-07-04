import { randomUUID } from "node:crypto";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { Request, Response } from "express";
import { PinoLogger } from "nestjs-pino";
import { Observable, catchError, tap, throwError } from "rxjs";
import { maskUserId } from "../logger/mask-user-id";

interface RequestWithContext extends Request {
  requestId?: string;
  user?: { id?: string };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const response = context.switchToHttp().getResponse<Response>();
    const requestId = randomUUID();
    request.requestId = requestId;

    const startedAt = Date.now();
    const userId = maskUserId(request.user?.id);

    return next.handle().pipe(
      tap(() => {
        this.logger.info(
          {
            requestId,
            method: request.method,
            url: request.originalUrl ?? request.url,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
            userId,
          },
          "request completed",
        );
      }),
      catchError((error: unknown) => {
        const err = error instanceof Error ? { name: error.name, stack: error.stack } : undefined;
        this.logger.error(
          {
            requestId,
            module: context.getClass().name,
            err,
          },
          error instanceof Error ? error.message : "Unhandled error",
        );
        return throwError(() => error);
      }),
    );
  }
}
