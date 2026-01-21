import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { EtniaEnum } from '../../infrastructure/enum/enum';
import { EtniaService } from '../../infrastructure/service/service';
import { EtniaEntity } from '../../domain/entity';
import { EtniaDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(EtniaEnum.table)
export class EtniaContext {
  constructor(private readonly service: EtniaService) { }

  @MessagePattern({ sm: EtniaEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<EtniaEntity>> {
    return await this.service.findAll(params);
  }

  @MessagePattern({ sm: EtniaEnum.smFindById })
  public async findById(@Payload('id') id: number) {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: EtniaEnum.smCreate })
  public async create(@Payload() data: EtniaDto): Promise<ApiResponse<EtniaEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: EtniaEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: EtniaDto }): Promise<ApiResponse<EtniaEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: EtniaEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<EtniaEntity>> {
    return await this.service.delete(+id);
  }
}

