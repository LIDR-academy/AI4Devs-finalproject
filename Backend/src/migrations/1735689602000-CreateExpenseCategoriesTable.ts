import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableUnique,
} from 'typeorm';

/**
 * Migration to create the expense_categories table.
 * Creates the table and inserts initial category data.
 */
export class CreateExpenseCategoriesTable1735689602000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'expense_categories',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create unique constraint for name
    await queryRunner.createUniqueConstraint(
      'expense_categories',
      new TableUnique({
        name: 'UQ_expense_categories_name',
        columnNames: ['name'],
      }),
    );

    // Create index for name
    await queryRunner.createIndex(
      'expense_categories',
      new TableIndex({
        name: 'IDX_expense_categories_name',
        columnNames: ['name'],
      }),
    );

    // Insert initial category data
    await queryRunner.query(`
      INSERT INTO expense_categories (name, icon, is_active) VALUES
      ('Comida', '🍽️', true),
      ('Transporte', '🚗', true),
      ('Alojamiento', '🏨', true),
      ('Entretenimiento', '🎬', true),
      ('Varios', '📦', true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.dropIndex(
      'expense_categories',
      'IDX_expense_categories_name',
    );

    // Drop unique constraint
    await queryRunner.dropUniqueConstraint(
      'expense_categories',
      'UQ_expense_categories_name',
    );

    // Drop table
    await queryRunner.dropTable('expense_categories');
  }
}
