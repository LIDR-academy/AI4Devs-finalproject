import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClasmEnum } from '../../infrastructure/enum/enum';
import { ClasmService } from '../../infrastructure/service/service';
import { ClasmEntity, ClasmParams } from '../../domain/entity';
import {
  CreateClasmRequestDto,
  UpdateClasmRequestDto,
  ClasmResponseDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('asambleas')
@Controller('asambleas')
export class ClasmController {
  constructor(
    private readonly service: ClasmService,
  ) { }

  @Get()
  @ApiOperation({ summary: `Listar todas las ${ClasmEnum.title}s` })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'clienteId', required: false, type: Number, description: 'Filtrar por ID de cliente' })
  @ApiQuery({ name: 'esDirectivo', required: false, type: Boolean, description: 'Filtrar por si es directivo' })
  @ApiQuery({ name: 'tipoRepresentante', required: false, type: Number, description: 'Filtrar por tipo representante asamblea' })
  @ApiResponseSwagger({ status: 200, description: 'Listado de asambleas', type: [ClasmResponseDto] })
  public async findAll(@Query() params: ParamsDto & { clienteId?: number; esDirectivo?: boolean; tipoRepresentante?: number }): Promise<ApiResponses<ClasmEntity>> {
    try {
      const clasmParams: ClasmParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        clienteId: params.clienteId,
        esDirectivo: params.esDirectivo,
        tipoRepresentante: params.tipoRepresentante,
      };
      const result = await this.service.findAll(clasmParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: `Buscar asamblea por ID de cliente` })
  @ApiResponseSwagger({ status: 200, description: 'Asamblea encontrada', type: ClasmResponseDto })
  public async findByClienId(@Param('clienteId') clienteId: number): Promise<ApiResponse<ClasmEntity>> {
    try {
      const result = await this.service.findByClienId(+clienteId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: `Obtener ${ClasmEnum.title} por ID` })
  @ApiResponseSwagger({ status: 200, description: 'Asamblea encontrada', type: ClasmResponseDto })
  public async findById(@Param('id') id: number): Promise<ApiResponse<ClasmEntity>> {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: `Crear una nueva ${ClasmEnum.title}` })
  @ApiBody({ type: CreateClasmRequestDto, description: `Datos de la ${ClasmEnum.title}` })
  @ApiResponseSwagger({ status: 201, description: 'Asamblea creada exitosamente', type: ClasmResponseDto })
  public async create(@Body() data: CreateClasmRequestDto): Promise<ApiResponse<ClasmEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: `Actualizar una ${ClasmEnum.title}` })
  @ApiBody({ type: UpdateClasmRequestDto, description: `Datos actualizados de la ${ClasmEnum.title}` })
  @ApiResponseSwagger({ status: 200, description: 'Asamblea actualizada exitosamente', type: ClasmResponseDto })
  public async update(@Param('id') id: number, @Body() data: UpdateClasmRequestDto): Promise<ApiResponse<ClasmEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: `Eliminar una ${ClasmEnum.title} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: 'Asamblea eliminada exitosamente', type: ClasmResponseDto })
  public async delete(@Param('id') id: number): Promise<ApiResponse<ClasmEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

