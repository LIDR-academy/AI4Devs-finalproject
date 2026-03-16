import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses } from 'src/shared/util';
import { GeoEnum } from '../../infrastructure/enum/enum';
import { GeoService } from '../../infrastructure/service/service';
import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from '../../domain/entity';
import {
  CreateProvinciaRequestDto,
  UpdateProvinciaRequestDto,
  CreateCantonRequestDto,
  UpdateCantonRequestDto,
  CreateParroquiaRequestDto,
  UpdateParroquiaRequestDto,
  ProvinciaResponseDto,
  CantonResponseDto,
  ParroquiaResponseDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('geo')
@Controller('geo')
export class GeoController {

  constructor(private readonly service: GeoService) { }

  // ========== PROVINCIAS ==========

  @Get('provincias')
  @ApiOperation({ summary: `Listar todas las ${GeoEnum.title.provi}` })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filtrar solo activas' })
  @ApiResponseSwagger({ status: 200, description: GeoEnum.smFindAllProvincias, type: [ProvinciaResponseDto] })
  public async findAllProvincias(@Query('active') active?: string): Promise<ApiResponses<ProvinciaEntity>> {
    const activeFilter = active === 'true' ? true : undefined;
    return await this.service.findAllProvincias(activeFilter);
  }

  @Post('provincias')
  @ApiOperation({ summary: `Crear una nueva ${GeoEnum.title.provi}` })
  @ApiBody({ type: CreateProvinciaRequestDto, description: `Datos de la ${GeoEnum.title.provi}` })
  @ApiResponseSwagger({ status: 201, description: GeoEnum.smCreateProvincia, type: ProvinciaResponseDto })
  public async createProvincia(@Body() data: CreateProvinciaRequestDto): Promise<ApiResponse<ProvinciaEntity>> {
    return await this.service.createProvincia(data);
  }

  @Put('provincias/:id')
  @ApiOperation({ summary: `Actualizar una ${GeoEnum.title.provi}` })
  @ApiBody({ type: UpdateProvinciaRequestDto, description: `Datos actualizados de la ${GeoEnum.title.provi}` })
  @ApiResponseSwagger({ status: 200, description: GeoEnum.smUpdateProvincia, type: ProvinciaResponseDto })
  public async updateProvincia(@Param('id') id: number, @Body() data: UpdateProvinciaRequestDto): Promise<ApiResponse<ProvinciaEntity>> {
    return await this.service.updateProvincia(+id, data);
  }

  @Delete('provincias/:id')
  @ApiOperation({ summary: `Eliminar una ${GeoEnum.title.provi} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: GeoEnum.smDeleteProvincia, type: ProvinciaResponseDto })
  public async deleteProvincia(@Param('id') id: number): Promise<ApiResponse<ProvinciaEntity>> {
    return await this.service.deleteProvincia(+id);
  }

  // ========== CANTONES ==========

  @Get('provincias/:provi_cod_prov/cantones')
  @ApiOperation({ summary: `Listar los ${GeoEnum.title.canto} de una provincia` })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filtrar solo activos' })
  @ApiResponseSwagger({ status: 200, description: GeoEnum.smFindCantonesByProvincia, type: [CantonResponseDto] })
  public async findCantonesByProvincia(
    @Param('provi_cod_prov') proviCodProv: string,
    @Query('active') active?: string
  ): Promise<ApiResponses<CantonEntity>> {
    const activeFilter = active === 'true' ? true : undefined;
    return await this.service.findCantonesByProvincia(proviCodProv, activeFilter);
  }

  @Post('cantones')
  @ApiOperation({ summary: `Crear un nuevo ${GeoEnum.title.canto}` })
  @ApiBody({ type: CreateCantonRequestDto, description: `Datos del ${GeoEnum.title.canto}` })
  @ApiResponseSwagger({ status: 201, description: GeoEnum.smCreateCanton, type: CantonResponseDto })
  public async createCanton(@Body() data: CreateCantonRequestDto): Promise<ApiResponse<CantonEntity>> {
    return await this.service.createCanton(data);
  }

  @Put('cantones/:id')
  @ApiOperation({ summary: `Actualizar un ${GeoEnum.title.canto}` })
  @ApiBody({ type: UpdateCantonRequestDto, description: `Datos actualizados del ${GeoEnum.title.canto}` })
  @ApiResponseSwagger({ status: 200, description: GeoEnum.smUpdateCanton, type: CantonResponseDto })
  public async updateCanton(@Param('id') id: number, @Body() data: UpdateCantonRequestDto): Promise<ApiResponse<CantonEntity>> {
    return await this.service.updateCanton(+id, data);
  }

  @Delete('cantones/:id')
  @ApiOperation({ summary: `Eliminar un ${GeoEnum.title.canto} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: GeoEnum.smDeleteCanton, type: CantonResponseDto })
  public async deleteCanton(@Param('id') id: number): Promise<ApiResponse<CantonEntity>> {
    return await this.service.deleteCanton(+id);
  }

  // ========== PARROQUIAS ==========

  @Get('provincias/:provi_cod_prov/cantones/:canto_cod_cant/parroquias')
  @ApiOperation({ summary: `Listar las ${GeoEnum.title.parro} de un cantón` })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filtrar solo activas' })
  @ApiResponseSwagger({ status: 200, description: GeoEnum.smFindParroquiasByCanton, type: [ParroquiaResponseDto] })
  public async findParroquiasByCanton(
    @Param('provi_cod_prov') proviCodProv: string,
    @Param('canto_cod_cant') cantoCodCant: string,
    @Query('active') active?: string
  ): Promise<ApiResponses<ParroquiaEntity>> {
    const activeFilter = active === 'true' ? true : undefined;
    return await this.service.findParroquiasByCanton(proviCodProv, cantoCodCant, activeFilter);
  }

  @Get('parroquias/search')
  @ApiOperation({ summary: `Buscar ${GeoEnum.title.parro} por nombre` })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Término de búsqueda' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de resultados (máximo 50, por defecto 20)' })
  @ApiResponseSwagger({ status: 200, description: GeoEnum.smSearchParroquias, type: [ParroquiaResponseDto] })
  public async searchParroquias(
    @Query('q') query: string,
    @Query('limit') limit?: string
  ): Promise<ApiResponses<ParroquiaEntity>> {
    const limitValue = limit ? parseInt(limit, 10) : 20;
    return await this.service.searchParroquias(query, limitValue);
  }

  @Post('parroquias')
  @ApiOperation({ summary: `Crear una nueva ${GeoEnum.title.parro}` })
  @ApiBody({ type: CreateParroquiaRequestDto, description: `Datos de la ${GeoEnum.title.parro}` })
  @ApiResponseSwagger({ status: 201, description: GeoEnum.smCreateParroquia, type: ParroquiaResponseDto })
  public async createParroquia(@Body() data: CreateParroquiaRequestDto): Promise<ApiResponse<ParroquiaEntity>> {
    return await this.service.createParroquia(data);
  }

  @Put('parroquias/:id')
  @ApiOperation({ summary: `Actualizar una ${GeoEnum.title.parro}` })
  @ApiBody({ type: UpdateParroquiaRequestDto, description: `Datos actualizados de la ${GeoEnum.title.parro}` })
  @ApiResponseSwagger({ status: 200, description: GeoEnum.smUpdateParroquia, type: ParroquiaResponseDto })
  public async updateParroquia(@Param('id') id: number, @Body() data: UpdateParroquiaRequestDto): Promise<ApiResponse<ParroquiaEntity>> {
    return await this.service.updateParroquia(+id, data);
  }

  @Delete('parroquias/:id')
  @ApiOperation({ summary: `Eliminar una ${GeoEnum.title.parro} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: GeoEnum.smDeleteParroquia, type: ParroquiaResponseDto })
  public async deleteParroquia(@Param('id') id: number): Promise<ApiResponse<ParroquiaEntity>> {
    return await this.service.deleteParroquia(+id);
  }
}

