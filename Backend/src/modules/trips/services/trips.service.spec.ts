import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { ObjectLiteral } from 'typeorm';
import { Repository, IsNull } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { TripsService } from './trips.service';
import { Trip } from '../entities/trip.entity';
import { TripParticipant } from '../entities/trip-participant.entity';
import { User } from '../../users/entities/user.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { TripStatus } from '../enums/trip-status.enum';
import { TripCurrency } from '../enums/trip-currency.enum';
import { ParticipantRole } from '../enums/participant-role.enum';
import { CreateTripDto } from '../dto/create-trip.dto';
import { TripListQueryDto } from '../dto/trip-list-query.dto';
import { UpdateTripDto } from '../dto/update-trip.dto';

type MockRepo<T extends ObjectLiteral> = jest.Mocked<Partial<Repository<T>>>;

const createMockRepository = <T extends ObjectLiteral>(): MockRepo<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('TripsService', () => {
  let service: TripsService;
  let tripRepository: MockRepo<Trip>;
  let tripParticipantRepository: MockRepo<TripParticipant>;
  let userRepository: MockRepo<User>;
  let expenseRepository: MockRepo<Expense>;
  let cacheManager: jest.Mocked<Cache>;

  const userId = 'user-id-1';
  const tripId = 'trip-id-1';

  const mockTrip: Trip = {
    id: tripId,
    name: 'New Trip',
    currency: TripCurrency.USD,
    status: TripStatus.ACTIVE,
    code: 'ABCDEFGH',
    participants: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  const mockUser: User = {
    id: userId,
    nombre: 'User One',
    email: 'user@example.com',
    passwordHash: 'hash',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const createMockCache = (): jest.Mocked<Cache> =>
    ({
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    }) as unknown as jest.Mocked<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        {
          provide: getRepositoryToken(Trip),
          useValue: createMockRepository<Trip>(),
        },
        {
          provide: getRepositoryToken(TripParticipant),
          useValue: createMockRepository<TripParticipant>(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
        {
          provide: getRepositoryToken(Expense),
          useValue: createMockRepository<Expense>(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: createMockCache(),
        },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    tripRepository = module.get(getRepositoryToken(Trip));
    tripParticipantRepository = module.get(getRepositoryToken(TripParticipant));
    userRepository = module.get(getRepositoryToken(User));
    expenseRepository = module.get(getRepositoryToken(Expense));
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTripDto: CreateTripDto = {
      name: 'New Trip',
      currency: TripCurrency.USD,
      memberEmails: ['friend@example.com'],
    };

    it('should create trip and participants on happy path', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const saveMock = tripRepository.save as jest.Mock;
      saveMock.mockResolvedValueOnce(mockTrip);

      const createTripMock = tripRepository.create as jest.Mock;
      createTripMock.mockImplementation((data: Partial<Trip>) => ({
        ...data,
      }));

      const memberUser: User = {
        id: 'friend-id',
        nombre: 'Friend',
        email: 'friend@example.com',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      (userRepository.find as jest.Mock).mockResolvedValue([memberUser]);
      (tripParticipantRepository.find as jest.Mock).mockResolvedValue([]);

      const createParticipantMock =
        tripParticipantRepository.create as jest.Mock;
      createParticipantMock.mockImplementation(
        (data: Partial<TripParticipant>) => ({ ...data }),
      );

      (tripParticipantRepository.save as jest.Mock).mockResolvedValue(null);

      const result = await service.create(createTripDto, userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId, deletedAt: IsNull() },
      });
      expect(tripRepository.save).toHaveBeenCalled();
      expect(tripParticipantRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(mockTrip.id);
      expect(result.name).toBe(createTripDto.name);
      expect(result.currency).toBe(createTripDto.currency);
    });

    it('should throw NotFoundException when creator user does not exist', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.create(createTripDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createTripDto, userId)).rejects.toThrow(
        'Usuario no encontrado',
      );
      expect(tripRepository.save).not.toHaveBeenCalled();
    });

    it('should retry on unique code violation and eventually succeed', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const duplicateError = {
        driverError: { code: '23505' },
      };
      const saveMock = tripRepository.save as jest.Mock;
      saveMock
        .mockRejectedValueOnce(duplicateError)
        .mockResolvedValueOnce(mockTrip);

      (userRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.create({ name: 'Trip With Retry' }, userId);

      expect(tripRepository.save).toHaveBeenCalledTimes(2);
      expect(result.id).toBe(mockTrip.id);
    });

    it('should throw ConflictException when cannot generate unique code', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const duplicateError = { driverError: { code: '23505' } };
      (tripRepository.save as jest.Mock).mockRejectedValue(duplicateError);

      await expect(
        service.create({ name: 'Trip Fails' }, userId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllByUser', () => {
    it('should return list of TripListItemDto with totals and roles', async () => {
      const qb: any = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn().mockResolvedValue({
          raw: [
            {
              trip_id: tripId,
              participantCount: '2',
              userRole: ParticipantRole.CREATOR,
            },
          ],
          entities: [mockTrip],
        }),
      };

      (tripRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const expenseQb: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ tripId, total: '100.50' }]),
      };

      (expenseRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        expenseQb,
      );

      const queryDto: TripListQueryDto = {};

      const result = await service.findAllByUser(userId, queryDto);

      expect(tripRepository.createQueryBuilder).toHaveBeenCalled();
      expect(expenseRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      const firstTrip = result[0]!;
      expect(firstTrip.id).toBe(tripId);
      expect(firstTrip.participantCount).toBe(2);
      expect(firstTrip.totalAmount).toBe(100.5);
      expect(firstTrip.userRole).toBe(ParticipantRole.CREATOR);
    });
  });

  describe('joinByCode', () => {
    it('should allow user to join active trip and invalidate cache', async () => {
      const activeTrip: Trip = { ...mockTrip, status: TripStatus.ACTIVE };
      (tripRepository.findOne as jest.Mock).mockResolvedValue(activeTrip);
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue(null);
      (tripParticipantRepository.create as jest.Mock).mockImplementation(
        (data: Partial<TripParticipant>) => ({ ...data }),
      );
      (tripParticipantRepository.save as jest.Mock).mockResolvedValue(null);
      (tripParticipantRepository.find as jest.Mock).mockResolvedValue([
        { userId } as TripParticipant,
      ]);
      (cacheManager.del as jest.Mock).mockResolvedValue(undefined);

      const result = await service.joinByCode('ABCDEFGH', userId);

      expect(result).toBe(activeTrip);
      expect(tripParticipantRepository.save).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalled();
    });

    it('should throw NotFoundException when trip not found or not active', async () => {
      (tripRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.joinByCode('INVALID', userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.joinByCode('INVALID', userId)).rejects.toThrow(
        'El viaje no existe o está cerrado',
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      (tripRepository.findOne as jest.Mock).mockResolvedValue(mockTrip);
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.joinByCode('ABCDEFGH', userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.joinByCode('ABCDEFGH', userId)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('should throw ConflictException when user already participant', async () => {
      (tripRepository.findOne as jest.Mock).mockResolvedValue(mockTrip);
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue(
        {} as TripParticipant,
      );

      await expect(service.joinByCode('ABCDEFGH', userId)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.joinByCode('ABCDEFGH', userId)).rejects.toThrow(
        'Ya eres participante de este viaje',
      );
    });
  });

  describe('findOneById', () => {
    it('should throw BadRequestException when tripId is not a valid UUID', async () => {
      await expect(service.findOneById('not-a-uuid', userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOneById('not-a-uuid', userId)).rejects.toThrow(
        'ID de viaje inválido',
      );
    });

    it('should return cached value when cache hit', async () => {
      const cachedValue = {
        trip: mockTrip,
        paginationMeta: {
          total: 1,
          page: 1,
          limit: 20,
          hasMore: false,
        },
        userRole: ParticipantRole.CREATOR,
        totalAmount: 50,
      };
      (cacheManager.get as jest.Mock).mockResolvedValue(cachedValue);

      const result = await service.findOneById(
        '123e4567-e89b-12d3-a456-426614174000',
        userId,
      );

      expect(result).toBe(cachedValue);
      expect(tripParticipantRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not participant', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findOneById('123e4567-e89b-12d3-a456-426614174000', userId),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.findOneById('123e4567-e89b-12d3-a456-426614174000', userId),
      ).rejects.toThrow('No tienes acceso a este viaje');
    });

    it('should throw NotFoundException when trip does not exist', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue({
        role: ParticipantRole.CREATOR,
      } as TripParticipant);
      (tripRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findOneById('123e4567-e89b-12d3-a456-426614174000', userId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findOneById('123e4567-e89b-12d3-a456-426614174000', userId),
      ).rejects.toThrow('Viaje no encontrado');
    });
  });

  describe('update', () => {
    const updateTripDto: UpdateTripDto = {
      name: 'Updated Trip',
      status: TripStatus.CLOSED,
    };

    it('should throw BadRequestException when tripId is invalid UUID', async () => {
      await expect(
        service.update('not-a-uuid', userId, updateTripDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update('not-a-uuid', userId, updateTripDto),
      ).rejects.toThrow('ID de viaje inválido');
    });

    it('should throw NotFoundException when trip does not exist', async () => {
      (tripRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update(
          '123e4567-e89b-12d3-a456-426614174000',
          userId,
          updateTripDto,
        ),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update(
          '123e4567-e89b-12d3-a456-426614174000',
          userId,
          updateTripDto,
        ),
      ).rejects.toThrow('Viaje no encontrado');
    });

    it('should throw ForbiddenException when user is not participant', async () => {
      (tripRepository.findOne as jest.Mock).mockResolvedValue(mockTrip);
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update(
          '123e4567-e89b-12d3-a456-426614174000',
          userId,
          updateTripDto,
        ),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update(
          '123e4567-e89b-12d3-a456-426614174000',
          userId,
          updateTripDto,
        ),
      ).rejects.toThrow('No tienes acceso a este viaje');
    });

    it('should throw ForbiddenException when user is not CREATOR', async () => {
      (tripRepository.findOne as jest.Mock).mockResolvedValue(mockTrip);
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue({
        role: ParticipantRole.MEMBER,
      } as TripParticipant);

      await expect(
        service.update(
          '123e4567-e89b-12d3-a456-426614174000',
          userId,
          updateTripDto,
        ),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update(
          '123e4567-e89b-12d3-a456-426614174000',
          userId,
          updateTripDto,
        ),
      ).rejects.toThrow(
        'Solo el creador del viaje puede actualizar su configuración',
      );
    });
  });
});
