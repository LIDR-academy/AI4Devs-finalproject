import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { InstrEnum } from '../../infrastructure/enum/enum';
import { InstrService } from '../../infrastructure/service/service';
import { InstrEntity } from '../../domain/entity';
import { InstrDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(InstrEnum.table)
export class InstrContext {
  constructor(private readonly service: InstrService) { }

  @MessagePattern({ sm: InstrEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<InstrEntity>> {
    return await this.service.findAll(params);
  }

  @MessagePattern({ sm: InstrEnum.smFindById })
  public async findById(@Payload('id') id: number) {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: InstrEnum.smCreate })
  public async create(@Payload() data: InstrDto): Promise<ApiResponse<InstrEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: InstrEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: InstrDto }): Promise<ApiResponse<InstrEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: InstrEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<InstrEntity>> {
    return await this.service.delete(+id);
  }
}

