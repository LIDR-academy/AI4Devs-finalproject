import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { IconsEnum } from '../../infrastructure/enum/enum';
import { IconsService } from '../../infrastructure/service/service';
import { IconsEntity } from '../../domain/entity';
import { IconsDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller(IconsEnum.table)
export class IconsContext {
    
    constructor(private readonly service: IconsService) { }

    @MessagePattern({ sm: IconsEnum.smFindAll })
    public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<IconsEntity>> {
        return await this.service.findAll(params);
    }

    @MessagePattern({ sm: IconsEnum.smFindAllByColor })
    public async findAllByColor(@Payload() params: ParamsDto, @Payload('id') id: number): Promise<ApiResponses<IconsEntity>> {
        return await this.service.findAllByColor(params, id);
    }

    @MessagePattern({ sm: IconsEnum.smFindById })
    public async findById(@Payload('id') id: number) {
        return await this.service.findById(+id);
    }

    @MessagePattern({ sm: IconsEnum.smCreate })
    public async create(@Payload() data: IconsDto): Promise<ApiResponse<IconsEntity>> {
        return await this.service.create(data);
    }

    @MessagePattern({ sm: IconsEnum.smUpdate })
    public async update(@Payload() payload: { id: number; data: IconsDto }): Promise<ApiResponse<IconsEntity>> {
        const { id, data } = payload;
        return await this.service.update(id, data);
    }

    @MessagePattern({ sm: IconsEnum.smDelete })
    public async delete(@Payload('id') id: number): Promise<ApiResponse<IconsEntity>> {
        return await this.service.delete(+id);
    }
}
