import { Factory } from 'rosie'
import { faker } from '@faker-js/faker'
import { BaseBuilder } from './base.builder'
import { Transaction } from '@entities/transaction.entity'
import { FrequencyEnum } from '@value-objects/frequency.value-object'

const factory = Factory.define<Transaction>('transaction')
  .attrs({
    id: () => faker.string.uuid(),
    description: () => faker.lorem.sentence(),
    expression: () => faker.number.float({ min: 0.01, multipleOf: 0.01 }).toString(),
    categoryId: () => faker.string.uuid(),
    userId: () => faker.string.uuid(),
    notes: () => faker.lorem.paragraph(),
    frequency: () => FrequencyEnum.MONTH,
    createdAt: () => faker.date.past(),
    updatedAt: () => faker.date.recent()
  })

export class TransactionBuilder extends BaseBuilder<Transaction> {
  constructor() {
    super(factory)
  }

  withDescription(description: string): this {
    this.options.description = description
    return this
  }

  withExpression(expression: string): this {
    this.options.expression = expression
    return this
  }

  withCategoryId(categoryId: string): this {
    this.options.categoryId = categoryId
    return this
  }

  withUserId(userId: string): this {
    this.options.userId = userId
    return this
  }

  withNotes(notes: string): this {
    this.options.notes = notes
    return this
  }

  withFrequency(frequency: FrequencyEnum): this {
    this.options.frequency = frequency
    return this
  }

  asIncome(): this {
    const amount = faker.number.float({ min: 0.01, max: 1000, multipleOf: 0.01 })
    this.options.expression = amount.toString()
    return this
  }

  asExpense(): this {
    const amount = faker.number.float({ min: 0.01, max: 1000, multipleOf: 0.01 })
    this.options.expression = `-${amount.toString()}`
    return this
  }
}
