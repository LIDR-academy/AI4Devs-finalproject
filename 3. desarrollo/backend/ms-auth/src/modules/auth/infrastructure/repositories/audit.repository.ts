import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IAuditRepository,
  AUDIT_REPOSITORY,
  AuditEvent,
} from '../../domain/ports/audit-repository.port';
import { AuditoriaAuthModel } from '../models/auditoria-auth.model';

/**
 * Implementación del repositorio de auditoría
 */
@Injectable()
export class AuditRepository implements IAuditRepository {
  constructor(
    @InjectRepository(AuditoriaAuthModel)
    private readonly auditRepo: Repository<AuditoriaAuthModel>,
  ) {}

  async log(event: AuditEvent): Promise<void> {
    const model = this.auditRepo.create({
      tipoEvento: event.tipoEvento,
      categoriaEvento: event.categoriaEvento || 'AUTH',
      usuarioId: event.usuarioId ?? null,
      nombreUsuario: event.nombreUsuario ?? null,
      sesionUuid: event.sesionUuid ?? null,
      ipLogin: event.ipLogin,
      userAgent: event.userAgent ?? null,
      exito: event.exito,
      motivoError: event.motivoError ?? null,
      empresaId: event.empresaId ?? null,
      oficinaId: event.oficinaId ?? null,
      datosEvento: event.datosEvento || {},
    });

    await this.auditRepo.save(model);
  }
}

