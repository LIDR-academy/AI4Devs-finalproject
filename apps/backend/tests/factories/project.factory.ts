
import { faker } from '@faker-js/faker';

export const createProjectDtoFactory = (overrides = {}) => ({
  title: faker.commerce.productName(),
  description: faker.lorem.sentence(),
  ...overrides,
});

export const projectEntityFactory = (overrides = {}) => ({
  id: faker.string.uuid(),
  title: faker.commerce.productName(),
  description: faker.lorem.sentence(),
  architectId: faker.string.uuid(),
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
