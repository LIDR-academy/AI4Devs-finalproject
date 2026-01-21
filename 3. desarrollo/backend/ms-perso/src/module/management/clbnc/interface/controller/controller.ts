import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClbncEnum } from '../../infrastructure/enum/enum';
import { ClbncService } from '../../infrastructure/service/service';
import { ClbncEntity, ClbncParams } from '../../domain/entity';
import {
  CreateClbncRequestDto,
  UpdateClbncRequestDto,
  ClbncResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  ChangePasswordRequestDto,
  IniciarRecuperacionPasswordRequestDto,
  CompletarRecuperacionPasswordRequestDto
} from '../../infrastructure/dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('usuarios-banca-digital')
@Controller('usuarios-banca-digital')
export class ClbncController {
  constructor(
    private readonly service: ClbncService,
  ) { }

  @Get()
  @ApiOperation({ summary: `Listar todos los ${ClbncEnum.title}s` })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'clienteId', required: false, type: Number, description: 'Filtrar por ID de cliente' })
  @ApiQuery({ name: 'username', required: false, type: String, description: 'Filtrar por username' })
  @ApiQuery({ name: 'activo', required: false, type: Boolean, description: 'Filtrar por estado activo' })
  @ApiResponseSwagger({ status: 200, description: 'Listado de usuarios de banca digital', type: [ClbncResponseDto] })
  public async findAll(@Query() params: ParamsDto & { clienteId?: number; username?: string; activo?: boolean }): Promise<ApiResponses<ClbncEntity>> {
    try {
      const clbncParams: ClbncParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        clienteId: params.clienteId,
        username: params.username,
        activo: params.activo,
      };
      const result = await this.service.findAll(clbncParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: `Buscar usuario de banca digital por ID de cliente` })
  @ApiResponseSwagger({ status: 200, description: 'Usuario de banca digital encontrado', type: ClbncResponseDto })
  public async findByClienId(@Param('clienteId') clienteId: number): Promise<ApiResponse<ClbncEntity>> {
    try {
      const result = await this.service.findByClienId(+clienteId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('username/:username')
  @ApiOperation({ summary: `Buscar usuario de banca digital por username` })
  @ApiResponseSwagger({ status: 200, description: 'Usuario de banca digital encontrado', type: ClbncResponseDto })
  public async findByUsername(@Param('username') username: string): Promise<ApiResponse<ClbncEntity>> {
    try {
      const result = await this.service.findByUsername(username);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: `Obtener ${ClbncEnum.title} por ID` })
  @ApiResponseSwagger({ status: 200, description: 'Usuario de banca digital encontrado', type: ClbncResponseDto })
  public async findById(@Param('id') id: number): Promise<ApiResponse<ClbncEntity>> {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: `Crear un nuevo ${ClbncEnum.title}` })
  @ApiBody({ type: CreateClbncRequestDto, description: `Datos del ${ClbncEnum.title}` })
  @ApiResponseSwagger({ status: 201, description: 'Usuario de banca digital creado exitosamente', type: ClbncResponseDto })
  public async create(@Body() data: CreateClbncRequestDto): Promise<ApiResponse<ClbncEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: `Actualizar un ${ClbncEnum.title}` })
  @ApiBody({ type: UpdateClbncRequestDto, description: `Datos actualizados del ${ClbncEnum.title}` })
  @ApiResponseSwagger({ status: 200, description: 'Usuario de banca digital actualizado exitosamente', type: ClbncResponseDto })
  public async update(@Param('id') id: number, @Body() data: UpdateClbncRequestDto): Promise<ApiResponse<ClbncEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: `Eliminar un ${ClbncEnum.title} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: 'Usuario de banca digital eliminado exitosamente', type: ClbncResponseDto })
  public async delete(@Param('id') id: number): Promise<ApiResponse<ClbncEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // ========== AUTENTICACIÓN Y SEGURIDAD (APP MÓVIL) ==========
  // NOTA: Estos endpoints son llamados desde la aplicación móvil para autenticación y gestión de sesiones

  @Post('login')
  @ApiOperation({ 
    summary: 'Autenticar usuario de banca digital (APP MÓVIL)',
    description: 'Endpoint llamado desde la aplicación móvil para autenticar usuarios. Valida credenciales, registra información del dispositivo (IMEI, IP, GPS) y genera token de sesión. El token debe incluirse en el header Authorization de requests posteriores.'
  })
  @ApiBody({ type: LoginRequestDto, description: 'Credenciales e información del dispositivo móvil' })
  @ApiResponseSwagger({ status: 200, description: 'Login exitoso', type: LoginResponseDto })
  @ApiResponseSwagger({ status: 401, description: 'Credenciales inválidas' })
  public async login(@Body() data: LoginRequestDto): Promise<ApiResponse<{ usuario: ClbncEntity; tokenSesion: string; clienteId: number }>> {
    try {
      const result = await this.service.login(
        data.username,
        data.password,
        {
          imei: data.imei ?? null,
          nombreDispositivo: data.nombreDispositivo ?? null,
          detallesDispositivo: data.detallesDispositivo ?? null,
          ip: data.ip ?? null,
          latitud: data.latitud ?? null,
          longitud: data.longitud ?? null,
          geocoder: data.geocoder ?? null,
        }
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post(':id/cambiar-password')
  @ApiOperation({ 
    summary: 'Cambiar contraseña de usuario de banca digital (APP MÓVIL)',
    description: 'Endpoint llamado desde la aplicación móvil para cambiar la contraseña del usuario autenticado. Requiere validar el password actual antes de establecer el nuevo.'
  })
  @ApiBody({ type: ChangePasswordRequestDto, description: 'Password actual y nuevo password' })
  @ApiResponseSwagger({ status: 200, description: 'Contraseña cambiada exitosamente', type: ClbncResponseDto })
  @ApiResponseSwagger({ status: 400, description: 'Password actual incorrecto' })
  public async changePassword(
    @Param('id') id: number,
    @Body() data: ChangePasswordRequestDto
  ): Promise<ApiResponse<ClbncEntity>> {
    try {
      const result = await this.service.changePassword(+id, data.passwordActual, data.passwordNuevo);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post('recuperar-password/iniciar')
  @ApiOperation({ 
    summary: 'Iniciar recuperación de contraseña (APP MÓVIL)',
    description: 'Endpoint llamado desde la aplicación móvil cuando el usuario olvida su contraseña. Genera un código de verificación de 6 dígitos que se envía por email/SMS. El código expira en 15 minutos.'
  })
  @ApiBody({ type: IniciarRecuperacionPasswordRequestDto, description: 'Username del usuario' })
  @ApiResponseSwagger({ status: 200, description: 'Código de verificación generado (en desarrollo se retorna, en producción se envía por email/SMS)' })
  public async iniciarRecuperacionPassword(
    @Body() data: IniciarRecuperacionPasswordRequestDto
  ): Promise<ApiResponse<{ codigoVerificacion: string; expiraEn: Date }>> {
    try {
      const result = await this.service.iniciarRecuperacionPassword(data.username);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post('recuperar-password/completar')
  @ApiOperation({ 
    summary: 'Completar recuperación de contraseña (APP MÓVIL)',
    description: 'Endpoint llamado desde la aplicación móvil después de validar el código de verificación recibido por email/SMS. Establece el nuevo password si el código es válido y no ha expirado.'
  })
  @ApiBody({ type: CompletarRecuperacionPasswordRequestDto, description: 'Username, código de verificación y nuevo password' })
  @ApiResponseSwagger({ status: 200, description: 'Contraseña restablecida exitosamente', type: ClbncResponseDto })
  @ApiResponseSwagger({ status: 400, description: 'Código de verificación inválido o expirado' })
  public async completarRecuperacionPassword(
    @Body() data: CompletarRecuperacionPasswordRequestDto
  ): Promise<ApiResponse<ClbncEntity>> {
    try {
      const result = await this.service.completarRecuperacionPassword(
        data.username,
        data.codigoVerificacion,
        data.passwordNuevo
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post(':id/bloquear')
  @ApiOperation({ 
    summary: 'Bloquear usuario de banca digital',
    description: 'Inactiva el acceso del usuario. Puede ser por intentos fallidos, solicitud del usuario o por seguridad.'
  })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        motivo: { type: 'string', example: 'Por intentos fallidos de login' } 
      } 
    },
    description: 'Motivo del bloqueo'
  })
  @ApiResponseSwagger({ status: 200, description: 'Usuario bloqueado exitosamente', type: ClbncResponseDto })
  public async bloquear(
    @Param('id') id: number,
    @Body() data: { motivo: string }
  ): Promise<ApiResponse<ClbncEntity>> {
    try {
      const result = await this.service.bloquear(+id, data.motivo);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post(':id/desbloquear')
  @ApiOperation({ 
    summary: 'Desbloquear usuario de banca digital',
    description: 'Reactiva el acceso del usuario previamente bloqueado.'
  })
  @ApiResponseSwagger({ status: 200, description: 'Usuario desbloqueado exitosamente', type: ClbncResponseDto })
  public async desbloquear(@Param('id') id: number): Promise<ApiResponse<ClbncEntity>> {
    try {
      const result = await this.service.desbloquear(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post('verificar-token')
  @ApiOperation({ 
    summary: 'Verificar token de sesión (APP MÓVIL)',
    description: 'Endpoint llamado desde la aplicación móvil para validar si un token de sesión sigue siendo válido.'
  })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        tokenSesion: { type: 'string', example: 'a1b2c3d4e5f6...' } 
      } 
    },
    description: 'Token de sesión a verificar'
  })
  @ApiResponseSwagger({ status: 200, description: 'Token válido', type: ClbncResponseDto })
  @ApiResponseSwagger({ status: 401, description: 'Token inválido o expirado' })
  public async verificarTokenSesion(
    @Body() data: { tokenSesion: string }
  ): Promise<ApiResponse<ClbncEntity>> {
    try {
      const result = await this.service.verificarTokenSesion(data.tokenSesion);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

