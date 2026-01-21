import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses } from 'src/shared/util';
import { GeoEnum } from '../../infrastructure/enum/enum';
import { GeoService } from '../../infrastructure/service/service';
import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from '../../domain/entity';
import {
  CreateProvinciaRequestDto,
  UpdateProvinciaRequestDto,
  CreateCantonRequestDto,
  UpdateCantonRequestDto,
  CreateParroquiaRequestDto,
  UpdateParroquiaRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('geo')
export class GeoContext {
    
  constructor(private readonly service: GeoService) { }

  // ========== PROVINCIAS ==========

  @MessagePattern({ sm: GeoEnum.smFindAllProvincias })
  public async findAllProvincias(@Payload() payload: { active?: boolean }): Promise<ApiResponses<ProvinciaEntity>> {
    return await this.service.findAllProvincias(payload?.active);
  }

  @MessagePattern({ sm: GeoEnum.smCreateProvincia })
  public async createProvincia(@Payload() data: CreateProvinciaRequestDto): Promise<ApiResponse<ProvinciaEntity>> {
    return await this.service.createProvincia(data);
  }

  @MessagePattern({ sm: GeoEnum.smUpdateProvincia })
  public async updateProvincia(@Payload() payload: { id: number; data: UpdateProvinciaRequestDto }): Promise<ApiResponse<ProvinciaEntity>> {
    const { id, data } = payload;
    return await this.service.updateProvincia(id, data);
  }

  @MessagePattern({ sm: GeoEnum.smDeleteProvincia })
  public async deleteProvincia(@Payload('id') id: number): Promise<ApiResponse<ProvinciaEntity>> {
    return await this.service.deleteProvincia(+id);
  }

  // ========== CANTONES ==========

  @MessagePattern({ sm: GeoEnum.smFindCantonesByProvincia })
  public async findCantonesByProvincia(@Payload() payload: { proviCodProv: string; active?: boolean }): Promise<ApiResponses<CantonEntity>> {
    return await this.service.findCantonesByProvincia(payload.proviCodProv, payload?.active);
  }

  @MessagePattern({ sm: GeoEnum.smCreateCanton })
  public async createCanton(@Payload() data: CreateCantonRequestDto): Promise<ApiResponse<CantonEntity>> {
    return await this.service.createCanton(data);
  }

  @MessagePattern({ sm: GeoEnum.smUpdateCanton })
  public async updateCanton(@Payload() payload: { id: number; data: UpdateCantonRequestDto }): Promise<ApiResponse<CantonEntity>> {
    const { id, data } = payload;
    return await this.service.updateCanton(id, data);
  }

  @MessagePattern({ sm: GeoEnum.smDeleteCanton })
  public async deleteCanton(@Payload('id') id: number): Promise<ApiResponse<CantonEntity>> {
    return await this.service.deleteCanton(+id);
  }

  // ========== PARROQUIAS ==========

  @MessagePattern({ sm: GeoEnum.smFindParroquiasByCanton })
  public async findParroquiasByCanton(@Payload() payload: { proviCodProv: string; cantoCodCant: string; active?: boolean }): Promise<ApiResponses<ParroquiaEntity>> {
    return await this.service.findParroquiasByCanton(payload.proviCodProv, payload.cantoCodCant, payload?.active);
  }

  @MessagePattern({ sm: GeoEnum.smSearchParroquias })
  public async searchParroquias(@Payload() payload: { query: string; limit: number }): Promise<ApiResponses<ParroquiaEntity>> {
    return await this.service.searchParroquias(payload.query, payload.limit);
  }

  @MessagePattern({ sm: GeoEnum.smCreateParroquia })
  public async createParroquia(@Payload() data: CreateParroquiaRequestDto): Promise<ApiResponse<ParroquiaEntity>> {
    return await this.service.createParroquia(data);
  }

  @MessagePattern({ sm: GeoEnum.smUpdateParroquia })
  public async updateParroquia(@Payload() payload: { id: number; data: UpdateParroquiaRequestDto }): Promise<ApiResponse<ParroquiaEntity>> {
    const { id, data } = payload;
    return await this.service.updateParroquia(id, data);
  }

  @MessagePattern({ sm: GeoEnum.smDeleteParroquia })
  public async deleteParroquia(@Payload('id') id: number): Promise<ApiResponse<ParroquiaEntity>> {
    return await this.service.deleteParroquia(+id);
  }
}

