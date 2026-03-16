import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClcygEnum } from '../../infrastructure/enum/enum';
import { ClcygService } from '../../infrastructure/service/service';
import { ClcygEntity, ClcygParams } from '../../domain/entity';
import {
  CreateClcygRequestDto,
  UpdateClcygRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(ClcygEnum.table)
export class ClcygContext {
  constructor(private readonly service: ClcygService) { }

  @MessagePattern({ sm: ClcygEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto & { clienteId?: number; personaId?: number }): Promise<ApiResponses<ClcygEntity>> {
    const clcygParams: ClcygParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      clienteId: params.clienteId,
      personaId: params.personaId,
    };
    return await this.service.findAll(clcygParams);
  }

  @MessagePattern({ sm: ClcygEnum.smFindById })
  public async findById(@Payload('id') id: number): Promise<ApiResponse<ClcygEntity>> {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: ClcygEnum.smFindByClienId })
  public async findByClienId(@Payload('clienteId') clienteId: number): Promise<ApiResponse<ClcygEntity>> {
    return await this.service.findByClienId(+clienteId);
  }

  @MessagePattern({ sm: ClcygEnum.smCreate })
  public async create(@Payload() data: CreateClcygRequestDto): Promise<ApiResponse<ClcygEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: ClcygEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: UpdateClcygRequestDto }): Promise<ApiResponse<ClcygEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: ClcygEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<ClcygEntity>> {
    return await this.service.delete(+id);
  }
}

