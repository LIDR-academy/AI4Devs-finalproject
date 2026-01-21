import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ToficEnum } from '../../infrastructure/enum/enum';
import { ToficService } from '../../infrastructure/service/service';
import { ToficEntity } from '../../domain/entity';
import { ToficDto } from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags(ToficEnum.table)
@Controller(ToficEnum.table)
export class ToficController {

    constructor(private readonly service: ToficService) { }

    @Get('/')
    @ApiOperation({ summary: `Listar los ${ToficEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: ToficEnum.smFindAll, type: ParamsDto, isArray: true })
    public async findAll(@Query() params: ParamsDto): Promise<ApiResponses<ToficEntity>> {
        return await this.service.findAll(params);
    }

    @Get(':id')
    @ApiOperation({ summary: `Obtener un ${ToficEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: ToficEnum.smFindById, type: ToficDto })
    public async findById(@Param('id') id: number) {
        return await this.service.findById(+id);
    }

    @Post()
    @ApiOperation({ summary: `Crear un nuevo ${ToficEnum.title}` })
    @ApiBody({ type: ToficDto, description: ToficEnum.title })
    @ApiResponseSwagger({ status: 200, description: ToficEnum.smCreate, type: ToficDto })
    public async create(@Body() data: ToficDto): Promise<ApiResponse<ToficEntity>> {
        return await this.service.create(data);
    }

    @Put(':id')
    @ApiOperation({ summary: `Actualizar un ${ToficEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: ToficEnum.smUpdate, type: ToficDto })
    public async update(@Param('id') id: number, @Body() data: ToficDto): Promise<ApiResponse<ToficEntity>> {
        return await this.service.update(+id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: `Eliminar un ${ToficEnum.title}` })
    @ApiResponseSwagger({ status: 200, description: ToficEnum.smDelete, type: ToficDto })
    public async delete(@Param('id') id: number): Promise<ApiResponse<ToficEntity>> {
        return await this.service.delete(+id);
    }
}
