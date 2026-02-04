import {
  Controller,
  Post,
  Get,
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
import { Throttle } from '@nestjs/throttler';
import { BackupService } from './services/backup.service';

@ApiTags('Security')
@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearer')
export class SecurityController {
  constructor(private readonly backupService: BackupService) {}

  @Post('backup/create')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Máximo 5 backups por minuto
  @ApiOperation({ summary: 'Crear backup manual de la base de datos' })
  @ApiResponse({ status: 200, description: 'Backup creado exitosamente' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async createBackup() {
    return this.backupService.createBackup('manual');
  }

  @Get('backup/list')
  @Roles('administrador')
  @ApiOperation({ summary: 'Listar todos los backups disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de backups' })
  async listBackups() {
    return {
      backups: this.backupService.listBackups(),
    };
  }

  @Post('backup/restore/:fileName')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 1, ttl: 3600000 } }) // Máximo 1 restauración por hora
  @ApiOperation({ summary: 'Restaurar base de datos desde un backup' })
  @ApiResponse({ status: 200, description: 'Backup restaurado exitosamente' })
  @ApiResponse({ status: 400, description: 'Archivo de backup no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async restoreBackup(@Param('fileName') fileName: string) {
    const backups = this.backupService.listBackups();
    const backup = backups.find((b) => b.fileName === fileName);

    if (!backup) {
      return {
        success: false,
        error: `Backup ${fileName} no encontrado`,
      };
    }

    return this.backupService.restoreBackup(backup.filePath);
  }
}
