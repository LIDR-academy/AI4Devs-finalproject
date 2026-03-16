import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClbenEnum } from '../../infrastructure/enum/enum';
import { ClbenService } from '../../infrastructure/service/service';
import { ClbenEntity, ClbenParams } from '../../domain/entity';
import {
  CreateClbenRequestDto,
  UpdateClbenRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(ClbenEnum.table)
export class ClbenContext {
  constructor(private readonly service: ClbenService) { }

  @MessagePattern({ sm: ClbenEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto & { usuarioBancaDigitalId?: number; activo?: boolean; externo?: boolean }): Promise<ApiResponses<ClbenEntity>> {
    const clbenParams: ClbenParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      usuarioBancaDigitalId: params.usuarioBancaDigitalId,
      activo: params.activo,
      externo: params.externo,
    };
    return await this.service.findAll(clbenParams);
  }

  @MessagePattern({ sm: ClbenEnum.smFindById })
  public async findById(@Payload('id') id: number): Promise<ApiResponse<ClbenEntity>> {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: ClbenEnum.smFindByClbncId })
  public async findByClbncId(@Payload('clbncId') clbncId: number): Promise<ApiResponses<ClbenEntity>> {
    return await this.service.findByClbncId(+clbncId);
  }

  @MessagePattern({ sm: ClbenEnum.smCreate })
  public async create(@Payload() data: CreateClbenRequestDto): Promise<ApiResponse<ClbenEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: ClbenEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: UpdateClbenRequestDto }): Promise<ApiResponse<ClbenEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: ClbenEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<ClbenEntity>> {
    return await this.service.delete(+id);
  }
}

