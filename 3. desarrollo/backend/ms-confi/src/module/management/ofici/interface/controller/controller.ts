import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses } from 'src/shared/util';
import { OficiEnum } from '../../infrastructure/enum/enum';
import { OficiService } from '../../infrastructure/service/service';
import { OficiEntity } from '../../domain/entity';
import { OficiDto } from '../../infrastructure/dto';
import { ApiBearerAuth, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags } from '@nestjs/swagger';
import { OficiParamsDto } from '../../infrastructure/dto/params';

@ApiBearerAuth()
@ApiTags(OficiEnum.table)
@Controller(OficiEnum.table)
export class OficiController {

    constructor(private readonly service: OficiService) { }

    @Get('/')
    @ApiOperation({ summary: `Listar los ${OficiEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: OficiEnum.smFindAll, type: OficiDto })
    public async findAll(@Query() params: OficiParamsDto): Promise<ApiResponses<OficiEntity>> {
        return await this.service.findAll(params);
    }

    @Get(':id')
    @ApiOperation({ summary: `Obtener un ${OficiEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: OficiEnum.smFindById, type: OficiDto })
    public async findById(@Param('id') id: number): Promise<ApiResponse<OficiEntity>> {
        return await this.service.findById(+id);
    }

    @Post()
    @ApiOperation({ summary: `Crear un nuevo ${OficiEnum.title}` })
    @ApiResponseSwagger({ status: 201, description: OficiEnum.smCreate, type: OficiDto })
    public async create(@Body() data: OficiDto): Promise<ApiResponse<OficiEntity>> {
        return await this.service.create(data);

    }

    @Put(':id')
    @ApiOperation({ summary: `Actualizar un ${OficiEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: OficiEnum.smUpdate, type: OficiDto })
    public async update(@Param('id') id: number, @Body() data: OficiDto): Promise<ApiResponse<OficiEntity>> {
        return await this.service.update(+id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: `Eliminar un ${OficiEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: OficiEnum.smDelete, type: OficiDto })
    public async delete(@Param('id') id: number): Promise<ApiResponse<OficiEntity>> {
        return await this.service.delete(+id);
    }
}
