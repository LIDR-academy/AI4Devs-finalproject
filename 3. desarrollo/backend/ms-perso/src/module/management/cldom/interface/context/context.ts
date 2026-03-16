import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { CldomEnum } from '../../infrastructure/enum/enum';
import { CldomService } from '../../infrastructure/service/service';
import { CldomEntity, CldomParams } from '../../domain/entity';
import {
  CreateCldomRequestDto,
  UpdateCldomRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(CldomEnum.table)
export class CldomContext {
  constructor(private readonly service: CldomService) { }

  @MessagePattern({ sm: CldomEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto & { clienteId?: number; provincia?: string; canton?: string; parroquia?: string }): Promise<ApiResponses<CldomEntity>> {
    const cldomParams: CldomParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      clienteId: params.clienteId,
      provincia: params.provincia,
      canton: params.canton,
      parroquia: params.parroquia,
    };
    return await this.service.findAll(cldomParams);
  }

  @MessagePattern({ sm: CldomEnum.smFindById })
  public async findById(@Payload('id') id: number): Promise<ApiResponse<CldomEntity>> {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: CldomEnum.smFindByClienId })
  public async findByClienId(@Payload('clienteId') clienteId: number): Promise<ApiResponse<CldomEntity>> {
    return await this.service.findByClienId(+clienteId);
  }

  @MessagePattern({ sm: CldomEnum.smCreate })
  public async create(@Payload() data: CreateCldomRequestDto): Promise<ApiResponse<CldomEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: CldomEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: UpdateCldomRequestDto }): Promise<ApiResponse<CldomEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: CldomEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<CldomEntity>> {
    return await this.service.delete(+id);
  }
}

