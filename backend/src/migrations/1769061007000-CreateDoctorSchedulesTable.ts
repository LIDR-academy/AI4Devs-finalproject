import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateDoctorSchedulesTable1769061007000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'DOCTOR_SCHEDULES',
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
            name: 'dayOfWeek',
            type: 'tinyint',
            isNullable: false,
          },
          {
            name: 'startTime',
            type: 'time',
            isNullable: false,
          },
          {
            name: 'endTime',
            type: 'time',
            isNullable: false,
          },
          {
            name: 'slotDurationMinutes',
            type: 'int',
            isNullable: false,
            default: 30,
          },
          {
            name: 'breakDurationMinutes',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
          },
          {
            name: 'deleted_at',
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
      'DOCTOR_SCHEDULES',
      new TableForeignKey({
        columnNames: ['doctor_id'],
        referencedTableName: 'DOCTORS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_DOCTOR_SCHEDULES_DOCTOR_ID',
      }),
    );

    await queryRunner.createIndex(
      'DOCTOR_SCHEDULES',
      new TableIndex({
        name: 'IDX_DOCTOR_SCHEDULES_DOCTOR_DAY',
        columnNames: ['doctor_id', 'dayOfWeek'],
      }),
    );
    await queryRunner.createIndex(
      'DOCTOR_SCHEDULES',
      new TableIndex({
        name: 'IDX_DOCTOR_SCHEDULES_IS_ACTIVE',
        columnNames: ['is_active'],
      }),
    );
    await queryRunner.createIndex(
      'DOCTOR_SCHEDULES',
      new TableIndex({
        name: 'IDX_DOCTOR_SCHEDULES_DELETED_AT',
        columnNames: ['deleted_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'SLOTS',
      new TableForeignKey({
        columnNames: ['schedule_id'],
        referencedTableName: 'DOCTOR_SCHEDULES',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_SLOTS_SCHEDULE_ID',
      }),
    );

    await queryRunner.createIndex(
      'SLOTS',
      new TableIndex({
        name: 'IDX_SLOTS_SCHEDULE_ID',
        columnNames: ['schedule_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const slotsTable = await queryRunner.getTable('SLOTS');
    if (slotsTable) {
      const scheduleFk = slotsTable.foreignKeys.find(
        (fk) => fk.name === 'FK_SLOTS_SCHEDULE_ID',
      );
      if (scheduleFk) {
        await queryRunner.dropForeignKey('SLOTS', scheduleFk);
      }
      const scheduleIdx = slotsTable.indices.find(
        (idx) => idx.name === 'IDX_SLOTS_SCHEDULE_ID',
      );
      if (scheduleIdx) {
        await queryRunner.dropIndex('SLOTS', scheduleIdx);
      }
    }

    const scheduleTable = await queryRunner.getTable('DOCTOR_SCHEDULES');
    if (scheduleTable) {
      for (const fk of scheduleTable.foreignKeys) {
        await queryRunner.dropForeignKey('DOCTOR_SCHEDULES', fk);
      }
      for (const index of scheduleTable.indices) {
        await queryRunner.dropIndex('DOCTOR_SCHEDULES', index);
      }
    }

    await queryRunner.dropTable('DOCTOR_SCHEDULES');
  }
}
