import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
    // Estos endpoints tienen su propio formato de respuesta
    const authEndpoints = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/verify-mfa'];
    const isAuthEndpoint = authEndpoints.some(endpoint => url.includes(endpoint));
    
    if (isAuthEndpoint) {
      // Para endpoints de auth, retornar la respuesta tal cual
      return next.handle();
    }
    
    return next.handle().pipe(
      map((data) => {
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
