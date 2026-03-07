import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { isUUID } from 'class-validator';
import { Trip } from '../entities/trip.entity';
import { TripParticipant } from '../entities/trip-participant.entity';
import { User } from '../../users/entities/user.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { CreateTripDto } from '../dto/create-trip.dto';
import { UpdateTripDto } from '../dto/update-trip.dto';
import { TripResponseDto } from '../dto/trip-response.dto';
import { TripListQueryDto } from '../dto/trip-list-query.dto';
import { TripListItemDto } from '../dto/trip-list-item.dto';
import { ParticipantsPaginationMeta } from '../dto/trip-detail-response.dto';
import { TripStatus } from '../enums/trip-status.enum';
import { TripCurrency } from '../enums/trip-currency.enum';
import { ParticipantRole } from '../enums/participant-role.enum';
import { TripMapper } from '../../../common/mappers/trip.mapper';

/**
 * Service de Trips.
 * Responsabilidad: Contener la lógica de negocio y acceso a datos mediante TypeORM.
 */
@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(TripParticipant)
    private readonly tripParticipantRepository: Repository<TripParticipant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Genera un código alfanumérico para un viaje.
   * La unicidad se garantiza por la constraint de base de datos más
   * la lógica de reintentos al guardar el registro.
   *
   * @returns Código alfanumérico único
   */
  private generateUniqueCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return code;
  }

  private getDbErrorCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null) {
      return undefined;
    }

    const directCode = (error as { code?: unknown }).code;
    if (typeof directCode === 'string') {
      return directCode;
    }

    const driverError = (error as { driverError?: unknown }).driverError;
    if (typeof driverError !== 'object' || driverError === null) {
      return undefined;
    }

    const driverCode = (driverError as { code?: unknown }).code;
    return typeof driverCode === 'string' ? driverCode : undefined;
  }

  /**
   * Crea un nuevo viaje y asocia automáticamente al usuario como CREATOR.
   * La moneda puede ser COP o USD. Si no se especifica, por defecto es COP.
   * Opcionalmente puede invitar usuarios por email como miembros.
   *
   * @param createTripDto - DTO con los datos del viaje a crear
   * @param userId - ID del usuario autenticado que crea el viaje
   * @returns Viaje creado con el usuario como CREATOR
   * @throws NotFoundException si algún email invitado no existe en el sistema
   */
  async create(
    createTripDto: CreateTripDto,
    userId: string,
  ): Promise<TripResponseDto> {
    // Verificar que el usuario existe
    const creator = await this.userRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });

    if (!creator) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Crear el viaje con lógica de reintento ante violación de unicidad del código
    const maxSaveAttempts = 5;
    let savedTrip: Trip | null = null;
    let code: string | null = null;
    let attempt = 0;

    while (attempt < maxSaveAttempts && !savedTrip) {
      code = this.generateUniqueCode();

      const trip = this.tripRepository.create({
        name: createTripDto.name,
        currency: createTripDto.currency ?? TripCurrency.COP, // Default COP si no se especifica
        status: TripStatus.ACTIVE,
        code,
      });

      try {
        savedTrip = await this.tripRepository.save(trip);
      } catch (error: unknown) {
        const errorCode = this.getDbErrorCode(error);

        // 23505 es el código de error de Postgres para violación de unique constraint
        if (errorCode === '23505') {
          this.logger.warn(
            `Código duplicado '${code}' al crear viaje. Reintentando (${attempt + 1}/${maxSaveAttempts}).`,
          );
          attempt++;
          continue;
        }

        throw error;
      }
    }

    if (!savedTrip) {
      throw new ConflictException(
        'No se pudo generar un código único para el viaje. Intenta nuevamente.',
      );
    }

    // Crear TripParticipant para el creador con rol CREATOR
    const creatorParticipant = this.tripParticipantRepository.create({
      trip: savedTrip,
      tripId: savedTrip.id,
      user: creator,
      userId: creator.id,
      role: ParticipantRole.CREATOR,
    });

    await this.tripParticipantRepository.save(creatorParticipant);

    // Si se proporcionaron emails para invitar, crear participantes MEMBER
    if (createTripDto.memberEmails && createTripDto.memberEmails.length > 0) {
      const users = await this.userRepository.find({
        where: {
          email: In(createTripDto.memberEmails),
          deletedAt: IsNull(),
        },
      });

      const emailToUser = new Map(users.map((u) => [u.email, u]));
      const memberParticipants: TripParticipant[] = [];

      // Pre-cargar participantes existentes para evitar duplicados
      const candidateUserIds = users
        .map((u) => u.id)
        .filter((id) => id !== userId);
      const existingParticipants = candidateUserIds.length
        ? await this.tripParticipantRepository.find({
            where: {
              tripId: savedTrip.id,
              userId: In(candidateUserIds),
              deletedAt: IsNull(),
            },
          })
        : [];
      const existingParticipantIds = new Set(
        existingParticipants.map((p) => p.userId),
      );

      for (const email of createTripDto.memberEmails) {
        const user = emailToUser.get(email);

        if (!user) {
          throw new NotFoundException(
            `El usuario con email ${email} no está registrado. Debe registrarse primero.`,
          );
        }

        if (user.id === userId) {
          continue; // Saltar si es el mismo creador
        }

        if (existingParticipantIds.has(user.id)) {
          continue; // Ya es participante, saltar
        }

        memberParticipants.push(
          this.tripParticipantRepository.create({
            trip: savedTrip,
            tripId: savedTrip.id,
            user,
            userId: user.id,
            role: ParticipantRole.MEMBER,
          }),
        );
      }

      // Guardar todos los participantes miembros
      if (memberParticipants.length > 0) {
        await this.tripParticipantRepository.save(memberParticipants);
      }
    }

    // Retornar el viaje como DTO
    return TripMapper.toResponseDto(savedTrip);
  }

  /**
   * Retrieves all trips where the authenticated user is a participant.
   * Returns only non-deleted trips (soft delete).
   * Optionally filters by trip status.
   *
   * @param userId - ID of the authenticated user
   * @param queryDto - DTO with optional filters (status)
   * @returns List of trips with extended information (user role and participant count)
   */
  async findAllByUser(
    userId: string,
    queryDto: TripListQueryDto,
  ): Promise<TripListItemDto[]> {
    // Interface for raw query result typing
    interface TripQueryRawResult {
      trip_id: string;
      participantCount: string; // COUNT returns string in PostgreSQL
      userRole: ParticipantRole; // Role from userParticipant
    }

    // Build query with Query Builder for JOIN and aggregation
    let query = this.tripRepository
      .createQueryBuilder('trip')
      .innerJoin(
        'trip.participants',
        'userParticipant',
        'userParticipant.userId = :userId AND userParticipant.deletedAt IS NULL',
        { userId },
      )
      .leftJoin(
        'trip.participants',
        'allParticipants',
        'allParticipants.deletedAt IS NULL',
      )
      .where('trip.deletedAt IS NULL')
      .select([
        'trip.id',
        'trip.name',
        'trip.currency',
        'trip.status',
        'trip.code',
        'trip.createdAt',
        'trip.updatedAt',
      ])
      .addSelect('userParticipant.role', 'userRole')
      .addSelect('COUNT(DISTINCT allParticipants.id)', 'participantCount')
      .groupBy('trip.id')
      .addGroupBy('userParticipant.id')
      .addGroupBy('userParticipant.role')
      .orderBy('trip.createdAt', 'DESC');

    // Apply status filter if provided
    if (queryDto.status) {
      query = query.andWhere('trip.status = :status', {
        status: queryDto.status,
      });
    }

    // Execute query
    const results = await query.getRawAndEntities();

    const rawByTripId = new Map<string, TripQueryRawResult>();
    (results.raw as TripQueryRawResult[]).forEach((raw) => {
      rawByTripId.set(raw.trip_id, raw);
    });

    // Get all trip IDs to calculate totalAmount for each
    const tripIds = results.entities.map((trip) => trip.id);

    // Calculate totalAmount for each trip
    const totalAmountsByTripId = new Map<string, number>();
    if (tripIds.length > 0) {
      const totalAmountResults = await this.expenseRepository
        .createQueryBuilder('expense')
        .select('expense.tripId', 'tripId')
        .addSelect('COALESCE(SUM(expense.amount), 0)', 'total')
        .where('expense.tripId IN (:...tripIds)', { tripIds })
        .andWhere('expense.deletedAt IS NULL')
        .groupBy('expense.tripId')
        .getRawMany<{ tripId: string; total: string }>();

      totalAmountResults.forEach((result) => {
        const total = result.total ? parseFloat(result.total) : 0;
        totalAmountsByTripId.set(result.tripId, total);
      });
    }

    // Map results to TripListItemDto correlating raw rows by trip_id
    return results.entities.map((trip) => {
      const raw = rawByTripId.get(trip.id);

      if (!raw) {
        this.logger.warn(
          `Trip list raw aggregation missing for tripId=${trip.id}. Falling back to defaults for userRole and participantCount.`,
        );
      } else {
        if (raw.userRole === undefined) {
          this.logger.warn(
            `Trip list raw aggregation missing field userRole for tripId=${trip.id}. Falling back to ParticipantRole.MEMBER.`,
          );
        }
        if (raw.participantCount === undefined) {
          this.logger.warn(
            `Trip list raw aggregation missing field participantCount for tripId=${trip.id}. Falling back to '1'.`,
          );
        }
      }

      const userRole = raw?.userRole ?? ParticipantRole.MEMBER;
      const participantCountStr = raw?.participantCount ?? '1';
      const totalAmount = totalAmountsByTripId.get(trip.id) ?? 0;

      return TripMapper.toListItemDto(
        trip,
        userRole,
        parseInt(participantCountStr, 10),
        totalAmount,
      );
    });
  }

  /**
   * Permite a un usuario autenticado unirse a un viaje existente usando su código.
   * Solo se puede unir a viajes con estado ACTIVE.
   * El usuario se agrega como participante con rol MEMBER.
   *
   * @param code - Código único del viaje (8 caracteres alfanuméricos)
   * @param userId - ID del usuario autenticado que quiere unirse
   * @returns Entidad Trip al que se unió el usuario
   * @throws NotFoundException si el viaje no existe o no está activo
   * @throws ConflictException si el usuario ya es participante del viaje
   */
  async joinByCode(code: string, userId: string): Promise<Trip> {
    // Buscar el viaje por código (solo viajes activos y no eliminados)
    const trip = await this.tripRepository.findOne({
      where: {
        code,
        deletedAt: IsNull(),
        status: TripStatus.ACTIVE,
      },
    });

    if (!trip) {
      this.logger.warn(
        `Intento fallido de unirse: código ${code}, usuario ${userId}, razón: Viaje no encontrado o no está activo`,
      );
      throw new NotFoundException('El viaje no existe o está cerrado');
    }

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });

    if (!user) {
      this.logger.warn(
        `Intento fallido de unirse: código ${code}, usuario ${userId}, razón: Usuario no encontrado`,
      );
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si el usuario ya es participante del viaje
    const existingParticipant = await this.tripParticipantRepository.findOne({
      where: {
        tripId: trip.id,
        userId: user.id,
        deletedAt: IsNull(),
      },
    });

    if (existingParticipant) {
      this.logger.warn(
        `Intento fallido de unirse: código ${code}, usuario ${userId}, viaje ${trip.id}, razón: Ya es participante`,
      );
      throw new ConflictException('Ya eres participante de este viaje');
    }

    // Crear TripParticipant con rol MEMBER
    const newParticipant = this.tripParticipantRepository.create({
      trip,
      tripId: trip.id,
      user,
      userId: user.id,
      role: ParticipantRole.MEMBER,
    });

    await this.tripParticipantRepository.save(newParticipant);

    this.logger.log(
      `Usuario ${userId} se unió exitosamente al viaje ${trip.id} (${trip.name}) usando código ${code}`,
    );

    // Invalidar caché del trip para TODOS los participantes (incluyendo el nuevo)
    const participantRows = await this.tripParticipantRepository.find({
      where: {
        tripId: trip.id,
        deletedAt: IsNull(),
      },
      select: {
        userId: true,
      },
    });

    const participantIds = new Set<string>(
      participantRows.map((p) => p.userId),
    );
    participantIds.add(userId);

    await Promise.all(
      Array.from(participantIds).map((participantId) =>
        this.invalidateTripCache(trip.id, participantId),
      ),
    );

    return trip;
  }

  /**
   * Obtiene los detalles de un viaje por ID incluyendo participantes paginados.
   * Solo los participantes del viaje pueden acceder a sus detalles.
   * Usa caché para optimizar performance.
   *
   * @param tripId - ID del viaje
   * @param userId - ID del usuario autenticado
   * @param participantsPage - Número de página para participantes (default: 1)
   * @param participantsLimit - Límite de participantes por página (default: 20, max: 100)
   * @returns Trip entity con participantes, metadatos de paginación y rol del usuario
   * @throws BadRequestException si el tripId no es un UUID válido
   * @throws ForbiddenException si el usuario no es participante del viaje
   * @throws NotFoundException si el viaje no existe
   */
  async findOneById(
    tripId: string,
    userId: string,
    participantsPage: number = 1,
    participantsLimit: number = 20,
  ): Promise<{
    trip: Trip;
    paginationMeta: ParticipantsPaginationMeta;
    userRole: ParticipantRole;
    totalAmount: number;
  }> {
    // Validar formato UUID
    if (!isUUID(tripId)) {
      throw new BadRequestException('ID de viaje inválido');
    }

    // Validar parámetros de paginación
    const safePage = Math.max(1, participantsPage);
    const safeLimit = Math.min(Math.max(1, participantsLimit), 100);

    // Verificar caché
    const cacheKey = `trip-detail:${tripId}:${userId}:${safePage}:${safeLimit}`;
    const cached = await this.cacheManager.get<{
      trip: Trip;
      paginationMeta: ParticipantsPaginationMeta;
      userRole: ParticipantRole;
      totalAmount: number;
    }>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for trip ${tripId}, page ${safePage}`);
      return cached;
    }

    // Verificar que el usuario es participante del viaje
    const userParticipation = await this.tripParticipantRepository.findOne({
      where: {
        tripId,
        userId,
        deletedAt: IsNull(),
      },
    });

    if (!userParticipation) {
      throw new ForbiddenException('No tienes acceso a este viaje');
    }

    // Obtener total de participantes para paginación
    const totalParticipants = await this.tripParticipantRepository.count({
      where: {
        tripId,
        deletedAt: IsNull(),
      },
    });

    // Obtener el trip sin paginar participantes
    const trip = await this.tripRepository.findOne({
      where: { id: tripId, deletedAt: IsNull() },
      select: [
        'id',
        'name',
        'currency',
        'status',
        'code',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!trip) {
      throw new NotFoundException('Viaje no encontrado');
    }

    // Construir query paginada para participantes
    const skip = (safePage - 1) * safeLimit;
    const participants = await this.tripParticipantRepository.find({
      where: { tripId, deletedAt: IsNull() },
      relations: ['user'],
      select: {
        id: true,
        userId: true,
        role: true,
        createdAt: true,
        user: {
          id: true,
          nombre: true,
          email: true,
        },
      },
      skip,
      take: safeLimit,
      order: { createdAt: 'ASC' },
    });

    // Adjuntar participantes paginados al trip
    trip.participants = participants;

    const userRole = userParticipation.role;

    // Calcular totalAmount sumando todos los gastos no eliminados del viaje
    const total_amount_result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount), 0)', 'total')
      .where('expense.tripId = :tripId', { tripId })
      .andWhere('expense.deletedAt IS NULL')
      .getRawOne<{ total: string }>();

    const total_amount = total_amount_result?.total
      ? parseFloat(total_amount_result.total)
      : 0;

    // Calcular metadatos de paginación
    const paginationMeta: ParticipantsPaginationMeta = {
      total: totalParticipants,
      page: safePage,
      limit: safeLimit,
      hasMore: safePage * safeLimit < totalParticipants,
    };

    const result = { trip, paginationMeta, userRole, totalAmount: total_amount };

    // Guardar en caché por 5 minutos
    await this.cacheManager.set(cacheKey, result, 300);

    this.logger.log(
      `Usuario ${userId} obtuvo detalles del viaje ${tripId}, página ${safePage}`,
    );

    return result;
  }

  /**
   * Updates a trip's basic information.
   * Only the CREATOR of the trip can update it.
   * Only the name and status fields can be updated. Currency and code cannot be changed.
   *
   * @param tripId - ID of the trip to update
   * @param userId - ID of the authenticated user
   * @param updateTripDto - DTO with fields to update
   * @returns Updated trip as TripResponseDto
   * @throws BadRequestException if tripId is not a valid UUID
   * @throws NotFoundException if the trip doesn't exist
   * @throws ForbiddenException if the user is not a participant or is not the CREATOR
   */
  async update(
    tripId: string,
    userId: string,
    updateTripDto: UpdateTripDto,
  ): Promise<TripResponseDto> {
    // Validate UUID format
    if (!isUUID(tripId)) {
      this.logger.warn(`Invalid UUID format: tripId=${tripId}`);
      throw new BadRequestException('ID de viaje inválido');
    }

    // Verify trip exists and is not deleted
    const trip = await this.tripRepository.findOne({
      where: { id: tripId, deletedAt: IsNull() },
    });

    if (!trip) {
      this.logger.warn(`Trip not found: tripId=${tripId}`);
      throw new NotFoundException('Viaje no encontrado');
    }

    // Verify user is a participant
    const userParticipation = await this.tripParticipantRepository.findOne({
      where: {
        tripId,
        userId,
        deletedAt: IsNull(),
      },
    });

    if (!userParticipation) {
      this.logger.warn(
        `User is not a participant: tripId=${tripId}, userId=${userId}`,
      );
      throw new ForbiddenException('No tienes acceso a este viaje');
    }

    // Verify user is CREATOR
    if (userParticipation.role !== ParticipantRole.CREATOR) {
      this.logger.warn(
        `User is not CREATOR: tripId=${tripId}, userId=${userId}, role=${userParticipation.role}`,
      );
      throw new ForbiddenException(
        'Solo el creador del viaje puede actualizar su configuración',
      );
    }

    // Update name field if provided
    if (updateTripDto.name !== undefined) {
      trip.name = updateTripDto.name;
    }

    // Update status field if provided
    if (updateTripDto.status !== undefined) {
      trip.status = updateTripDto.status;
    }

    // Save changes
    const updatedTrip = await this.tripRepository.save(trip);

    this.logger.log(
      `Usuario ${userId} actualizó el viaje ${tripId} (${updatedTrip.name})`,
    );

    // Invalidate cache for all participants
    const participantRows = await this.tripParticipantRepository.find({
      where: {
        tripId: trip.id,
        deletedAt: IsNull(),
      },
      select: {
        userId: true,
      },
    });

    const participantIds = new Set<string>(
      participantRows.map((p) => p.userId),
    );

    await Promise.all(
      Array.from(participantIds).map((participantId) =>
        this.invalidateTripCache(trip.id, participantId),
      ),
    );

    // Return updated trip as DTO
    return TripMapper.toResponseDto(updatedTrip);
  }

  /**
   * Invalida el caché de un viaje específico.
   * Elimina todas las entradas de caché relacionadas con el trip.
   * Debe llamarse después de cualquier operación que modifique el trip o sus participantes.
   *
   * @param tripId - ID del viaje cuyo caché se invalidará
   */
  private async invalidateTripCache(
    tripId: string,
    userId?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<void> {
    try {
      const key = `trip-detail:${tripId}:${userId ?? 'unknown'}:${page}:${limit}`;
      await this.cacheManager.del(key);
      this.logger.debug(`Cache invalidated for key ${key}`);
    } catch (error) {
      this.logger.error(`Error al invalidar caché del viaje ${tripId}:`, error);
    }
  }
}
