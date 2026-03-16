import { Injectable, Inject } from "@nestjs/common";
import { ClbncPort, CLBNC_REPOSITORY } from "../domain/port";
import { ClbncEntity, ClbncParams } from "../domain/entity";
import { ClbncValue } from "../domain/value";

/**
 * UseCase de Usuario Banca Digital
 * Implementa la lógica de negocio para el módulo de Usuario Banca Digital
 * UN SOLO UseCase que implementa el Port directamente
 */
@Injectable()
export class ClbncUseCase implements ClbncPort {
  constructor(
    @Inject(CLBNC_REPOSITORY)
    private readonly repository: ClbncPort
  ) {}

  async findAll(params?: ClbncParams): Promise<{ data: ClbncEntity[]; total: number }> {
    return await this.repository.findAll(params);
  }

  async findById(id: number): Promise<ClbncEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    return await this.repository.findById(id);
  }

  async findByClienId(clienId: number): Promise<ClbncEntity | null> {
    if (!clienId || clienId <= 0) {
      return null;
    }
    return await this.repository.findByClienId(clienId);
  }

  async findByUsername(username: string): Promise<ClbncEntity | null> {
    if (!username || username.trim().length === 0) {
      return null;
    }
    return await this.repository.findByUsername(username);
  }

  async create(data: ClbncEntity): Promise<ClbncEntity | null> {
    // Verificar constraint único: un cliente solo puede tener un usuario de banca digital
    const existingByClien = await this.repository.findByClienId(data.clbnc_cod_clien);
    if (existingByClien) {
      throw new Error('Este cliente ya tiene un usuario de banca digital registrado');
    }
    
    // Verificar constraint único: username debe ser único
    const existingByUsername = await this.repository.findByUsername(data.clbnc_usr_banca);
    if (existingByUsername) {
      throw new Error('El username ya está en uso');
    }
    
    // Normalizar datos mediante Value Object
    const clbncValue = new ClbncValue(data);
    const normalizedData = clbncValue.toJson();
    
    return await this.repository.create(normalizedData);
  }

  async update(id: number, data: ClbncEntity): Promise<ClbncEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de actualizar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Si cambió el cliente, verificar constraint único
    if (existing.clbnc_cod_clien !== data.clbnc_cod_clien) {
      const existingByClien = await this.repository.findByClienId(data.clbnc_cod_clien);
      if (existingByClien && existingByClien.clbnc_cod_clbnc !== id) {
        throw new Error('Este cliente ya tiene un usuario de banca digital registrado');
      }
    }
    
    // Si cambió el username, verificar constraint único
    if (existing.clbnc_usr_banca !== data.clbnc_usr_banca) {
      const existingByUsername = await this.repository.findByUsername(data.clbnc_usr_banca);
      if (existingByUsername && existingByUsername.clbnc_cod_clbnc !== id) {
        throw new Error('El username ya está en uso');
      }
    }
    
    // Normalizar datos mediante Value Object
    const clbncValue = new ClbncValue(data, id);
    const normalizedData = clbncValue.toJson();
    
    return await this.repository.update(id, normalizedData);
  }

  async delete(id: number): Promise<ClbncEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de eliminar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    return await this.repository.delete(id);
  }

  // ========== AUTENTICACIÓN Y SEGURIDAD (APP MÓVIL) ==========

  async login(
    username: string,
    password: string,
    deviceInfo: {
      imei?: string | null;
      nombreDispositivo?: string | null;
      detallesDispositivo?: string | null;
      ip?: string | null;
      latitud?: number | null;
      longitud?: number | null;
      geocoder?: string | null;
    }
  ): Promise<{ usuario: ClbncEntity; tokenSesion: string } | null> {
    try {
      // Validaciones básicas
      if (!username || username.trim().length === 0) {
        throw new Error('Username es requerido');
      }
      if (!password || password.length === 0) {
        throw new Error('Password es requerido');
      }

      return await this.repository.login(username, password, deviceInfo);
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    id: number,
    passwordActual: string,
    passwordNuevo: string
  ): Promise<ClbncEntity | null> {
    try {
      if (!id || id <= 0) {
        throw new Error('ID inválido');
      }
      if (!passwordActual || passwordActual.length === 0) {
        throw new Error('Password actual es requerido');
      }
      if (!passwordNuevo || passwordNuevo.length < 8) {
        throw new Error('El nuevo password debe tener al menos 8 caracteres');
      }

      return await this.repository.changePassword(id, passwordActual, passwordNuevo);
    } catch (error) {
      throw error;
    }
  }

  async iniciarRecuperacionPassword(username: string): Promise<{ codigoVerificacion: string; expiraEn: Date } | null> {
    try {
      if (!username || username.trim().length === 0) {
        throw new Error('Username es requerido');
      }

      return await this.repository.iniciarRecuperacionPassword(username);
    } catch (error) {
      throw error;
    }
  }

  async completarRecuperacionPassword(
    username: string,
    codigoVerificacion: string,
    passwordNuevo: string
  ): Promise<ClbncEntity | null> {
    try {
      if (!username || username.trim().length === 0) {
        throw new Error('Username es requerido');
      }
      if (!codigoVerificacion || codigoVerificacion.length !== 6) {
        throw new Error('Código de verificación inválido');
      }
      if (!passwordNuevo || passwordNuevo.length < 8) {
        throw new Error('El nuevo password debe tener al menos 8 caracteres');
      }

      return await this.repository.completarRecuperacionPassword(username, codigoVerificacion, passwordNuevo);
    } catch (error) {
      throw error;
    }
  }

  async bloquear(id: number, motivo: string): Promise<ClbncEntity | null> {
    try {
      if (!id || id <= 0) {
        throw new Error('ID inválido');
      }
      if (!motivo || motivo.trim().length === 0) {
        throw new Error('Motivo del bloqueo es requerido');
      }

      return await this.repository.bloquear(id, motivo);
    } catch (error) {
      throw error;
    }
  }

  async desbloquear(id: number): Promise<ClbncEntity | null> {
    try {
      if (!id || id <= 0) {
        throw new Error('ID inválido');
      }

      return await this.repository.desbloquear(id);
    } catch (error) {
      throw error;
    }
  }

  async verificarTokenSesion(tokenSesion: string): Promise<ClbncEntity | null> {
    try {
      if (!tokenSesion || tokenSesion.trim().length === 0) {
        return null;
      }

      return await this.repository.verificarTokenSesion(tokenSesion);
    } catch (error) {
      throw error;
    }
  }
}

