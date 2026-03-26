import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

/**
 * Migration to create the expense_splits table.
 * Creates the table with foreign keys to expenses and users.
 */
export class CreateExpenseSplitsTable1735689604000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'expense_splits',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'expense_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'amount_owed',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for frequently queried columns
    await queryRunner.createIndex(
      'expense_splits',
      new TableIndex({
        name: 'IDX_expense_splits_expense_id',
        columnNames: ['expense_id'],
      }),
    );

    await queryRunner.createIndex(
      'expense_splits',
      new TableIndex({
        name: 'IDX_expense_splits_user_id',
        columnNames: ['user_id'],
      }),
    );

    // Create foreign key to expenses
    await queryRunner.createForeignKey(
      'expense_splits',
      new TableForeignKey({
        columnNames: ['expense_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'expenses',
        onDelete: 'CASCADE',
        name: 'FK_expense_splits_expense',
      }),
    );

    // Create foreign key to users (beneficiary)
    await queryRunner.createForeignKey(
      'expense_splits',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_expense_splits_user',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey(
      'expense_splits',
      'FK_expense_splits_user',
    );
    await queryRunner.dropForeignKey(
      'expense_splits',
      'FK_expense_splits_expense',
    );

    // Drop indexes
    await queryRunner.dropIndex('expense_splits', 'IDX_expense_splits_user_id');
    await queryRunner.dropIndex(
      'expense_splits',
      'IDX_expense_splits_expense_id',
    );

    // Drop table
    await queryRunner.dropTable('expense_splits');
  }
}
