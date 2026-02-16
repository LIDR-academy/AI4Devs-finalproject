import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateSlotsTable1769058002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'SLOTS',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            default: '(UUID())',
          },
          {
            name: 'doctor_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'schedule_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'start_time',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'end_time',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'is_available',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'locked_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'locked_until',
            type: 'datetime',
            isNullable: true,
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
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'SLOTS',
      new TableForeignKey({
        columnNames: ['doctor_id'],
        referencedTableName: 'DOCTORS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_SLOTS_DOCTOR_ID',
      }),
    );

    await queryRunner.createIndex(
      'SLOTS',
      new TableIndex({
        name: 'IDX_SLOTS_DOCTOR_START',
        columnNames: ['doctor_id', 'start_time'],
      }),
    );

    await queryRunner.createIndex(
      'SLOTS',
      new TableIndex({
        name: 'IDX_SLOTS_AVAILABILITY',
        columnNames: ['is_available', 'locked_until'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('SLOTS');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('SLOTS', fk);
      }
      for (const index of table.indices) {
        await queryRunner.dropIndex('SLOTS', index);
      }
    }
    await queryRunner.dropTable('SLOTS');
  }
}
