import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  ISessionRepository,
  SESSION_REPOSITORY,
  CreateSessionData,
} from '../../domain/ports/session-repository.port';
import { SesionModel } from '../models/sesion.model';
import { SesionMapper } from '../mappers/sesion.mapper';
import { SesionEntity } from '../../domain/entities/sesion.entity';

/**
 * Implementación del repositorio de sesiones
 */
@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(
    @InjectRepository(SesionModel)
    private readonly sesionRepo: Repository<SesionModel>,
  ) {}

  async create(session: CreateSessionData): Promise<SesionEntity> {
    const model = this.sesionRepo.create({
      usuarioId: session.usuarioId,
      refreshTokenHash: session.refreshTokenHash,
      tokenFamily: session.tokenFamily,
      ipLogin: session.ipLogin,
      userAgent: session.userAgent,
      deviceFingerprint: session.deviceFingerprint,
      deviceName: session.deviceName,
      fechaExpiracion: session.fechaExpiracion,
    });

    const saved = await this.sesionRepo.save(model);
    return SesionMapper.toDomain(saved);
  }

  async findByRefreshTokenHash(hash: string): Promise<SesionEntity | null> {
    const model = await this.sesionRepo.findOne({
      where: { refreshTokenHash: hash },
      relations: ['usuario'],
    });

    return model ? SesionMapper.toDomain(model) : null;
  }

  async findByUuid(uuid: string): Promise<SesionEntity | null> {
    const model = await this.sesionRepo.findOne({
      where: { uuid },
      relations: ['usuario'],
    });

    return model ? SesionMapper.toDomain(model) : null;
  }

  async findActiveByUserId(userId: number): Promise<SesionEntity[]> {
    const models = await this.sesionRepo.find({
      where: {
        usuarioId: userId,
        activo: true,
        fechaRevocacion: IsNull(),
      },
      order: { fechaUltimaActividad: 'DESC' },
    });

    return models.map((model) => SesionMapper.toDomain(model));
  }

  async updateActivity(sessionId: number): Promise<void> {
    await this.sesionRepo.update(sessionId, {
      fechaUltimaActividad: new Date(),
    });
  }

  async updateRefreshToken(
    sessionId: number,
    newHash: string,
    newFamily: string,
  ): Promise<void> {
    await this.sesionRepo.update(sessionId, {
      refreshTokenHash: newHash,
      tokenFamily: newFamily,
      fechaUltimaActividad: new Date(),
    });
  }

  async revoke(
    sessionId: number,
    reason: string,
    revokedBy?: number,
  ): Promise<void> {
    await this.sesionRepo.update(sessionId, {
      activo: false,
      fechaRevocacion: new Date(),
      motivoRevocacion: reason as any,
    });
  }

  async revokeAllByUserId(
    userId: number,
    reason: string,
    exceptSessionId?: number,
  ): Promise<number> {
    const query = this.sesionRepo
      .createQueryBuilder()
      .update(SesionModel)
      .set({
        activo: false,
        fechaRevocacion: new Date(),
        motivoRevocacion: reason as any,
      })
      .where('sesio_cod_usuar = :userId', { userId })
      .andWhere('sesio_ctr_activ = true')
      .andWhere('sesio_fec_revoc IS NULL');

    if (exceptSessionId) {
      query.andWhere('sesio_cod_sesio != :exceptSessionId', {
        exceptSessionId,
      });
    }

    const result = await query.execute();
    return result.affected || 0;
  }
}

