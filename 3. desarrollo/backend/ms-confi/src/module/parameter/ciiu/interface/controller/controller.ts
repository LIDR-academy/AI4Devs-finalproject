import { Controller, Get, Post, Body, Param, Delete, Put, Query, ParseIntPipe } from '@nestjs/common';
import { ApiResponse, ApiResponses } from 'src/shared/util';
import { CiiuEnum } from '../../infrastructure/enum/enum';
import { CiiuService } from '../../infrastructure/service/service';
import {
  SeccionEntity, ActividadEntity,
  ActividadCompletaEntity, ArbolCiiuEntity
} from '../../domain/entity';
import {
  CreateSeccionRequestDto,
  UpdateSeccionRequestDto,
  CreateActividadRequestDto,
  UpdateActividadRequestDto,
  SearchActividadDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('ciiu')
@Controller('ciiu')
export class CiiuController {
  constructor(private readonly ciiuService: CiiuService) {}

  // ==================== BÚSQUEDA / SELECTOR ====================
  
  @Get('actividades/search')
  @ApiOperation({ summary: 'Buscar actividades económicas (autocomplete)' })
  @ApiQuery({ name: 'query', required: true, type: String, description: 'Texto de búsqueda (mínimo 3 caracteres)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de resultados (máximo 50, por defecto 20)' })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smSearchActividades })
  async searchActividades(@Query() dto: SearchActividadDto) {
    return this.ciiuService.searchActividades(dto.query, dto.limit);
  }

  @Get('actividades/:id/completa')
  @ApiOperation({ summary: 'Obtener actividad con jerarquía completa' })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smFindActividadCompleta })
  async findActividadCompleta(@Param('id', ParseIntPipe) id: number) {
    return this.ciiuService.findActividadCompleta(id);
  }

  @Get('actividades/codigo/:codigo')
  @ApiOperation({ summary: 'Obtener actividad por código CIIU' })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smFindActividadCompletaByAbr })
  async findActividadByAbr(@Param('codigo') codigo: string) {
    return this.ciiuService.findActividadCompletaByAbr(codigo);
  }

  // ==================== ÁRBOL ====================
  
  @Get('arbol')
  @ApiOperation({ summary: 'Obtener estructura de árbol completa' })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smFindArbolCompleto })
  async findArbol() {
    return this.ciiuService.findArbolCompleto();
  }

  @Get('arbol/:nivel/:parentId/hijos')
  @ApiOperation({ summary: 'Obtener hijos de un nodo específico' })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smFindHijosByNivel })
  async findHijos(
    @Param('nivel', ParseIntPipe) nivel: number,
    @Param('parentId', ParseIntPipe) parentId: number,
  ) {
    return this.ciiuService.findHijosByNivel(nivel, parentId);
  }

  // ==================== CRUD SECCIONES (Nivel 1) ====================
  @Get('secciones')
  @ApiOperation({ summary: `Listar todas las ${CiiuEnum.title.cisec}` })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smFindAllSecciones })
  async findAllSecciones() {
    return this.ciiuService.findAllSecciones();
  }

  @Get('secciones/:id')
  @ApiOperation({ summary: `Obtener una ${CiiuEnum.title.cisec} por ID` })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smFindSeccionById })
  async findSeccionById(@Param('id', ParseIntPipe) id: number) {
    return this.ciiuService.findSeccionById(id);
  }

  @Post('secciones')
  @ApiOperation({ summary: `Crear una nueva ${CiiuEnum.title.cisec}` })
  @ApiBody({ type: CreateSeccionRequestDto })
  @ApiResponseSwagger({ status: 201, description: CiiuEnum.smCreateSeccion })
  async createSeccion(@Body() data: CreateSeccionRequestDto) {
    return this.ciiuService.createSeccion(data);
  }

  @Put('secciones/:id')
  @ApiOperation({ summary: `Actualizar una ${CiiuEnum.title.cisec}` })
  @ApiBody({ type: UpdateSeccionRequestDto })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smUpdateSeccion })
  async updateSeccion(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateSeccionRequestDto) {
    return this.ciiuService.updateSeccion(id, data);
  }

  @Delete('secciones/:id')
  @ApiOperation({ summary: `Eliminar una ${CiiuEnum.title.cisec} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smDeleteSeccion })
  async deleteSeccion(@Param('id', ParseIntPipe) id: number) {
    return this.ciiuService.deleteSeccion(id);
  }

  // ==================== CRUD ACTIVIDADES (Nivel 6) ====================
  @Get('actividades')
  @ApiOperation({ summary: `Listar todas las ${CiiuEnum.title.ciact}` })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smFindAllActividades })
  async findAllActividades() {
    return this.ciiuService.findAllActividades();
  }

  @Get('actividades/:id')
  @ApiOperation({ summary: `Obtener una ${CiiuEnum.title.ciact} por ID` })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smFindActividadById })
  async findActividadById(@Param('id', ParseIntPipe) id: number) {
    return this.ciiuService.findActividadById(id);
  }

  @Post('actividades')
  @ApiOperation({ summary: `Crear una nueva ${CiiuEnum.title.ciact}` })
  @ApiBody({ type: CreateActividadRequestDto })
  @ApiResponseSwagger({ status: 201, description: CiiuEnum.smCreateActividad })
  async createActividad(@Body() data: CreateActividadRequestDto) {
    return this.ciiuService.createActividad(data);
  }

  @Put('actividades/:id')
  @ApiOperation({ summary: `Actualizar una ${CiiuEnum.title.ciact}` })
  @ApiBody({ type: UpdateActividadRequestDto })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smUpdateActividad })
  async updateActividad(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateActividadRequestDto) {
    return this.ciiuService.updateActividad(id, data);
  }

  @Delete('actividades/:id')
  @ApiOperation({ summary: `Eliminar una ${CiiuEnum.title.ciact} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: CiiuEnum.smDeleteActividad })
  async deleteActividad(@Param('id', ParseIntPipe) id: number) {
    return this.ciiuService.deleteActividad(id);
  }
}

