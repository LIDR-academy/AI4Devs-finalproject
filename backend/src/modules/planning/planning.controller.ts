import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PlanningService } from './planning.service';
import { ChecklistService } from './services/checklist.service';
import { CreateSurgeryDto } from './dto/create-surgery.dto';
import { UpdateSurgeryDto } from './dto/update-surgery.dto';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';
import { SurgeryStatus } from './entities/surgery.entity';

@ApiTags('Planificación Quirúrgica')
@Controller('planning')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearer')
export class PlanningController {
  constructor(
    private readonly planningService: PlanningService,
    private readonly checklistService: ChecklistService,
  ) {}

  @Post('surgeries')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva cirugía' })
  @ApiResponse({
    status: 201,
    description: 'Cirugía creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async createSurgery(
    @Body() createSurgeryDto: CreateSurgeryDto,
    @CurrentUser() user: any,
  ) {
    return this.planningService.createSurgery(createSurgeryDto, user.userId);
  }

  @Get('surgeries')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Listar cirugías' })
  @ApiQuery({ name: 'patientId', required: false })
  @ApiQuery({ name: 'surgeonId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: SurgeryStatus })
  @ApiResponse({
    status: 200,
    description: 'Lista de cirugías',
  })
  async listSurgeries(
    @Query('patientId') patientId?: string,
    @Query('surgeonId') surgeonId?: string,
    @Query('status') status?: SurgeryStatus,
  ) {
    return this.planningService.findSurgeries({
      patientId,
      surgeonId,
      status,
    });
  }

  @Get('surgeries/:id')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Obtener cirugía por ID' })
  @ApiParam({ name: 'id', description: 'ID de la cirugía (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Cirugía encontrada',
  })
  @ApiResponse({ status: 404, description: 'Cirugía no encontrada' })
  async getSurgery(@Param('id', ParseUUIDPipe) id: string) {
    return this.planningService.findSurgeryById(id);
  }

  @Put('surgeries/:id')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Actualizar cirugía' })
  @ApiParam({ name: 'id', description: 'ID de la cirugía (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Cirugía actualizada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Cirugía no encontrada' })
  async updateSurgery(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSurgeryDto: UpdateSurgeryDto,
  ) {
    return this.planningService.updateSurgery(id, updateSurgeryDto);
  }

  @Put('surgeries/:id/status')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Actualizar estado de cirugía' })
  @ApiParam({ name: 'id', description: 'ID de la cirugía (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Estado inválido' })
  @ApiResponse({ status: 404, description: 'Cirugía no encontrada' })
  async updateSurgeryStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: SurgeryStatus,
  ) {
    if (!Object.values(SurgeryStatus).includes(status)) {
      throw new BadRequestException(`Estado inválido: ${status}. Estados válidos: ${Object.values(SurgeryStatus).join(', ')}`);
    }
    return this.planningService.updateSurgeryStatus(id, status);
  }

  @Post('plannings')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear planificación quirúrgica' })
  @ApiResponse({
    status: 201,
    description: 'Planificación creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o planificación ya existe' })
  async createPlanning(
    @Body() createPlanningDto: CreatePlanningDto,
    @CurrentUser() user: any,
  ) {
    return this.planningService.createPlanning(createPlanningDto, user.userId);
  }

  @Get('plannings/surgery/:surgeryId')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Obtener planificación por ID de cirugía' })
  @ApiParam({ name: 'surgeryId', description: 'ID de la cirugía (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Planificación encontrada',
  })
  @ApiResponse({ status: 404, description: 'Planificación no encontrada' })
  async getPlanning(@Param('surgeryId', ParseUUIDPipe) surgeryId: string) {
    return this.planningService.getPlanningBySurgeryId(surgeryId);
  }

  @Put('plannings/:id')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Actualizar planificación quirúrgica' })
  @ApiParam({ name: 'id', description: 'ID de la planificación (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Planificación actualizada exitosamente',
  })
  async updatePlanning(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<CreatePlanningDto>,
  ) {
    return this.planningService.updatePlanning(id, updateData);
  }

  @Get('surgeries/:surgeryId/risk-score')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Calcular score de riesgo para cirugía' })
  @ApiParam({ name: 'surgeryId', description: 'ID de la cirugía (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Score de riesgo calculado',
  })
  async calculateRiskScore(@Param('surgeryId', ParseUUIDPipe) surgeryId: string) {
    return this.planningService.calculateRiskScore(surgeryId);
  }

  // Endpoints de Checklist
  @Get('surgeries/:surgeryId/checklist')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Obtener checklist de cirugía' })
  @ApiParam({ name: 'surgeryId', description: 'ID de la cirugía (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Checklist encontrado',
  })
  async getChecklist(@Param('surgeryId', ParseUUIDPipe) surgeryId: string) {
    return this.checklistService.getChecklist(surgeryId);
  }

  @Post('surgeries/:surgeryId/checklist')
  @Roles('cirujano', 'administrador')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear checklist para cirugía' })
  @ApiParam({ name: 'surgeryId', description: 'ID de la cirugía (UUID)' })
  @ApiResponse({
    status: 201,
    description: 'Checklist creado exitosamente',
  })
  async createChecklist(@Param('surgeryId', ParseUUIDPipe) surgeryId: string) {
    return this.checklistService.createChecklist(surgeryId);
  }

  @Put('surgeries/:surgeryId/checklist/phase')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Actualizar fase del checklist' })
  @ApiParam({ name: 'surgeryId', description: 'ID de la cirugía (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Fase actualizada exitosamente',
  })
  async updateChecklistPhase(
    @Param('surgeryId', ParseUUIDPipe) surgeryId: string,
    @Body() updateChecklistDto: UpdateChecklistDto,
    @CurrentUser() user: any,
  ) {
    if (updateChecklistDto.phaseData) {
      return this.checklistService.updateChecklistPhase(
        surgeryId,
        updateChecklistDto.phase,
        updateChecklistDto.phaseData,
        user.userId,
      );
    } else if (updateChecklistDto.itemId !== undefined) {
      return this.checklistService.toggleChecklistItem(
        surgeryId,
        updateChecklistDto.phase,
        updateChecklistDto.itemId,
        updateChecklistDto.checked ?? true,
        user.userId,
        updateChecklistDto.notes,
      );
    } else {
      throw new BadRequestException('Debe proporcionar phaseData o itemId');
    }
  }
}
