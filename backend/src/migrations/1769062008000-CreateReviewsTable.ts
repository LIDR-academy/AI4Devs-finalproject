import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateReviewsTable1769062008000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'REVIEWS',
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
            isUnique: true,
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
            name: 'rating',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'moderation_status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected'],
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'moderated_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'moderated_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'moderation_notes',
            type: 'text',
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
      true
    );

    const table = await queryRunner.getTable('REVIEWS');
    const existingFkNames = new Set(table?.foreignKeys.map((fk) => fk.name) ?? []);

    const foreignKeys = [
      new TableForeignKey({
        columnNames: ['appointment_id'],
        referencedTableName: 'APPOINTMENTS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_REVIEWS_APPOINTMENT_ID',
      }),
      new TableForeignKey({
        columnNames: ['patient_id'],
        referencedTableName: 'USERS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_REVIEWS_PATIENT_ID',
      }),
      new TableForeignKey({
        columnNames: ['doctor_id'],
        referencedTableName: 'DOCTORS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_REVIEWS_DOCTOR_ID',
      }),
      new TableForeignKey({
        columnNames: ['moderated_by'],
        referencedTableName: 'USERS',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_REVIEWS_MODERATED_BY',
      }),
    ];

    for (const fk of foreignKeys) {
      if (!existingFkNames.has(fk.name!)) {
        await queryRunner.createForeignKey('REVIEWS', fk);
      }
    }

    const existingIndexNames = new Set(table?.indices.map((idx) => idx.name) ?? []);
    const indexes = [
      new TableIndex({
        name: 'IDX_REVIEWS_DOCTOR_ID',
        columnNames: ['doctor_id'],
      }),
      new TableIndex({
        name: 'IDX_REVIEWS_MODERATION_STATUS',
        columnNames: ['moderation_status'],
      }),
      new TableIndex({
        name: 'IDX_REVIEWS_CREATED_AT',
        columnNames: ['created_at'],
      }),
      new TableIndex({
        name: 'UQ_REVIEWS_APPOINTMENT_ID',
        columnNames: ['appointment_id'],
        isUnique: true,
      }),
    ];

    for (const index of indexes) {
      if (!existingIndexNames.has(index.name!)) {
        await queryRunner.createIndex('REVIEWS', index);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('REVIEWS');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('REVIEWS', fk);
      }
      for (const index of table.indices) {
        await queryRunner.dropIndex('REVIEWS', index);
      }
    }
    await queryRunner.dropTable('REVIEWS');
  }
}
