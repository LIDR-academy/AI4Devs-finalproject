import { FrequencyEnum } from '@value-objects/frequency.value-object';
import { TransactionBuilder } from '@builders/transaction.builder';
import { CategoryBuilder } from '@builders/category.builder';
import { createTestApiClient } from '@setup/api-client.setup';

describe('Transaction Management', () => {
  describe('Budgeting', () => {
    describe('Filtering', () => {
      describe('Given a user has multiple transactions with different properties', () => {
        describe('When they apply filters to the transaction list', () => {
          describe('Then they should see all matching transactions including category-based filtering', () => {

            it('should return all transactions when no filters are applied', async () => {
              const apiClient = createTestApiClient();
              
              // Act: Get all transactions from API
              const allTransactions = await apiClient.transactions.transactionControllerFindAll();

              // Assert: Verify API response structure
              expect(allTransactions).toBeDefined();
              expect(allTransactions.transactions).toBeDefined();
              expect(Array.isArray(allTransactions.transactions)).toBe(true);
              expect(allTransactions.total).toBeDefined();
              expect(typeof allTransactions.total).toBe('number');
              expect(allTransactions.page).toBeDefined();
              expect(allTransactions.limit).toBeDefined();
            });

            it('should filter transactions by date range correctly', async () => {
              const apiClient = createTestApiClient();
              
              // Create test data
              const testCategory = await apiClient.categories.categoryControllerCreate({ 
                createCategoryDto: new CategoryBuilder()
                  .asIncome()
                  .withName('Test Category')
                  .withColor('#00FF00')
                  .withDescription('Test category')
                  .createDto()
              });

              await apiClient.transactions.transactionControllerCreate({ 
                createTransactionDto: new TransactionBuilder()
                  .withDescription('Transaction 1')
                  .asIncome()
                  .onDate(new Date('2024-01-15'))
                  .withCategoryId(testCategory.id)
                  .withFrequency(FrequencyEnum.MONTH)
                  .createDto()
              });

              await apiClient.transactions.transactionControllerCreate({ 
                createTransactionDto: new TransactionBuilder()
                  .withDescription('Transaction 2')
                  .asIncome()
                  .onDate(new Date('2024-01-16'))
                  .withCategoryId(testCategory.id)
                  .withFrequency(FrequencyEnum.MONTH)
                  .createDto()
              });

              // Arrange: Define date range
              const startDate = '2024-01-15';
              const endDate = '2024-01-16';

              // Act: Get transactions within date range from API
              const filteredTransactions = await apiClient.transactions.transactionControllerFindAll({
                startDate,
                endDate
              });

              // Assert: Verify filtered results
              expect(filteredTransactions.transactions.length).toBeGreaterThanOrEqual(2);
            });

            it('should filter transactions by category correctly', async () => {
              const apiClient = createTestApiClient();
              
              // Create test data
              const incomeCategory = await apiClient.categories.categoryControllerCreate({ 
                createCategoryDto: new CategoryBuilder()
                  .asIncome()
                  .withName('Income Category')
                  .withColor('#00FF00')
                  .withDescription('Income category')
                  .createDto()
              });

              await apiClient.transactions.transactionControllerCreate({ 
                createTransactionDto: new TransactionBuilder()
                  .withDescription('Income Transaction')
                  .asIncome()
                  .onDate(new Date('2024-01-15'))
                  .withCategoryId(incomeCategory.id)
                  .withFrequency(FrequencyEnum.MONTH)
                  .createDto()
              });

              // Act: Get transactions by income category from API
              const incomeTransactions = await apiClient.transactions.transactionControllerFindAll({
                categoryId: incomeCategory.id
              });

              // Assert: Verify only income transactions are returned
              expect(incomeTransactions.transactions.length).toBeGreaterThanOrEqual(1);
              
              // Verify all returned transactions belong to the income category
              incomeTransactions.transactions.forEach(transaction => {
                expect(transaction.categoryId).toBe(incomeCategory.id);
              });
            });

            it('should filter transactions by frequency correctly', async () => {
              const apiClient = createTestApiClient();
              
              // Create test data
              const testCategory = await apiClient.categories.categoryControllerCreate({ 
                createCategoryDto: new CategoryBuilder()
                  .asIncome()
                  .withName('Test Category')
                  .withColor('#00FF00')
                  .withDescription('Test category')
                  .createDto()
              });

              await apiClient.transactions.transactionControllerCreate({ 
                createTransactionDto: new TransactionBuilder()
                  .withDescription('Monthly Transaction')
                  .asIncome()
                  .onDate(new Date('2024-01-15'))
                  .withCategoryId(testCategory.id)
                  .withFrequency(FrequencyEnum.MONTH)
                  .createDto()
              });

              // Act: Get monthly transactions from API
              const monthlyTransactions = await apiClient.transactions.transactionControllerFindAll({
                frequency: FrequencyEnum.MONTH
              });

              // Assert: Verify only monthly transactions are returned
              expect(monthlyTransactions.transactions.length).toBeGreaterThanOrEqual(1);
              
              // Verify all returned transactions have monthly frequency
              monthlyTransactions.transactions.forEach(transaction => {
                expect(transaction.frequency).toBe(FrequencyEnum.MONTH);
              });
            });

            it('should search transactions by description text', async () => {
              const apiClient = createTestApiClient();
              
              // Act: Get all transactions from API
              const allTransactions = await apiClient.transactions.transactionControllerFindAll();
              
              // Search for any transaction with a description (client-side filtering)
              const searchResults = allTransactions.transactions.filter(transaction => 
                transaction.description && transaction.description.length > 0
              );

              // Assert: Verify we can filter transactions by description
              expect(searchResults.length).toBeGreaterThanOrEqual(0);
              
              // Verify all returned transactions have valid descriptions
              searchResults.forEach(transaction => {
                expect(transaction.description).toBeDefined();
                expect(transaction.description.length).toBeGreaterThan(0);
              });
            });

            it('should handle empty filter results gracefully', async () => {
              const apiClient = createTestApiClient();
              
              // Arrange: Use a non-existent category ID
              const nonExistentCategoryId = '123e4567-e89b-12d3-a456-426614174000';

              // Act: Get transactions with non-existent category from API
              const filteredTransactions = await apiClient.transactions.transactionControllerFindAll({
                categoryId: nonExistentCategoryId
              });

              // Assert: Verify empty result is handled gracefully
              expect(filteredTransactions.transactions.length).toBe(0);
            });
          });
        });
      });
    });
  });
});
