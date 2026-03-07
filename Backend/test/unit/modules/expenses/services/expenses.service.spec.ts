import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fc from 'fast-check';
import { ExpensesService } from '../../../../../src/modules/expenses/services/expenses.service';
import { Expense } from '../../../../../src/modules/expenses/entities/expense.entity';
import { ExpenseSplit } from '../../../../../src/modules/expenses/entities/expense-split.entity';
import { ExpenseCategory } from '../../../../../src/modules/expenses/entities/expense-category.entity';
import { Trip } from '../../../../../src/modules/trips/entities/trip.entity';
import { TripParticipant } from '../../../../../src/modules/trips/entities/trip-participant.entity';

const createMockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  softRemove: jest.fn(),
});

const createMockDataSource = () => ({
  createQueryRunner: jest.fn(() => ({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: { save: jest.fn() },
  })),
});

describe('ExpensesService', () => {
  let service: ExpensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: getRepositoryToken(Expense), useValue: createMockRepository() },
        {
          provide: getRepositoryToken(ExpenseSplit),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(ExpenseCategory),
          useValue: createMockRepository(),
        },
        { provide: getRepositoryToken(Trip), useValue: createMockRepository() },
        {
          provide: getRepositoryToken(TripParticipant),
          useValue: createMockRepository(),
        },
        { provide: DataSource, useValue: createMockDataSource() },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    jest.clearAllMocks();
  });

  describe('calculateFairShare (property-based)', () => {
    /**
     * Property: Two-decimal precision.
     * For any total_amount and beneficiary_count > 0, the returned value
     * has at most two decimal places (i.e. result * 100 is an integer within float tolerance).
     */
    it('should always return a value with at most two decimal places', () => {
      const totalAmountArb = fc.double({
        min: 0.01,
        max: 1_000_000,
        noNaN: true,
      });
      const beneficiaryCountArb = fc.integer({ min: 1, max: 1000 });

      /** Epsilon for float rounding (result * 100 may not be exactly integer in IEEE 754). */
      const FLOAT_TOLERANCE = 1e-6;

      fc.assert(
        fc.property(totalAmountArb, beneficiaryCountArb, (total_amount, beneficiary_count) => {
          const result = (
            service as unknown as { calculateFairShare: (a: number, b: number) => number }
          ).calculateFairShare(total_amount, beneficiary_count);
          const cents = result * 100;
          const roundedCents = Math.round(cents);
          const hasAtMostTwoDecimals = Math.abs(cents - roundedCents) < FLOAT_TOLERANCE;
          expect(hasAtMostTwoDecimals).toBe(true);
        }),
        { numRuns: 500 },
      );
    });
  });
});
