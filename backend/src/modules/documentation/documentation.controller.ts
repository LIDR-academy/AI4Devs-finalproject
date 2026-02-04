import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DocumentationService } from './services/documentation.service';
import { CreateDocumentationDto } from './dto/create-documentation.dto';
import { UpdateDocumentationDto } from './dto/update-documentation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Documentación Intraoperatoria')
@Controller('documentation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentationController {
  constructor(
    private readonly documentationService: DocumentationService,
  ) {}

  @Post()
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Crear nueva documentación para una cirugía' })
  @ApiResponse({
    status: 201,
    description: 'Documentación creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(
    @Body() createDto: CreateDocumentationDto,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.documentationService.create(createDto, userId);
  }

  @Get('surgery/:surgeryId')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Obtener documentación por ID de cirugía (se crea si no existe)' })
  @ApiParam({ name: 'surgeryId', description: 'ID de la cirugía (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Documentación encontrada o creada',
  })
  async findBySurgeryId(
    @Param('surgeryId', ParseUUIDPipe) surgeryId: string,
    @CurrentUser() user?: any,
  ) {
    const userId = user?.userId ?? user?.sub ?? user?.id;
    return this.documentationService.findBySurgeryId(surgeryId, userId);
  }

  @Put(':id')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Actualizar documentación' })
  @ApiParam({ name: 'id', description: 'ID de la documentación (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Documentación actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Documentación no encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDocumentationDto,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.documentationService.update(id, updateDto, userId);
  }

  @Get(':id/versions')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Obtener historial de versiones (snapshots) de documentación' })
  @ApiParam({ name: 'id', description: 'ID de la documentación (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de versiones, más reciente primero',
  })
  async getVersionHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentationService.getVersionHistory(id);
  }

  @Get(':id/history')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiOperation({ summary: 'Obtener historial de cambios (campo a campo) de documentación' })
  @ApiParam({ name: 'id', description: 'ID de la documentación (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Historial de cambios',
  })
  async getChangeHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentationService.getChangeHistory(id);
  }

  @Put(':id/complete')
  @Roles('cirujano', 'administrador')
  @ApiOperation({ summary: 'Marcar documentación como completada' })
  @ApiParam({ name: 'id', description: 'ID de la documentación (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Documentación marcada como completada',
  })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.documentationService.complete(id, userId);
  }
}
