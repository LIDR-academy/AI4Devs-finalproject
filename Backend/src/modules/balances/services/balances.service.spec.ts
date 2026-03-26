import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BalancesService } from './balances.service';
import { Expense } from '../../expenses/entities/expense.entity';
import { ExpenseSplit } from '../../expenses/entities/expense-split.entity';
import { TripParticipant } from '../../trips/entities/trip-participant.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { ParticipantBalanceDto } from '../dto/participant-balance.dto';

type MockRepo<T> = jest.Mocked<Partial<Repository<T>>>;

const createMockRepository = <T>(): MockRepo<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('BalancesService', () => {
  let service: BalancesService;
  let expenseRepository: MockRepo<Expense>;
  let expenseSplitRepository: MockRepo<ExpenseSplit>;
  let tripParticipantRepository: MockRepo<TripParticipant>;
  let tripRepository: MockRepo<Trip>;

  const tripId = 'trip-id-1';
  const userId = 'user-id-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalancesService,
        {
          provide: getRepositoryToken(Expense),
          useValue: createMockRepository<Expense>(),
        },
        {
          provide: getRepositoryToken(ExpenseSplit),
          useValue: createMockRepository<ExpenseSplit>(),
        },
        {
          provide: getRepositoryToken(TripParticipant),
          useValue: createMockRepository<TripParticipant>(),
        },
        {
          provide: getRepositoryToken(Trip),
          useValue: createMockRepository<Trip>(),
        },
      ],
    }).compile();

    service = module.get<BalancesService>(BalancesService);
    expenseRepository = module.get(getRepositoryToken(Expense));
    expenseSplitRepository = module.get(getRepositoryToken(ExpenseSplit));
    tripParticipantRepository = module.get(getRepositoryToken(TripParticipant));
    tripRepository = module.get(getRepositoryToken(Trip));

    jest.clearAllMocks();
  });

  describe('calculateBalances', () => {
    it('should throw ForbiddenException when user is not participant', async () => {
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.calculateBalances(tripId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.calculateBalances(tripId, userId)).rejects.toThrow(
        'No eres participante de este viaje',
      );
    });

    it('should throw NotFoundException when trip does not exist', async () => {
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue({
        tripId,
        userId,
      } as TripParticipant);
      (tripRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.calculateBalances(tripId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.calculateBalances(tripId, userId)).rejects.toThrow(
        'El viaje no existe',
      );
    });

    it('should return zero balances when there are no participants', async () => {
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue({
        tripId,
        userId,
      } as TripParticipant);
      (tripRepository.findOne as jest.Mock).mockResolvedValue({
        id: tripId,
      } as Trip);
      (tripParticipantRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.calculateBalances(tripId, userId);

      expect(result.trip_id).toBe(tripId);
      expect(result.total_expenses).toBe(0);
      expect(result.participant_count).toBe(0);
      expect(result.balances).toHaveLength(0);
    });

    it('should calculate balances correctly for participants', async () => {
      (tripParticipantRepository.findOne as jest.Mock).mockResolvedValue({
        tripId,
        userId,
      } as TripParticipant);
      (tripRepository.findOne as jest.Mock).mockResolvedValue({
        id: tripId,
      } as Trip);

      (tripParticipantRepository.find as jest.Mock).mockResolvedValue([
        {
          id: 'tp-1',
          tripId,
          userId,
          user: {
            id: userId,
            nombre: 'User One',
            email: 'user1@example.com',
          },
        } as unknown as TripParticipant,
        {
          id: 'tp-2',
          tripId,
          userId: 'user-id-2',
          user: {
            id: 'user-id-2',
            nombre: 'User Two',
            email: 'user2@example.com',
          },
        } as unknown as TripParticipant,
      ]);

      const totalQb: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '150.00' }),
      };
      const spentQb: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { user_id: userId, total_spent: '100.00' },
          { user_id: 'user-id-2', total_spent: '50.00' },
        ]),
      };
      const owedQb: any = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { user_id: userId, total_owed: '30.00' },
          { user_id: 'user-id-2', total_owed: '120.00' },
        ]),
      };

      (expenseRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(totalQb)
        .mockReturnValueOnce(spentQb);
      (expenseSplitRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        owedQb,
      );

      const result = await service.calculateBalances(tripId, userId);

      expect(result.total_expenses).toBe(150);
      expect(result.participant_count).toBe(2);
      expect(result.balances).toHaveLength(2);

      const user1 = result.balances.find((b) => b.user_id === userId);
      const user2 = result.balances.find((b) => b.user_id === 'user-id-2');

      expect(user1?.total_spent).toBe(100);
      expect(user1?.total_owed).toBe(30);
      expect(user1?.balance).toBe(70);

      expect(user2?.total_spent).toBe(50);
      expect(user2?.total_owed).toBe(120);
      expect(user2?.balance).toBe(-70);
    });
  });

  describe('settleBalances', () => {
    it('should return empty transactions when all balances are zero', async () => {
      const balancesZero: ParticipantBalanceDto[] = [
        {
          user_id: userId,
          user_name: 'User One',
          user_email: 'user1@example.com',
          total_spent: 0,
          total_owed: 0,
          balance: 0,
        },
      ];

      const spy = jest.spyOn(service, 'calculateBalances').mockResolvedValue({
        trip_id: tripId,
        total_expenses: 0,
        participant_count: 1,
        balances: balancesZero,
      });

      const result = await service.settleBalances(tripId, userId);

      expect(spy).toHaveBeenCalled();
      expect(result.transactions).toHaveLength(0);
      expect(result.total_transactions).toBe(0);
    });

    it('should create transactions to settle positive and negative balances', async () => {
      const balances: ParticipantBalanceDto[] = [
        {
          user_id: userId,
          user_name: 'User One',
          user_email: 'user1@example.com',
          total_spent: 100,
          total_owed: 30,
          balance: 70,
        },
        {
          user_id: 'user-id-2',
          user_name: 'User Two',
          user_email: 'user2@example.com',
          total_spent: 50,
          total_owed: 120,
          balance: -70,
        },
      ];

      jest.spyOn(service, 'calculateBalances').mockResolvedValue({
        trip_id: tripId,
        total_expenses: 150,
        participant_count: 2,
        balances,
      });

      const result = await service.settleBalances(tripId, userId);

      expect(result.transactions).toHaveLength(1);
      expect(result.total_transactions).toBe(1);

      const transaction = result.transactions[0];
      expect(transaction.from_user_id).toBe('user-id-2');
      expect(transaction.to_user_id).toBe(userId);
      expect(transaction.amount).toBe(70);
    });
  });
});
