import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { SexosEnum } from '../../infrastructure/enum/enum';
import { SexosService } from '../../infrastructure/service/service';
import { SexosEntity } from '../../domain/entity';
import { SexosDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(SexosEnum.table)
export class SexosContext {
  constructor(private readonly service: SexosService) { }

  @MessagePattern({ sm: SexosEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<SexosEntity>> {
    return await this.service.findAll(params);
  }

  @MessagePattern({ sm: SexosEnum.smFindById })
  public async findById(@Payload('id') id: number) {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: SexosEnum.smCreate })
  public async create(@Payload() data: SexosDto): Promise<ApiResponse<SexosEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: SexosEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: SexosDto }): Promise<ApiResponse<SexosEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: SexosEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<SexosEntity>> {
    return await this.service.delete(+id);
  }
}

