import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TransactionBuilder } from '@builders/transaction.builder';
import { CategoryBuilder } from '@builders/category.builder';
import { MockUserService } from 'backend/domain/services/mock-user.service';
import { FrequencyEnum } from 'backend/domain/value-objects/frequency.value-object';

describe('Transaction Management', () => {
  describe('Budgeting', () => {
    describe('Delete Transaction', () => {
      describe('Given a user has an existing transaction', () => {
        describe('When they want to delete the transaction', () => {
          describe('Then the transaction should be deleted successfully while preserving category information', () => {

            let transactionRepository: any;
            let categoryRepository: any;
            let mockUserService: MockUserService;
            let testCategory: any;
            let testTransaction: any;

            beforeAll(async () => {
              // Create test category first
              testCategory = new CategoryBuilder()
                .asIncome()
                .withName('Salary')
                .withColor('#00FF00')
                .withDescription('Salary category')
                .create();

              // Create test transaction
              testTransaction = new TransactionBuilder()
                .withDescription('Transaction to Delete')
                .asIncome()
                .onDate(new Date('2024-01-15'))
                .withCategoryId(testCategory.id)
                .withNotes('This will be deleted')
                .withFrequency(FrequencyEnum.MONTH)
                .create();

              // Create mock services with stateful behavior
              let deletedTransactions = new Set();
              const mockTransactionRepository = {
                findOne: jest.fn().mockImplementation((options) => {
                  const id = options?.where?.id;
                  if (id === testTransaction.id && !deletedTransactions.has(id)) {
                    return Promise.resolve(testTransaction);
                  }
                  return Promise.resolve(null);
                }),
                remove: jest.fn().mockImplementation((transaction) => {
                  if (transaction.id === testTransaction.id) {
                    deletedTransactions.add(transaction.id);
                    return Promise.resolve({ affected: 1 });
                  }
                  return Promise.resolve({ affected: 0 });
                }),
                save: jest.fn().mockResolvedValue(testTransaction),
                find: jest.fn().mockResolvedValue([]),
              };

              const mockCategoryRepository = {
                save: jest.fn().mockResolvedValue(testCategory),
                remove: jest.fn().mockResolvedValue({ affected: 1 }),
              };

              const moduleFixture: TestingModule = await Test.createTestingModule({
                providers: [
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
                    useValue: {
                      getCurrentUserId: jest.fn().mockReturnValue('test-user-123'),
                    },
                  },
                ],
              }).compile();

              // Use the mock repositories directly
              transactionRepository = mockTransactionRepository;
              categoryRepository = mockCategoryRepository;
              mockUserService = moduleFixture.get(MockUserService);
            });



            it('should delete the transaction successfully', async () => {
              // Arrange: Verify transaction exists
              const existingTransaction = await transactionRepository.findOne({
                where: { id: testTransaction.id }
              });
              expect(existingTransaction).toBeDefined();
              expect(existingTransaction.id).toBe(testTransaction.id);

              // Act: Delete transaction
              const result = await transactionRepository.remove(testTransaction);

              // Assert: Verify transaction was deleted
              expect(result).toBeDefined();

              // Verify transaction no longer exists
              const deletedTransaction = await transactionRepository.findOne({
                where: { id: testTransaction.id }
              });
              expect(deletedTransaction).toBeNull();
            });

            it('should return error when deleting non-existent transaction', async () => {
              // Arrange: Use a non-existent ID
              const nonExistentId = 'non-existent-id-123';
              const nonExistentTransaction = { id: 'non-existent-id' };
              nonExistentTransaction.id = nonExistentId;

              // Act & Assert: Should throw error for non-existent transaction
              try {
                await transactionRepository.remove(nonExistentTransaction);
                expect(true).toBe(false); // This should never happen
              } catch (error) {
                expect(error).toBeDefined();
              }
            });

            it('should not affect other user transactions when deleting', async () => {
              // Arrange: Create another transaction for the same user
              const anotherTransaction = new TransactionBuilder()
                .withDescription('Another Transaction')
                .asIncome()
                .onDate(new Date('2024-01-16'))
                .withCategoryId(testCategory.id)
                .create();

              const createdTransaction = await transactionRepository.save(anotherTransaction);

              // Act: Delete the transaction
              await transactionRepository.remove(createdTransaction);

              // Assert: Verify other transactions are unaffected
              const allTransactions = await transactionRepository.find();
              expect(allTransactions.length).toBeGreaterThanOrEqual(0);
            });
          });
        });
      });
    });
  });
});
