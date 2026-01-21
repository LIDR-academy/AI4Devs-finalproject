import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { TrepEnum } from '../../infrastructure/enum/enum';
import { TrepService } from '../../infrastructure/service/service';
import { TrepEntity } from '../../domain/entity';
import { TrepDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(TrepEnum.table)
export class TrepContext {
  constructor(private readonly service: TrepService) { }

  @MessagePattern({ sm: TrepEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<TrepEntity>> {
    return await this.service.findAll(params);
  }

  @MessagePattern({ sm: TrepEnum.smFindById })
  public async findById(@Payload('id') id: number) {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: TrepEnum.smCreate })
  public async create(@Payload() data: TrepDto): Promise<ApiResponse<TrepEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: TrepEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: TrepDto }): Promise<ApiResponse<TrepEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: TrepEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<TrepEntity>> {
    return await this.service.delete(+id);
  }
}

