import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  ISessionRepository,
} from '../../domain/ports/session-repository.port';
import {
  AUDIT_REPOSITORY,
  IAuditRepository,
} from '../../domain/ports/audit-repository.port';
import { TokenPayload } from '../../infrastructure/services/jwt-token.service';

/**
 * Use Case para cerrar sesión
 */
@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepository: IAuditRepository,
  ) {}

  /**
   * Ejecuta el proceso de logout
   */
  async execute(user: TokenPayload & { sessionUuid?: string }): Promise<void> {
    // 1. Buscar sesión por usuario (si no se proporciona sessionUuid, buscar la más reciente)
    let sesion;
    if (user.sessionUuid) {
      sesion = await this.sessionRepository.findByUuid(user.sessionUuid);
    } else {
      const sesiones = await this.sessionRepository.findActiveByUserId(user.sub);
      sesion = sesiones[0]; // Tomar la primera sesión activa
    }

    if (!sesion) {
      throw new UnauthorizedException('Sesión no encontrada');
    }

    // 2. Verificar que la sesión pertenece al usuario
    if (sesion.usuarioId !== user.sub) {
      throw new UnauthorizedException('No tiene permiso para esta acción');
    }

    // 3. Revocar sesión
    await this.sessionRepository.revoke(sesion.id, 'LOGOUT', user.sub);

    // 4. Registrar en auditoría
    await this.auditRepository.log({
      tipoEvento: 'LOGOUT',
      usuarioId: user.sub,
      sesionUuid: sesion.uuid,
      ipLogin: 'unknown',
      exito: true,
      empresaId: user.empresaId,
      oficinaId: user.oficinaId,
    });
  }
}

