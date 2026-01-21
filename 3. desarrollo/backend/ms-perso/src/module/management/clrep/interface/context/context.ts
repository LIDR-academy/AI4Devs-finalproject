import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClrepEnum } from '../../infrastructure/enum/enum';
import { ClrepService } from '../../infrastructure/service/service';
import { ClrepEntity, ClrepParams } from '../../domain/entity';
import {
  CreateClrepRequestDto,
  UpdateClrepRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(ClrepEnum.table)
export class ClrepContext {
  constructor(private readonly service: ClrepService) { }

  @MessagePattern({ sm: ClrepEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto & { clienteId?: number; tipoRepresentante?: number; personaId?: number }): Promise<ApiResponses<ClrepEntity>> {
    const clrepParams: ClrepParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      clienteId: params.clienteId,
      tipoRepresentante: params.tipoRepresentante,
      personaId: params.personaId,
    };
    return await this.service.findAll(clrepParams);
  }

  @MessagePattern({ sm: ClrepEnum.smFindById })
  public async findById(@Payload('id') id: number): Promise<ApiResponse<ClrepEntity>> {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: ClrepEnum.smFindByClienId })
  public async findByClienId(@Payload('clienteId') clienteId: number): Promise<ApiResponse<ClrepEntity>> {
    return await this.service.findByClienId(+clienteId);
  }

  @MessagePattern({ sm: ClrepEnum.smCreate })
  public async create(@Payload() data: CreateClrepRequestDto): Promise<ApiResponse<ClrepEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: ClrepEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: UpdateClrepRequestDto }): Promise<ApiResponse<ClrepEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: ClrepEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<ClrepEntity>> {
    return await this.service.delete(+id);
  }
}

