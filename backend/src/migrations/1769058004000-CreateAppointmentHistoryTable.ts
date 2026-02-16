import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateAppointmentHistoryTable1769058004000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'APPOINTMENT_HISTORY',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            default: '(UUID())',
          },
          {
            name: 'appointment_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'old_status',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'new_status',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'change_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'changed_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'changed_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'APPOINTMENT_HISTORY',
      new TableForeignKey({
        columnNames: ['appointment_id'],
        referencedTableName: 'APPOINTMENTS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_APPOINTMENT_HISTORY_APPOINTMENT_ID',
      }),
    );

    await queryRunner.createIndex(
      'APPOINTMENT_HISTORY',
      new TableIndex({
        name: 'IDX_APPOINTMENT_HISTORY_APPOINTMENT',
        columnNames: ['appointment_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('APPOINTMENT_HISTORY');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('APPOINTMENT_HISTORY', fk);
      }
      for (const index of table.indices) {
        await queryRunner.dropIndex('APPOINTMENT_HISTORY', index);
      }
    }
    await queryRunner.dropTable('APPOINTMENT_HISTORY');
  }
}
