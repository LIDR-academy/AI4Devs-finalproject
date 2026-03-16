import { Injectable, Inject } from '@nestjs/common';
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
 * Use Case para cerrar todas las sesiones
 */
@Injectable()
export class LogoutAllUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepository: IAuditRepository,
  ) {}

  /**
   * Ejecuta el proceso de logout de todas las sesiones
   */
  async execute(user: TokenPayload & { sessionUuid?: string }): Promise<{ sessionsRevoked: number }> {
    // 1. Obtener sesión actual para excluirla (si existe)
    let currentSession: { id: number; uuid: string } | null = null;
    if (user.sessionUuid) {
      const session = await this.sessionRepository.findByUuid(
        user.sessionUuid,
      );
      if (session) {
        currentSession = { id: session.id, uuid: session.uuid };
      }
    }

    // 2. Revocar todas las sesiones excepto la actual
    const revokedCount = await this.sessionRepository.revokeAllByUserId(
      user.sub,
      'LOGOUT_ALL',
      currentSession?.id,
    );

    // 3. Registrar en auditoría
    await this.auditRepository.log({
      tipoEvento: 'LOGOUT_ALL',
      usuarioId: user.sub,
      sesionUuid: currentSession?.uuid || undefined,
      ipLogin: 'unknown',
      exito: true,
      datosEvento: { sessionsRevoked: revokedCount },
      empresaId: user.empresaId,
      oficinaId: user.oficinaId,
    });

    return { sessionsRevoked: revokedCount };
  }
}

