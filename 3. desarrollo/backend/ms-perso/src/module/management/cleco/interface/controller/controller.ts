import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClecoEnum } from '../../infrastructure/enum/enum';
import { ClecoService } from '../../infrastructure/service/service';
import { ClecoEntity, ClecoParams } from '../../domain/entity';
import {
  CreateClecoRequestDto,
  UpdateClecoRequestDto,
  ClecoResponseDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('actividades-economicas')
@Controller('actividades-economicas')
export class ClecoController {
  constructor(
    private readonly service: ClecoService,
  ) { }

  @Get()
  @ApiOperation({ summary: `Listar todas las ${ClecoEnum.title}s` })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'clienteId', required: false, type: Number, description: 'Filtrar por ID de cliente' })
  @ApiQuery({ name: 'sector', required: false, type: String, description: 'Filtrar por código de sector BCE' })
  @ApiQuery({ name: 'actividad', required: false, type: String, description: 'Filtrar por código de actividad BCE' })
  @ApiResponseSwagger({ status: 200, description: 'Listado de actividades económicas', type: [ClecoResponseDto] })
  public async findAll(@Query() params: ParamsDto & { clienteId?: number; sector?: string; actividad?: string }): Promise<ApiResponses<ClecoEntity>> {
    try {
      const clecoParams: ClecoParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        clienteId: params.clienteId,
        sector: params.sector,
        actividad: params.actividad,
      };
      const result = await this.service.findAll(clecoParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: `Buscar actividad económica por ID de cliente` })
  @ApiResponseSwagger({ status: 200, description: 'Actividad económica encontrada', type: ClecoResponseDto })
  public async findByClienId(@Param('clienteId') clienteId: number): Promise<ApiResponse<ClecoEntity>> {
    try {
      const result = await this.service.findByClienId(+clienteId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: `Obtener ${ClecoEnum.title} por ID` })
  @ApiResponseSwagger({ status: 200, description: 'Actividad económica encontrada', type: ClecoResponseDto })
  public async findById(@Param('id') id: number): Promise<ApiResponse<ClecoEntity>> {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: `Crear una nueva ${ClecoEnum.title}` })
  @ApiBody({ type: CreateClecoRequestDto, description: `Datos de la ${ClecoEnum.title}` })
  @ApiResponseSwagger({ status: 201, description: 'Actividad económica creada exitosamente', type: ClecoResponseDto })
  public async create(@Body() data: CreateClecoRequestDto): Promise<ApiResponse<ClecoEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: `Actualizar una ${ClecoEnum.title}` })
  @ApiBody({ type: UpdateClecoRequestDto, description: `Datos actualizados de la ${ClecoEnum.title}` })
  @ApiResponseSwagger({ status: 200, description: 'Actividad económica actualizada exitosamente', type: ClecoResponseDto })
  public async update(@Param('id') id: number, @Body() data: UpdateClecoRequestDto): Promise<ApiResponse<ClecoEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: `Eliminar una ${ClecoEnum.title} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: 'Actividad económica eliminada exitosamente', type: ClecoResponseDto })
  public async delete(@Param('id') id: number): Promise<ApiResponse<ClecoEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

