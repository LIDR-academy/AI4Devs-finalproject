import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiResponse } from 'src/shared/util';
import { EmpreEnum } from '../../infrastructure/enum/enum';
import { EmpreService } from '../../infrastructure/service/service';
import { EmpreEntity } from '../../domain/entity';
import { EmpreDto } from '../../infrastructure/dto';
import { ApiBearerAuth, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags(EmpreEnum.table)
@Controller(EmpreEnum.table)
export class EmpreController {

    constructor(private readonly service: EmpreService) { }

    @Get('/')
    @ApiOperation({ summary: `Listar los ${EmpreEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: EmpreEnum.smFindAll, type: EmpreDto })
    public async findAll(): Promise<ApiResponse<EmpreEntity>> {
        return await this.service.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: `Obtener un ${EmpreEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: EmpreEnum.smFindById, type: EmpreDto })
    public async findById(@Param('id') id: number): Promise<ApiResponse<EmpreEntity>> {
        return await this.service.findById(+id);
    }

    @Post()
    @ApiOperation({ summary: `Crear un nuevo ${EmpreEnum.title}` })
    @ApiResponseSwagger({ status: 201, description: EmpreEnum.smCreate, type: EmpreDto })
    public async create(@Body() data: EmpreDto): Promise<ApiResponse<EmpreEntity>> {
        return await this.service.create(data);

    }

    @Put(':id')
    @ApiOperation({ summary: `Actualizar un ${EmpreEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: EmpreEnum.smUpdate, type: EmpreDto })
    public async update(@Param('id') id: number, @Body() data: EmpreDto): Promise<ApiResponse<EmpreEntity>> {
        return await this.service.update(+id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: `Eliminar un ${EmpreEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: EmpreEnum.smDelete, type: EmpreDto })
    public async delete(@Param('id') id: number): Promise<ApiResponse<EmpreEntity>> {
        return await this.service.delete(+id);
    }
}
