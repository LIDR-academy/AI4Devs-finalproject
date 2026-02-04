import {
  Controller,
  Get,
  Patch,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';

@ApiTags('Notificaciones')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearer')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Listar notificaciones del usuario actual' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones' })
  async list(
    @CurrentUser() user: { userId: string },
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const userId = user.userId;
    return this.notificationsService.findByUser(
      userId,
      unreadOnly === 'true',
    );
  }

  @Patch('read-all')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Cantidad de notificaciones marcadas' })
  async markAllAsRead(@CurrentUser() user: { userId: string }) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Patch(':id/read')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Notificación actualizada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.notificationsService.markAsRead(id, user.userId);
  }
}
