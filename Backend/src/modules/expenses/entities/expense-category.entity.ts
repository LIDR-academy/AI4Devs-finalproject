import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index } from 'typeorm';
import { Expense } from './expense.entity';

/**
 * Entity that represents an expense category.
 * This is a lookup table with numeric IDs, so it does not extend BaseEntity.
 */
@Entity('expense_categories')
export class ExpenseCategory {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 50, unique: true })
  @Index()
  name!: string;

  @Column({ name: 'icon', type: 'varchar', length: 50, nullable: true })
  icon!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  /**
   * Relation one-to-many with Expense.
   * A category can have multiple expenses.
   */
  @OneToMany(() => Expense, (expense) => expense.category)
  expenses!: Expense[];
}
