import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { CllabEnum } from '../../infrastructure/enum/enum';
import { CllabService } from '../../infrastructure/service/service';
import { CllabEntity, CllabParams } from '../../domain/entity';
import {
  CreateCllabRequestDto,
  UpdateCllabRequestDto,
  CllabResponseDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('informacion-laboral')
@Controller('informacion-laboral')
export class CllabController {
  constructor(
    private readonly service: CllabService,
  ) { }

  @Get()
  @ApiOperation({ summary: `Listar todas las ${CllabEnum.title}s` })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'clienteId', required: false, type: Number, description: 'Filtrar por ID de cliente' })
  @ApiQuery({ name: 'dependenciaId', required: false, type: Number, description: 'Filtrar por ID de dependencia' })
  @ApiQuery({ name: 'tipoContrato', required: false, type: Number, description: 'Filtrar por tipo de contrato' })
  @ApiResponseSwagger({ status: 200, description: 'Listado de informaciones laborales', type: [CllabResponseDto] })
  public async findAll(@Query() params: ParamsDto & { clienteId?: number; dependenciaId?: number; tipoContrato?: number }): Promise<ApiResponses<CllabEntity>> {
    try {
      const cllabParams: CllabParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        clienteId: params.clienteId,
        dependenciaId: params.dependenciaId,
        tipoContrato: params.tipoContrato,
      };
      const result = await this.service.findAll(cllabParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: `Buscar información laboral por ID de cliente` })
  @ApiResponseSwagger({ status: 200, description: 'Información laboral encontrada', type: CllabResponseDto })
  public async findByClienId(@Param('clienteId') clienteId: number): Promise<ApiResponse<CllabEntity>> {
    try {
      const result = await this.service.findByClienId(+clienteId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: `Obtener ${CllabEnum.title} por ID` })
  @ApiResponseSwagger({ status: 200, description: 'Información laboral encontrada', type: CllabResponseDto })
  public async findById(@Param('id') id: number): Promise<ApiResponse<CllabEntity>> {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: `Crear una nueva ${CllabEnum.title}` })
  @ApiBody({ type: CreateCllabRequestDto, description: `Datos de la ${CllabEnum.title}` })
  @ApiResponseSwagger({ status: 201, description: 'Información laboral creada exitosamente', type: CllabResponseDto })
  public async create(@Body() data: CreateCllabRequestDto): Promise<ApiResponse<CllabEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: `Actualizar una ${CllabEnum.title}` })
  @ApiBody({ type: UpdateCllabRequestDto, description: `Datos actualizados de la ${CllabEnum.title}` })
  @ApiResponseSwagger({ status: 200, description: 'Información laboral actualizada exitosamente', type: CllabResponseDto })
  public async update(@Param('id') id: number, @Body() data: UpdateCllabRequestDto): Promise<ApiResponse<CllabEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: `Eliminar una ${CllabEnum.title} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: 'Información laboral eliminada exitosamente', type: CllabResponseDto })
  public async delete(@Param('id') id: number): Promise<ApiResponse<CllabEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

