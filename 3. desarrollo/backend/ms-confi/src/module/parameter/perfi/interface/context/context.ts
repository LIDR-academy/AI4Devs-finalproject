import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { PerfiEnum } from '../../infrastructure/enum/enum';
import { PerfiService } from '../../infrastructure/service/service';
import { PerfiEntity } from '../../domain/entity';
import { PerfiDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller(PerfiEnum.table)
export class PerfiContext {
    
    constructor(private readonly service: PerfiService) { }

    @MessagePattern({ sm: PerfiEnum.smFindAll })
    public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<PerfiEntity>> {
        return await this.service.findAll(params);
    }

    @MessagePattern({ sm: PerfiEnum.smFindById })
    public async findById(@Payload('id') id: number) {
        return await this.service.findById(+id);
    }

    @MessagePattern({ sm: PerfiEnum.smCreate })
    public async create(@Payload() data: PerfiDto): Promise<ApiResponse<PerfiEntity>> {
        return await this.service.create(data);
    }

    @MessagePattern({ sm: PerfiEnum.smUpdate })
    public async update(@Payload() payload: { id: number; data: PerfiDto }): Promise<ApiResponse<PerfiEntity>> {
        const { id, data } = payload;
        return await this.service.update(id, data);
    }

    @MessagePattern({ sm: PerfiEnum.smDelete })
    public async delete(@Payload('id') id: number): Promise<ApiResponse<PerfiEntity>> {
        return await this.service.delete(+id);
    }
}
