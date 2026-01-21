import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { TifinEnum } from '../../infrastructure/enum/enum';
import { TifinService } from '../../infrastructure/service/service';
import { TifinEntity } from '../../domain/entity';
import { TifinDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(TifinEnum.table)
export class TifinContext {
  constructor(private readonly service: TifinService) { }

  @MessagePattern({ sm: TifinEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<TifinEntity>> {
    return await this.service.findAll(params);
  }

  @MessagePattern({ sm: TifinEnum.smFindById })
  public async findById(@Payload('id') id: number) {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: TifinEnum.smCreate })
  public async create(@Payload() data: TifinDto): Promise<ApiResponse<TifinEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: TifinEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: TifinDto }): Promise<ApiResponse<TifinEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: TifinEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<TifinEntity>> {
    return await this.service.delete(+id);
  }
}

