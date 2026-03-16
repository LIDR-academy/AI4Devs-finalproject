import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { NacioEnum } from '../../infrastructure/enum/enum';
import { NacioService } from '../../infrastructure/service/service';
import { NacioEntity } from '../../domain/entity';
import { NacioDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(NacioEnum.table)
export class NacioContext {
  constructor(private readonly service: NacioService) { }

  @MessagePattern({ sm: NacioEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<NacioEntity>> {
    return await this.service.findAll(params);
  }

  @MessagePattern({ sm: NacioEnum.smFindById })
  public async findById(@Payload('id') id: number) {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: NacioEnum.smCreate })
  public async create(@Payload() data: NacioDto): Promise<ApiResponse<NacioEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: NacioEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: NacioDto }): Promise<ApiResponse<NacioEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: NacioEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<NacioEntity>> {
    return await this.service.delete(+id);
  }
}

