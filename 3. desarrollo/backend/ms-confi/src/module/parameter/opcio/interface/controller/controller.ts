import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { OpcioEnum } from '../../infrastructure/enum/enum';
import { OpcioService } from '../../infrastructure/service/service';
import { OpcioEntity } from '../../domain/entity';
import { OpcioDto } from '../../infrastructure/dto';
import { ApiBearerAuth, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags(OpcioEnum.table)
@Controller(OpcioEnum.table)
export class OpcioController {

    constructor(private readonly service: OpcioService) { }

    @Get('/')
    @ApiOperation({ summary: `Listar los ${OpcioEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: OpcioEnum.smFindAll, type: ParamsDto, isArray: true })
    public async findAll(@Query() params: ParamsDto): Promise<ApiResponses<OpcioEntity>> {
        return await this.service.findAll(params);
    }

    @Get(':id')
    @ApiOperation({ summary: `Obtener un ${OpcioEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: OpcioEnum.smFindById, type: OpcioDto })
    public async findById(@Param('id') id: string): Promise<ApiResponse<OpcioEntity>> {
        return await this.service.findById(id);
    }

    @Post()
    @ApiOperation({ summary: `Crear un nuevo ${OpcioEnum.title}` })
    @ApiResponseSwagger({ status: 201, description: OpcioEnum.smCreate, type: OpcioDto })
    public async create(@Body() data: OpcioDto): Promise<ApiResponse<OpcioEntity>> {
        return await this.service.create(data);
    }

    @Put(':id')
    @ApiOperation({ summary: `Actualizar un ${OpcioEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: OpcioEnum.smUpdate, type: OpcioDto })
    public async update(@Param('id') id: string, @Body() data: OpcioDto): Promise<ApiResponse<OpcioEntity>> {
        return await this.service.update(id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: `Eliminar un ${OpcioEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: OpcioEnum.smDelete, type: OpcioDto })
    public async delete(@Param('id') id: string): Promise<ApiResponse<OpcioEntity>> {
        return await this.service.delete(id);
    }
}

