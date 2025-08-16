import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from 'backend/application/services/transaction.service';
import { MockUserService } from 'backend/domain/services/mock-user.service';
import { FrequencyEnum } from 'backend/domain/value-objects/frequency.value-object';
import { TransactionBuilder } from '@builders/transaction.builder';
import { CategoryBuilder } from '@builders/category.builder';

describe('Transaction Management', () => {
  describe('Budgeting', () => {
    describe('Edit Transaction', () => {
      describe('Given a user has an existing transaction', () => {
        describe('When they want to edit the transaction', () => {
          describe('Then the transaction should be updated successfully including category changes', () => {
            let transactionService: TransactionService;
            let mockTransactionRepository: any;
            let mockCategoryRepository: any;
            let mockUserService: any;
            let testTransaction: any;
            let testCategory: any;

            beforeEach(async () => {
              // Create mock repositories
              mockTransactionRepository = {
                save: jest.fn(),
                findOne: jest.fn(),
                update: jest.fn(),
              };

              mockCategoryRepository = {
                findOne: jest.fn(),
              };

              mockUserService = {
                getCurrentUserId: jest.fn(),
              };

              const module: TestingModule = await Test.createTestingModule({
                providers: [
                  TransactionService,
                  {
                    provide: 'TransactionRepository',
                    useValue: mockTransactionRepository,
                  },
                  {
                    provide: 'CategoryRepository',
                    useValue: mockCategoryRepository,
                  },
                  {
                    provide: MockUserService,
                    useValue: mockUserService,
                  },
                ],
              }).compile();

              transactionService = module.get<TransactionService>(TransactionService);

              // Set test user ID
              const testUserId = 'test-user-123';
              mockUserService.getCurrentUserId.mockReturnValue(testUserId);

              // Create test category using builder
              testCategory = new CategoryBuilder()
                .asIncome()
                .withName('Salary')
                .withColor('#00FF00')
                .withDescription('Salary category')
                .create();

              // Create test transaction using builder
              testTransaction = new TransactionBuilder()
                .withDescription('Initial Transaction')
                .asIncome()
                .onDate(new Date('2024-01-15'))
                .withUserId(testUserId)
                .withCategoryId(testCategory.id)
                .withNotes('Initial notes')
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              // Mock the initial transaction lookup
              mockTransactionRepository.findOne.mockResolvedValue(testTransaction);
            });

            it('should update transaction description', async () => {
              // Arrange: Prepare update data
              const updateData = {
                description: 'Updated Transaction Description',
              };

              const updatedTransaction = {
                ...testTransaction,
                description: 'Updated Transaction Description',
              };

              mockTransactionRepository.update.mockResolvedValue({ affected: 1 });
              mockTransactionRepository.findOne.mockResolvedValue(updatedTransaction);

              // Act: Update transaction
              const result = await transactionService.update(testTransaction.id, updateData);

              // Assert: Verify description was updated
              expect(result.description).toBe('Updated Transaction Description');
              expect(result.amount).toBe(testTransaction.amount); // Other fields unchanged
              expect(result.notes).toBe('Initial notes'); // Other fields unchanged

              // Verify mocks were called correctly
              expect(mockTransactionRepository.update).toHaveBeenCalledWith(testTransaction.id, updateData);
              expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
                where: { id: testTransaction.id },
                relations: ['category'],
              });
            });

            it('should update transaction amount', async () => {
              // Arrange: Prepare update data
              const updateData = {
                amount: 1500.00,
              };

              const updatedTransaction = {
                ...testTransaction,
                amount: 1500.00,
              };

              mockTransactionRepository.update.mockResolvedValue({ affected: 1 });
              mockTransactionRepository.findOne.mockResolvedValue(updatedTransaction);

              // Act: Update transaction
              const result = await transactionService.update(testTransaction.id, updateData);

              // Assert: Verify amount was updated
              expect(result.amount).toBe(1500.00);
              expect(result.description).toBe('Initial Transaction'); // Other fields unchanged

              // Verify mocks were called correctly
              expect(mockTransactionRepository.update).toHaveBeenCalledWith(testTransaction.id, updateData);
            });

            it('should update transaction date', async () => {
              // Arrange: Prepare update data
              const updateData = {
                date: '2024-02-15',
              };

              const updatedTransaction = {
                ...testTransaction,
                date: new Date('2024-02-15'),
              };

              mockTransactionRepository.update.mockResolvedValue({ affected: 1 });
              mockTransactionRepository.findOne.mockResolvedValue(updatedTransaction);

              // Act: Update transaction
              const result = await transactionService.update(testTransaction.id, updateData);

              // Assert: Verify date was updated
              expect(result.date).toEqual(new Date('2024-02-15'));
              expect(result.description).toBe('Initial Transaction'); // Other fields unchanged

              // Verify mocks were called correctly
              expect(mockTransactionRepository.update).toHaveBeenCalledWith(testTransaction.id, {
                date: new Date('2024-02-15')
              });
            });

            it('should update transaction category', async () => {
              // Arrange: Create new category using builder and prepare update data
              const newCategory = new CategoryBuilder()
                .asExpense()
                .withName('Food')
                .withColor('#FF0000')
                .withDescription('Food category')
                .create();

              const updateData = {
                categoryId: newCategory.id,
              };

              const updatedTransaction = {
                ...testTransaction,
                categoryId: newCategory.id,
                category: newCategory,
              };

              mockCategoryRepository.findOne.mockResolvedValue(newCategory);
              mockTransactionRepository.update.mockResolvedValue({ affected: 1 });
              mockTransactionRepository.findOne.mockResolvedValue(updatedTransaction);

              // Act: Update transaction
              const result = await transactionService.update(testTransaction.id, updateData);

              // Assert: Verify category was updated
              expect(result.categoryId).toBe(newCategory.id);
              expect(result.categoryName).toBe('Food');
              expect(result.description).toBe('Initial Transaction'); // Other fields unchanged

              // Verify mocks were called correctly
              expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
                where: { id: newCategory.id },
              });
              expect(mockTransactionRepository.update).toHaveBeenCalledWith(testTransaction.id, updateData);
            });

            it('should update transaction notes', async () => {
              // Arrange: Prepare update data
              const updateData = {
                notes: 'Updated notes for the transaction',
              };

              const updatedTransaction = {
                ...testTransaction,
                notes: 'Updated notes for the transaction',
              };

              mockTransactionRepository.update.mockResolvedValue({ affected: 1 });
              mockTransactionRepository.findOne.mockResolvedValue(updatedTransaction);

              // Act: Update transaction
              const result = await transactionService.update(testTransaction.id, updateData);

              // Assert: Verify notes were updated
              expect(result.notes).toBe('Updated notes for the transaction');
              expect(result.description).toBe('Initial Transaction'); // Other fields unchanged

              // Verify mocks were called correctly
              expect(mockTransactionRepository.update).toHaveBeenCalledWith(testTransaction.id, updateData);
            });

            it('should update transaction frequency', async () => {
              // Arrange: Prepare update data
              const updateData = {
                frequency: FrequencyEnum.WEEK,
              };

              const updatedTransaction = {
                ...testTransaction,
                frequency: FrequencyEnum.WEEK,
              };

              mockTransactionRepository.update.mockResolvedValue({ affected: 1 });
              mockTransactionRepository.findOne.mockResolvedValue(updatedTransaction);

              // Act: Update transaction
              const result = await transactionService.update(testTransaction.id, updateData);

              // Assert: Verify frequency was updated
              expect(result.frequency).toBe(FrequencyEnum.WEEK);
              expect(result.description).toBe('Initial Transaction'); // Other fields unchanged

              // Verify mocks were called correctly
              expect(mockTransactionRepository.update).toHaveBeenCalledWith(testTransaction.id, updateData);
            });

            it('should update multiple fields at once', async () => {
              // Arrange: Prepare update data with multiple fields
              const updateData = {
                description: 'Multi-updated transaction',
                amount: 2000.00,
                notes: 'Multiple fields updated',
                frequency: FrequencyEnum.QUARTER,
              };

              const updatedTransaction = {
                ...testTransaction,
                description: 'Multi-updated transaction',
                amount: 2000.00,
                notes: 'Multiple fields updated',
                frequency: FrequencyEnum.QUARTER,
              };

              mockTransactionRepository.update.mockResolvedValue({ affected: 1 });
              mockTransactionRepository.findOne.mockResolvedValue(updatedTransaction);

              // Act: Update transaction
              const result = await transactionService.update(testTransaction.id, updateData);

              // Assert: Verify all fields were updated
              expect(result.description).toBe('Multi-updated transaction');
              expect(result.amount).toBe(2000.00);
              expect(result.notes).toBe('Multiple fields updated');
              expect(result.frequency).toBe(FrequencyEnum.QUARTER);
              expect(result.date).toEqual(new Date('2024-01-15')); // Unchanged field
              expect(result.categoryId).toBe(testCategory.id); // Unchanged field

              // Verify mocks were called correctly
              expect(mockTransactionRepository.update).toHaveBeenCalledWith(testTransaction.id, updateData);
            });
          });
        });
      });
    });
  });
});
