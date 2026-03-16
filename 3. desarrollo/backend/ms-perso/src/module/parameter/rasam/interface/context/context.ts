import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { RasamEnum } from '../../infrastructure/enum/enum';
import { RasamService } from '../../infrastructure/service/service';
import { RasamEntity } from '../../domain/entity';
import { RasamDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(RasamEnum.table)
export class RasamContext {
  constructor(private readonly service: RasamService) { }

  @MessagePattern({ sm: RasamEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<RasamEntity>> {
    return await this.service.findAll(params);
  }

  @MessagePattern({ sm: RasamEnum.smFindById })
  public async findById(@Payload('id') id: number) {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: RasamEnum.smCreate })
  public async create(@Payload() data: RasamDto): Promise<ApiResponse<RasamEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: RasamEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: RasamDto }): Promise<ApiResponse<RasamEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: RasamEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<RasamEntity>> {
    return await this.service.delete(+id);
  }
}

