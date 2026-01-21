import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClrfiEnum } from '../../infrastructure/enum/enum';
import { ClrfiService } from '../../infrastructure/service/service';
import { ClrfiEntity, ClrfiParams } from '../../domain/entity';
import {
  CreateClrfiRequestDto,
  UpdateClrfiRequestDto,
  ClrfiResponseDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('residencias-fiscales')
@Controller('residencias-fiscales')
export class ClrfiController {
  constructor(
    private readonly service: ClrfiService,
  ) { }

  @Get()
  @ApiOperation({ summary: `Listar todas las ${ClrfiEnum.title}s` })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'clienteId', required: false, type: Number, description: 'Filtrar por ID de cliente' })
  @ApiQuery({ name: 'tieneResidenciaFiscal', required: false, type: Boolean, description: 'Filtrar por si tiene residencia fiscal extranjera' })
  @ApiQuery({ name: 'paisId', required: false, type: Number, description: 'Filtrar por país de residencia fiscal' })
  @ApiResponseSwagger({ status: 200, description: 'Listado de residencias fiscales', type: [ClrfiResponseDto] })
  public async findAll(@Query() params: ParamsDto & { clienteId?: number; tieneResidenciaFiscal?: boolean; paisId?: number }): Promise<ApiResponses<ClrfiEntity>> {
    try {
      const clrfiParams: ClrfiParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        clienteId: params.clienteId,
        tieneResidenciaFiscal: params.tieneResidenciaFiscal,
        paisId: params.paisId,
      };
      const result = await this.service.findAll(clrfiParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: `Buscar residencia fiscal por ID de cliente` })
  @ApiResponseSwagger({ status: 200, description: 'Residencia fiscal encontrada', type: ClrfiResponseDto })
  public async findByClienId(@Param('clienteId') clienteId: number): Promise<ApiResponse<ClrfiEntity>> {
    try {
      const result = await this.service.findByClienId(+clienteId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: `Obtener ${ClrfiEnum.title} por ID` })
  @ApiResponseSwagger({ status: 200, description: 'Residencia fiscal encontrada', type: ClrfiResponseDto })
  public async findById(@Param('id') id: number): Promise<ApiResponse<ClrfiEntity>> {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: `Crear una nueva ${ClrfiEnum.title}` })
  @ApiBody({ type: CreateClrfiRequestDto, description: `Datos de la ${ClrfiEnum.title}` })
  @ApiResponseSwagger({ status: 201, description: 'Residencia fiscal creada exitosamente', type: ClrfiResponseDto })
  public async create(@Body() data: CreateClrfiRequestDto): Promise<ApiResponse<ClrfiEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: `Actualizar una ${ClrfiEnum.title}` })
  @ApiBody({ type: UpdateClrfiRequestDto, description: `Datos actualizados de la ${ClrfiEnum.title}` })
  @ApiResponseSwagger({ status: 200, description: 'Residencia fiscal actualizada exitosamente', type: ClrfiResponseDto })
  public async update(@Param('id') id: number, @Body() data: UpdateClrfiRequestDto): Promise<ApiResponse<ClrfiEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: `Eliminar una ${ClrfiEnum.title} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: 'Residencia fiscal eliminada exitosamente', type: ClrfiResponseDto })
  public async delete(@Param('id') id: number): Promise<ApiResponse<ClrfiEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

