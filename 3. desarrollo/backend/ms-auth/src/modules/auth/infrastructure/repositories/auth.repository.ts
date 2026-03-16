import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { IAuthRepository, AUTH_REPOSITORY } from '../../domain/ports/auth-repository.port';
import { UsuarioModel } from '../models/usuario.model';
import { HistorialPasswordModel } from '../models/historial-password.model';
import { UsuarioMapper } from '../mappers/usuario.mapper';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';

/**
 * Implementación del repositorio de autenticación
 */
@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(UsuarioModel)
    private readonly usuarioRepo: Repository<UsuarioModel>,
    @InjectRepository(HistorialPasswordModel)
    private readonly historialPasswordRepo: Repository<HistorialPasswordModel>,
  ) {}

  async findByUsername(username: string): Promise<UsuarioEntity | null> {
    const model = await this.usuarioRepo.findOne({
      where: {
        username,
        activo: true,
        fechaEliminacion: IsNull(),
      },
      relations: ['perfil'],
    });

    return model ? UsuarioMapper.toDomain(model) : null;
  }

  async findById(id: number): Promise<UsuarioEntity | null> {
    const model = await this.usuarioRepo.findOne({
      where: {
        id,
        fechaEliminacion: IsNull(),
      },
      relations: ['perfil'],
    });

    return model ? UsuarioMapper.toDomain(model) : null;
  }

  async findByEmail(email: string): Promise<UsuarioEntity | null> {
    const model = await this.usuarioRepo.findOne({
      where: {
        email,
        activo: true,
        fechaEliminacion: IsNull(),
      },
      relations: ['perfil'],
    });

    return model ? UsuarioMapper.toDomain(model) : null;
  }

  async findByUuid(uuid: string): Promise<UsuarioEntity | null> {
    const model = await this.usuarioRepo.findOne({
      where: {
        uuid,
        fechaEliminacion: IsNull(),
      },
      relations: ['perfil'],
    });

    return model ? UsuarioMapper.toDomain(model) : null;
  }

  async updateLastLogin(id: number, ip: string): Promise<void> {
    await this.usuarioRepo.update(id, {
      fechaUltimoLogin: new Date(),
      ultimaIpLogin: ip,
    });
  }

  async incrementFailedAttempts(id: number): Promise<number> {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) {
      throw new Error(`Usuario con id ${id} no encontrado`);
    }

    // Si es el primer intento fallido, registrar la fecha
    if (usuario.intentosFallidos === 0 || !usuario.fechaPrimerIntentoFallido) {
      await this.usuarioRepo.update(id, {
        intentosFallidos: 1,
        fechaPrimerIntentoFallido: new Date(),
      });
      return 1;
    }

    // Incrementar intentos
    const nuevosIntentos = usuario.intentosFallidos + 1;
    await this.usuarioRepo.update(id, {
      intentosFallidos: nuevosIntentos,
    });

    return nuevosIntentos;
  }

  async resetFailedAttempts(id: number): Promise<void> {
    await this.usuarioRepo.update(id, {
      intentosFallidos: 0,
      fechaPrimerIntentoFallido: null,
    });
  }

  async lockUser(id: number, until: Date, reason: string): Promise<void> {
    await this.usuarioRepo.update(id, {
      bloqueadoHasta: until,
      motivoBloqueo: reason,
    });
  }

  async unlockUser(id: number): Promise<void> {
    await this.usuarioRepo.update(id, {
      bloqueadoHasta: null,
      motivoBloqueo: null,
      intentosFallidos: 0,
      fechaPrimerIntentoFallido: null,
    });
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.usuarioRepo.update(id, {
      passwordHash,
      fechaUltimoPassword: new Date(),
      forzarCambioPassword: false,
    });
  }

  async getPasswordHistory(userId: number, limit: number): Promise<string[]> {
    const historial = await this.historialPasswordRepo.find({
      where: { usuarioId: userId },
      order: { fechaCreacion: 'DESC' },
      take: limit,
    });

    return historial.map((h) => h.passwordHash);
  }

  async savePasswordHistory(userId: number, passwordHash: string): Promise<void> {
    const historial = new HistorialPasswordModel();
    historial.usuarioId = userId;
    historial.passwordHash = passwordHash;

    await this.historialPasswordRepo.save(historial);
  }
}

