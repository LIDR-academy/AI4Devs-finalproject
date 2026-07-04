import { ArgumentsHost, Catch, HttpServer, Logger, Optional } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import * as Sentry from "@sentry/node";
import type { Request } from "express";
import { maskUserId } from "../logger/mask-user-id";

interface RequestWithContext extends Request {
  requestId?: string;
  user?: { id?: string };
}

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  constructor(@Optional() applicationRef?: HttpServer) {
    super(applicationRef);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const request = host.switchToHttp().getRequest<RequestWithContext>();

    try {
      Sentry.captureException(exception, {
        contexts: {
          request: {
            requestId: request.requestId,
            endpoint: `${request.method} ${request.originalUrl ?? request.url}`,
            userId: maskUserId(request.user?.id),
          },
        },
      });
    } catch (captureError) {
      this.logger.warn(
        `sentry_capture_failed: ${captureError instanceof Error ? captureError.message : String(captureError)}`,
      );
    }

    super.catch(exception, host);
  }
}
