import { Injectable } from "@nestjs/common";
import { ClbncEnum } from "../enum/enum";
import { ClbncUseCase } from "../../application/usecase";
import { ClbncParams, ClbncEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { ClbncDBRepository } from "../repository/repository";
import { UpdateClbncRequestDto } from "../dto/request/update-clbnc.request.dto";
import { CreateClbncRequestDto } from "../dto/request/create-clbnc.request.dto";

@Injectable()
export class ClbncService {
  public usecase: ClbncUseCase;

  constructor(private readonly repository: ClbncDBRepository) {
    this.usecase = new ClbncUseCase(this.repository);
  }

  async findAll(params?: ClbncParams): Promise<ApiResponses<ClbncEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClbncEnum.title, 
        method: 'findAll' 
      });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<ClbncEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ApiResponse<ClbncEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClbncEnum.title, 
        method: 'findById' 
      });
      const found = await this.usecase.findById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClbncEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByClienId(clienId: number): Promise<ApiResponse<ClbncEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClbncEnum.title, 
        method: 'findByClienId' 
      });
      const found = await this.usecase.findByClienId(clienId);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: 'No se encontró usuario de banca digital para este cliente' }, 404);
      }
      return ResponseUtil.response<ClbncEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByUsername(username: string): Promise<ApiResponse<ClbncEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClbncEnum.title, 
        method: 'findByUsername' 
      });
      const found = await this.usecase.findByUsername(username);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: 'No se encontró usuario con ese username' }, 404);
      }
      return ResponseUtil.response<ClbncEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async create(data: CreateClbncRequestDto): Promise<ApiResponse<ClbncEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: ClbncEnum.title, 
        method: 'create' 
      });
      // Convertir DTO a Entity
      const entityData: ClbncEntity = data as ClbncEntity;
      const created = await this.usecase.create(entityData);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<ClbncEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: number, data: UpdateClbncRequestDto): Promise<ApiResponse<ClbncEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClbncEnum.title, 
        method: 'update' 
      });
      // Convertir DTO a Entity
      const entityData: ClbncEntity = data as ClbncEntity;
      const updated = await this.usecase.update(id, entityData);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClbncEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<ApiResponse<ClbncEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: ClbncEnum.title, 
        method: 'delete' 
      });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClbncEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
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
  ): Promise<ApiResponse<{ usuario: ClbncEntity; tokenSesion: string; clienteId: number }>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'validator', 
        resource: ClbncEnum.title, 
        method: 'login' 
      });
      const result = await this.usecase.login(username, password, deviceInfo);
      if (result === null) {
        return ResponseUtil.detail({ ...detail, message: 'Credenciales inválidas' }, 401);
      }
      return ResponseUtil.response<{ usuario: ClbncEntity; tokenSesion: string; clienteId: number }>({
        usuario: result.usuario,
        tokenSesion: result.tokenSesion,
        clienteId: result.usuario.clbnc_cod_clien,
      }, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async changePassword(
    id: number,
    passwordActual: string,
    passwordNuevo: string
  ): Promise<ApiResponse<ClbncEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClbncEnum.title, 
        method: 'changePassword' 
      });
      const updated = await this.usecase.changePassword(id, passwordActual, passwordNuevo);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: 'Password actual incorrecto o usuario no encontrado' }, 400);
      }
      return ResponseUtil.response<ClbncEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async iniciarRecuperacionPassword(username: string): Promise<ApiResponse<{ codigoVerificacion: string; expiraEn: Date }>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'validator', 
        resource: ClbncEnum.title, 
        method: 'iniciarRecuperacionPassword' 
      });
      const result = await this.usecase.iniciarRecuperacionPassword(username);
      if (result === null) {
        // Por seguridad, no revelar si el usuario existe o no
        return ResponseUtil.detail({ ...detail, message: 'Si el usuario existe, se enviará un código de verificación' }, 200);
      }
      // NOTA: En producción, el código se enviaría por email/SMS y NO se retornaría en la respuesta
      // Por ahora, para desarrollo, se retorna (debe eliminarse en producción)
      return ResponseUtil.response<{ codigoVerificacion: string; expiraEn: Date }>(result, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async completarRecuperacionPassword(
    username: string,
    codigoVerificacion: string,
    passwordNuevo: string
  ): Promise<ApiResponse<ClbncEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClbncEnum.title, 
        method: 'completarRecuperacionPassword' 
      });
      const updated = await this.usecase.completarRecuperacionPassword(username, codigoVerificacion, passwordNuevo);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: 'Código de verificación inválido o expirado' }, 400);
      }
      return ResponseUtil.response<ClbncEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async bloquear(id: number, motivo: string): Promise<ApiResponse<ClbncEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClbncEnum.title, 
        method: 'bloquear' 
      });
      const blocked = await this.usecase.bloquear(id, motivo);
      if (blocked === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClbncEntity>(blocked, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async desbloquear(id: number): Promise<ApiResponse<ClbncEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClbncEnum.title, 
        method: 'desbloquear' 
      });
      const unblocked = await this.usecase.desbloquear(id);
      if (unblocked === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClbncEntity>(unblocked, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async verificarTokenSesion(tokenSesion: string): Promise<ApiResponse<ClbncEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'validator', 
        resource: ClbncEnum.title, 
        method: 'verificarTokenSesion' 
      });
      const usuario = await this.usecase.verificarTokenSesion(tokenSesion);
      if (usuario === null) {
        return ResponseUtil.detail({ ...detail, message: 'Token de sesión inválido o expirado' }, 401);
      }
      return ResponseUtil.response<ClbncEntity>(usuario, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

