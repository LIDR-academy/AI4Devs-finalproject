import { BaseBuilder } from './base.builder';
import { Category, CategoryFlow } from '../../backend/src/domain/entities/category.entity';
import { faker } from '@faker-js/faker';

export class CategoryBuilder extends BaseBuilder<Category> {
  protected defaultData: Partial<Category> = {
    name: 'Test Category',
    flow: CategoryFlow.EXPENSE,
    color: '#FF0000',
    description: 'Test category description',
    parentId: undefined
  };
  
  withName(name: string): this {
    this.currentData.name = name;
    return this;
  }
  
  asIncome(): this {
    this.currentData.flow = CategoryFlow.INCOME;
    return this;
  }
  
  asExpense(): this {
    this.currentData.flow = CategoryFlow.EXPENSE;
    return this;
  }
  
  asSavingsAndInvestments(): this {
    this.currentData.flow = CategoryFlow.SAVINGS_AND_INVESTMENTS;
    return this;
  }
  
  withColor(color: string): this {
    this.currentData.color = color;
    return this;
  }
  
  withDescription(description: string): this {
    this.currentData.description = description;
    return this;
  }
  
  withParentId(parentId: string): this {
    this.currentData.parentId = parentId;
    return this;
  }
  
  asRoot(): this {
    this.currentData.parentId = undefined;
    return this;
  }
  
  asChild(parentId: string): this {
    this.currentData.parentId = parentId;
    return this;
  }
  
  withRandomName(): this {
    const names = ['Groceries', 'Transport', 'Entertainment', 'Utilities', 'Salary', 'Freelance', 'Investment'];
    this.currentData.name = faker.helpers.arrayElement(names);
    return this;
  }
  
  withRandomColor(): this {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];
    this.currentData.color = faker.helpers.arrayElement(colors);
    return this;
  }
}
