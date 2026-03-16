import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ColorEnum } from '../../infrastructure/enum/enum';
import { ColorService } from '../../infrastructure/service/service';
import { ColorEntity } from '../../domain/entity';
import { ColorDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller(ColorEnum.table)
export class ColorContext {
    
    constructor(private readonly service: ColorService) { }

    @MessagePattern({ sm: ColorEnum.smFindAll })
    public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<ColorEntity>> {
        return await this.service.findAll(params);
    }

    @MessagePattern({ sm: ColorEnum.smFindById })
    public async findById(@Payload('id') id: number) {
        return await this.service.findById(+id);
    }

    @MessagePattern({ sm: ColorEnum.smCreate })
    public async create(@Payload() data: ColorDto): Promise<ApiResponse<ColorEntity>> {
        return await this.service.create(data);
    }

    @MessagePattern({ sm: ColorEnum.smUpdate })
    public async update(@Payload() payload: { id: number; data: ColorDto }): Promise<ApiResponse<ColorEntity>> {
        const { id, data } = payload;
        return await this.service.update(id, data);
    }

    @MessagePattern({ sm: ColorEnum.smDelete })
    public async delete(@Payload('id') id: number): Promise<ApiResponse<ColorEntity>> {
        return await this.service.delete(+id);
    }
}
