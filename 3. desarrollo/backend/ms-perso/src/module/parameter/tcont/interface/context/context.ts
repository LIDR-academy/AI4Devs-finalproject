import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { TcontEnum } from '../../infrastructure/enum/enum';
import { TcontService } from '../../infrastructure/service/service';
import { TcontEntity } from '../../domain/entity';
import { TcontDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(TcontEnum.table)
export class TcontContext {
  constructor(private readonly service: TcontService) { }

  @MessagePattern({ sm: TcontEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<TcontEntity>> {
    return await this.service.findAll(params);
  }

  @MessagePattern({ sm: TcontEnum.smFindById })
  public async findById(@Payload('id') id: number) {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: TcontEnum.smCreate })
  public async create(@Payload() data: TcontDto): Promise<ApiResponse<TcontEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: TcontEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: TcontDto }): Promise<ApiResponse<TcontEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: TcontEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<TcontEntity>> {
    return await this.service.delete(+id);
  }
}

