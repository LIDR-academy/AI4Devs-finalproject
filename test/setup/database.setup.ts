import { DataSource } from 'typeorm';
import { Transaction } from 'backend/domain/entities/transaction.entity';
import { Category } from 'backend/domain/entities/category.entity';

export class DatabaseSetup {
  private dataSource: DataSource;

  async initialize(): Promise<void> {
    this.dataSource = new DataSource({
      type: 'postgres',
      host: 'localhost',
      port: 5433, // External port mapped from Docker container
      username: 'user',
      password: 'password',
      database: 'salary_tracker',
      entities: [Transaction, Category],
      synchronize: true, // For tests, we want to sync the schema
      logging: false, // Disable logging for cleaner test output
    });

    await this.dataSource.initialize();
    
    // Force schema synchronization
    await this.dataSource.synchronize();
  }

  async cleanup(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      try {
        // Use a transaction for cleanup to ensure atomicity
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        try {
          // Clear all data but keep schema - use RESTART IDENTITY to reset auto-increment
          await queryRunner.query('TRUNCATE TABLE transactions RESTART IDENTITY CASCADE');
          await queryRunner.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE');
          
          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      } catch (error) {
        // Tables might not exist yet, ignore cleanup errors
        console.log('Cleanup warning:', error.message);
      }
    }
  }

  async close(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  async saveCategory(category: Partial<Category>): Promise<Category> {
    const categoryRepository = this.dataSource.getRepository(Category);
    return await categoryRepository.save(category);
  }

  async saveTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const transactionRepository = this.dataSource.getRepository(Transaction);
    return await transactionRepository.save(transaction);
  }

  async findCategory(id: string): Promise<Category | null> {
    const categoryRepository = this.dataSource.getRepository(Category);
    return await categoryRepository.findOne({ where: { id } });
  }

  async findTransaction(id: string): Promise<Transaction | null> {
    const transactionRepository = this.dataSource.getRepository(Transaction);
    return await transactionRepository.findOne({ where: { id } });
  }

  async deleteCategory(id: string): Promise<void> {
    const categoryRepository = this.dataSource.getRepository(Category);
    await categoryRepository.delete(id);
  }

  async deleteTransaction(id: string): Promise<void> {
    const transactionRepository = this.dataSource.getRepository(Transaction);
    await transactionRepository.delete(id);
  }
}
