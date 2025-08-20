import { FrequencyEnum } from '@value-objects/frequency.value-object';
import { createTestApiClient } from '@setup/api-client.setup';

describe('Transaction Management', () => {
  describe('Budgeting', () => {
    describe('Summarizing', () => {
      describe('Given a user has multiple transactions with different frequencies', () => {
        describe('When they view the transaction overview', () => {
          describe('Then they should see accurate financial summaries including category information', () => {

            it('should return transactions with correct structure', async () => {
              const apiClient = createTestApiClient();
              
              // Act: Get all transactions from API
              const allTransactions = await apiClient.transactions.transactionControllerFindAll();

              // Assert: Verify API response structure and data types
              expect(allTransactions).toBeDefined();
              expect(allTransactions.transactions).toBeDefined();
              expect(Array.isArray(allTransactions.transactions)).toBe(true);
              expect(allTransactions.total).toBeDefined();
              expect(typeof allTransactions.total).toBe('number');
              
              if (allTransactions.transactions.length > 0) {
                // Verify transaction structure
                const transaction = allTransactions.transactions[0];
                expect(transaction.id).toBeDefined();
                expect(transaction.amount).toBeDefined();
                expect(transaction.categoryId).toBeDefined();
                expect(transaction.description).toBeDefined();
                expect(transaction.date).toBeDefined();
                expect(transaction.frequency).toBeDefined();
              }
            });

            it('should filter transactions by frequency correctly', async () => {
              const apiClient = createTestApiClient();
              
              // Act: Get monthly transactions from API
              const monthlyTransactions = await apiClient.transactions.transactionControllerFindAll({ 
                frequency: FrequencyEnum.MONTH 
              });

              // Assert: Verify API response structure
              expect(monthlyTransactions).toBeDefined();
              expect(monthlyTransactions.transactions).toBeDefined();
              expect(Array.isArray(monthlyTransactions.transactions)).toBe(true);
              
              // Verify all returned transactions have monthly frequency
              monthlyTransactions.transactions.forEach(transaction => {
                expect(transaction.frequency).toBe(FrequencyEnum.MONTH);
              });
            });

            it('should filter transactions by weekly frequency', async () => {
              const apiClient = createTestApiClient();
              
              // Act: Get weekly transactions from API
              const weeklyTransactions = await apiClient.transactions.transactionControllerFindAll({ 
                frequency: FrequencyEnum.WEEK 
              });

              // Assert: Verify API response structure
              expect(weeklyTransactions).toBeDefined();
              expect(weeklyTransactions.transactions).toBeDefined();
              expect(Array.isArray(weeklyTransactions.transactions)).toBe(true);
              
              // Verify all returned transactions have weekly frequency
              weeklyTransactions.transactions.forEach(transaction => {
                expect(transaction.frequency).toBe(FrequencyEnum.WEEK);
              });
            });

            it('should filter transactions by yearly frequency', async () => {
              const apiClient = createTestApiClient();
              
              // Act: Get yearly transactions from API
              const yearlyTransactions = await apiClient.transactions.transactionControllerFindAll({ 
                frequency: FrequencyEnum.YEAR 
              });

              // Assert: Verify API response structure
              expect(yearlyTransactions).toBeDefined();
              expect(yearlyTransactions.transactions).toBeDefined();
              expect(Array.isArray(yearlyTransactions.transactions)).toBe(true);
              
              // Verify all returned transactions have yearly frequency
              yearlyTransactions.transactions.forEach(transaction => {
                expect(transaction.frequency).toBe(FrequencyEnum.YEAR);
              });
            });

            it('should handle empty results gracefully', async () => {
              const apiClient = createTestApiClient();
              
              // Act: Get transactions with a frequency that might not have data
              const quarterlyTransactions = await apiClient.transactions.transactionControllerFindAll({
                frequency: FrequencyEnum.QUARTER
              });

              // Assert: Verify API handles empty results gracefully
              expect(quarterlyTransactions).toBeDefined();
              expect(quarterlyTransactions.transactions).toBeDefined();
              expect(Array.isArray(quarterlyTransactions.transactions)).toBe(true);
              expect(quarterlyTransactions.total).toBeDefined();
            });

            it('should return paginated results correctly', async () => {
              const apiClient = createTestApiClient();
              
              // Act: Get transactions with pagination
              const paginatedTransactions = await apiClient.transactions.transactionControllerFindAll({
                page: 1,
                limit: 5
              });

              // Assert: Verify pagination structure
              expect(paginatedTransactions).toBeDefined();
              expect(paginatedTransactions.transactions).toBeDefined();
              expect(paginatedTransactions.page).toBeDefined();
              expect(paginatedTransactions.limit).toBeDefined();
              expect(paginatedTransactions.total).toBeDefined();
              
              // Verify pagination values
              expect(paginatedTransactions.page).toBe(1);
              expect(paginatedTransactions.limit).toBe(5);
              expect(paginatedTransactions.transactions.length).toBeLessThanOrEqual(5);
            });
          });
        });
      });
    });
  });
});
