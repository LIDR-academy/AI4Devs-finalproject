import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricsInterceptor.name);

  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = request;
    
    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode || 200;
        
        // Registrar métricas HTTP
        this.metricsService.recordHttpRequestDuration(method, url, statusCode, duration);
        this.metricsService.incrementHttpRequests(method, url, statusCode);
        
        this.logger.debug(`HTTP ${method} ${url} - ${statusCode} - ${duration}ms`);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;
        
        // Registrar métricas de error
        this.metricsService.recordHttpRequestDuration(method, url, statusCode, duration);
        this.metricsService.incrementHttpRequests(method, url, statusCode);
        
        this.logger.error(`HTTP ${method} ${url} - ${statusCode} - ${duration}ms - Error: ${error.message}`);
        
        throw error;
      })
    );
  }
}
