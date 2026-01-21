import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClfinEnum } from '../../infrastructure/enum/enum';
import { ClfinService } from '../../infrastructure/service/service';
import { ClfinEntity, ClfinParams } from '../../domain/entity';
import {
  CreateClfinRequestDto,
  UpdateClfinRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(ClfinEnum.table)
export class ClfinContext {
  constructor(private readonly service: ClfinService) { }

  @MessagePattern({ sm: ClfinEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto & { clienteId?: number; tipoFinanciero?: number }): Promise<ApiResponses<ClfinEntity>> {
    const clfinParams: ClfinParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      clienteId: params.clienteId,
      tipoFinanciero: params.tipoFinanciero,
    };
    return await this.service.findAll(clfinParams);
  }

  @MessagePattern({ sm: ClfinEnum.smFindById })
  public async findById(@Payload('id') id: number): Promise<ApiResponse<ClfinEntity>> {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: ClfinEnum.smFindByClienId })
  public async findByClienId(@Payload('clienteId') clienteId: number): Promise<ApiResponses<ClfinEntity>> {
    return await this.service.findByClienId(+clienteId);
  }

  @MessagePattern({ sm: ClfinEnum.smFindByClienIdAndTipo })
  public async findByClienIdAndTipo(@Payload() payload: { clienteId: number; tipoFinanciero: number }): Promise<ApiResponse<ClfinEntity>> {
    const { clienteId, tipoFinanciero } = payload;
    return await this.service.findByClienIdAndTipo(+clienteId, +tipoFinanciero);
  }

  @MessagePattern({ sm: ClfinEnum.smCreate })
  public async create(@Payload() data: CreateClfinRequestDto): Promise<ApiResponse<ClfinEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: ClfinEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: UpdateClfinRequestDto }): Promise<ApiResponse<ClfinEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: ClfinEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<ClfinEntity>> {
    return await this.service.delete(+id);
  }
}

