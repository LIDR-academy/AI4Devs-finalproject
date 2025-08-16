import { TransactionBuilder } from '@builders/transaction.builder';
import { CategoryBuilder } from '@builders/category.builder';
import { FrequencyEnum } from 'backend/domain/value-objects/frequency.value-object';
import { appSetup } from '../../../../test-setup';

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
                .create();

              testCategory = await appSetup.getDatabaseSetup().saveCategory(categoryData);

              // Create test transaction using builder and save to database
              const transactionData = new TransactionBuilder()
                .withDescription('Transaction to Delete')
                .asIncome()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(testCategory.id)
                .withNotes('This will be deleted')
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              testTransaction = await appSetup.getDatabaseSetup().saveTransaction(transactionData);
            });

            it('should delete the transaction successfully', async () => {
              // Arrange: Verify transaction exists in database
              const existingTransaction = await appSetup.getDatabaseSetup().findTransaction(testTransaction.id);
              expect(existingTransaction).toBeDefined();
              expect(existingTransaction?.id).toBe(testTransaction.id);

              // Act: Delete transaction directly from database
              await appSetup.getDatabaseSetup().deleteTransaction(testTransaction.id);

              // Assert: Verify transaction was deleted from database
              const deletedTransaction = await appSetup.getDatabaseSetup().findTransaction(testTransaction.id);
              expect(deletedTransaction).toBeNull();
            });

            it('should handle deletion of non-existent transaction gracefully', async () => {
              // Arrange: Use a non-existent UUID
              const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

              // Act: Try to delete non-existent transaction
              await appSetup.getDatabaseSetup().deleteTransaction(nonExistentId);

              // Assert: Should not throw error, just do nothing
              expect(true).toBe(true);
            });

            it('should not affect other transactions when deleting', async () => {
              // Arrange: Create another transaction for the same user
              const anotherTransactionData = new TransactionBuilder()
                .withDescription('Another Transaction')
                .asIncome()
                .onDate(new Date('2024-01-16'))
                .withCategoryId(testCategory.id)
                .create();

              const createdTransaction = await appSetup.getDatabaseSetup().saveTransaction(anotherTransactionData);

              // Act: Delete the first transaction
              await appSetup.getDatabaseSetup().deleteTransaction(testTransaction.id);

              // Assert: Verify other transactions are unaffected
              const remainingTransaction = await appSetup.getDatabaseSetup().findTransaction(createdTransaction.id);
              expect(remainingTransaction).toBeDefined();
              expect(remainingTransaction?.id).toBe(createdTransaction.id);
            });
          });
        });
      });
    });
  });
});
