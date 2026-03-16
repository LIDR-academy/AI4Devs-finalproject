import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClrepEnum } from '../../infrastructure/enum/enum';
import { ClrepService } from '../../infrastructure/service/service';
import { ClrepEntity, ClrepParams } from '../../domain/entity';
import {
  CreateClrepRequestDto,
  UpdateClrepRequestDto,
  ClrepResponseDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('representantes')
@Controller('representantes')
export class ClrepController {
  constructor(
    private readonly service: ClrepService,
  ) { }

  @Get()
  @ApiOperation({ summary: `Listar todos los ${ClrepEnum.title}s` })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'clienteId', required: false, type: Number, description: 'Filtrar por ID de cliente' })
  @ApiQuery({ name: 'tipoRepresentante', required: false, type: Number, description: 'Filtrar por tipo de representante' })
  @ApiQuery({ name: 'personaId', required: false, type: Number, description: 'Filtrar por ID de persona representante' })
  @ApiResponseSwagger({ status: 200, description: 'Listado de representantes', type: [ClrepResponseDto] })
  public async findAll(@Query() params: ParamsDto & { clienteId?: number; tipoRepresentante?: number; personaId?: number }): Promise<ApiResponses<ClrepEntity>> {
    try {
      const clrepParams: ClrepParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        clienteId: params.clienteId,
        tipoRepresentante: params.tipoRepresentante,
        personaId: params.personaId,
      };
      const result = await this.service.findAll(clrepParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: `Buscar representante por ID de cliente` })
  @ApiResponseSwagger({ status: 200, description: 'Representante encontrado', type: ClrepResponseDto })
  public async findByClienId(@Param('clienteId') clienteId: number): Promise<ApiResponse<ClrepEntity>> {
    try {
      const result = await this.service.findByClienId(+clienteId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: `Obtener ${ClrepEnum.title} por ID` })
  @ApiResponseSwagger({ status: 200, description: 'Representante encontrado', type: ClrepResponseDto })
  public async findById(@Param('id') id: number): Promise<ApiResponse<ClrepEntity>> {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: `Crear un nuevo ${ClrepEnum.title}` })
  @ApiBody({ type: CreateClrepRequestDto, description: `Datos del ${ClrepEnum.title}` })
  @ApiResponseSwagger({ status: 201, description: 'Representante creado exitosamente', type: ClrepResponseDto })
  public async create(@Body() data: CreateClrepRequestDto): Promise<ApiResponse<ClrepEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: `Actualizar un ${ClrepEnum.title}` })
  @ApiBody({ type: UpdateClrepRequestDto, description: `Datos actualizados del ${ClrepEnum.title}` })
  @ApiResponseSwagger({ status: 200, description: 'Representante actualizado exitosamente', type: ClrepResponseDto })
  public async update(@Param('id') id: number, @Body() data: UpdateClrepRequestDto): Promise<ApiResponse<ClrepEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: `Eliminar un ${ClrepEnum.title} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: 'Representante eliminado exitosamente', type: ClrepResponseDto })
  public async delete(@Param('id') id: number): Promise<ApiResponse<ClrepEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

