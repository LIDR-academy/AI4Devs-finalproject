import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';
import { AuditService } from './services/audit.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { GdprExportDto } from './dto/gdpr-export.dto';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearer')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Roles('administrador', 'cirujano')
  @ApiOperation({ summary: 'Consultar logs de auditoría' })
  @ApiResponse({ status: 200, description: 'Lista de logs de auditoría' })
  async queryLogs(@Query() queryDto: QueryAuditLogDto) {
    return this.auditService.query(queryDto);
  }

  @Get('logs/:id')
  @Roles('administrador', 'cirujano')
  @ApiOperation({ summary: 'Obtener un log específico' })
  @ApiResponse({ status: 200, description: 'Log de auditoría encontrado' })
  @ApiResponse({ status: 404, description: 'Log no encontrado' })
  async getLog(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditService.findById(id);
  }

  @Get('user/:userId')
  @Roles('administrador')
  @ApiOperation({ summary: 'Obtener todos los logs de un usuario' })
  @ApiResponse({ status: 200, description: 'Logs del usuario' })
  async getUserLogs(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.auditService.findByUserId(userId);
  }

  @Post('gdpr/export')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exportar datos de un usuario (GDPR)' })
  @ApiResponse({ status: 200, description: 'Datos exportados para cumplimiento GDPR' })
  async exportUserData(@Body() dto: GdprExportDto) {
    return this.auditService.exportUserData(dto);
  }

  @Post('gdpr/anonymize/:userId')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Anonimizar logs de un usuario (GDPR)',
    description:
      'Anonimiza los logs manteniendo la trazabilidad. Reemplaza userId, elimina IP, userAgent y datos sensibles. Recomendado para cumplimiento GDPR mientras se mantiene auditoría.',
  })
  @ApiResponse({ status: 200, description: 'Logs anonimizados exitosamente' })
  async anonymizeUserLogs(@Param('userId', ParseUUIDPipe) userId: string) {
    const count = await this.auditService.anonymizeUserLogs(userId);
    return {
      message: `Se anonimizaron ${count} logs del usuario`,
      anonymizedCount: count,
      note: 'Los logs fueron anonimizados manteniendo la trazabilidad del sistema',
    };
  }

  @Post('gdpr/delete/:userId')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar completamente logs de un usuario (GDPR)',
    description:
      '⚠️ ADVERTENCIA: Elimina permanentemente todos los logs del usuario. Esta acción es irreversible y elimina toda la trazabilidad. Solo usar cuando no hay obligaciones legales de retención.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logs eliminados completamente. Esta acción es irreversible.',
  })
  async deleteUserLogs(@Param('userId', ParseUUIDPipe) userId: string) {
    const count = await this.auditService.deleteUserLogs(userId);
    return {
      message: `Se eliminaron completamente ${count} logs del usuario`,
      deletedCount: count,
      warning: 'Esta acción es irreversible. Toda la trazabilidad del usuario ha sido eliminada.',
    };
  }

  @Get('statistics')
  @Roles('administrador')
  @ApiOperation({ summary: 'Obtener estadísticas de auditoría' })
  @ApiResponse({ status: 200, description: 'Estadísticas de auditoría' })
  async getStatistics(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.auditService.getStatistics(daysNumber);
  }

  @Post('cleanup')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Limpiar logs antiguos (retención de datos)' })
  @ApiResponse({ status: 200, description: 'Logs antiguos eliminados' })
  async cleanupOldLogs(@Query('retentionDays') retentionDays?: string) {
    const days = retentionDays ? parseInt(retentionDays, 10) : 2555; // 7 años por defecto
    const count = await this.auditService.deleteOldLogs(days);
    return {
      message: `Se eliminaron ${count} logs antiguos`,
      deletedCount: count,
    };
  }
}
