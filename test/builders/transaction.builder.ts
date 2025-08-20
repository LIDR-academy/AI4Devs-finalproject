import { Factory } from 'rosie';
import { BaseBuilder } from './base.builder';
import { Transaction } from '@entities/transaction.entity';
import { Category } from '@entities/category.entity';
import { FrequencyEnum } from '@value-objects/frequency.value-object';
import { faker } from '@faker-js/faker';

// Define the Rosie factory with functions for random generation
const factory = Factory.define<Transaction>('transaction')
  .attrs({
    id: () => faker.string.uuid(),
    description: () => faker.commerce.productName(),
    amount: () => faker.number.float({ min: 0.01, multipleOf: 0.01 }),
    date: () => faker.date.recent({ days: 30 }),
    userId: () => faker.string.uuid(),
    categoryId: () => faker.string.uuid(),
    notes: () => faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    frequency: () => faker.helpers.arrayElement([FrequencyEnum.DAILY, FrequencyEnum.WEEK, FrequencyEnum.MONTH, FrequencyEnum.YEAR]),
    createdAt: () => faker.date.past(),
    updatedAt: () => faker.date.recent()
  });

export class TransactionBuilder extends BaseBuilder<Transaction> {
  constructor() {
    super(factory);
  }
  
  withAmount(amount: number): this {
    this.options.amount = amount;
    return this;
  }
  
  asIncome(): this {
    const randomAmount = faker.number.float({ min: 0.01, multipleOf: 0.01 });
    return this.withAmount(randomAmount);
  }
  
  asExpense(): this {
    const randomAmount = faker.number.float({ min: 0.01, multipleOf: 0.01 });
    return this.withAmount(-randomAmount);
  }
  
  withDescription(description: string): this {
    this.options.description = description;
    return this;
  }
  
  onDate(date: Date): this {
    this.options.date = date;
    return this;
  }
  
  withUserId(userId: string): this {
    this.options.userId = userId;
    return this;
  }
  
  withCategoryId(categoryId: string): this {
    this.options.categoryId = categoryId;
    return this;
  }
  
  withCategory(category: Category): this {
    this.options.categoryId = category.id;
    return this;
  }
  
  withNotes(notes: string): this {
    this.options.notes = notes;
    return this;
  }
  
  withFrequency(frequency: FrequencyEnum): this {
    this.options.frequency = frequency;
    return this;
  }
  
  withRandomAmount(): this {
    this.options.amount = faker.number.float({ min: 0.01, multipleOf: 0.01 });
    return this;
  }
  
  withRandomDate(): this {
    this.options.date = faker.date.recent({ days: 365 });
    return this;
  }
  
  withRandomDescription(): this {
    this.options.description = faker.commerce.productName();
    return this;
  }
  
  withRandomNotes(): this {
    this.options.notes = faker.datatype.boolean() ? faker.lorem.sentence() : undefined;
    return this;
  }

  create(): Transaction {
    return this.factory.build(this.options);
  }

  createDto(): any {
    const dto: any = {};
    if (this.options.description) dto.description = this.options.description;
    if (this.options.amount) dto.amount = this.options.amount;
    if (this.options.date) dto.date = this.options.date instanceof Date ? this.options.date.toISOString().split('T')[0] : this.options.date;
    if (this.options.categoryId) dto.categoryId = this.options.categoryId;
    if (this.options.notes) dto.notes = this.options.notes;
    if (this.options.frequency) dto.frequency = this.options.frequency;
    return dto;
  }
}
