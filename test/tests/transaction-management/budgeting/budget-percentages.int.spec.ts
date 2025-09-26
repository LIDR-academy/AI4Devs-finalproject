import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionService } from '../../../../backend/src/application/services/transaction.service';
import { Transaction } from '../../../../backend/src/domain/entities/transaction.entity';
import { Category, CategoryFlow } from '../../../../backend/src/domain/entities/category.entity';
import { MockUserService } from '../../../../backend/src/domain/services/mock-user.service';
import { TransactionEvaluatorService } from '../../../../backend/src/domain/services/transaction-evaluator.service';
import { BudgetPercentagesDto } from '../../../../backend/src/application/dto/budget-percentages.dto';

describe('TransactionService Budget Percentages Integration Tests', () => {
  let service: TransactionService;
  let transactionRepository: Repository<Transaction>;
  let categoryRepository: Repository<Category>;
  let mockUserService: MockUserService;
  let transactionEvaluatorService: TransactionEvaluatorService;

  const mockTransactionRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockCategoryRepository = {
    findOne: jest.fn(),
  };

  const mockUserServiceInstance = {
    getCurrentUserId: jest.fn(),
  };

  const mockTransactionEvaluatorService = {
    evaluate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: MockUserService,
          useValue: mockUserServiceInstance,
        },
        {
          provide: TransactionEvaluatorService,
          useValue: mockTransactionEvaluatorService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    mockUserService = module.get<MockUserService>(MockUserService);
    transactionEvaluatorService = module.get<TransactionEvaluatorService>(TransactionEvaluatorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBudgetPercentages', () => {
    it('should return empty percentages when no transactions exist', async () => {
      // Arrange
      const userId = 'test-user-id';
      mockUserServiceInstance.getCurrentUserId.mockReturnValue(userId);
      
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getBudgetPercentages();

      // Assert
      expect(mockTransactionRepository.createQueryBuilder).toHaveBeenCalledWith('transaction');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('transaction.category', 'category');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('transaction.userId = :userId', { userId });
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      
      expect(result).toEqual({
        categoryPercentages: [],
        flowPercentages: [],
        totalAmount: 0
      });
    });

    it('should calculate percentages correctly for multiple transactions', async () => {
      // Arrange
      const userId = 'test-user-id';
      mockUserServiceInstance.getCurrentUserId.mockReturnValue(userId);

      // Create mock categories
      const salaryCategory = new Category('Salary', CategoryFlow.INCOME, '#10B981');
      salaryCategory.id = 'salary-id';
      
      const rentCategory = new Category('Rent', CategoryFlow.EXPENSE, '#EF4444');
      rentCategory.id = 'rent-id';
      
      const savingsCategory = new Category('Savings', CategoryFlow.SAVINGS_AND_INVESTMENTS, '#6366F1');
      savingsCategory.id = 'savings-id';

      // Create mock transactions
      const transactions = [
        {
          id: 'trans-1',
          description: 'Salary',
          expression: '3000',
          category: salaryCategory,
          categoryId: 'salary-id',
          userId,
        },
        {
          id: 'trans-2',
          description: 'Rent',
          expression: '1200',
          category: rentCategory,
          categoryId: 'rent-id',
          userId,
        },
        {
          id: 'trans-3',
          description: 'Savings',
          expression: '500',
          category: savingsCategory,
          categoryId: 'savings-id',
          userId,
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(transactions),
      };
      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock transaction evaluations (normalized monthly amounts)
      mockTransactionEvaluatorService.evaluate
        .mockResolvedValueOnce({ type: 'income', normalizedAmount: 3000 }) // Salary
        .mockResolvedValueOnce({ type: 'expense', normalizedAmount: -1200 }) // Rent
        .mockResolvedValueOnce({ type: 's&i', normalizedAmount: 500 }); // Savings

      // Act
      const result = await service.getBudgetPercentages();

      // Assert
      expect(result.totalAmount).toBe(4700); // 3000 + 1200 + 500
      
      // Check category percentages
      expect(result.categoryPercentages).toHaveLength(3);
      expect(result.categoryPercentages[0]).toEqual({
        categoryId: 'salary-id',
        categoryName: 'Salary',
        categoryColor: '#10B981',
        flow: CategoryFlow.INCOME,
        percentage: 63.8, // 3000/4700 * 100
        amount: 3000
      });
      expect(result.categoryPercentages[1]).toEqual({
        categoryId: 'rent-id',
        categoryName: 'Rent',
        categoryColor: '#EF4444',
        flow: CategoryFlow.EXPENSE,
        percentage: 25.5, // 1200/4700 * 100
        amount: 1200
      });
      expect(result.categoryPercentages[2]).toEqual({
        categoryId: 'savings-id',
        categoryName: 'Savings',
        categoryColor: '#6366F1',
        flow: CategoryFlow.SAVINGS_AND_INVESTMENTS,
        percentage: 10.6, // 500/4700 * 100
        amount: 500
      });

      // Check flow percentages
      expect(result.flowPercentages).toHaveLength(3);
      expect(result.flowPercentages[0]).toEqual({
        flow: CategoryFlow.INCOME,
        percentage: 63.8,
        amount: 3000
      });
      expect(result.flowPercentages[1]).toEqual({
        flow: CategoryFlow.EXPENSE,
        percentage: 25.5,
        amount: 1200
      });
      expect(result.flowPercentages[2]).toEqual({
        flow: CategoryFlow.SAVINGS_AND_INVESTMENTS,
        percentage: 10.6,
        amount: 500
      });
    });

    it('should handle transactions with zero amounts', async () => {
      // Arrange
      const userId = 'test-user-id';
      mockUserServiceInstance.getCurrentUserId.mockReturnValue(userId);

      const salaryCategory = new Category('Salary', CategoryFlow.INCOME, '#10B981');
      salaryCategory.id = 'salary-id';

      const transactions = [
        {
          id: 'trans-1',
          description: 'Salary',
          expression: '3000',
          category: salaryCategory,
          categoryId: 'salary-id',
          userId,
        },
        {
          id: 'trans-2',
          description: 'Zero Transaction',
          expression: '0',
          category: salaryCategory,
          categoryId: 'salary-id',
          userId,
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(transactions),
      };
      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock transaction evaluations
      mockTransactionEvaluatorService.evaluate
        .mockResolvedValueOnce({ type: 'income', normalizedAmount: 3000 }) // Salary
        .mockResolvedValueOnce({ type: 'income', normalizedAmount: 0 }); // Zero transaction

      // Act
      const result = await service.getBudgetPercentages();

      // Assert
      expect(result.totalAmount).toBe(3000); // Only non-zero amounts count
      expect(result.categoryPercentages).toHaveLength(1);
      expect(result.categoryPercentages[0].percentage).toBe(100); // 3000/3000 * 100
    });

    it('should sort categories and flows by amount descending', async () => {
      // Arrange
      const userId = 'test-user-id';
      mockUserServiceInstance.getCurrentUserId.mockReturnValue(userId);

      const smallCategory = new Category('Small', CategoryFlow.INCOME, '#10B981');
      smallCategory.id = 'small-id';
      
      const largeCategory = new Category('Large', CategoryFlow.INCOME, '#10B981');
      largeCategory.id = 'large-id';

      const transactions = [
        {
          id: 'trans-1',
          description: 'Small',
          expression: '100',
          category: smallCategory,
          categoryId: 'small-id',
          userId,
        },
        {
          id: 'trans-2',
          description: 'Large',
          expression: '1000',
          category: largeCategory,
          categoryId: 'large-id',
          userId,
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(transactions),
      };
      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      mockTransactionEvaluatorService.evaluate
        .mockResolvedValueOnce({ type: 'income', normalizedAmount: 100 })
        .mockResolvedValueOnce({ type: 'income', normalizedAmount: 1000 });

      // Act
      const result = await service.getBudgetPercentages();

      // Assert
      expect(result.categoryPercentages[0].categoryName).toBe('Large'); // Higher amount first
      expect(result.categoryPercentages[1].categoryName).toBe('Small');
      expect(result.categoryPercentages[0].amount).toBe(1000);
      expect(result.categoryPercentages[1].amount).toBe(100);
    });
  });
});
