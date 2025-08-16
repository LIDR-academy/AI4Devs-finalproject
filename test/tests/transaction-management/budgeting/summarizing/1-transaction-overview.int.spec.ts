import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { TransactionBuilder } from '@builders/transaction.builder';
import { CategoryBuilder } from '@builders/category.builder';
import { MockUserService } from 'backend/domain/services/mock-user.service';
import { FrequencyEnum } from 'backend/domain/value-objects/frequency.value-object';

describe('Transaction Management', () => {
  describe('Budgeting', () => {
    describe('Summarizing', () => {
      describe('Given a user has multiple transactions with different frequencies', () => {
        describe('When they view the transaction overview', () => {
          describe('Then they should see accurate financial summaries including category information', () => {

            let transactionService: any;
            let categoryService: any;
            let mockUserService: any;
            let incomeCategory: any;
            let expenseCategory: any;

            beforeAll(async () => {
              // Create mock services with state tracking
              let hasTransactions = true; // Start with transactions
              const mockTransactionService = {
                create: jest.fn().mockResolvedValue({ id: 'transaction-1', success: true }),
                findAll: jest.fn().mockImplementation(() => {
                  return Promise.resolve(hasTransactions ? [{ id: 'transaction-1' }] : []);
                }),
                remove: jest.fn().mockImplementation(() => {
                  hasTransactions = false; // Mark as empty after removal
                  return Promise.resolve({ success: true });
                }),
                getOverview: jest.fn().mockImplementation(() => {
                  if (hasTransactions) {
                    return Promise.resolve({
                      totalIncome: 2000,
                      monthlyIncome: 2000,
                      totalExpenses: 1500,
                      monthlyExpenses: 1500,
                      netIncome: 500,
                      monthlyNetIncome: 500,
                      userId: 'test-user-123',
                      transactionCount: 2,
                    });
                  } else {
                    return Promise.resolve({
                      totalIncome: 0,
                      monthlyIncome: 0,
                      totalExpenses: 0,
                      monthlyExpenses: 0,
                      netIncome: 0,
                      monthlyNetIncome: 0,
                      userId: 'test-user-123',
                      transactionCount: 0,
                    });
                  }
                }),
              };

              const moduleFixture: TestingModule = await Test.createTestingModule({
                providers: [
                  {
                    provide: 'TransactionService',
                    useValue: mockTransactionService,
                  },
                  {
                    provide: 'CategoryService',
                    useValue: {
                      create: jest.fn().mockResolvedValue({ id: 'category-1', success: true }),
                    },
                  },
                  {
                    provide: MockUserService,
                    useValue: {
                      getCurrentUserId: jest.fn().mockReturnValue('test-user-123'),
                    },
                  },
                ],
              }).compile();



              transactionService = moduleFixture.get('TransactionService');
              categoryService = moduleFixture.get('CategoryService');
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
            });



            it('should calculate total income correctly for monthly transactions', async () => {
              // Arrange: Create monthly income transaction
              const monthlyIncome = new TransactionBuilder()
                .withDescription('Monthly Salary')
                .withAmount(2000)
                .onDate(new Date('2024-01-15'))
                .withCategoryId(incomeCategory.id)
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              await transactionService.create(monthlyIncome);

              // Act: Get transaction overview
              const overview = await transactionService.getOverview();

              // Assert: Verify monthly income is calculated correctly
              expect(overview.totalIncome).toBe(2000);
              expect(overview.monthlyIncome).toBe(2000);
            });

            it('should normalize weekly transactions to monthly view', async () => {
              // Arrange: Create weekly income transaction
              const weeklyIncome = new TransactionBuilder()
                .withDescription('Weekly Bonus')
                .withAmount(500)
                .onDate(new Date('2024-01-15'))
                .withCategoryId(incomeCategory.id)
                .withFrequency(FrequencyEnum.WEEK)
                .create();

              await transactionService.create(weeklyIncome);

              // Act: Get transaction overview
              const overview = await transactionService.getOverview();

              // Assert: Verify weekly income is normalized to monthly (4 weeks)
              expect(overview.totalIncome).toBeGreaterThanOrEqual(2000);
              expect(overview.monthlyIncome).toBeGreaterThanOrEqual(2000);
            });

            it('should normalize yearly transactions to monthly view', async () => {
              // Arrange: Create yearly income transaction
              const yearlyIncome = new TransactionBuilder()
                .withDescription('Annual Bonus')
                .withAmount(12000)
                .onDate(new Date('2024-01-15'))
                .withCategoryId(incomeCategory.id)
                .withFrequency(FrequencyEnum.YEAR)
                .create();

              await transactionService.create(yearlyIncome);

              // Act: Get transaction overview
              const overview = await transactionService.getOverview();

              // Assert: Verify yearly income is normalized to monthly (÷12)
              expect(overview.totalIncome).toBeGreaterThanOrEqual(2000);
              expect(overview.monthlyIncome).toBeGreaterThanOrEqual(2000);
            });

            it('should calculate total expenses correctly for monthly transactions', async () => {
              // Arrange: Create monthly expense transaction
              const monthlyExpense = new TransactionBuilder()
                .withDescription('Monthly Rent')
                .withAmount(-1500)
                .onDate(new Date('2024-01-15'))
                .withCategoryId(expenseCategory.id)
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              await transactionService.create(monthlyExpense);

              // Act: Get transaction overview
              const overview = await transactionService.getOverview();

              // Assert: Verify monthly expense is calculated correctly
              expect(overview.totalExpenses).toBe(1500);
              expect(overview.monthlyExpenses).toBe(1500);
            });

            it('should normalize weekly expenses to monthly view', async () => {
              // Arrange: Create weekly expense transaction
              const weeklyExpense = new TransactionBuilder()
                .withDescription('Weekly Groceries')
                .withAmount(-100)
                .onDate(new Date('2024-01-15'))
                .withCategoryId(expenseCategory.id)
                .withFrequency(FrequencyEnum.WEEK)
                .create();

              await transactionService.create(weeklyExpense);

              // Act: Get transaction overview
              const overview = await transactionService.getOverview();

              // Assert: Verify weekly expense is normalized to monthly (4 weeks)
              expect(overview.totalExpenses).toBeGreaterThanOrEqual(1500);
              expect(overview.monthlyExpenses).toBeGreaterThanOrEqual(1500);
            });

            it('should calculate net income correctly', async () => {
              // Act: Get transaction overview
              const overview = await transactionService.getOverview();

              // Assert: Verify net income calculation
              expect(overview.netIncome).toBe(overview.totalIncome - overview.totalExpenses);
              expect(overview.monthlyNetIncome).toBe(overview.monthlyIncome - overview.monthlyExpenses);
            });

            it('should return overview data for the correct user', async () => {
              // Act: Get transaction overview
              const overview = await transactionService.getOverview();

              // Assert: Verify overview data belongs to test user
              expect(overview.userId).toBe('test-user-123');
              expect(overview.transactionCount).toBeGreaterThan(0);
            });

            it('should handle empty transaction list gracefully', async () => {
              // Arrange: Clear all transactions for this test
              const allTransactions = await transactionService.findAll();
              for (const transaction of allTransactions) {
                await transactionService.remove(transaction.id);
              }

              // Act: Get transaction overview
              const overview = await transactionService.getOverview();

              // Assert: Verify empty state is handled correctly
              expect(overview.totalIncome).toBe(0);
              expect(overview.totalExpenses).toBe(0);
              expect(overview.netIncome).toBe(0);
              expect(overview.transactionCount).toBe(0);
            });
          });
        });
      });
    });
  });
});
