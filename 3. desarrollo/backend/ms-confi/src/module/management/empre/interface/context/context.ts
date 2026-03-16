import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { EmpreEnum } from '../../infrastructure/enum/enum';
import { EmpreService } from '../../infrastructure/service/service';
import { EmpreEntity } from '../../domain/entity';
import { EmpreDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller(EmpreEnum.table)
export class EmpreContext {
    
    constructor(private readonly service: EmpreService) { }

    @MessagePattern({ sm: EmpreEnum.smFindAll })
    public async findAll(): Promise<ApiResponse<EmpreEntity>> {
        return await this.service.findAll();
    }

    @MessagePattern({ sm: EmpreEnum.smFindById })
    public async findById(@Payload('id') id: number) {
        return await this.service.findById(+id);
    }

    @MessagePattern({ sm: EmpreEnum.smCreate })
    public async create(@Payload() data: EmpreDto): Promise<ApiResponse<EmpreEntity>> {
        return await this.service.create(data);
    }

    @MessagePattern({ sm: EmpreEnum.smUpdate })
    public async update(@Payload() payload: { id: number; data: EmpreDto }): Promise<ApiResponse<EmpreEntity>> {
        const { id, data } = payload;
        return await this.service.update(id, data);
    }

    @MessagePattern({ sm: EmpreEnum.smDelete })
    public async delete(@Payload('id') id: number): Promise<ApiResponse<EmpreEntity>> {
        return await this.service.delete(+id);
    }
}
