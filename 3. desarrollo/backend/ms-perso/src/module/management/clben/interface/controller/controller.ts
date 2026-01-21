import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClbenEnum } from '../../infrastructure/enum/enum';
import { ClbenService } from '../../infrastructure/service/service';
import { ClbenEntity, ClbenParams } from '../../domain/entity';
import {
  CreateClbenRequestDto,
  UpdateClbenRequestDto,
  ClbenResponseDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('beneficiarios')
@Controller('beneficiarios')
export class ClbenController {
  constructor(
    private readonly service: ClbenService,
  ) { }

  @Get()
  @ApiOperation({ summary: `Listar todos los ${ClbenEnum.title}s` })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'usuarioBancaDigitalId', required: false, type: Number, description: 'Filtrar por ID de usuario de banca digital' })
  @ApiQuery({ name: 'activo', required: false, type: Boolean, description: 'Filtrar por estado activo' })
  @ApiQuery({ name: 'externo', required: false, type: Boolean, description: 'Filtrar por si es externo' })
  @ApiResponseSwagger({ status: 200, description: 'Listado de beneficiarios', type: [ClbenResponseDto] })
  public async findAll(@Query() params: ParamsDto & { usuarioBancaDigitalId?: number; activo?: boolean; externo?: boolean }): Promise<ApiResponses<ClbenEntity>> {
    try {
      const clbenParams: ClbenParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        usuarioBancaDigitalId: params.usuarioBancaDigitalId,
        activo: params.activo,
        externo: params.externo,
      };
      const result = await this.service.findAll(clbenParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('usuario-banca-digital/:clbncId')
  @ApiOperation({ summary: `Buscar beneficiarios por ID de usuario de banca digital` })
  @ApiResponseSwagger({ status: 200, description: 'Listado de beneficiarios del usuario de banca digital', type: [ClbenResponseDto] })
  public async findByClbncId(@Param('clbncId') clbncId: number): Promise<ApiResponses<ClbenEntity>> {
    try {
      const result = await this.service.findByClbncId(+clbncId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: `Obtener ${ClbenEnum.title} por ID` })
  @ApiResponseSwagger({ status: 200, description: 'Beneficiario encontrado', type: ClbenResponseDto })
  public async findById(@Param('id') id: number): Promise<ApiResponse<ClbenEntity>> {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: `Crear un nuevo ${ClbenEnum.title}` })
  @ApiBody({ type: CreateClbenRequestDto, description: `Datos del ${ClbenEnum.title}` })
  @ApiResponseSwagger({ status: 201, description: 'Beneficiario creado exitosamente', type: ClbenResponseDto })
  public async create(@Body() data: CreateClbenRequestDto): Promise<ApiResponse<ClbenEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: `Actualizar un ${ClbenEnum.title}` })
  @ApiBody({ type: UpdateClbenRequestDto, description: `Datos actualizados del ${ClbenEnum.title}` })
  @ApiResponseSwagger({ status: 200, description: 'Beneficiario actualizado exitosamente', type: ClbenResponseDto })
  public async update(@Param('id') id: number, @Body() data: UpdateClbenRequestDto): Promise<ApiResponse<ClbenEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: `Eliminar un ${ClbenEnum.title} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: 'Beneficiario eliminado exitosamente', type: ClbenResponseDto })
  public async delete(@Param('id') id: number): Promise<ApiResponse<ClbenEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

