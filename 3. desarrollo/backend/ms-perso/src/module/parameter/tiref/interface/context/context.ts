import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { TirefEnum } from '../../infrastructure/enum/enum';
import { TirefService } from '../../infrastructure/service/service';
import { TirefEntity } from '../../domain/entity';
import { TirefDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(TirefEnum.table)
export class TirefContext {
  constructor(private readonly service: TirefService) { }

  @MessagePattern({ sm: TirefEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<TirefEntity>> {
    return await this.service.findAll(params);
  }

  @MessagePattern({ sm: TirefEnum.smFindById })
  public async findById(@Payload('id') id: number) {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: TirefEnum.smCreate })
  public async create(@Payload() data: TirefDto): Promise<ApiResponse<TirefEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: TirefEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: TirefDto }): Promise<ApiResponse<TirefEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: TirefEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<TirefEntity>> {
    return await this.service.delete(+id);
  }
}

