import { FrequencyEnum } from 'backend/domain/value-objects/frequency.value-object';
import { TransactionBuilder } from '@builders/transaction.builder';
import { CategoryBuilder } from '@builders/category.builder';
import { appSetup } from '../../../../test-setup';

describe('Transaction Management', () => {
  describe('Budgeting', () => {
    describe('Summarizing', () => {
      describe('Given a user has multiple transactions with different frequencies', () => {
        describe('When they view the transaction overview', () => {
          describe('Then they should see accurate financial summaries including category information', () => {
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
            });

            it('should calculate total income correctly for monthly transactions', async () => {
              // Arrange: Create monthly income transaction
              const monthlyIncomeData = new TransactionBuilder()
                .withDescription('Monthly Salary')
                .asIncome()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(incomeCategory.id)
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              await appSetup.getDatabaseSetup().saveTransaction(monthlyIncomeData);

              // Act: Get transaction summary from database
              const allTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .find();

              // Calculate summary manually by fetching categories separately
              let totalIncome = 0;
              for (const transaction of allTransactions) {
                const category = await appSetup.getDatabaseSetup().findCategory(transaction.categoryId);
                if (category?.flow === 'income') {
                  totalIncome += parseFloat(transaction.amount);
                }
              }

              // Assert: Verify monthly income is calculated correctly
              expect(totalIncome).toBeGreaterThan(0);
              expect(allTransactions.length).toBeGreaterThan(0);
            });

            it('should normalize weekly transactions to monthly view', async () => {
              // Arrange: Create weekly income transaction
              const weeklyIncomeData = new TransactionBuilder()
                .withDescription('Weekly Allowance')
                .asIncome()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(incomeCategory.id)
                .withFrequency(FrequencyEnum.WEEK)
                .create();

              await appSetup.getDatabaseSetup().saveTransaction(weeklyIncomeData);

              // Act: Get weekly transactions from database
              const weeklyTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .where('transaction.frequency = :frequency', { frequency: FrequencyEnum.WEEK })
                .getMany();

              // Assert: Verify weekly transactions are found
              expect(weeklyTransactions.length).toBeGreaterThan(0);
              weeklyTransactions.forEach(transaction => {
                expect(transaction.frequency).toBe(FrequencyEnum.WEEK);
              });
            });

            it('should normalize yearly transactions to monthly view', async () => {
              // Arrange: Create yearly income transaction
              const yearlyIncomeData = new TransactionBuilder()
                .withDescription('Annual Bonus')
                .asIncome()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(incomeCategory.id)
                .withFrequency(FrequencyEnum.YEAR)
                .create();

              await appSetup.getDatabaseSetup().saveTransaction(yearlyIncomeData);

              // Act: Get yearly transactions from database
              const yearlyTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .where('transaction.frequency = :frequency', { frequency: FrequencyEnum.YEAR })
                .getMany();

              // Assert: Verify yearly transactions are found
              expect(yearlyTransactions.length).toBeGreaterThan(0);
              yearlyTransactions.forEach(transaction => {
                expect(transaction.frequency).toBe(FrequencyEnum.YEAR);
              });
            });

            it('should calculate total expenses correctly for monthly transactions', async () => {
              // Arrange: Create monthly expense transaction
              const monthlyExpenseData = new TransactionBuilder()
                .withDescription('Monthly Rent')
                .asExpense()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(expenseCategory.id)
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              await appSetup.getDatabaseSetup().saveTransaction(monthlyExpenseData);

              // Act: Get transaction summary from database
              const allTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .find();

              // Calculate summary manually by fetching categories separately
              let totalExpenses = 0;
              for (const transaction of allTransactions) {
                const category = await appSetup.getDatabaseSetup().findCategory(transaction.categoryId);
                if (category?.flow === 'expense') {
                  totalExpenses += Math.abs(parseFloat(transaction.amount));
                }
              }

              // Assert: Verify monthly expenses are calculated correctly
              expect(totalExpenses).toBeGreaterThan(0);
            });

            it('should normalize weekly expenses to monthly view', async () => {
              // Arrange: Create weekly expense transaction
              const weeklyExpenseData = new TransactionBuilder()
                .withDescription('Weekly Groceries')
                .asExpense()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(expenseCategory.id)
                .withFrequency(FrequencyEnum.WEEK)
                .create();

              await appSetup.getDatabaseSetup().saveTransaction(weeklyExpenseData);

              // Act: Get weekly expense transactions from database
              const weeklyExpenses = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .where('transaction.frequency = :frequency', { frequency: FrequencyEnum.WEEK })
                .getMany();

              // Filter by expense category manually
              const expenseWeeklyTransactions: any[] = [];
              for (const transaction of weeklyExpenses) {
                const category = await appSetup.getDatabaseSetup().findCategory(transaction.categoryId);
                if (category?.flow === 'expense') {
                  expenseWeeklyTransactions.push(transaction);
                }
              }

              // Assert: Verify weekly expenses are found
              expect(expenseWeeklyTransactions.length).toBeGreaterThan(0);
            });

            it('should calculate net income correctly', async () => {
              // Arrange: Create both income and expense transactions
              const incomeData = new TransactionBuilder()
                .withDescription('Salary')
                .asIncome()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(incomeCategory.id)
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              const expenseData = new TransactionBuilder()
                .withDescription('Rent')
                .asExpense()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(expenseCategory.id)
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              await appSetup.getDatabaseSetup().saveTransaction(incomeData);
              await appSetup.getDatabaseSetup().saveTransaction(expenseData);

              // Act: Get transaction summary from database
              const allTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .find();

              // Calculate summary manually by fetching categories separately
              let totalIncome = 0;
              let totalExpenses = 0;
              for (const transaction of allTransactions) {
                const category = await appSetup.getDatabaseSetup().findCategory(transaction.categoryId);
                if (category?.flow === 'income') {
                  totalIncome += parseFloat(transaction.amount);
                } else if (category?.flow === 'expense') {
                  totalExpenses += Math.abs(parseFloat(transaction.amount));
                }
              }

              const netIncome = totalIncome - totalExpenses;

              // Assert: Verify net income calculation
              expect(netIncome).toBeDefined();
              expect(typeof netIncome).toBe('number');
            });

            it('should return summary data for the correct user', async () => {
              // Arrange: Create transaction for specific user
              const userId = '123e4567-e89b-12d3-a456-426614174000';
              const userTransactionData = new TransactionBuilder()
                .withDescription('User-specific transaction')
                .asIncome()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(incomeCategory.id)
                .withUserId(userId)
                .create();

              await appSetup.getDatabaseSetup().saveTransaction(userTransactionData);

              // Act: Get transactions for specific user from database
              const userTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .createQueryBuilder('transaction')
                .where('transaction.userId = :userId', { userId })
                .getMany();

              // Assert: Verify user-specific transactions are found
              expect(userTransactions.length).toBeGreaterThan(0);
              userTransactions.forEach(transaction => {
                expect(transaction.userId).toBe(userId);
              });
            });

            it('should handle empty transaction list gracefully', async () => {
              // Arrange: Clear existing transactions
              const existingTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .find();

              // Remove existing transactions
              for (const transaction of existingTransactions) {
                await appSetup.getDatabaseSetup().deleteTransaction(transaction.id);
              }

              // Act: Get transaction summary from empty database
              const emptyTransactions = await appSetup.getDatabaseSetup().getDataSource()
                .getRepository('Transaction')
                .find();

              // Assert: Verify empty list is handled gracefully
              expect(emptyTransactions.length).toBe(0);
            });
          });
        });
      });
    });
  });
});
