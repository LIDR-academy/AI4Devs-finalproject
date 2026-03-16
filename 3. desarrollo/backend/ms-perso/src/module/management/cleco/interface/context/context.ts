import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClecoEnum } from '../../infrastructure/enum/enum';
import { ClecoService } from '../../infrastructure/service/service';
import { ClecoEntity, ClecoParams } from '../../domain/entity';
import {
  CreateClecoRequestDto,
  UpdateClecoRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(ClecoEnum.table)
export class ClecoContext {
  constructor(private readonly service: ClecoService) { }

  @MessagePattern({ sm: ClecoEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto & { clienteId?: number; sector?: string; actividad?: string }): Promise<ApiResponses<ClecoEntity>> {
    const clecoParams: ClecoParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      clienteId: params.clienteId,
      sector: params.sector,
      actividad: params.actividad,
    };
    return await this.service.findAll(clecoParams);
  }

  @MessagePattern({ sm: ClecoEnum.smFindById })
  public async findById(@Payload('id') id: number): Promise<ApiResponse<ClecoEntity>> {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: ClecoEnum.smFindByClienId })
  public async findByClienId(@Payload('clienteId') clienteId: number): Promise<ApiResponse<ClecoEntity>> {
    return await this.service.findByClienId(+clienteId);
  }

  @MessagePattern({ sm: ClecoEnum.smCreate })
  public async create(@Payload() data: CreateClecoRequestDto): Promise<ApiResponse<ClecoEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: ClecoEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: UpdateClecoRequestDto }): Promise<ApiResponse<ClecoEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: ClecoEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<ClecoEntity>> {
    return await this.service.delete(+id);
  }
}

