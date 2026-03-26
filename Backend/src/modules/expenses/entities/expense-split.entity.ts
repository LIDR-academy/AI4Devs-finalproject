import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Expense } from './expense.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Entity that represents how an expense is split among users.
 * Extends BaseEntity for id, timestamps, and soft delete.
 */
@Entity('expense_splits')
export class ExpenseSplit extends BaseEntity {
  /**
   * Relation many-to-one with Expense.
   * A split belongs to an expense.
   */
  @ManyToOne(() => Expense, (expense) => expense.splits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'expense_id' })
  expense!: Expense;

  @Column({ name: 'expense_id', type: 'uuid' })
  @Index()
  expenseId!: string;

  /**
   * Relation many-to-one with User (beneficiary).
   * The user who owes part of this expense.
   */
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @Column({
    name: 'amount_owed',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  amountOwed!: number;
}
