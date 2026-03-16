import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { TidenEnum } from '../../infrastructure/enum/enum';
import { TidenService } from '../../infrastructure/service/service';
import { TidenEntity } from '../../domain/entity';
import { TidenDto } from '../../infrastructure/dto';

@Controller(TidenEnum.table)
export class TidenController {
    constructor(
        private readonly service: TidenService,
    ) { }
    @Get('/')
    public async findAll(@Body() params: ParamsDto): Promise<ApiResponses<TidenEntity>> {
        try {
            const result = await this.service.findAll(params);
            return result;
        } catch (error) {
            throw error;
        }
    }

    @Get(':id')
    public async findById(@Param('id') id: number) {
        try {
            const result = await this.service.findById(+id);
            return result;
        } catch (error) {
            throw error;
        }
    }

    @Post()
    public async create(@Body() data: TidenDto): Promise<ApiResponse<TidenEntity>> {
        try {
            const result = await this.service.create(data);
            return result;
        } catch (error) {
            throw error;
        }
    }

    @Put(':id')
    public async update(@Param('id') id: number, @Body() data: TidenDto): Promise<ApiResponse<TidenEntity>> {
        try {
            const result = await this.service.update(+id, data);
            return result;
        } catch (error) {
            throw error;
        }
    }

    @Delete(':id')
    public async delete(@Param('id') id: number): Promise<ApiResponse<TidenEntity>> {
        const startTime = Date.now();
        try {
            const result = await this.service.delete(+id);
            return result;
        } catch (error) {
            throw error;
        }
    }
}
