import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CircuitBreakerFactory } from './circuit-breaker.factory';

export interface CircuitBreakerInterceptorOptions {
  name?: string;
  timeout?: number;
  errorThresholdPercentage?: number;
  volumeThreshold?: number;
  resetTimeout?: number;
  fallback?: (...args: any[]) => any;
}

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CircuitBreakerInterceptor.name);

  constructor(private readonly circuitBreakerFactory: CircuitBreakerFactory) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
    options: CircuitBreakerInterceptorOptions = {}
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    const breakerName = options.name || `${method}_${url}`;

    // Crear o obtener circuit breaker
    const breaker = this.circuitBreakerFactory.create(
      async () => {
        return new Promise((resolve, reject) => {
          next.handle().subscribe({
            next: (value) => resolve(value),
            error: (error) => reject(error),
          });
        });
      },
      {
        name: breakerName,
        timeout: options.timeout,
        errorThresholdPercentage: options.errorThresholdPercentage,
        volumeThreshold: options.volumeThreshold,
        resetTimeout: options.resetTimeout,
      }
    );

    // Configurar fallback si se proporciona
    if (options.fallback) {
      breaker.fallback(options.fallback);
    }

    return new Observable((observer) => {
      breaker
        .fire()
        .then((result) => {
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          this.logger.error(
            `Circuit breaker '${breakerName}' failed: ${error.message}`,
            error.stack
          );
          observer.error(error);
        });
    }).pipe(
      tap(() => {
        this.logger.debug(`Circuit breaker '${breakerName}' executed successfully`);
      }),
      catchError((error) => {
        this.logger.error(
          `Circuit breaker '${breakerName}' error: ${error.message}`,
          error.stack
        );
        return throwError(() => error);
      })
    );
  }
}

/**
 * Decorator para aplicar circuit breaker a métodos específicos
 */
export function CircuitBreaker(options: CircuitBreakerInterceptorOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const circuitBreakerFactory = new CircuitBreakerFactory();
      const breakerName = options.name || `${target.constructor.name}_${propertyKey}`;

      const breaker = circuitBreakerFactory.create(
        async () => {
          return originalMethod.apply(this, args);
        },
        {
          name: breakerName,
          timeout: options.timeout,
          errorThresholdPercentage: options.errorThresholdPercentage,
          volumeThreshold: options.volumeThreshold,
          resetTimeout: options.resetTimeout,
        }
      );

      if (options.fallback) {
        breaker.fallback(options.fallback);
      }

      return breaker.fire();
    };

    return descriptor;
  };
}
