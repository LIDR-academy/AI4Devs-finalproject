import { Factory } from 'rosie';
import { BaseBuilder } from './base.builder';
import { Category, CategoryFlow } from '@entities/category.entity';
import { faker } from '@faker-js/faker';

const factory = Factory.define<Category>('category')
  .attrs({
    id: () => faker.string.uuid(),
    name: () => faker.commerce.department(),
    flow: () => faker.helpers.arrayElement(Object.values(CategoryFlow)),
    color: () => faker.internet.color(),
    description: () => faker.lorem.sentence(),
    parentId: () => undefined,
    createdAt: () => faker.date.past(),
    updatedAt: () => faker.date.recent()
  });

export class CategoryBuilder extends BaseBuilder<Category> {
  constructor() {
    super(factory);
  }
  
  withName(name: string): this {
    this.options.name = name;
    return this;
  }
  
  withFlow(flow: CategoryFlow): this {
    this.options.flow = flow
    return this;
  }
  
  withColor(color: string): this {
    this.options.color = color;
    return this;
  }
  
  withDescription(description: string): this {
    this.options.description = description;
    return this;
  }
  
  withParentId(parentId: string): this {
    this.options.parentId = parentId;
    return this;
  }
  
  withParent(parent: Category): this {
    this.options.parentId = parent.id;
    return this;
  }
  
  asRoot(): this {
    this.options.parentId = undefined;
    return this;
  }
  
  asChild(parentId: string): this {
    this.options.parentId = parentId;
    return this;
  }
  
  asChildOf(parent: Category): this {
    this.options.parentId = parent.id;
    return this;
  }
}
