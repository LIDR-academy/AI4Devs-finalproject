import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OperatingRoomService } from '../services/operating-room.service';
import { PlanningService } from '../planning.service';
import { CreateOperatingRoomDto } from '../dto/create-operating-room.dto';
import { UpdateOperatingRoomDto } from '../dto/update-operating-room.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ParseUUIDPipe } from '../../../common/pipes/parse-uuid.pipe';
import { BadRequestException } from '@nestjs/common';

@ApiTags('Quirófanos')
@Controller('planning/operating-rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearer')
export class OperatingRoomController {
  constructor(
    private readonly operatingRoomService: OperatingRoomService,
    private readonly planningService: PlanningService,
  ) {}

  @Post()
  @Roles('administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo quirófano' })
  @ApiResponse({
    status: 201,
    description: 'Quirófano creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o código duplicado' })
  async create(@Body() createDto: CreateOperatingRoomDto) {
    return this.operatingRoomService.create(createDto);
  }

  @Get()
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Listar quirófanos' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Solo quirófanos activos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de quirófanos',
  })
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const activeOnlyBool = activeOnly === 'true';
    return this.operatingRoomService.findAll(activeOnlyBool);
  }

  @Get(':id/availability')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Disponibilidad del quirófano en un rango de fechas (calendario)' })
  @ApiParam({ name: 'id', description: 'ID del quirófano (UUID)' })
  @ApiQuery({ name: 'from', required: true, description: 'Fecha inicio ISO (ej. 2024-02-01T00:00:00.000Z)' })
  @ApiQuery({ name: 'to', required: true, description: 'Fecha fin ISO (ej. 2024-02-28T23:59:59.999Z)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cirugías programadas en el quirófano en el rango',
  })
  @ApiResponse({ status: 400, description: 'Parámetros from/to requeridos o inválidos' })
  @ApiResponse({ status: 404, description: 'Quirófano no encontrado' })
  async getAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    if (!from || !to) {
      throw new BadRequestException('Los parámetros "from" y "to" (fechas ISO) son obligatorios.');
    }
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException('Las fechas "from" y "to" deben ser válidas (ISO 8601).');
    }
    if (toDate.getTime() <= fromDate.getTime()) {
      throw new BadRequestException('La fecha "to" debe ser posterior a "from".');
    }
    await this.operatingRoomService.findOne(id); // 404 si no existe
    return this.planningService.getRoomAvailability(id, fromDate, toDate);
  }

  @Get(':id')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Obtener quirófano por ID' })
  @ApiParam({ name: 'id', description: 'ID del quirófano (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Quirófano encontrado',
  })
  @ApiResponse({ status: 404, description: 'Quirófano no encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.operatingRoomService.findOne(id);
  }

  @Put(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Actualizar quirófano' })
  @ApiParam({ name: 'id', description: 'ID del quirófano (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Quirófano actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Quirófano no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateOperatingRoomDto,
  ) {
    return this.operatingRoomService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar (desactivar) quirófano' })
  @ApiParam({ name: 'id', description: 'ID del quirófano (UUID)' })
  @ApiResponse({
    status: 204,
    description: 'Quirófano desactivado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Quirófano no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.operatingRoomService.remove(id);
  }
}
