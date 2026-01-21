import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ColorEnum } from '../../infrastructure/enum/enum';
import { ColorService } from '../../infrastructure/service/service';
import { ColorEntity } from '../../domain/entity';
import { ColorDto } from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags(ColorEnum.table)
@Controller(ColorEnum.table)
export class ColorController {

    constructor(private readonly service: ColorService) { }

    @Get('/')
    @ApiOperation({ summary: `Listar los ${ColorEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: ColorEnum.smFindAll, type: ParamsDto, isArray: true })
    public async findAll(@Query() params: ParamsDto): Promise<ApiResponses<ColorEntity>> {
        try {
            return await this.service.findAll(params);
        } catch (error) {
            throw error;
        }
    }

    @Get(':id')
    @ApiOperation({ summary: `Obtener un ${ColorEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: ColorEnum.smFindById, type: ColorDto })
    public async findById(@Param('id') id: number) {
        try {
            return await this.service.findById(+id);
        } catch (error) {
            throw error;
        }
    }

    @Post()
    @ApiOperation({ summary: `Crear un nuevo ${ColorEnum.title}` })
    @ApiBody({ type: ColorDto, description: ColorEnum.title })
    @ApiResponseSwagger({ status: 201, description: ColorEnum.smCreate, type: ColorDto })
    public async create(@Body() data: ColorDto): Promise<ApiResponse<ColorEntity>> {
        try {
            return await this.service.create(data);
        } catch (error) {
            throw error;
        }
    }

    @Put(':id')
    @ApiOperation({ summary: `Actualizar un ${ColorEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: ColorEnum.smUpdate, type: ColorDto })
    public async update(@Param('id') id: number, @Body() data: ColorDto): Promise<ApiResponse<ColorEntity>> {
        try {
            return await this.service.update(+id, data);
        } catch (error) {
            throw error;
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: `Eliminar un ${ColorEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: ColorEnum.smDelete, type: ColorDto })
    public async delete(@Param('id') id: number): Promise<ApiResponse<ColorEntity>> {
        try {
            return await this.service.delete(+id);
        } catch (error) {
            throw error;
        }
    }
}
