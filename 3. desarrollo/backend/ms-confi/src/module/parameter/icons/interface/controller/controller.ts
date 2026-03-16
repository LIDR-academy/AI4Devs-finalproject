import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { IconsEnum } from '../../infrastructure/enum/enum';
import { IconsService } from '../../infrastructure/service/service';
import { IconsEntity } from '../../domain/entity';
import { IconsDto } from '../../infrastructure/dto';
import { ApiBearerAuth, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags(IconsEnum.table)
@Controller(IconsEnum.table)
export class IconsController {

    constructor(private readonly service: IconsService) { }

    @Get('/')
    @ApiOperation({ summary: `Listar los ${IconsEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: IconsEnum.smFindAll, type: ParamsDto, isArray: true })
    public async findAll(@Query() params: ParamsDto): Promise<ApiResponses<IconsEntity>> {
        try {
            return await this.service.findAll(params);
        } catch (error) {
            throw error;
        }
    }

    @Get('color/:id')
    @ApiOperation({ summary: `Listar los ${IconsEnum.title} por color` })
    @ApiResponseSwagger({ status: 200, description: IconsEnum.smFindAllByColor, type: ParamsDto, isArray: true })
    public async findAllByColor(@Query() params: ParamsDto, @Param('id') id: number): Promise<ApiResponses<IconsEntity>> {
        try {
            return await this.service.findAllByColor(params, id);
        } catch (error) {
            throw error;
        }
    }

    @Get(':id')
    @ApiOperation({ summary: `Obtener un ${IconsEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: IconsEnum.smFindById, type: IconsDto })
    public async findById(@Param('id') id: number) {
        try {
            return await this.service.findById(+id);
        } catch (error) {
            throw error;
        }
    }

    @Post()
    @ApiOperation({ summary: `Crear un nuevo ${IconsEnum.title}` })
    @ApiResponseSwagger({ status: 201, description: IconsEnum.smCreate, type: IconsDto })
    public async create(@Body() data: IconsDto): Promise<ApiResponse<IconsEntity>> {
        try {
            return await this.service.create(data);
        } catch (error) {
            throw error;
        }
    }

    @Put(':id')
    @ApiOperation({ summary: `Actualizar un ${IconsEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: IconsEnum.smUpdate, type: IconsDto })
    public async update(@Param('id') id: number, @Body() data: IconsDto): Promise<ApiResponse<IconsEntity>> {
        try {
            return await this.service.update(+id, data);
        } catch (error) {
            throw error;
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: `Eliminar un ${IconsEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: IconsEnum.smDelete, type: IconsDto })
    public async delete(@Param('id') id: number): Promise<ApiResponse<IconsEntity>> {
        try {
            return await this.service.delete(+id);
        } catch (error) {
            throw error;
        }
    }
}
