import { Injectable, Inject } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  ISessionRepository,
} from '../../domain/ports/session-repository.port';
import { TokenPayload } from '../../infrastructure/services/jwt-token.service';
import { SessionResponseDto } from '../../infrastructure/dto/response/session.response.dto';

/**
 * Use Case para obtener sesiones activas
 */
@Injectable()
export class GetSessionsUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  /**
   * Ejecuta la obtención de sesiones activas
   */
  async execute(user: TokenPayload): Promise<SessionResponseDto[]> {
    const sesiones = await this.sessionRepository.findActiveByUserId(user.sub);

    return sesiones.map((sesion) => ({
      uuid: sesion.uuid,
      ipLogin: sesion.ipLogin,
      userAgent: sesion.userAgent || undefined,
      deviceName: sesion.deviceName || undefined,
      fechaCreacion: sesion.fechaCreacion,
      fechaExpiracion: sesion.fechaExpiracion,
      fechaUltimaActividad: sesion.fechaUltimaActividad,
      activo: sesion.activo,
    }));
  }
}

