import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository, IsNull, ObjectLiteral } from 'typeorm';
import { ExpensesService } from './expenses.service';
import { Expense } from '../entities/expense.entity';
import { ExpenseSplit } from '../entities/expense-split.entity';
import { ExpenseCategory } from '../entities/expense-category.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { TripParticipant } from '../../trips/entities/trip-participant.entity';
import { TripStatus } from '../../trips/enums/trip-status.enum';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { ExpenseListQueryDto } from '../dto/expense-list-query.dto';

type MockRepo<T extends ObjectLiteral> = jest.Mocked<Partial<Repository<T>>>;

const createMockRepository = <T extends ObjectLiteral>(): MockRepo<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const createMockDataSource = () =>
  ({
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: { save: jest.fn() },
    })),
  }) as unknown as DataSource;

describe('ExpensesService', () => {
  let service: ExpensesService;
  let expenseRepository: MockRepo<Expense>;
  let expenseSplitRepository: MockRepo<ExpenseSplit>;
  let expenseCategoryRepository: MockRepo<ExpenseCategory>;
  let tripRepository: MockRepo<Trip>;
  let tripParticipantRepository: MockRepo<TripParticipant>;
  let dataSource: DataSource;

  const tripId = 'trip-id-1';
  const userId = 'user-id-1';
  const otherUserId = 'user-id-2';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getRepositoryToken(Expense),
          useValue: createMockRepository<Expense>(),
        },
        {
          provide: getRepositoryToken(ExpenseSplit),
          useValue: createMockRepository<ExpenseSplit>(),
        },
        {
          provide: getRepositoryToken(ExpenseCategory),
          useValue: createMockRepository<ExpenseCategory>(),
        },
        {
          provide: getRepositoryToken(Trip),
          useValue: createMockRepository<Trip>(),
        },
        {
          provide: getRepositoryToken(TripParticipant),
          useValue: createMockRepository<TripParticipant>(),
        },
        {
          provide: DataSource,
          useValue: createMockDataSource(),
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    expenseRepository = module.get(getRepositoryToken(Expense));
    expenseSplitRepository = module.get(getRepositoryToken(ExpenseSplit));
    expenseCategoryRepository = module.get(getRepositoryToken(ExpenseCategory));
    tripRepository = module.get(getRepositoryToken(Trip));
    tripParticipantRepository = module.get(getRepositoryToken(TripParticipant));
    dataSource = module.get(DataSource);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const baseCreateDto: CreateExpenseDto = {
      title: 'Cena',
      amount: 100,
      category_id: 1,
      expense_date: '2024-01-01',
      receipt_url: undefined,
      beneficiaries: [
        { user_id: userId },
        { user_id: otherUserId, amount_owed: 60 },
      ],
    };

    it('should create expense and splits on happy path', async () => {
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue({
        tripId,
        userId,
      } as TripParticipant);

      (tripRepository.findOne as jest.Mock).mockResolvedValue({
        id: tripId,
        status: TripStatus.ACTIVE,
      } as Trip);

      (expenseCategoryRepository.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        isActive: true,
      } as ExpenseCategory);

      (tripParticipantRepository.find as jest.Mock).mockResolvedValue([
        { userId } as TripParticipant,
        { userId: otherUserId } as TripParticipant,
      ]);

      const queryRunner = dataSource.createQueryRunner();
      (dataSource.createQueryRunner as jest.Mock).mockReturnValue(queryRunner);
      const savedExpense = {
        id: 'expense-id-1',
        tripId,
        payerId: userId,
        categoryId: 1,
        title: baseCreateDto.title,
        amount: baseCreateDto.amount,
        receiptUrl: null,
        expenseDate: new Date(baseCreateDto.expense_date),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        trip: { id: tripId } as Trip,
        payer: { id: userId } as any,
        category: { id: 1 } as ExpenseCategory,
        splits: [] as ExpenseSplit[],
      } as Expense;

      (expenseRepository.create as jest.Mock).mockImplementation(
        (data: Partial<Expense>) => ({ ...data }),
      );
      (queryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce(savedExpense)
        .mockResolvedValueOnce(undefined);

      (expenseSplitRepository.create as jest.Mock).mockImplementation(
        (data: Partial<ExpenseSplit>) => ({ ...data }),
      );

      (expenseRepository.findOne as jest.Mock).mockResolvedValue({
        ...savedExpense,
        splits: [
          {
            userId,
            amountOwed: 40,
          } as ExpenseSplit,
          {
            userId: otherUserId,
            amountOwed: 60,
          } as ExpenseSplit,
        ],
        category: {
          id: 1,
          name: 'Comida',
        } as ExpenseCategory,
      } as Expense);

      const result = await service.create(tripId, userId, baseCreateDto);

      expect(tripParticipantRepository.findOne).toHaveBeenCalledWith({
        where: { tripId, userId, deletedAt: IsNull() },
      });
      expect(tripRepository.findOne).toHaveBeenCalled();
      expect(expenseCategoryRepository.findOne).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.trip_id).toBe(tripId);
      expect(result.amount).toBe(baseCreateDto.amount);
      expect(result.beneficiaries).toHaveLength(2);
    });

    it('should throw ForbiddenException when user is not participant', async () => {
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create(tripId, userId, baseCreateDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.create(tripId, userId, baseCreateDto),
      ).rejects.toThrow('No eres participante de este viaje');
    });

    it('should throw BadRequestException when any beneficiary is not participant', async () => {
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue({
        tripId,
        userId,
      } as TripParticipant);
      (tripRepository.findOne as jest.Mock).mockResolvedValue({
        id: tripId,
        status: TripStatus.ACTIVE,
      } as Trip);
      (expenseCategoryRepository.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        isActive: true,
      } as ExpenseCategory);

      (tripParticipantRepository.find as jest.Mock).mockResolvedValue([
        { userId } as TripParticipant,
      ]);

      await expect(
        service.create(tripId, userId, baseCreateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllByTrip', () => {
    it('should throw ForbiddenException when user is not participant', async () => {
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue(null);

      const query: ExpenseListQueryDto = {};

      await expect(
        service.findAllByTrip(tripId, userId, query),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.findAllByTrip(tripId, userId, query),
      ).rejects.toThrow('No eres participante de este viaje');
    });

    it('should return paginated expenses for participant user', async () => {
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue({
        tripId,
        userId,
      } as TripParticipant);
      (tripRepository.findOne as jest.Mock).mockResolvedValue({
        id: tripId,
      } as Trip);

      const countQb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };
      const listQb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'expense-1',
            tripId,
            payerId: userId,
            categoryId: 1,
            title: 'Cena',
            amount: 100,
            receiptUrl: null,
            expenseDate: new Date('2024-01-01'),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            splits: [],
            category: { id: 1, name: 'Comida' } as ExpenseCategory,
          } as unknown as Expense,
        ]),
      };

      (expenseRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(countQb)
        .mockReturnValueOnce(listQb);

      const query: ExpenseListQueryDto = { page: 1, limit: 10 };

      const result = await service.findAllByTrip(tripId, userId, query);

      expect(result.meta.total).toBe(1);
      expect(result.expenses).toHaveLength(1);

      const firstExpense = result.expenses[0];
      if (!firstExpense) {
        throw new Error('Expected at least one expense in result.expenses');
      }

      expect(firstExpense.trip_id).toBe(tripId);
    });
  });

  describe('findOneById', () => {
    it('should throw BadRequestException when UUIDs are invalid', async () => {
      await expect(
        service.findOneById('not-uuid', 'not-uuid', userId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.findOneById('not-uuid', 'not-uuid', userId),
      ).rejects.toThrow('ID de viaje o gasto inválido');
    });

    it('should throw ForbiddenException when user is not participant', async () => {
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findOneById(
          '123e4567-e89b-12d3-a456-426614174000',
          '223e4567-e89b-12d3-a456-426614174000',
          userId,
        ),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.findOneById(
          '123e4567-e89b-12d3-a456-426614174000',
          '223e4567-e89b-12d3-a456-426614174000',
          userId,
        ),
      ).rejects.toThrow('No eres participante de este viaje');
    });

    it('should throw NotFoundException when expense does not exist', async () => {
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue({
        tripId,
        userId,
      } as TripParticipant);
      (tripRepository.findOne as jest.Mock).mockResolvedValue({
        id: tripId,
      } as Trip);
      (expenseRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findOneById(
          '123e4567-e89b-12d3-a456-426614174000',
          '223e4567-e89b-12d3-a456-426614174000',
          userId,
        ),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findOneById(
          '123e4567-e89b-12d3-a456-426614174000',
          '223e4567-e89b-12d3-a456-426614174000',
          userId,
        ),
      ).rejects.toThrow('El gasto no existe o no pertenece a este viaje');
    });
  });
});
