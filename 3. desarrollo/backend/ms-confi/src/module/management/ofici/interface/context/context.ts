import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { OficiEnum } from '../../infrastructure/enum/enum';
import { OficiService } from '../../infrastructure/service/service';
import { OficiEntity } from '../../domain/entity';
import { OficiDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OficiParamsDto } from '../../infrastructure/dto/params';


@Controller(OficiEnum.table)
export class OficiContext {

    constructor(private readonly service: OficiService) { }

    @MessagePattern({ sm: OficiEnum.smFindAll })
    public async findAll(@Payload() params: OficiParamsDto): Promise<ApiResponses<OficiEntity>> {
        return await this.service.findAll(params);
    }

    @MessagePattern({ sm: OficiEnum.smFindById })
    public async findById(@Payload('id') id: number) {
        return await this.service.findById(+id);
    }

    @MessagePattern({ sm: OficiEnum.smCreate })
    public async create(@Payload() data: OficiDto): Promise<ApiResponse<OficiEntity>> {
        return await this.service.create(data);
    }

    @MessagePattern({ sm: OficiEnum.smUpdate })
    public async update(@Payload() payload: { id: number; data: OficiDto }): Promise<ApiResponse<OficiEntity>> {
        const { id, data } = payload;
        return await this.service.update(id, data);
    }

    @MessagePattern({ sm: OficiEnum.smDelete })
    public async delete(@Payload('id') id: number): Promise<ApiResponse<OficiEntity>> {
        return await this.service.delete(+id);
    }
}
