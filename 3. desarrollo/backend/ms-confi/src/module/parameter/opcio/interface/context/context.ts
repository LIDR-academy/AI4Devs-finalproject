import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { OpcioEnum } from '../../infrastructure/enum/enum';
import { OpcioService } from '../../infrastructure/service/service';
import { OpcioEntity } from '../../domain/entity';
import { OpcioDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller(OpcioEnum.table)
export class OpcioContext {

    constructor(private readonly service: OpcioService) { }

    @MessagePattern({ sm: OpcioEnum.smFindAll })
    public async findAll(@Payload() params: ParamsDto): Promise<ApiResponses<OpcioEntity>> {
        return await this.service.findAll(params);
    }

    @MessagePattern({ sm: OpcioEnum.smFindById })
    public async findById(@Payload('id') id: string): Promise<ApiResponse<OpcioEntity>> {
        return await this.service.findById(id);
    }

    @MessagePattern({ sm: OpcioEnum.smCreate })
    public async create(@Payload() data: OpcioDto): Promise<ApiResponse<OpcioEntity>> {
        return await this.service.create(data);
    }

    @MessagePattern({ sm: OpcioEnum.smUpdate })
    public async update(@Payload() payload: { id: string; data: OpcioDto }): Promise<ApiResponse<OpcioEntity>> {
        const { id, data } = payload;
        return await this.service.update(id, data);
    }

    @MessagePattern({ sm: OpcioEnum.smDelete })
    public async delete(@Payload('id') id: string): Promise<ApiResponse<OpcioEntity>> {
        return await this.service.delete(id);
    }
}
