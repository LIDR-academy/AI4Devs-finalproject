import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from '../metrics.service';
import { throwError } from 'rxjs';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url } = request;
    const startTime = Date.now();

    // Normalizar ruta (remover IDs y query params para agrupación)
    const route = this.normalizeRoute(url);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.metricsService.recordHttpRequest(method, route, statusCode, duration);
        },
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;
        const errorType = error.constructor?.name || 'UnknownError';
        
        this.metricsService.recordHttpRequest(method, route, statusCode, duration);
        this.metricsService.recordHttpError(method, route, statusCode, errorType);
        
        return throwError(() => error);
      }),
    );
  }

  private normalizeRoute(url: string): string {
    // Remover query params
    let route = url.split('?')[0];
    
    // Remover IDs UUID (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    route = route.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id');
    
    // Remover otros IDs numéricos comunes
    route = route.replace(/\/\d+/g, '/:id');
    
    return route;
  }
}
