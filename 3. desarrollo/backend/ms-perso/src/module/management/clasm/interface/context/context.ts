import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClasmEnum } from '../../infrastructure/enum/enum';
import { ClasmService } from '../../infrastructure/service/service';
import { ClasmEntity, ClasmParams } from '../../domain/entity';
import {
  CreateClasmRequestDto,
  UpdateClasmRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(ClasmEnum.table)
export class ClasmContext {
  constructor(private readonly service: ClasmService) { }

  @MessagePattern({ sm: ClasmEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto & { clienteId?: number; esDirectivo?: boolean; tipoRepresentante?: number }): Promise<ApiResponses<ClasmEntity>> {
    const clasmParams: ClasmParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      clienteId: params.clienteId,
      esDirectivo: params.esDirectivo,
      tipoRepresentante: params.tipoRepresentante,
    };
    return await this.service.findAll(clasmParams);
  }

  @MessagePattern({ sm: ClasmEnum.smFindById })
  public async findById(@Payload('id') id: number): Promise<ApiResponse<ClasmEntity>> {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: ClasmEnum.smFindByClienId })
  public async findByClienId(@Payload('clienteId') clienteId: number): Promise<ApiResponse<ClasmEntity>> {
    return await this.service.findByClienId(+clienteId);
  }

  @MessagePattern({ sm: ClasmEnum.smCreate })
  public async create(@Payload() data: CreateClasmRequestDto): Promise<ApiResponse<ClasmEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: ClasmEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: UpdateClasmRequestDto }): Promise<ApiResponse<ClasmEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: ClasmEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<ClasmEntity>> {
    return await this.service.delete(+id);
  }
}

