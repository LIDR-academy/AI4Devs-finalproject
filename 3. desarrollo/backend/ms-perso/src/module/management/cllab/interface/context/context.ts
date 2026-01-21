import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { CllabEnum } from '../../infrastructure/enum/enum';
import { CllabService } from '../../infrastructure/service/service';
import { CllabEntity, CllabParams } from '../../domain/entity';
import {
  CreateCllabRequestDto,
  UpdateCllabRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(CllabEnum.table)
export class CllabContext {
  constructor(private readonly service: CllabService) { }

  @MessagePattern({ sm: CllabEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto & { clienteId?: number; dependenciaId?: number; tipoContrato?: number }): Promise<ApiResponses<CllabEntity>> {
    const cllabParams: CllabParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      clienteId: params.clienteId,
      dependenciaId: params.dependenciaId,
      tipoContrato: params.tipoContrato,
    };
    return await this.service.findAll(cllabParams);
  }

  @MessagePattern({ sm: CllabEnum.smFindById })
  public async findById(@Payload('id') id: number): Promise<ApiResponse<CllabEntity>> {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: CllabEnum.smFindByClienId })
  public async findByClienId(@Payload('clienteId') clienteId: number): Promise<ApiResponse<CllabEntity>> {
    return await this.service.findByClienId(+clienteId);
  }

  @MessagePattern({ sm: CllabEnum.smCreate })
  public async create(@Payload() data: CreateCllabRequestDto): Promise<ApiResponse<CllabEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: CllabEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: UpdateCllabRequestDto }): Promise<ApiResponse<CllabEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: CllabEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<CllabEntity>> {
    return await this.service.delete(+id);
  }
}

