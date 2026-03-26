import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { User } from '../../users/entities/user.entity';
import { ExpenseCategory } from './expense-category.entity';
import { ExpenseSplit } from './expense-split.entity';

/**
 * Entity that represents an expense in a trip.
 * Extends BaseEntity for id, timestamps, and soft delete.
 */
@Entity('expenses')
export class Expense extends BaseEntity {
  /**
   * Relation many-to-one with Trip.
   * An expense belongs to a trip.
   */
  @ManyToOne(() => Trip, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @Column({ name: 'trip_id', type: 'uuid' })
  @Index()
  tripId!: string;

  /**
   * Relation many-to-one with User (payer).
   * The user who paid for this expense.
   */
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payer_id' })
  payer!: User;

  @Column({ name: 'payer_id', type: 'uuid' })
  @Index()
  payerId!: string;

  /**
   * Relation many-to-one with ExpenseCategory.
   * The category of this expense.
   */
  @ManyToOne(() => ExpenseCategory, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: ExpenseCategory;

  @Column({ name: 'category_id', type: 'int' })
  @Index()
  categoryId!: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title!: string;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  amount!: number;

  @Column({
    name: 'receipt_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  receiptUrl!: string | null;

  @Column({ name: 'expense_date', type: 'date' })
  expenseDate!: Date;

  /**
   * Relation one-to-many with ExpenseSplit.
   * An expense can be split among multiple users.
   */
  @OneToMany(() => ExpenseSplit, (split) => split.expense, {
    cascade: true,
  })
  splits!: ExpenseSplit[];
}
