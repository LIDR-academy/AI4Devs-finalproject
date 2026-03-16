import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ToficEnum } from '../../infrastructure/enum/enum';
import { ToficService } from '../../infrastructure/service/service';
import { ToficEntity } from '../../domain/entity';
import { ToficDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller(ToficEnum.table)
export class ToficContext {
    
    constructor(private readonly service: ToficService) { }

    @MessagePattern({ sm: ToficEnum.smFindAll })
    public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<ToficEntity>> {
        return await this.service.findAll(params);
    }

    @MessagePattern({ sm: ToficEnum.smFindById })
    public async findById(@Payload('id') id: number) {
        return await this.service.findById(+id);
    }

    @MessagePattern({ sm: ToficEnum.smCreate })
    public async create(@Payload() data: ToficDto): Promise<ApiResponse<ToficEntity>> {
        return await this.service.create(data);
    }

    @MessagePattern({ sm: ToficEnum.smUpdate })
    public async update(@Payload() payload: { id: number; data: ToficDto }): Promise<ApiResponse<ToficEntity>> {
        const { id, data } = payload;
        return await this.service.update(id, data);
    }

    @MessagePattern({ sm: ToficEnum.smDelete })
    public async delete(@Payload('id') id: number): Promise<ApiResponse<ToficEntity>> {
        return await this.service.delete(+id);
    }
}
