import { TransactionBuilder } from '@builders/transaction.builder';
import { CategoryBuilder } from '@builders/category.builder';
import { FrequencyEnum } from 'backend/domain/value-objects/frequency.value-object';
import { appSetup } from '../../../../jest-global-setup';

describe('Transaction Management', () => {
  describe('Budgeting', () => {
    describe('Delete Transaction', () => {
      describe('Given a user has an existing transaction', () => {
        describe('When they want to delete the transaction', () => {
          describe('Then the transaction should be deleted successfully while preserving category information', () => {

            let testCategory: any;
            let testTransaction: any;

            beforeEach(async () => {
              // Create test category using builder and save to database
              const categoryData = new CategoryBuilder()
                .asIncome()
                .withName('Salary')
                .withColor('#00FF00')
                .withDescription('Salary category')
                .createDto();

              testCategory = await appSetup.saveCategory(categoryData);

              // Create test transaction using builder and save to database
              const transactionData = new TransactionBuilder()
                .withDescription('Test Transaction')
                .asIncome()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(testCategory.id)
                .withNotes('Test notes')
                .withFrequency(FrequencyEnum.MONTH)
                .createDto();

              testTransaction = await appSetup.saveTransaction(transactionData);
            });

            it('should delete an existing transaction', async () => {
              // Arrange: Verify transaction exists
              const existingTransaction = await appSetup.findTransaction(testTransaction.id);
              expect(existingTransaction).toBeDefined();

              // Act: Delete transaction
              await appSetup.deleteTransaction(testTransaction.id);

              // Assert: Verify transaction was deleted
              await expect(appSetup.findTransaction(testTransaction.id)).rejects.toMatchObject({
                name: 'ResponseError',
                response: expect.objectContaining({
                  status: 404
                })
              });
            });

            it('should handle deleting non-existent transaction gracefully', async () => {
              // Arrange: Use a non-existent ID
              const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

              // Act & Assert: Should throw 404 error for non-existent transaction
              await expect(appSetup.deleteTransaction(nonExistentId)).rejects.toMatchObject({
                name: 'ResponseError',
                response: expect.objectContaining({
                  status: 404
                })
              });
            });

            it('should maintain data integrity after deletion', async () => {
              // Arrange: Create another transaction
              const anotherTransactionData = new TransactionBuilder()
                .withDescription('Another Transaction')
                .asExpense()
                .onDate(new Date('2024-01-16'))
                .withCategoryId(testCategory.id)
                .withNotes('Another test')
                .withFrequency(FrequencyEnum.WEEK)
                .createDto();

              const createdTransaction = await appSetup.saveTransaction(anotherTransactionData);

              // Act: Delete the original transaction
              await appSetup.deleteTransaction(testTransaction.id);

              // Assert: Other transactions remain intact
              const remainingTransaction = await appSetup.findTransaction(createdTransaction.id);
              expect(remainingTransaction).toBeDefined();
              expect(remainingTransaction.description).toBe('Another Transaction');
            });
          });
        });
      });
    });
  });
});
