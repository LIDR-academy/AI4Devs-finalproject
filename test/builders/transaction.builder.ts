import { BaseBuilder } from './base.builder';
import { Transaction } from '../../backend/src/domain/entities/transaction.entity';
import { faker } from '@faker-js/faker';

export class TransactionBuilder extends BaseBuilder<Transaction> {
  protected defaultData: Partial<Transaction> = {
    description: 'Test transaction',
    amount: 100.00,
    date: new Date(),
    userId: faker.string.uuid(),
    categoryId: faker.string.uuid(),
    notes: undefined,
    frequency: 'MONTH' as any
  };
  
  withAmount(amount: number): this {
    this.currentData.amount = amount;
    return this;
  }
  
  asIncome(): this {
    const randomAmount = faker.number.float({ min: 0.01, max: 10000, precision: 0.01 });
    return this.withAmount(randomAmount);
  }
  
  asExpense(): this {
    const randomAmount = faker.number.float({ min: 0, max: 10000, precision: 0.01 });
    return this.withAmount(-randomAmount);
  }
  
  withDescription(description: string): this {
    this.currentData.description = description;
    return this;
  }
  
  onDate(date: Date): this {
    this.currentData.date = date;
    return this;
  }
  
  withUserId(userId: string): this {
    this.currentData.userId = userId;
    return this;
  }
  
  withCategoryId(categoryId: string): this {
    this.currentData.categoryId = categoryId;
    return this;
  }
  
  withNotes(notes: string): this {
    this.currentData.notes = notes;
    return this;
  }
  
  withFrequency(frequency: string): this {
    this.currentData.frequency = frequency as any;
    return this;
  }
}
