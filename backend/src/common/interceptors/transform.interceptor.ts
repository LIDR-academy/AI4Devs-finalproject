import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StreamableFile } from '@nestjs/common';

export interface Response<T> {
  data: T;
  statusCode: number;
  message?: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Excluir endpoints de autenticación del transformador
    const authEndpoints = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/verify-mfa'];
    const isAuthEndpoint = authEndpoints.some((endpoint) => url.includes(endpoint));

    // Excluir respuestas binarias (PDF, etc.): no envolver en { data, statusCode }
    const isBinaryEndpoint = url.includes('/pdf') || url.endsWith('.pdf');
    if (isAuthEndpoint || isBinaryEndpoint) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // No transformar si es StreamableFile (descarga de archivo)
        if (data instanceof StreamableFile) {
          return data;
        }
        // Si la respuesta ya tiene formato estándar, retornarla tal cual
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return {
            ...data,
            timestamp: new Date().toISOString(),
          };
        }

        // Formato estándar para respuestas exitosas
        return {
          data,
          statusCode: context.switchToHttp().getResponse().statusCode || 200,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
