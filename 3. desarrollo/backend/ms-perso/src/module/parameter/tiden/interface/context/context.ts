import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { TidenEnum } from '../../infrastructure/enum/enum';
import { TidenService } from '../../infrastructure/service/service';
import { TidenEntity } from '../../domain/entity';
import { TidenDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller(TidenEnum.table)
export class TidenContext {
    constructor(private readonly service: TidenService) { }


    @MessagePattern({ sm: TidenEnum.smFindAll })
    public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<TidenEntity>> {
        return await this.service.findAll(params);
    }

    @MessagePattern({ sm: TidenEnum.smFindById })
    public async findById(@Payload('id') id: number) {
        return await this.service.findById(+id);
    }

    @MessagePattern({ sm: TidenEnum.smCreate })
    public async create(@Payload() data: TidenDto): Promise<ApiResponse<TidenEntity>> {
        console.log("LLEGA A CREATE");
        console.log(data);
        return await this.service.create(data);
    }

    @MessagePattern({ sm: TidenEnum.smUpdate })
    public async update(@Payload() payload: { id: number; data: TidenDto }): Promise<ApiResponse<TidenEntity>> {
        const { id, data } = payload;
        return await this.service.update(id, data);
    }

    @MessagePattern({ sm: TidenEnum.smDelete })
    public async delete(@Payload('id') id: number): Promise<ApiResponse<TidenEntity>> {
        return await this.service.delete(+id);
    }
}
