import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from '../services/audit.service';
import { AuditAction } from '../entities/audit-log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);
  // UUID especial para usuarios anónimos/no autenticados
  private readonly ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000';

  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, headers } = request;
    const user = (request as any).user; // Usuario del JWT guard

    // Excluir endpoints de salud, auditoría, métricas y docs para evitar loops
    if (
      url.includes('/health') ||
      url.includes('/api/v1/audit') ||
      url.includes('/audit') ||
      url.includes('/api/v1/auth/login') ||
      url.includes('/api/v1/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/metrics') ||
      url.includes('/api/docs') ||
      url.includes('/swagger')
    ) {
      return next.handle();
    }

    // Obtener userId del usuario autenticado
    const userId = user?.sub || user?.id || user?.userId;
    
    // Si no hay usuario autenticado y es un endpoint protegido, no registrar auditoría
    // (los endpoints protegidos requieren autenticación, así que no deberían llegar aquí sin usuario)
    // Para endpoints públicos, usar UUID de anónimo
    const finalUserId = userId || this.ANONYMOUS_USER_ID;

    // Determinar acción basada en método HTTP
    let action: AuditAction;
    switch (method) {
      case 'POST':
        action = AuditAction.CREATE;
        break;
      case 'PUT':
      case 'PATCH':
        action = AuditAction.UPDATE;
        break;
      case 'DELETE':
        action = AuditAction.DELETE;
        break;
      case 'GET':
        action = AuditAction.VIEW;
        break;
      default:
        action = AuditAction.VIEW;
    }

    // Extraer información de la entidad desde la URL
    const urlParts = url.split('/').filter((p) => p);
    let entityType: string | null = null;
    let entityId: string | null = null;

    // Intentar identificar entidad desde la URL (ej: /api/v1/hce/patients/:id)
    const entityPatterns = [
      { pattern: /\/patients\/([^\/]+)/, type: 'Patient' },
      { pattern: /\/surgeries\/([^\/]+)/, type: 'Surgery' },
      { pattern: /\/operating-rooms\/([^\/]+)/, type: 'OperatingRoom' },
      { pattern: /\/planning\/([^\/]+)/, type: 'SurgicalPlanning' },
      { pattern: /\/checklists\/([^\/]+)/, type: 'Checklist' },
    ];

    for (const { pattern, type } of entityPatterns) {
      const match = url.match(pattern);
      if (match) {
        entityType = type;
        entityId = match[1];
        break;
      }
    }

    // Si no se encontró en la URL, intentar desde el body
    if (!entityType && request.body) {
      if (request.body.patientId) {
        entityType = 'Patient';
        entityId = request.body.patientId;
      } else if (request.body.surgeryId) {
        entityType = 'Surgery';
        entityId = request.body.surgeryId;
      }
    }

    // Obtener datos antes y después para cambios
    const body = request.body ? JSON.parse(JSON.stringify(request.body)) : null;
    const before = action === AuditAction.UPDATE || action === AuditAction.DELETE ? body : null;

    return next.handle().pipe(
      tap({
        next: async (data) => {
          // Registrar auditoría de forma asíncrona (no bloquea la respuesta)
          this.logAudit({
            userId: finalUserId,
            action,
            entityType,
            entityId,
            changes: {
              before: before,
              after: action === AuditAction.CREATE || action === AuditAction.UPDATE ? data?.data || data : null,
              metadata: {
                statusCode: 200,
                method,
                endpoint: url,
              },
            },
            ipAddress: ip || (Array.isArray(headers['x-forwarded-for']) 
              ? headers['x-forwarded-for'][0] 
              : headers['x-forwarded-for']) || null,
            userAgent: headers['user-agent'] || null,
            endpoint: url,
            method,
          }).catch((error) => {
            this.logger.error(`Error al registrar auditoría: ${error.message}`, error.stack);
          });
        },
        error: async (error) => {
          // Registrar errores también
          this.logAudit({
            userId: finalUserId,
            action,
            entityType,
            entityId,
            changes: {
              before: before,
              after: null,
              metadata: {
                statusCode: error.status || 500,
                error: error.message,
                method,
                endpoint: url,
              },
            },
            ipAddress: ip || (Array.isArray(headers['x-forwarded-for']) 
              ? headers['x-forwarded-for'][0] 
              : headers['x-forwarded-for']) || null,
            userAgent: headers['user-agent'] || null,
            endpoint: url,
            method,
          }).catch((err) => {
            this.logger.error(`Error al registrar auditoría de error: ${err.message}`, err.stack);
          });
        },
      }),
    );
  }

  private async logAudit(dto: {
    userId: string;
    action: AuditAction;
    entityType: string | null;
    entityId: string | null;
    changes: any;
    ipAddress: string | null;
    userAgent: string | null;
    endpoint: string | null;
    method: string | null;
  }): Promise<void> {
    try {
      await this.auditService.log(dto);
    } catch (error) {
      // Log pero no lanzar error para no interrumpir el flujo
      this.logger.warn(`No se pudo registrar auditoría: ${error.message}`);
    }
  }
}
