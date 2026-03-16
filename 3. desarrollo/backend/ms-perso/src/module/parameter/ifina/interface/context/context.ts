import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { IfinaEnum } from '../../infrastructure/enum/enum';
import { IfinaService } from '../../infrastructure/service/service';
import { IfinaEntity } from '../../domain/entity';
import { IfinaDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(IfinaEnum.table)
export class IfinaContext {
  constructor(private readonly service: IfinaService) { }

  @MessagePattern({ sm: IfinaEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<IfinaEntity>> {
    return await this.service.findAll(params);
  }

  @MessagePattern({ sm: IfinaEnum.smFindById })
  public async findById(@Payload('id') id: number) {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: IfinaEnum.smCreate })
  public async create(@Payload() data: IfinaDto): Promise<ApiResponse<IfinaEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: IfinaEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: IfinaDto }): Promise<ApiResponse<IfinaEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: IfinaEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<IfinaEntity>> {
    return await this.service.delete(+id);
  }
}

