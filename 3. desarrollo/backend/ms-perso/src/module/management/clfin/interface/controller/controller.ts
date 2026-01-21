import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClfinEnum } from '../../infrastructure/enum/enum';
import { ClfinService } from '../../infrastructure/service/service';
import { ClfinEntity, ClfinParams } from '../../domain/entity';
import {
  CreateClfinRequestDto,
  UpdateClfinRequestDto,
  ClfinResponseDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('informacion-financiera')
@Controller('informacion-financiera')
export class ClfinController {
  constructor(
    private readonly service: ClfinService,
  ) { }

  @Get()
  @ApiOperation({ summary: `Listar todas las ${ClfinEnum.title}s` })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'clienteId', required: false, type: Number, description: 'Filtrar por ID de cliente' })
  @ApiQuery({ name: 'tipoFinanciero', required: false, type: Number, description: 'Filtrar por tipo financiero (I=Ingreso, G=Gasto, A=Activo, P=Pasivo)' })
  @ApiResponseSwagger({ status: 200, description: 'Listado de informaciones financieras', type: [ClfinResponseDto] })
  public async findAll(@Query() params: ParamsDto & { clienteId?: number; tipoFinanciero?: number }): Promise<ApiResponses<ClfinEntity>> {
    try {
      const clfinParams: ClfinParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        clienteId: params.clienteId,
        tipoFinanciero: params.tipoFinanciero,
      };
      const result = await this.service.findAll(clfinParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: `Buscar informaciones financieras por ID de cliente` })
  @ApiResponseSwagger({ status: 200, description: 'Listado de informaciones financieras del cliente', type: [ClfinResponseDto] })
  public async findByClienId(@Param('clienteId') clienteId: number): Promise<ApiResponses<ClfinEntity>> {
    try {
      const result = await this.service.findByClienId(+clienteId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('cliente/:clienteId/tipo/:tipoFinanciero')
  @ApiOperation({ summary: `Buscar información financiera por cliente y tipo` })
  @ApiResponseSwagger({ status: 200, description: 'Información financiera encontrada', type: ClfinResponseDto })
  public async findByClienIdAndTipo(@Param('clienteId') clienteId: number, @Param('tipoFinanciero') tipoFinanciero: number): Promise<ApiResponse<ClfinEntity>> {
    try {
      const result = await this.service.findByClienIdAndTipo(+clienteId, +tipoFinanciero);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: `Obtener ${ClfinEnum.title} por ID` })
  @ApiResponseSwagger({ status: 200, description: 'Información financiera encontrada', type: ClfinResponseDto })
  public async findById(@Param('id') id: number): Promise<ApiResponse<ClfinEntity>> {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: `Crear una nueva ${ClfinEnum.title}` })
  @ApiBody({ type: CreateClfinRequestDto, description: `Datos de la ${ClfinEnum.title}` })
  @ApiResponseSwagger({ status: 201, description: 'Información financiera creada exitosamente', type: ClfinResponseDto })
  public async create(@Body() data: CreateClfinRequestDto): Promise<ApiResponse<ClfinEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: `Actualizar una ${ClfinEnum.title}` })
  @ApiBody({ type: UpdateClfinRequestDto, description: `Datos actualizados de la ${ClfinEnum.title}` })
  @ApiResponseSwagger({ status: 200, description: 'Información financiera actualizada exitosamente', type: ClfinResponseDto })
  public async update(@Param('id') id: number, @Body() data: UpdateClfinRequestDto): Promise<ApiResponse<ClfinEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: `Eliminar una ${ClfinEnum.title} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: 'Información financiera eliminada exitosamente', type: ClfinResponseDto })
  public async delete(@Param('id') id: number): Promise<ApiResponse<ClfinEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

