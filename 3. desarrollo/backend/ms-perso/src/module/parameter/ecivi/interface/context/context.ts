import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { EciviEnum } from '../../infrastructure/enum/enum';
import { EciviService } from '../../infrastructure/service/service';
import { EciviEntity } from '../../domain/entity';
import { EciviDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(EciviEnum.table)
export class EciviContext {
  constructor(private readonly service: EciviService) { }

  @MessagePattern({ sm: EciviEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<EciviEntity>> {
    return await this.service.findAll(params);
  }

  @MessagePattern({ sm: EciviEnum.smFindById })
  public async findById(@Payload('id') id: number) {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: EciviEnum.smCreate })
  public async create(@Payload() data: EciviDto): Promise<ApiResponse<EciviEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: EciviEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: EciviDto }): Promise<ApiResponse<EciviEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: EciviEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<EciviEntity>> {
    return await this.service.delete(+id);
  }
}

