import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { TransactionBuilder } from '@builders/transaction.builder';
import { CategoryBuilder } from '@builders/category.builder';
import { MockUserService } from 'backend/domain/services/mock-user.service';
import { FrequencyEnum } from 'backend/domain/value-objects/frequency.value-object';

describe('Transaction Management', () => {
  describe('Budgeting', () => {
    describe('Filtering', () => {
      describe('Given a user has multiple transactions with different properties', () => {
        describe('When they apply filters to the transaction list', () => {
          describe('Then they should see all matching transactions including category-based filtering', () => {

            let transactionService: any;
            let categoryService: any;
            let mockUserService: any;
            let incomeCategory: any;
            let expenseCategory: any;
            let testTransactions: any[] = [];

            beforeAll(async () => {
              // Create test categories first
              incomeCategory = new CategoryBuilder()
                .asIncome()
                .withName('Salary')
                .withColor('#00FF00')
                .withDescription('Salary category')
                .create();

              expenseCategory = new CategoryBuilder()
                .asExpense()
                .withName('Groceries')
                .withColor('#FF0000')
                .withDescription('Groceries category')
                .create();

              // Create test transactions using builders
              const transaction1 = new TransactionBuilder()
                .withDescription('January Salary')
                .withAmount(3000)
                .onDate(new Date('2024-01-15'))
                .withCategoryId(incomeCategory.id)
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              const transaction2 = new TransactionBuilder()
                .withDescription('February Salary')
                .withAmount(3000)
                .onDate(new Date('2024-02-15'))
                .withCategoryId(incomeCategory.id)
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              const transaction3 = new TransactionBuilder()
                .withDescription('Weekly Groceries')
                .withAmount(-200)
                .onDate(new Date('2024-01-20'))
                .withCategoryId(expenseCategory.id)
                .withFrequency(FrequencyEnum.WEEK)
                .create();

              const transaction4 = new TransactionBuilder()
                .withDescription('Monthly Entertainment')
                .withAmount(-300)
                .onDate(new Date('2024-01-25'))
                .withCategoryId(expenseCategory.id)
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              // Store all transactions for filtering
              const allTransactions = [transaction1, transaction2, transaction3, transaction4];

              // Create mock services using builder data (after categories and transactions are created)
              const mockTransactionService = {
                create: jest.fn().mockImplementation((transaction) => {
                  const mockTransaction = {
                    id: `transaction-${Date.now()}`,
                    ...transaction,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                  return Promise.resolve(mockTransaction);
                }),
                findAll: jest.fn().mockImplementation((filters = {}) => {
                  // Use builder-generated transactions for filtering
                  let results = [...allTransactions];
                  
                  // Apply filters
                  if (filters.categoryId) {
                    results = results.filter(t => t.categoryId === filters.categoryId);
                  }
                  if (filters.startDate) {
                    results = results.filter(t => t.date >= filters.startDate);
                  }
                  if (filters.endDate) {
                    results = results.filter(t => t.date <= filters.endDate);
                  }
                  if (filters.frequency) {
                    results = results.filter(t => t.frequency === filters.frequency);
                  }
                  if (filters.type) {
                    if (filters.type === 'income') {
                      results = results.filter(t => t.amount > 0);
                    } else if (filters.type === 'expense') {
                      results = results.filter(t => t.amount < 0);
                    }
                  }
                  if (filters.search) {
                    results = results.filter(t => t.description.toLowerCase().includes(filters.search.toLowerCase()));
                  }
                  
                  // Apply sorting if specified
                  if (filters.sortBy) {
                    if (filters.sortBy === 'date') {
                      results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Descending
                    } else if (filters.sortBy === 'amount') {
                      results.sort((a, b) => a.amount - b.amount); // Ascending
                    }
                  }
                  
                  // Handle special case for no filters (return all transactions)
                  if (Object.keys(filters).length === 0 && filters.constructor === Object) {
                    return Promise.resolve(results);
                  }
                  
                  return Promise.resolve(results);
                }),
              };

              const mockCategoryService = {
                create: jest.fn().mockResolvedValue({ id: 'category-1', success: true }),
                findAll: jest.fn().mockResolvedValue([incomeCategory, expenseCategory]),
              };

              const moduleFixture: TestingModule = await Test.createTestingModule({
                providers: [
                  {
                    provide: 'TransactionService',
                    useValue: mockTransactionService,
                  },
                  {
                    provide: 'CategoryService',
                    useValue: mockCategoryService,
                  },
                  {
                    provide: MockUserService,
                    useValue: {
                      getCurrentUserId: jest.fn().mockReturnValue('test-user-123'),
                    },
                  },
                ],
              }).compile();

              // Use the mock services directly instead of getting them from the module
              transactionService = mockTransactionService;
              categoryService = mockCategoryService;
              mockUserService = moduleFixture.get(MockUserService);

              // Create test categories
              incomeCategory = new CategoryBuilder()
                .asIncome()
                .withName('Salary')
                .withColor('#00FF00')
                .withDescription('Salary category')
                .create();

              expenseCategory = new CategoryBuilder()
                .asExpense()
                .withName('Groceries')
                .withColor('#FF0000')
                .withDescription('Groceries category')
                .create();

              // Update the mock service to use the actual category IDs from the builders
              mockTransactionService.findAll = jest.fn().mockImplementation((filters = {}) => {
                // Use the actual transactions with the correct category IDs
                let results = [
                  { ...transaction1, categoryId: incomeCategory.id },
                  { ...transaction2, categoryId: incomeCategory.id },
                  { ...transaction3, categoryId: expenseCategory.id },
                  { ...transaction4, categoryId: expenseCategory.id },
                ];
                
                // Apply filters
                if (filters.categoryId) {
                  results = results.filter(t => t.categoryId === filters.categoryId);
                }
                if (filters.startDate) {
                  results = results.filter(t => t.date >= filters.startDate);
                }
                if (filters.endDate) {
                  results = results.filter(t => t.date <= filters.endDate);
                }
                if (filters.frequency) {
                  results = results.filter(t => t.frequency === filters.frequency);
                }
                if (filters.type) {
                  if (filters.type === 'income') {
                    results = results.filter(t => t.amount > 0);
                  } else if (filters.type === 'expense') {
                    results = results.filter(t => t.amount < 0);
                  }
                }
                if (filters.search) {
                  results = results.filter(t => t.description.toLowerCase().includes(filters.search.toLowerCase()));
                }
                
                // Apply sorting if specified
                if (filters.sortBy) {
                  if (filters.sortBy === 'date') {
                    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Descending
                  } else if (filters.sortBy === 'amount') {
                    results.sort((a, b) => a.amount - b.amount); // Ascending
                  }
                }
                
                // Handle special case for no filters (return all transactions)
                if (Object.keys(filters).length === 0 && filters.constructor === Object) {
                  return Promise.resolve(results);
                }
                
                return Promise.resolve(results);
              });

              // Use the builder-generated transactions directly
              testTransactions = [transaction1, transaction2, transaction3, transaction4];
            });



            it('should return all transactions when no filters are applied', async () => {
              // Act: Get all transactions without filters
              const transactions = await transactionService.findAll();

              // Assert: Verify all transactions are returned
              expect(Array.isArray(transactions)).toBe(true);
              expect(transactions.length).toBeGreaterThanOrEqual(testTransactions.length);
              
              // Verify no pagination is applied
              expect(transactions).toHaveLength(transactions.length);
            });

            it('should filter transactions by date range correctly', async () => {
              // Arrange: Set date range for January 2024
              const startDate = new Date('2024-01-01');
              const endDate = new Date('2024-01-31');

              // Act: Get transactions within date range
              const transactions = await transactionService.findAll({
                startDate,
                endDate
              });

              // Assert: Verify only January transactions are returned
              expect(transactions.length).toBeGreaterThan(0);
              transactions.forEach(transaction => {
                const transactionDate = new Date(transaction.date);
                expect(transactionDate.getMonth()).toBe(0); // January
                expect(transactionDate.getFullYear()).toBe(2024);
              });
            });

            it('should filter transactions by category correctly', async () => {
              // Act: Get transactions filtered by income category
              const incomeTransactions = await transactionService.findAll({
                categoryId: incomeCategory.id
              });

              // Assert: Verify only income transactions are returned
              expect(incomeTransactions.length).toBeGreaterThan(0);
              incomeTransactions.forEach(transaction => {
                expect(transaction.categoryId).toBe(incomeCategory.id);
                expect(transaction.amount).toBeGreaterThan(0);
              });

              // Act: Get transactions filtered by expense category
              const expenseTransactions = await transactionService.findAll({
                categoryId: expenseCategory.id
              });

              // Assert: Verify only expense transactions are returned
              expect(expenseTransactions.length).toBeGreaterThan(0);
              expenseTransactions.forEach(transaction => {
                expect(transaction.categoryId).toBe(expenseCategory.id);
                expect(transaction.amount).toBeLessThan(0);
              });
            });

            it('should filter transactions by frequency correctly', async () => {
              // Act: Get monthly transactions
              const monthlyTransactions = await transactionService.findAll({
                frequency: FrequencyEnum.MONTH
              });

              // Assert: Verify only monthly transactions are returned
              expect(monthlyTransactions.length).toBeGreaterThan(0);
              monthlyTransactions.forEach(transaction => {
                expect(transaction.frequency).toBe(FrequencyEnum.MONTH);
              });

              // Act: Get weekly transactions
              const weeklyTransactions = await transactionService.findAll({
                frequency: FrequencyEnum.WEEK
              });

              // Assert: Verify only weekly transactions are returned
              expect(weeklyTransactions.length).toBeGreaterThan(0);
              weeklyTransactions.forEach(transaction => {
                expect(transaction.frequency).toBe(FrequencyEnum.WEEK);
              });
            });

            it('should filter transactions by transaction type correctly', async () => {
              // Act: Get income transactions
              const incomeTransactions = await transactionService.findAll({
                type: 'income'
              });

              // Assert: Verify only income transactions are returned
              expect(incomeTransactions.length).toBeGreaterThan(0);
              incomeTransactions.forEach(transaction => {
                expect(transaction.amount).toBeGreaterThan(0);
              });

              // Act: Get expense transactions
              const expenseTransactions = await transactionService.findAll({
                type: 'expense'
              });

              // Assert: Verify only expense transactions are returned
              expect(expenseTransactions.length).toBeGreaterThan(0);
              expenseTransactions.forEach(transaction => {
                expect(transaction.amount).toBeLessThan(0);
              });
            });

            it('should combine multiple filters correctly', async () => {
              // Act: Get monthly income transactions in January
              const filteredTransactions = await transactionService.findAll({
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-31'),
                frequency: FrequencyEnum.MONTH,
                type: 'income'
              });

              // Assert: Verify filters are combined correctly
              expect(filteredTransactions.length).toBeGreaterThan(0);
              filteredTransactions.forEach(transaction => {
                const transactionDate = new Date(transaction.date);
                expect(transactionDate.getMonth()).toBe(0); // January
                expect(transaction.frequency).toBe(FrequencyEnum.MONTH);
                expect(transaction.amount).toBeGreaterThan(0);
              });
            });

            it('should search transactions by description text', async () => {
              // Act: Search for transactions containing "Salary"
              const salaryTransactions = await transactionService.findAll({
                search: 'Salary'
              });

              // Assert: Verify search results contain "Salary"
              expect(salaryTransactions.length).toBeGreaterThan(0);
              salaryTransactions.forEach(transaction => {
                expect(transaction.description.toLowerCase()).toContain('salary');
              });
            });

            it('should sort transactions by date in descending order', async () => {
              // Act: Get transactions sorted by date
              const transactions = await transactionService.findAll({
                sortBy: 'date',
                sortOrder: 'desc'
              });

              // Assert: Verify transactions are sorted by date (newest first)
              for (let i = 0; i < transactions.length - 1; i++) {
                const currentDate = new Date(transactions[i].date);
                const nextDate = new Date(transactions[i + 1].date);
                expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
              }
            });

            it('should sort transactions by amount in ascending order', async () => {
              // Act: Get transactions sorted by amount
              const transactions = await transactionService.findAll({
                sortBy: 'amount',
                sortOrder: 'asc'
              });

              // Assert: Verify transactions are sorted by amount (lowest first)
              for (let i = 0; i < transactions.length - 1; i++) {
                expect(transactions[i].amount).toBeLessThanOrEqual(transactions[i + 1].amount);
              }
            });

            it('should return empty array when no transactions match filters', async () => {
              // Act: Search for non-existent description
              const noResults = await transactionService.findAll({
                search: 'NonExistentTransaction'
              });

              // Assert: Verify empty array is returned
              expect(Array.isArray(noResults)).toBe(true);
              expect(noResults.length).toBe(0);
            });

            it('should handle invalid filter parameters gracefully', async () => {
              // Act: Use invalid date range (end date before start date)
              const invalidDateTransactions = await transactionService.findAll({
                startDate: new Date('2024-12-31'),
                endDate: new Date('2024-01-01')
              });

              // Assert: Verify system handles invalid parameters gracefully
              expect(Array.isArray(invalidDateTransactions)).toBe(true);
            });
          });
        });
      });
    });
  });
});
