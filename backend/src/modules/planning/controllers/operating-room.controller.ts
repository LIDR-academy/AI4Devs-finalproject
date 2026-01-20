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
import { CreateOperatingRoomDto } from '../dto/create-operating-room.dto';
import { UpdateOperatingRoomDto } from '../dto/update-operating-room.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ParseUUIDPipe } from '../../../common/pipes/parse-uuid.pipe';

@ApiTags('Quirófanos')
@Controller('planning/operating-rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearer')
export class OperatingRoomController {
  constructor(private readonly operatingRoomService: OperatingRoomService) {}

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
