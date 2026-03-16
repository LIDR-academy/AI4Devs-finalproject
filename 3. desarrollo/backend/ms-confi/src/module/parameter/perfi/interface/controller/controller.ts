import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { PerfiEnum } from '../../infrastructure/enum/enum';
import { PerfiService } from '../../infrastructure/service/service';
import { PerfiEntity } from '../../domain/entity';
import { PerfiDto } from '../../infrastructure/dto';
import { ApiBearerAuth, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags(PerfiEnum.table)
@Controller(PerfiEnum.table)
export class PerfiController {

    constructor(private readonly service: PerfiService) { }

    @Get('/')
    @ApiOperation({ summary: `Listar los ${PerfiEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: PerfiEnum.smFindAll, type: ParamsDto, isArray: true })
    public async findAll(@Query() params: ParamsDto): Promise<ApiResponses<PerfiEntity>> {
        try {
            return await this.service.findAll(params);
        } catch (error) {
            throw error;
        }
    }

    @Get(':id')
    @ApiOperation({ summary: `Obtener un ${PerfiEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: PerfiEnum.smFindById, type: PerfiDto })
    public async findById(@Param('id') id: number) {
        try {
            return await this.service.findById(+id);
        } catch (error) {
            throw error;
        }
    }

    @Post()
    @ApiOperation({ summary: `Crear un nuevo ${PerfiEnum.title}` })
    @ApiResponseSwagger({ status: 201, description: PerfiEnum.smCreate, type: PerfiDto })
    public async create(@Body() data: PerfiDto): Promise<ApiResponse<PerfiEntity>> {
        try {
            return await this.service.create(data);
        } catch (error) {
            throw error;
        }
    }

    @Put(':id')
    @ApiOperation({ summary: `Actualizar un ${PerfiEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: PerfiEnum.smUpdate, type: PerfiDto })
    public async update(@Param('id') id: number, @Body() data: PerfiDto): Promise<ApiResponse<PerfiEntity>> {
        try {
            return await this.service.update(+id, data);
        } catch (error) {
            throw error;
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: `Eliminar un ${PerfiEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: PerfiEnum.smDelete, type: PerfiDto })
    public async delete(@Param('id') id: number): Promise<ApiResponse<PerfiEntity>> {
        try {
            return await this.service.delete(+id);
        } catch (error) {
            throw error;
        }
    }
}
