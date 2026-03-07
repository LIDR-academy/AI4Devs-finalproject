import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TripsService } from '../services/trips.service';
import { CreateTripDto } from '../dto/create-trip.dto';
import { UpdateTripDto } from '../dto/update-trip.dto';
import { JoinTripDto } from '../dto/join-trip.dto';
import { TripResponseDto } from '../dto/trip-response.dto';
import { TripListQueryDto } from '../dto/trip-list-query.dto';
import { TripListItemDto } from '../dto/trip-list-item.dto';
import { TripDetailResponseDto } from '../dto/trip-detail-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { TripMapper } from '../../../common/mappers/trip.mapper';

/**
 * Controller de Trips.
 *
 * Este controlador maneja las peticiones HTTP relacionadas con la gestión de viajes.
 * Su responsabilidad principal es manejar peticiones HTTP y validaciones de entrada,
 * delegando toda la lógica de negocio al TripsService.
 *
 * @class TripsController
 * @description Controlador para gestionar viajes
 */
@ApiTags('trips')
@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  /**
   * Crea una instancia del TripsController.
   *
   * @constructor
   * @param {TripsService} tripsService - Servicio inyectado para gestionar viajes
   */
  constructor(private readonly tripsService: TripsService) {}

  /**
   * Crea un nuevo viaje y asocia automáticamente al usuario autenticado como CREATOR.
   * La moneda puede ser COP o USD. Si no se especifica, por defecto es COP.
   * Opcionalmente puede invitar usuarios por email como miembros.
   *
   * @method create
   * @param {CreateTripDto} createTripDto - DTO con los datos del viaje a crear
   * @param {AuthenticatedRequest} req - Request con el usuario autenticado
   * @returns {TripResponseDto} Viaje creado con el usuario como CREATOR
   * @example
   * // POST /trips
   * // Headers: Authorization: Bearer {token}
   * // Body: { name: "Viaje a Cartagena", currency: "COP", memberEmails: ["maria@example.com"] }
   * // Respuesta: { id: "...", name: "...", currency: "COP", status: "ACTIVE", code: "...", createdAt: "...", updatedAt: "..." }
   * @example
   * // POST /trips
   * // Headers: Authorization: Bearer {token}
   * // Body: { name: "Viaje a Miami", currency: "USD" }
   * // Respuesta: { id: "...", name: "...", currency: "USD", status: "ACTIVE", code: "...", createdAt: "...", updatedAt: "..." }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo viaje',
    description:
      'Crea un viaje con nombre y moneda seleccionable (COP o USD, por defecto COP). El usuario autenticado se asocia automáticamente como CREATOR. Opcionalmente puede invitar usuarios por email como miembros.',
  })
  @ApiCreatedResponse({
    description: 'Viaje creado exitosamente',
    type: TripResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado. Se requiere autenticación.',
  })
  async create(
    @Body() createTripDto: CreateTripDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<TripResponseDto> {
    return this.tripsService.create(createTripDto, req.user!.id);
  }

  /**
   * Retrieves all trips where the authenticated user is a participant.
   * Allows optional filtering by trip status (ACTIVE/CLOSED).
   *
   * @method findAll
   * @param {TripListQueryDto} queryDto - DTO with optional filters
   * @param {AuthenticatedRequest} req - Request with authenticated user
   * @returns {TripListItemDto[]} List of trips with user role and participant count
   * @example
   * // GET /trips
   * // Headers: Authorization: Bearer {token}
   * // Response: [{ id: "...", name: "...", currency: "COP", status: "ACTIVE", code: "...", createdAt: "...", updatedAt: "...", userRole: "CREATOR", participantCount: 3 }]
   * @example
   * // GET /trips?status=ACTIVE
   * // Headers: Authorization: Bearer {token}
   * // Response: [{ ... active trips only ... }]
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user trips',
    description:
      'Returns all trips where the authenticated user is a participant (CREATOR or MEMBER). Can be filtered by trip status.',
  })
  @ApiOkResponse({
    description: 'Trip list retrieved successfully',
    type: [TripListItemDto],
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Authentication required.',
  })
  async findAll(
    @Query() queryDto: TripListQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<TripListItemDto[]> {
    return this.tripsService.findAllByUser(req.user!.id, queryDto);
  }

  /**
   * Permite a un usuario autenticado unirse a un viaje activo usando su código único.
   * El usuario se agrega como participante con rol MEMBER.
   *
   * @method join
   * @param {JoinTripDto} joinTripDto - DTO con el código del viaje
   * @param {AuthenticatedRequest} req - Request con el usuario autenticado
   * @returns {TripResponseDto} Detalles del viaje al que se unió el usuario
   * @throws {NotFoundException} Si el viaje no existe o no está activo
   * @throws {ConflictException} Si el usuario ya es participante
   * @example
   * // POST /trips/join
   * // Headers: Authorization: Bearer {token}
   * // Body: { code: "ABC12345" }
   * // Respuesta: { id: "...", name: "...", currency: "COP", status: "ACTIVE", code: "ABC12345", createdAt: "...", updatedAt: "..." }
   */
  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unirse a un viaje por código',
    description:
      'Permite a un usuario autenticado unirse a un viaje existente utilizando su código único de 8 caracteres. El usuario se agrega como participante con rol MEMBER. Solo se puede unir a viajes activos.',
  })
  @ApiOkResponse({
    description: 'Te has unido al viaje exitosamente',
    type: TripResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Código de viaje inválido o datos de entrada incorrectos',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado. Se requiere autenticación.',
  })
  @ApiNotFoundResponse({
    description: 'El viaje no existe o está cerrado',
  })
  @ApiConflictResponse({
    description: 'Ya eres participante de este viaje',
  })
  async join(
    @Body() joinTripDto: JoinTripDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<TripResponseDto> {
    const trip = await this.tripsService.joinByCode(
      joinTripDto.code,
      req.user!.id,
    );
    return TripMapper.toResponseDto(trip);
  }

  /**
   * Obtiene los detalles de un viaje por ID incluyendo participantes paginados.
   * Solo los participantes del viaje pueden acceder a sus detalles.
   *
   * @param id - ID del viaje
   * @param participantsPage - Número de página para participantes (default: 1)
   * @param participantsLimit - Límite de participantes por página (default: 20, max: 100)
   * @param req - Request con usuario autenticado
   * @returns Detalles del viaje con participantes paginados
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalles de un viaje por ID con participantes paginados',
    description:
      'Retorna los detalles completos de un viaje incluyendo sus participantes de forma paginada. Solo accesible para participantes del viaje.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del viaje (UUID)',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'participantsPage',
    required: false,
    type: Number,
    description: 'Número de página de participantes (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'participantsLimit',
    required: false,
    type: Number,
    description: 'Límite de participantes por página (default: 20, max: 100)',
    example: 20,
  })
  @ApiOkResponse({
    description: 'Detalles del viaje con participantes paginados',
    type: TripDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Viaje no encontrado' })
  @ApiForbiddenResponse({ description: 'No tienes acceso a este viaje' })
  @ApiBadRequestResponse({ description: 'ID de viaje inválido' })
  @ApiUnauthorizedResponse({
    description: 'No autorizado. Se requiere autenticación.',
  })
  async findOne(
    @Param('id') id: string,
    @Query('participantsPage') participantsPage: number = 1,
    @Query('participantsLimit') participantsLimit: number = 20,
    @Request() req: AuthenticatedRequest,
  ): Promise<TripDetailResponseDto> {
    // Validar y sanitizar parámetros de paginación
    const safePage = Math.max(1, Number(participantsPage) || 1);
    const safeLimit = Math.min(
      Math.max(1, Number(participantsLimit) || 20),
      100,
    );

    const { trip, paginationMeta, userRole, totalAmount } =
      await this.tripsService.findOneById(
        id,
        req.user!.id,
        safePage,
        safeLimit,
      );

    return TripMapper.toDetailDto(trip, userRole, paginationMeta, totalAmount);
  }

  /**
   * Updates a trip's basic information.
   * Only the CREATOR of the trip can update it.
   * Only the name and status fields can be updated. Currency and code cannot be changed.
   *
   * @method update
   * @param {string} id - ID of the trip to update
   * @param {UpdateTripDto} updateTripDto - DTO with fields to update
   * @param {AuthenticatedRequest} req - Request with authenticated user
   * @returns {TripResponseDto} Updated trip
   * @throws {BadRequestException} If trip ID is invalid
   * @throws {NotFoundException} If trip doesn't exist
   * @throws {ForbiddenException} If user is not CREATOR
   * @example
   * // PATCH /trips/550e8400-e29b-41d4-a716-446655440000
   * // Headers: Authorization: Bearer {token}
   * // Body: { name: "Viaje a Cartagena - Actualizado" }
   * // Response: { id: "...", name: "Viaje a Cartagena - Actualizado", currency: "COP", status: "ACTIVE", code: "...", createdAt: "...", updatedAt: "..." }
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar configuración de viaje',
    description:
      'Permite al CREATOR del viaje modificar datos básicos del viaje (nombre). Solo el creador puede actualizar el viaje. La moneda, estado y código no pueden modificarse.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del viaje (UUID)',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Viaje actualizado exitosamente',
    type: TripResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'ID de viaje inválido o datos de entrada incorrectos',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado. Se requiere autenticación.',
  })
  @ApiForbiddenResponse({
    description:
      'No tienes acceso a este viaje o no eres el creador del viaje',
  })
  @ApiNotFoundResponse({
    description: 'Viaje no encontrado',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTripDto: UpdateTripDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<TripResponseDto> {
    return this.tripsService.update(id, req.user!.id, updateTripDto);
  }
}
