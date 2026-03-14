import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateAppointmentsTable1769058003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'APPOINTMENTS',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            default: '(UUID())',
          },
          {
            name: 'patient_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'doctor_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'slot_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'appointment_date',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['confirmed', 'pending', 'completed', 'cancelled', 'no_show'],
            default: "'confirmed'",
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'cancellation_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'reminder_sent',
            type: 'boolean',
            default: false,
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
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    const table = await queryRunner.getTable('APPOINTMENTS');
    const existingFkNames = new Set(
      table?.foreignKeys.map((fk) => fk.name) ?? []
    );

    const foreignKeys = [
      {
        def: new TableForeignKey({
          columnNames: ['patient_id'],
          referencedTableName: 'USERS',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          name: 'FK_APPOINTMENTS_PATIENT_ID',
        }),
      },
      {
        def: new TableForeignKey({
          columnNames: ['doctor_id'],
          referencedTableName: 'DOCTORS',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          name: 'FK_APPOINTMENTS_DOCTOR_ID',
        }),
      },
      {
        def: new TableForeignKey({
          columnNames: ['slot_id'],
          referencedTableName: 'SLOTS',
          referencedColumnNames: ['id'],
          onDelete: 'RESTRICT',
          name: 'FK_APPOINTMENTS_SLOT_ID',
        }),
      },
    ];

    for (const { def } of foreignKeys) {
      if (!existingFkNames.has(def.name!)) {
        await queryRunner.createForeignKey('APPOINTMENTS', def);
      }
    }

    const existingIndexNames = new Set(
      table?.indices.map((idx) => idx.name) ?? []
    );

    const indices = [
      new TableIndex({
        name: 'IDX_APPOINTMENTS_PATIENT_STATUS',
        columnNames: ['patient_id', 'status'],
      }),
      new TableIndex({
        name: 'IDX_APPOINTMENTS_DOCTOR_DATE',
        columnNames: ['doctor_id', 'appointment_date'],
      }),
      new TableIndex({
        name: 'UQ_APPOINTMENTS_SLOT_ID',
        columnNames: ['slot_id'],
        isUnique: true,
      }),
    ];

    for (const index of indices) {
      if (!existingIndexNames.has(index.name!)) {
        await queryRunner.createIndex('APPOINTMENTS', index);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('APPOINTMENTS');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('APPOINTMENTS', fk);
      }
      for (const index of table.indices) {
        await queryRunner.dropIndex('APPOINTMENTS', index);
      }
    }
    await queryRunner.dropTable('APPOINTMENTS');
  }
}
