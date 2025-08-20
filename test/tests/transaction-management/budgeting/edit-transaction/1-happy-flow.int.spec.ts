import { FrequencyEnum } from '@value-objects/frequency.value-object';
import { TransactionBuilder } from '@builders/transaction.builder';
import { CategoryBuilder } from '@builders/category.builder';
import { createTestApiClient } from '@setup/api-client.setup';

describe('Transaction Management', () => {
  describe('Budgeting', () => {
    describe('Edit Transaction', () => {
      describe('Given a user has an existing transaction', () => {
        describe('When they want to edit the transaction', () => {
          describe('Then the transaction should be updated successfully including category changes', () => {
            let testTransaction: any;
            let testCategory: any;

            beforeEach(async () => {
              const apiClient = createTestApiClient();
              
              // Create test category using builder and save to database
              const categoryData = new CategoryBuilder()
                .asIncome()
                .withName('Salary')
                .withColor('#00FF00')
                .withDescription('Salary category')
                .createDto();

              testCategory = await apiClient.categories.categoryControllerCreate({ createCategoryDto: categoryData });

              // Create test transaction using builder and save to database
              const transactionData = new TransactionBuilder()
                .withDescription('Initial Transaction')
                .asIncome()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(testCategory.id)
                .withNotes('Initial notes')
                .withFrequency(FrequencyEnum.MONTH)
                .createDto();

              testTransaction = await apiClient.transactions.transactionControllerCreate({ createTransactionDto: transactionData });
            });

            it('should update transaction description', async () => {
              const apiClient = createTestApiClient();
              
              // Arrange: Prepare update data
              const updateData = {
                description: 'Updated Transaction Description',
              };

              // Act: Update transaction using API
              await apiClient.transactions.transactionControllerUpdate({ id: testTransaction.id, updateTransactionDto: updateData });

              // Assert: Verify description was updated
              const updatedTransaction = await apiClient.transactions.transactionControllerFindOne({ id: testTransaction.id });
              expect(updatedTransaction?.description).toBe('Updated Transaction Description');
              expect(parseFloat(String(updatedTransaction?.amount || '0'))).toBe(parseFloat(String(testTransaction.amount || '0'))); // Other fields unchanged
              expect(updatedTransaction?.notes).toBe('Initial notes'); // Other fields unchanged
            });

            it('should update transaction amount', async () => {
              const apiClient = createTestApiClient();
              
              // Arrange: Prepare update data
              const updateData = {
                amount: 1500.00,
              };

              // Act: Update transaction using API
              await apiClient.transactions.transactionControllerUpdate({ id: testTransaction.id, updateTransactionDto: updateData });

              // Assert: Verify amount was updated
              const updatedTransaction = await apiClient.transactions.transactionControllerFindOne({ id: testTransaction.id });
              expect(parseFloat(String(updatedTransaction?.amount || '0'))).toBe(1500.00);
              expect(updatedTransaction?.description).toBe('Initial Transaction'); // Other fields unchanged
            });

            it('should update transaction date', async () => {
              const apiClient = createTestApiClient();
              
              // Arrange: Prepare update data
              const newDate = new Date('2024-02-15');
              const updateData = {
                date: newDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
              };

              // Act: Update transaction using API
              await apiClient.transactions.transactionControllerUpdate({ id: testTransaction.id, updateTransactionDto: updateData });

              // Assert: Verify date was updated
              const updatedTransaction = await apiClient.transactions.transactionControllerFindOne({ id: testTransaction.id });
              expect(new Date(updatedTransaction?.date || '')).toEqual(newDate);
              expect(updatedTransaction?.description).toBe('Initial Transaction'); // Other fields unchanged
            });

            it('should update transaction notes', async () => {
              const apiClient = createTestApiClient();
              
              // Arrange: Prepare update data
              const updateData = {
                notes: 'Updated notes for the transaction',
              };

              // Act: Update transaction using API
              await apiClient.transactions.transactionControllerUpdate({ id: testTransaction.id, updateTransactionDto: updateData });

              // Assert: Verify notes were updated
              const updatedTransaction = await apiClient.transactions.transactionControllerFindOne({ id: testTransaction.id });
              expect(updatedTransaction?.notes).toBe('Updated notes for the transaction');
              expect(updatedTransaction?.description).toBe('Initial Transaction'); // Other fields unchanged
            });

            it('should update transaction frequency', async () => {
              const apiClient = createTestApiClient();
              
              // Arrange: Prepare update data
              const updateData = {
                frequency: FrequencyEnum.YEAR,
              };

              // Act: Update transaction using API
              await apiClient.transactions.transactionControllerUpdate({ id: testTransaction.id, updateTransactionDto: updateData });

              // Assert: Verify frequency was updated
              const updatedTransaction = await apiClient.transactions.transactionControllerFindOne({ id: testTransaction.id });
              expect(updatedTransaction?.frequency).toBe(FrequencyEnum.YEAR);
              expect(updatedTransaction?.description).toBe('Initial Transaction'); // Other fields unchanged
            });

            it('should update transaction category', async () => {
              const apiClient = createTestApiClient();
              
              // Arrange: Create a new category and prepare update data
              const newCategoryData = new CategoryBuilder()
                .asExpense()
                .withName('New Category')
                .withColor('#0000FF')
                .withDescription('New category for testing')
                .createDto();

              const newCategory = await apiClient.categories.categoryControllerCreate({ createCategoryDto: newCategoryData });

              // Act: Update transaction using API
              await apiClient.transactions.transactionControllerUpdate({ id: testTransaction.id, updateTransactionDto: { categoryId: newCategory.id } });

              // Assert: Verify category was updated
              const updatedTransaction = await apiClient.transactions.transactionControllerFindOne({ id: testTransaction.id });
              expect(updatedTransaction?.categoryId).toBe(newCategory.id);
              expect(updatedTransaction?.description).toBe('Initial Transaction'); // Other fields unchanged
            });

            it('should handle multiple field updates simultaneously', async () => {
              const apiClient = createTestApiClient();
              
              // Arrange: Prepare multiple field updates
              const updateData = {
                description: 'Multi-updated Transaction',
                amount: 2500.00,
                notes: 'Multiple fields updated',
              };

              // Act: Update multiple fields using API
              await apiClient.transactions.transactionControllerUpdate({ id: testTransaction.id, updateTransactionDto: updateData });

              // Assert: Verify all fields were updated
              const updatedTransaction = await apiClient.transactions.transactionControllerFindOne({ id: testTransaction.id });
              expect(updatedTransaction?.description).toBe('Multi-updated Transaction');
              expect(parseFloat(String(updatedTransaction?.amount || '0'))).toBe(2500.00);
              expect(updatedTransaction?.notes).toBe('Multiple fields updated');
            });

            it('should handle updating non-existent transaction gracefully', async () => {
              const apiClient = createTestApiClient();
              
              // Arrange: Use a non-existent transaction ID
              const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

              // Act & Assert: Should throw 404 error for non-existent transaction
              await expect(apiClient.transactions.transactionControllerUpdate({ id: nonExistentId, updateTransactionDto: { description: 'This should not work' } }))
                .rejects.toMatchObject({
                  name: 'ResponseError',
                  response: expect.objectContaining({
                    status: 404
                  })
                });
            });
          });
        });
      });
    });
  });
});
