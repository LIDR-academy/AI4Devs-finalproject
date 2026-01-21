import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClrefEnum } from '../../infrastructure/enum/enum';
import { ClrefService } from '../../infrastructure/service/service';
import { ClrefEntity, ClrefParams } from '../../domain/entity';
import {
  CreateClrefRequestDto,
  UpdateClrefRequestDto,
  ClrefResponseDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('referencias')
@Controller('referencias')
export class ClrefController {
  constructor(
    private readonly service: ClrefService,
  ) { }

  @Get()
  @ApiOperation({ summary: `Listar todas las ${ClrefEnum.title}s` })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'clienteId', required: false, type: Number, description: 'Filtrar por ID de cliente' })
  @ApiQuery({ name: 'tipoReferencia', required: false, type: Number, description: 'Filtrar por tipo de referencia (1=Personal, 2=Comercial, 3=Financiera)' })
  @ApiQuery({ name: 'personaId', required: false, type: Number, description: 'Filtrar por ID de persona' })
  @ApiResponseSwagger({ status: 200, description: 'Listado de referencias', type: [ClrefResponseDto] })
  public async findAll(@Query() params: ParamsDto & { clienteId?: number; tipoReferencia?: number; personaId?: number }): Promise<ApiResponses<ClrefEntity>> {
    try {
      const clrefParams: ClrefParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        clienteId: params.clienteId,
        tipoReferencia: params.tipoReferencia,
        personaId: params.personaId,
      };
      const result = await this.service.findAll(clrefParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: `Buscar referencias por ID de cliente` })
  @ApiResponseSwagger({ status: 200, description: 'Listado de referencias del cliente', type: [ClrefResponseDto] })
  public async findByClienId(@Param('clienteId') clienteId: number): Promise<ApiResponses<ClrefEntity>> {
    try {
      const result = await this.service.findByClienId(+clienteId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: `Obtener ${ClrefEnum.title} por ID` })
  @ApiResponseSwagger({ status: 200, description: 'Referencia encontrada', type: ClrefResponseDto })
  public async findById(@Param('id') id: number): Promise<ApiResponse<ClrefEntity>> {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: `Crear una nueva ${ClrefEnum.title}` })
  @ApiBody({ type: CreateClrefRequestDto, description: `Datos de la ${ClrefEnum.title}` })
  @ApiResponseSwagger({ status: 201, description: 'Referencia creada exitosamente', type: ClrefResponseDto })
  public async create(@Body() data: CreateClrefRequestDto): Promise<ApiResponse<ClrefEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: `Actualizar una ${ClrefEnum.title}` })
  @ApiBody({ type: UpdateClrefRequestDto, description: `Datos actualizados de la ${ClrefEnum.title}` })
  @ApiResponseSwagger({ status: 200, description: 'Referencia actualizada exitosamente', type: ClrefResponseDto })
  public async update(@Param('id') id: number, @Body() data: UpdateClrefRequestDto): Promise<ApiResponse<ClrefEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: `Eliminar una ${ClrefEnum.title} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: 'Referencia eliminada exitosamente', type: ClrefResponseDto })
  public async delete(@Param('id') id: number): Promise<ApiResponse<ClrefEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

