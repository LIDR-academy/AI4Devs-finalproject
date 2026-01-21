import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClrefEnum } from '../../infrastructure/enum/enum';
import { ClrefService } from '../../infrastructure/service/service';
import { ClrefEntity, ClrefParams } from '../../domain/entity';
import {
  CreateClrefRequestDto,
  UpdateClrefRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(ClrefEnum.table)
export class ClrefContext {
  constructor(private readonly service: ClrefService) { }

  @MessagePattern({ sm: ClrefEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto & { clienteId?: number; tipoReferencia?: number; personaId?: number }): Promise<ApiResponses<ClrefEntity>> {
    const clrefParams: ClrefParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      clienteId: params.clienteId,
      tipoReferencia: params.tipoReferencia,
      personaId: params.personaId,
    };
    return await this.service.findAll(clrefParams);
  }

  @MessagePattern({ sm: ClrefEnum.smFindById })
  public async findById(@Payload('id') id: number): Promise<ApiResponse<ClrefEntity>> {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: ClrefEnum.smFindByClienId })
  public async findByClienId(@Payload('clienteId') clienteId: number): Promise<ApiResponses<ClrefEntity>> {
    return await this.service.findByClienId(+clienteId);
  }

  @MessagePattern({ sm: ClrefEnum.smCreate })
  public async create(@Payload() data: CreateClrefRequestDto): Promise<ApiResponse<ClrefEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: ClrefEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: UpdateClrefRequestDto }): Promise<ApiResponse<ClrefEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: ClrefEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<ClrefEntity>> {
    return await this.service.delete(+id);
  }
}

