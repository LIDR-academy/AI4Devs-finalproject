import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClcygEnum } from '../../infrastructure/enum/enum';
import { ClcygService } from '../../infrastructure/service/service';
import { ClcygEntity, ClcygParams } from '../../domain/entity';
import {
  CreateClcygRequestDto,
  UpdateClcygRequestDto,
  ClcygResponseDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('conyuges')
@Controller('conyuges')
export class ClcygController {
  constructor(
    private readonly service: ClcygService,
  ) { }

  @Get()
  @ApiOperation({ summary: `Listar todos los ${ClcygEnum.title}s` })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'clienteId', required: false, type: Number, description: 'Filtrar por ID de cliente' })
  @ApiQuery({ name: 'personaId', required: false, type: Number, description: 'Filtrar por ID de persona cónyuge' })
  @ApiResponseSwagger({ status: 200, description: 'Listado de cónyuges', type: [ClcygResponseDto] })
  public async findAll(@Query() params: ParamsDto & { clienteId?: number; personaId?: number }): Promise<ApiResponses<ClcygEntity>> {
    try {
      const clcygParams: ClcygParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        clienteId: params.clienteId,
        personaId: params.personaId,
      };
      const result = await this.service.findAll(clcygParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: `Buscar cónyuge por ID de cliente` })
  @ApiResponseSwagger({ status: 200, description: 'Cónyuge encontrado', type: ClcygResponseDto })
  public async findByClienId(@Param('clienteId') clienteId: number): Promise<ApiResponse<ClcygEntity>> {
    try {
      const result = await this.service.findByClienId(+clienteId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: `Obtener ${ClcygEnum.title} por ID` })
  @ApiResponseSwagger({ status: 200, description: 'Cónyuge encontrado', type: ClcygResponseDto })
  public async findById(@Param('id') id: number): Promise<ApiResponse<ClcygEntity>> {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: `Crear un nuevo ${ClcygEnum.title}` })
  @ApiBody({ type: CreateClcygRequestDto, description: `Datos del ${ClcygEnum.title}` })
  @ApiResponseSwagger({ status: 201, description: 'Cónyuge creado exitosamente', type: ClcygResponseDto })
  public async create(@Body() data: CreateClcygRequestDto): Promise<ApiResponse<ClcygEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: `Actualizar un ${ClcygEnum.title}` })
  @ApiBody({ type: UpdateClcygRequestDto, description: `Datos actualizados del ${ClcygEnum.title}` })
  @ApiResponseSwagger({ status: 200, description: 'Cónyuge actualizado exitosamente', type: ClcygResponseDto })
  public async update(@Param('id') id: number, @Body() data: UpdateClcygRequestDto): Promise<ApiResponse<ClcygEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: `Eliminar un ${ClcygEnum.title} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: 'Cónyuge eliminado exitosamente', type: ClcygResponseDto })
  public async delete(@Param('id') id: number): Promise<ApiResponse<ClcygEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

