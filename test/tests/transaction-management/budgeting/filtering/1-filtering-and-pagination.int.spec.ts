import { FrequencyEnum } from 'backend/domain/value-objects/frequency.value-object';
import { TransactionBuilder } from '@builders/transaction.builder';
import { CategoryBuilder } from '@builders/category.builder';
import { appSetup } from '../../../../test-setup';

describe('Transaction Management', () => {
  describe('Budgeting', () => {
    describe('Filtering', () => {
      describe('Given a user has multiple transactions with different properties', () => {
        describe('When they apply filters to the transaction list', () => {
          describe('Then they should see all matching transactions including category-based filtering', () => {
            let testTransactions: any[];
            let incomeCategory: any;
            let expenseCategory: any;

            beforeEach(async () => {
              // Create test categories using builders and save to database
              const incomeCategoryData = new CategoryBuilder()
                .asIncome()
                .withName('Salary')
                .withColor('#00FF00')
                .withDescription('Income category')
                .create();

              incomeCategory = await appSetup.getDatabaseSetup().saveCategory(incomeCategoryData);

              const expenseCategoryData = new CategoryBuilder()
                .asExpense()
                .withName('Food')
                .withColor('#FF0000')
                .withDescription('Expense category')
                .create();

              expenseCategory = await appSetup.getDatabaseSetup().saveCategory(expenseCategoryData);

              // Create test transactions using builders and save to database
              const transaction1Data = new TransactionBuilder()
                .withDescription('Salary Payment')
                .asIncome()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(incomeCategory.id)
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              const transaction2Data = new TransactionBuilder()
                .withDescription('Grocery Shopping')
                .asExpense()
                .onDate(new Date('2024-01-16'))
                .withCategoryId(expenseCategory.id)
                .withFrequency(FrequencyEnum.WEEK)
                .create();

              const transaction3Data = new TransactionBuilder()
                .withDescription('Freelance Work')
                .asIncome()
                .onDate(new Date('2024-01-17'))
                .withCategoryId(incomeCategory.id)
                .withFrequency(FrequencyEnum.QUARTER)
                .create();

              testTransactions = [
                await appSetup.getDatabaseSetup().saveTransaction(transaction1Data),
                await appSetup.getDatabaseSetup().saveTransaction(transaction2Data),
                await appSetup.getDatabaseSetup().saveTransaction(transaction3Data),
              ];
            });

            it('should return all transactions when no filters are applied', async () => {
              // Act: Get all transactions from database
              const allTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .find();

              // Assert: Verify all transactions are returned
              expect(allTransactions.length).toBeGreaterThanOrEqual(testTransactions.length);
              
              // Verify our test transactions are included
              const testTransactionIds = testTransactions.map(t => t.id);
              const foundTestTransactions = allTransactions.filter(t => testTransactionIds.includes(t.id));
              expect(foundTestTransactions.length).toBe(testTransactions.length);
            });

            it('should filter transactions by date range correctly', async () => {
              // Arrange: Define date range
              const startDate = new Date('2024-01-15');
              const endDate = new Date('2024-01-16');

              // Act: Get transactions within date range from database
              const filteredTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .where('transaction.date >= :startDate', { startDate })
                .andWhere('transaction.date <= :endDate', { endDate })
                .getMany();

              // Assert: Verify filtered results
              expect(filteredTransactions.length).toBeGreaterThanOrEqual(2);
              
              // Verify all returned transactions are within the date range
              filteredTransactions.forEach(transaction => {
                const transactionDate = new Date(transaction.date);
                expect(transactionDate >= startDate).toBe(true);
                expect(transactionDate <= endDate).toBe(true);
              });
            });

            it('should filter transactions by category correctly', async () => {
              // Act: Get transactions by income category from database
              const incomeTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .where('transaction.categoryId = :categoryId', { categoryId: incomeCategory.id })
                .getMany();

              // Assert: Verify only income transactions are returned
              expect(incomeTransactions.length).toBeGreaterThanOrEqual(2);
              
              incomeTransactions.forEach(transaction => {
                expect(transaction.categoryId).toBe(incomeCategory.id);
              });
            });

            it('should filter transactions by frequency correctly', async () => {
              // Act: Get monthly transactions from database
              const monthlyTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .where('transaction.frequency = :frequency', { frequency: FrequencyEnum.MONTH })
                .getMany();

              // Assert: Verify only monthly transactions are returned
              expect(monthlyTransactions.length).toBeGreaterThanOrEqual(1);
              
              monthlyTransactions.forEach(transaction => {
                expect(transaction.frequency).toBe(FrequencyEnum.MONTH);
              });
            });

            it('should filter transactions by transaction type correctly', async () => {
              // Act: Get all transactions and filter by income category
              const allTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .find();

              // Filter by income category manually
              const incomeTransactions: any[] = [];
              for (const transaction of allTransactions) {
                const category = await appSetup.getDatabaseSetup().findCategory(transaction.categoryId);
                if (category?.flow === 'income') {
                  incomeTransactions.push(transaction);
                }
              }

              // Assert: Verify only income transactions are returned
              expect(incomeTransactions.length).toBeGreaterThanOrEqual(2);
              
              // Verify each transaction has the correct category flow
              for (const transaction of incomeTransactions) {
                const category = await appSetup.getDatabaseSetup().findCategory(transaction.categoryId);
                expect(category?.flow).toBe('income');
              }
            });

            it('should combine multiple filters correctly', async () => {
              // Arrange: Define multiple filter criteria
              const startDate = new Date('2024-01-15');
              const categoryId = incomeCategory.id;

              // Act: Get transactions with multiple filters from database
              const filteredTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .where('transaction.date >= :startDate', { startDate })
                .andWhere('transaction.categoryId = :categoryId', { categoryId })
                .getMany();

              // Assert: Verify filtered results meet all criteria
              expect(filteredTransactions.length).toBeGreaterThanOrEqual(2);
              
              filteredTransactions.forEach(transaction => {
                const transactionDate = new Date(transaction.date);
                expect(transactionDate >= startDate).toBe(true);
                expect(transaction.categoryId).toBe(categoryId);
              });
            });

            it('should search transactions by description text', async () => {
              // Arrange: Search term
              const searchTerm = 'Salary';

              // Act: Search transactions by description from database
              const searchResults = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .where('transaction.description ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .getMany();

              // Assert: Verify search results
              expect(searchResults.length).toBeGreaterThanOrEqual(1);
              
              searchResults.forEach(transaction => {
                expect(transaction.description.toLowerCase()).toContain(searchTerm.toLowerCase());
              });
            });

            it('should sort transactions by date in descending order', async () => {
              // Act: Get transactions sorted by date from database
              const sortedTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .orderBy('transaction.date', 'DESC')
                .getMany();

              // Assert: Verify transactions are sorted by date in descending order
              expect(sortedTransactions.length).toBeGreaterThanOrEqual(testTransactions.length);
              
              for (let i = 0; i < sortedTransactions.length - 1; i++) {
                const currentDate = new Date(sortedTransactions[i].date);
                const nextDate = new Date(sortedTransactions[i + 1].date);
                expect(currentDate >= nextDate).toBe(true);
              }
            });

            it('should sort transactions by amount in ascending order', async () => {
              // Act: Get transactions sorted by amount from database
              const sortedTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .orderBy('transaction.amount', 'ASC')
                .getMany();

              // Assert: Verify transactions are sorted by amount in ascending order
              expect(sortedTransactions.length).toBeGreaterThanOrEqual(testTransactions.length);
              
              for (let i = 0; i < sortedTransactions.length - 1; i++) {
                const currentAmount = parseFloat(sortedTransactions[i].amount);
                const nextAmount = parseFloat(sortedTransactions[i + 1].amount);
                expect(currentAmount <= nextAmount).toBe(true);
              }
            });

            it('should return empty array when no transactions match filters', async () => {
              // Arrange: Use a non-existent category ID
              const nonExistentCategoryId = '123e4567-e89b-12d3-a456-426614174000';

              // Act: Get transactions with non-existent category from database
              const filteredTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .where('transaction.categoryId = :categoryId', { categoryId: nonExistentCategoryId })
                .getMany();

              // Assert: Verify no transactions are returned
              expect(filteredTransactions.length).toBe(0);
            });

            it('should handle invalid filter parameters gracefully', async () => {
              // Arrange: Invalid date (null)
              const invalidDate = null;

              // Act: Get transactions with invalid date filter from database
              const filteredTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .where('transaction.date = :date', { date: invalidDate })
                .getMany();

              // Assert: Verify no transactions are returned (graceful handling)
              expect(filteredTransactions.length).toBe(0);
            });
          });
        });
      });
    });
  });
});
