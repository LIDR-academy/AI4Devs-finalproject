import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

/**
 * Migration to create the expenses table.
 * Creates the table with foreign keys to trips, users, and expense_categories.
 */
export class CreateExpensesTable1735689603000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'expenses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'trip_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'payer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'category_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'receipt_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'expense_date',
            type: 'date',
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
      'expenses',
      new TableIndex({
        name: 'IDX_expenses_trip_id',
        columnNames: ['trip_id'],
      }),
    );

    await queryRunner.createIndex(
      'expenses',
      new TableIndex({
        name: 'IDX_expenses_payer_id',
        columnNames: ['payer_id'],
      }),
    );

    await queryRunner.createIndex(
      'expenses',
      new TableIndex({
        name: 'IDX_expenses_category_id',
        columnNames: ['category_id'],
      }),
    );

    // Create foreign key to trips
    await queryRunner.createForeignKey(
      'expenses',
      new TableForeignKey({
        columnNames: ['trip_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'trips',
        onDelete: 'CASCADE',
        name: 'FK_expenses_trip',
      }),
    );

    // Create foreign key to users (payer)
    await queryRunner.createForeignKey(
      'expenses',
      new TableForeignKey({
        columnNames: ['payer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_expenses_payer',
      }),
    );

    // Create foreign key to expense_categories
    await queryRunner.createForeignKey(
      'expenses',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'expense_categories',
        onDelete: 'RESTRICT',
        name: 'FK_expenses_category',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('expenses', 'FK_expenses_category');
    await queryRunner.dropForeignKey('expenses', 'FK_expenses_payer');
    await queryRunner.dropForeignKey('expenses', 'FK_expenses_trip');

    // Drop indexes
    await queryRunner.dropIndex('expenses', 'IDX_expenses_category_id');
    await queryRunner.dropIndex('expenses', 'IDX_expenses_payer_id');
    await queryRunner.dropIndex('expenses', 'IDX_expenses_trip_id');

    // Drop table
    await queryRunner.dropTable('expenses');
  }
}
