import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateVerificationDocumentsTable1769060006000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'VERIFICATION_DOCUMENTS',
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
            name: 'file_path',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'original_filename',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'file_size_bytes',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'document_type',
            type: 'enum',
            enum: ['cedula', 'diploma', 'other'],
            default: "'cedula'",
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected'],
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true
    );

    const table = await queryRunner.getTable('VERIFICATION_DOCUMENTS');
    const existingFkNames = new Set(table?.foreignKeys.map((fk) => fk.name) ?? []);

    const doctorFk = new TableForeignKey({
      columnNames: ['doctor_id'],
      referencedTableName: 'DOCTORS',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
      name: 'FK_VERIF_DOCS_DOCTOR_ID',
    });

    if (!existingFkNames.has(doctorFk.name!)) {
      await queryRunner.createForeignKey('VERIFICATION_DOCUMENTS', doctorFk);
    }

    const existingIndexNames = new Set(table?.indices.map((idx) => idx.name) ?? []);
    const indices = [
      new TableIndex({
        name: 'IDX_VERIF_DOCS_DOCTOR_ID',
        columnNames: ['doctor_id'],
      }),
      new TableIndex({
        name: 'IDX_VERIF_DOCS_STATUS',
        columnNames: ['status'],
      }),
      new TableIndex({
        name: 'IDX_VERIF_DOCS_CREATED_AT',
        columnNames: ['created_at'],
      }),
      new TableIndex({
        name: 'IDX_VERIF_DOCS_DOCTOR_STATUS',
        columnNames: ['doctor_id', 'status'],
      }),
    ];

    for (const index of indices) {
      if (!existingIndexNames.has(index.name!)) {
        await queryRunner.createIndex('VERIFICATION_DOCUMENTS', index);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('VERIFICATION_DOCUMENTS');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('VERIFICATION_DOCUMENTS', fk);
      }
      for (const index of table.indices) {
        await queryRunner.dropIndex('VERIFICATION_DOCUMENTS', index);
      }
      await queryRunner.dropTable('VERIFICATION_DOCUMENTS');
    }
  }
}
