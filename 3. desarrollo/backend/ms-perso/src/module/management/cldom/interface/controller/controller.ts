import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { CldomEnum } from '../../infrastructure/enum/enum';
import { CldomService } from '../../infrastructure/service/service';
import { CldomEntity, CldomParams } from '../../domain/entity';
import {
  CreateCldomRequestDto,
  UpdateCldomRequestDto,
  CldomResponseDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('domicilios')
@Controller('domicilios')
export class CldomController {
  constructor(
    private readonly service: CldomService,
  ) { }

  @Get()
  @ApiOperation({ summary: `Listar todos los ${CldomEnum.title}s` })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'clienteId', required: false, type: Number, description: 'Filtrar por ID de cliente' })
  @ApiQuery({ name: 'provincia', required: false, type: String, description: 'Filtrar por código de provincia' })
  @ApiQuery({ name: 'canton', required: false, type: String, description: 'Filtrar por código de cantón' })
  @ApiQuery({ name: 'parroquia', required: false, type: String, description: 'Filtrar por código de parroquia' })
  @ApiResponseSwagger({ status: 200, description: 'Listado de domicilios', type: [CldomResponseDto] })
  public async findAll(@Query() params: ParamsDto & { clienteId?: number; provincia?: string; canton?: string; parroquia?: string }): Promise<ApiResponses<CldomEntity>> {
    try {
      const cldomParams: CldomParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        clienteId: params.clienteId,
        provincia: params.provincia,
        canton: params.canton,
        parroquia: params.parroquia,
      };
      const result = await this.service.findAll(cldomParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: `Buscar domicilio por ID de cliente` })
  @ApiResponseSwagger({ status: 200, description: 'Domicilio encontrado', type: CldomResponseDto })
  public async findByClienId(@Param('clienteId') clienteId: number): Promise<ApiResponse<CldomEntity>> {
    try {
      const result = await this.service.findByClienId(+clienteId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: `Obtener ${CldomEnum.title} por ID` })
  @ApiResponseSwagger({ status: 200, description: 'Domicilio encontrado', type: CldomResponseDto })
  public async findById(@Param('id') id: number): Promise<ApiResponse<CldomEntity>> {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: `Crear un nuevo ${CldomEnum.title}` })
  @ApiBody({ type: CreateCldomRequestDto, description: `Datos del ${CldomEnum.title}` })
  @ApiResponseSwagger({ status: 201, description: 'Domicilio creado exitosamente', type: CldomResponseDto })
  public async create(@Body() data: CreateCldomRequestDto): Promise<ApiResponse<CldomEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: `Actualizar un ${CldomEnum.title}` })
  @ApiBody({ type: UpdateCldomRequestDto, description: `Datos actualizados del ${CldomEnum.title}` })
  @ApiResponseSwagger({ status: 200, description: 'Domicilio actualizado exitosamente', type: CldomResponseDto })
  public async update(@Param('id') id: number, @Body() data: UpdateCldomRequestDto): Promise<ApiResponse<CldomEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: `Eliminar un ${CldomEnum.title} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: 'Domicilio eliminado exitosamente', type: CldomResponseDto })
  public async delete(@Param('id') id: number): Promise<ApiResponse<CldomEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

