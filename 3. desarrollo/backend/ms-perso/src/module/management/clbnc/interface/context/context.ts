import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClbncEnum } from '../../infrastructure/enum/enum';
import { ClbncService } from '../../infrastructure/service/service';
import { ClbncEntity, ClbncParams } from '../../domain/entity';
import {
  CreateClbncRequestDto,
  UpdateClbncRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(ClbncEnum.table)
export class ClbncContext {
  constructor(private readonly service: ClbncService) { }

  @MessagePattern({ sm: ClbncEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto & { clienteId?: number; username?: string; activo?: boolean }): Promise<ApiResponses<ClbncEntity>> {
    const clbncParams: ClbncParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      clienteId: params.clienteId,
      username: params.username,
      activo: params.activo,
    };
    return await this.service.findAll(clbncParams);
  }

  @MessagePattern({ sm: ClbncEnum.smFindById })
  public async findById(@Payload('id') id: number): Promise<ApiResponse<ClbncEntity>> {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: ClbncEnum.smFindByClienId })
  public async findByClienId(@Payload('clienteId') clienteId: number): Promise<ApiResponse<ClbncEntity>> {
    return await this.service.findByClienId(+clienteId);
  }

  @MessagePattern({ sm: ClbncEnum.smFindByUsername })
  public async findByUsername(@Payload('username') username: string): Promise<ApiResponse<ClbncEntity>> {
    return await this.service.findByUsername(username);
  }

  @MessagePattern({ sm: ClbncEnum.smCreate })
  public async create(@Payload() data: CreateClbncRequestDto): Promise<ApiResponse<ClbncEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: ClbncEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: UpdateClbncRequestDto }): Promise<ApiResponse<ClbncEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: ClbncEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<ClbncEntity>> {
    return await this.service.delete(+id);
  }

  // ========== AUTENTICACIÓN Y SEGURIDAD (APP MÓVIL) ==========

  @MessagePattern({ sm: ClbncEnum.smLogin })
  public async login(@Payload() payload: {
    username: string;
    password: string;
    deviceInfo: {
      imei?: string | null;
      nombreDispositivo?: string | null;
      detallesDispositivo?: string | null;
      ip?: string | null;
      latitud?: number | null;
      longitud?: number | null;
      geocoder?: string | null;
    };
  }): Promise<ApiResponse<{ usuario: ClbncEntity; tokenSesion: string; clienteId: number }>> {
    const { username, password, deviceInfo } = payload;
    return await this.service.login(username, password, deviceInfo);
  }

  @MessagePattern({ sm: ClbncEnum.smChangePassword })
  public async changePassword(@Payload() payload: {
    id: number;
    passwordActual: string;
    passwordNuevo: string;
  }): Promise<ApiResponse<ClbncEntity>> {
    const { id, passwordActual, passwordNuevo } = payload;
    return await this.service.changePassword(id, passwordActual, passwordNuevo);
  }

  @MessagePattern({ sm: ClbncEnum.smRecoverPassword })
  public async iniciarRecuperacionPassword(@Payload() payload: {
    username: string;
  }): Promise<ApiResponse<{ codigoVerificacion: string; expiraEn: Date }>> {
    return await this.service.iniciarRecuperacionPassword(payload.username);
  }
}

