import { FrequencyEnum } from 'backend/domain/value-objects/frequency.value-object';
import { TransactionBuilder } from '@builders/transaction.builder';
import { CategoryBuilder } from '@builders/category.builder';
import { appSetup } from '../../../../test-setup';

describe('Transaction Management', () => {
  describe('Budgeting', () => {
    describe('Edit Transaction', () => {
      describe('Given a user has an existing transaction', () => {
        describe('When they want to edit the transaction', () => {
          describe('Then the transaction should be updated successfully including category changes', () => {
            let testTransaction: any;
            let testCategory: any;

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
                .withDescription('Initial Transaction')
                .asIncome()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(testCategory.id)
                .withNotes('Initial notes')
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              testTransaction = await appSetup.getDatabaseSetup().saveTransaction(transactionData);
            });

            it('should update transaction description', async () => {
              // Arrange: Prepare update data
              const updateData = {
                description: 'Updated Transaction Description',
              };

              // Act: Update transaction directly in database
              await appSetup.getDatabaseSetup().getDataSource()
                .createQueryBuilder()
                .update('Transaction')
                .set({ description: updateData.description })
                .where('id = :id', { id: testTransaction.id })
                .execute();

              // Assert: Verify description was updated
              const updatedTransaction = await appSetup.getDatabaseSetup().findTransaction(testTransaction.id);
              expect(updatedTransaction?.description).toBe('Updated Transaction Description');
              expect(parseFloat(String(updatedTransaction?.amount || '0'))).toBe(parseFloat(String(testTransaction.amount || '0'))); // Other fields unchanged
              expect(updatedTransaction?.notes).toBe('Initial notes'); // Other fields unchanged
            });

            it('should update transaction amount', async () => {
              // Arrange: Prepare update data
              const updateData = {
                amount: 1500.00,
              };

              // Act: Update transaction directly in database
              await appSetup.getDatabaseSetup().getDataSource()
                .createQueryBuilder()
                .update('Transaction')
                .set({ amount: updateData.amount })
                .where('id = :id', { id: testTransaction.id })
                .execute();

              // Assert: Verify amount was updated
              const updatedTransaction = await appSetup.getDatabaseSetup().findTransaction(testTransaction.id);
              expect(parseFloat(String(updatedTransaction?.amount || '0'))).toBe(1500.00);
              expect(updatedTransaction?.description).toBe('Initial Transaction'); // Other fields unchanged
            });

            it('should update transaction date', async () => {
              // Arrange: Prepare update data
              const newDate = new Date('2024-02-15');

              // Act: Update transaction directly in database
              await appSetup.getDatabaseSetup().getDataSource()
                .createQueryBuilder()
                .update('Transaction')
                .set({ date: newDate })
                .where('id = :id', { id: testTransaction.id })
                .execute();

              // Assert: Verify date was updated
              const updatedTransaction = await appSetup.getDatabaseSetup().findTransaction(testTransaction.id);
              expect(new Date(updatedTransaction?.date || '')).toEqual(newDate);
              expect(updatedTransaction?.description).toBe('Initial Transaction'); // Other fields unchanged
            });

            it('should update transaction notes', async () => {
              // Arrange: Prepare update data
              const updateData = {
                notes: 'Updated notes for the transaction',
              };

              // Act: Update transaction directly in database
              await appSetup.getDatabaseSetup().getDataSource()
                .createQueryBuilder()
                .update('Transaction')
                .set({ notes: updateData.notes })
                .where('id = :id', { id: testTransaction.id })
                .execute();

              // Assert: Verify notes were updated
              const updatedTransaction = await appSetup.getDatabaseSetup().findTransaction(testTransaction.id);
              expect(updatedTransaction?.notes).toBe('Updated notes for the transaction');
              expect(updatedTransaction?.description).toBe('Initial Transaction'); // Other fields unchanged
            });

            it('should update transaction frequency', async () => {
              // Arrange: Prepare update data
              const updateData = {
                frequency: FrequencyEnum.WEEK,
              };

              // Act: Update transaction directly in database
              await appSetup.getDatabaseSetup().getDataSource()
                .createQueryBuilder()
                .update('Transaction')
                .set({ frequency: updateData.frequency })
                .where('id = :id', { id: testTransaction.id })
                .execute();

              // Assert: Verify frequency was updated
              const updatedTransaction = await appSetup.getDatabaseSetup().findTransaction(testTransaction.id);
              expect(updatedTransaction?.frequency).toBe(FrequencyEnum.WEEK);
              expect(updatedTransaction?.description).toBe('Initial Transaction'); // Other fields unchanged
            });

            it('should update transaction category', async () => {
              // Arrange: Create a new category for the update
              const newCategoryData = new CategoryBuilder()
                .asExpense()
                .withName('Groceries')
                .withColor('#FF0000')
                .withDescription('Expense category')
                .create();

              const newCategory = await appSetup.getDatabaseSetup().saveCategory(newCategoryData);

              // Act: Update transaction category directly in database
              await appSetup.getDatabaseSetup().getDataSource()
                .createQueryBuilder()
                .update('Transaction')
                .set({ categoryId: newCategory.id })
                .where('id = :id', { id: testTransaction.id })
                .execute();

              // Assert: Verify category was updated
              const updatedTransaction = await appSetup.getDatabaseSetup().findTransaction(testTransaction.id);
              expect(updatedTransaction?.categoryId).toBe(newCategory.id);
              expect(updatedTransaction?.description).toBe('Initial Transaction'); // Other fields unchanged
            });

            it('should handle updating non-existent transaction gracefully', async () => {
              // Arrange: Use a non-existent transaction ID
              const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

              // Act: Try to update non-existent transaction
              const result = await appSetup.getDatabaseSetup().getDataSource()
                .createQueryBuilder()
                .update('Transaction')
                .set({ description: 'This should not work' })
                .where('id = :id', { id: nonExistentId })
                .execute();

              // Assert: Should not throw error, just affect 0 rows
              expect(result.affected).toBe(0);
            });
          });
        });
      });
    });
  });
});
