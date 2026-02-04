import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FollowupService } from './followup.service';
import { CreateEvolutionDto } from './dto/create-evolution.dto';
import { CreateDischargePlanDto } from './dto/create-discharge-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Seguimiento Postoperatorio')
@Controller('followup')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FollowupController {
  constructor(private readonly followupService: FollowupService) {}

  @Post('evolutions')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Registrar evolución postoperatoria' })
  @ApiResponse({ status: 201, description: 'Evolución registrada' })
  async createEvolution(
    @Body() dto: CreateEvolutionDto,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId ?? user?.sub ?? user?.id;
    return this.followupService.createEvolution(dto, userId);
  }

  @Get('evolutions/surgery/:surgeryId')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Listar evoluciones de una cirugía' })
  @ApiParam({ name: 'surgeryId' })
  @ApiResponse({ status: 200, description: 'Lista de evoluciones' })
  async getEvolutionsBySurgery(@Param('surgeryId', ParseUUIDPipe) surgeryId: string) {
    return this.followupService.getEvolutionsBySurgery(surgeryId);
  }

  @Get('evolutions/:id')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Obtener una evolución por ID' })
  @ApiParam({ name: 'id' })
  async getEvolutionById(@Param('id', ParseUUIDPipe) id: string) {
    return this.followupService.getEvolutionById(id);
  }

  @Get('evolutions/surgery/:surgeryId/complications')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Alertas de complicaciones' })
  @ApiParam({ name: 'surgeryId' })
  @ApiResponse({ status: 200, description: 'Evoluciones con complicaciones' })
  async getComplicationsAlerts(@Param('surgeryId', ParseUUIDPipe) surgeryId: string) {
    return this.followupService.getComplicationsAlerts(surgeryId);
  }

  @Put('discharge-plan/:surgeryId')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Crear o actualizar plan de alta' })
  @ApiParam({ name: 'surgeryId' })
  @ApiResponse({ status: 200, description: 'Plan de alta guardado' })
  async createOrUpdateDischargePlan(
    @Param('surgeryId', ParseUUIDPipe) surgeryId: string,
    @Body() dto: CreateDischargePlanDto,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId ?? user?.sub ?? user?.id;
    return this.followupService.createOrUpdateDischargePlan(surgeryId, dto, userId);
  }

  @Get('discharge-plan/:surgeryId')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Obtener plan de alta por cirugía' })
  @ApiParam({ name: 'surgeryId' })
  @ApiResponse({ status: 200, description: 'Plan de alta' })
  async getDischargePlan(@Param('surgeryId', ParseUUIDPipe) surgeryId: string) {
    return this.followupService.getDischargePlanBySurgery(surgeryId);
  }

  @Get('discharge-plan/:surgeryId/pdf')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Descargar plan de alta en PDF' })
  @ApiParam({ name: 'surgeryId' })
  @ApiResponse({ status: 200, description: 'PDF del plan de alta' })
  async getDischargePlanPdf(
    @Param('surgeryId', ParseUUIDPipe) surgeryId: string,
  ): Promise<StreamableFile> {
    const buffer = await this.followupService.getDischargePlanPdfBuffer(surgeryId);
    const filename = `plan-alta-${surgeryId.slice(0, 8)}.pdf`;
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${filename}"`,
    });
  }

  @Post('discharge-plan/:surgeryId/finalize')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Finalizar plan de alta' })
  @ApiParam({ name: 'surgeryId' })
  @ApiResponse({ status: 200, description: 'Plan finalizado' })
  async finalizeDischargePlan(
    @Param('surgeryId', ParseUUIDPipe) surgeryId: string,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId ?? user?.sub ?? user?.id;
    return this.followupService.finalizeDischargePlan(surgeryId, userId);
  }

  @Post('discharge-plan/:surgeryId/generate')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Generar plan de alta desde cirugía' })
  @ApiParam({ name: 'surgeryId' })
  @ApiResponse({ status: 200, description: 'Plan de alta generado' })
  async generateDischargePlan(
    @Param('surgeryId', ParseUUIDPipe) surgeryId: string,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId ?? user?.sub ?? user?.id;
    return this.followupService.generateDischargePlanFromSurgery(surgeryId, userId);
  }
}
