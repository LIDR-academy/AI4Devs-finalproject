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
import { ResourcesService } from './resources.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { CreateStaffAssignmentDto } from './dto/create-staff-assignment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';

@ApiTags('Recursos Quirúrgicos')
@Controller('resources')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearer')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post('equipment')
  @Roles('administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear equipo' })
  @ApiResponse({ status: 201, description: 'Equipo creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createEquipment(@Body() dto: CreateEquipmentDto) {
    return this.resourcesService.createEquipment(dto);
  }

  @Get('equipment')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Listar equipos' })
  @ApiQuery({ name: 'operatingRoomId', required: false })
  @ApiQuery({ name: 'availableOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de equipos' })
  async listEquipment(
    @Query('operatingRoomId') operatingRoomId?: string,
    @Query('availableOnly') availableOnly?: string,
  ) {
    return this.resourcesService.findAllEquipment(
      operatingRoomId || undefined,
      availableOnly === 'true',
    );
  }

  @Get('equipment/:id')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Obtener equipo por ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Equipo encontrado' })
  @ApiResponse({ status: 404, description: 'Equipo no encontrado' })
  async getEquipment(@Param('id', ParseUUIDPipe) id: string) {
    return this.resourcesService.findEquipmentById(id);
  }

  @Put('equipment/:id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Actualizar equipo' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Equipo actualizado' })
  @ApiResponse({ status: 404, description: 'Equipo no encontrado' })
  async updateEquipment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEquipmentDto,
  ) {
    return this.resourcesService.updateEquipment(id, dto);
  }

  @Delete('equipment/:id')
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar equipo' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: 'Equipo no encontrado' })
  async removeEquipment(@Param('id', ParseUUIDPipe) id: string) {
    return this.resourcesService.removeEquipment(id);
  }

  @Post('staff-assignments')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar personal a cirugía' })
  @ApiResponse({ status: 201, description: 'Asignación creada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createStaffAssignment(@Body() dto: CreateStaffAssignmentDto) {
    return this.resourcesService.createStaffAssignment(dto);
  }

  @Get('staff-assignments/surgery/:surgeryId')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Listar asignaciones de personal por cirugía' })
  @ApiParam({ name: 'surgeryId' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones' })
  async getAssignmentsBySurgery(@Param('surgeryId', ParseUUIDPipe) surgeryId: string) {
    return this.resourcesService.findAssignmentsBySurgery(surgeryId);
  }

  @Get('staff-assignments/user/:userId')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Listar asignaciones por usuario' })
  @ApiParam({ name: 'userId' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones' })
  async getAssignmentsByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.resourcesService.findAssignmentsByUser(userId);
  }

  @Delete('staff-assignments/:id')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar asignación de personal' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  async removeStaffAssignment(@Param('id', ParseUUIDPipe) id: string) {
    return this.resourcesService.removeStaffAssignment(id);
  }
}
