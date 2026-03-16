import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClrfiEnum } from '../../infrastructure/enum/enum';
import { ClrfiService } from '../../infrastructure/service/service';
import { ClrfiEntity, ClrfiParams } from '../../domain/entity';
import {
  CreateClrfiRequestDto,
  UpdateClrfiRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(ClrfiEnum.table)
export class ClrfiContext {
  constructor(private readonly service: ClrfiService) { }

  @MessagePattern({ sm: ClrfiEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto & { clienteId?: number; tieneResidenciaFiscal?: boolean; paisId?: number }): Promise<ApiResponses<ClrfiEntity>> {
    const clrfiParams: ClrfiParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      clienteId: params.clienteId,
      tieneResidenciaFiscal: params.tieneResidenciaFiscal,
      paisId: params.paisId,
    };
    return await this.service.findAll(clrfiParams);
  }

  @MessagePattern({ sm: ClrfiEnum.smFindById })
  public async findById(@Payload('id') id: number): Promise<ApiResponse<ClrfiEntity>> {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: ClrfiEnum.smFindByClienId })
  public async findByClienId(@Payload('clienteId') clienteId: number): Promise<ApiResponse<ClrfiEntity>> {
    return await this.service.findByClienId(+clienteId);
  }

  @MessagePattern({ sm: ClrfiEnum.smCreate })
  public async create(@Payload() data: CreateClrfiRequestDto): Promise<ApiResponse<ClrfiEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: ClrfiEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: UpdateClrfiRequestDto }): Promise<ApiResponse<ClrfiEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: ClrfiEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<ClrfiEntity>> {
    return await this.service.delete(+id);
  }
}

