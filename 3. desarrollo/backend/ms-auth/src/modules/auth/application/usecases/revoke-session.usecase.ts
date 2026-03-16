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
 * Use Case para revocar una sesión específica
 */
@Injectable()
export class RevokeSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepository: IAuditRepository,
  ) {}

  /**
   * Ejecuta la revocación de sesión
   */
  async execute(user: TokenPayload, sessionUuid: string): Promise<void> {
    // 1. Buscar sesión
    const sesion = await this.sessionRepository.findByUuid(sessionUuid);

    if (!sesion) {
      throw new UnauthorizedException('Sesión no encontrada');
    }

    // 2. Verificar que la sesión pertenece al usuario
    if (sesion.usuarioId !== user.sub) {
      throw new UnauthorizedException('No tiene permiso para esta acción');
    }

    // 3. Revocar sesión
    await this.sessionRepository.revoke(sesion.id, 'ADMIN', user.sub);

    // 4. Registrar en auditoría
    await this.auditRepository.log({
      tipoEvento: 'SESSION_INVALIDATED',
      usuarioId: user.sub,
      sesionUuid: sessionUuid,
      ipLogin: 'unknown',
      exito: true,
      empresaId: user.empresaId,
      oficinaId: user.oficinaId,
    });
  }
}

