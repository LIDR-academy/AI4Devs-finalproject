import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { TpersEnum } from '../../infrastructure/enum/enum';
import { TpersService } from '../../infrastructure/service/service';
import { TpersEntity } from '../../domain/entity';
import { TpersDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(TpersEnum.table)
export class TpersContext {
  constructor(private readonly service: TpersService) { }

  @MessagePattern({ sm: TpersEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<TpersEntity>> {
    return await this.service.findAll(params);
  }

  @MessagePattern({ sm: TpersEnum.smFindById })
  public async findById(@Payload('id') id: number) {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: TpersEnum.smCreate })
  public async create(@Payload() data: TpersDto): Promise<ApiResponse<TpersEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: TpersEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: TpersDto }): Promise<ApiResponse<TpersEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: TpersEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<TpersEntity>> {
    return await this.service.delete(+id);
  }
}

