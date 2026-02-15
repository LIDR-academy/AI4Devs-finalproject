import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class AddAdminVerificationFieldsToDoctors1769063009000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('DOCTORS');
    if (!table) return;

    if (!table.findColumnByName('verified_by')) {
      await queryRunner.addColumn(
        'DOCTORS',
        new TableColumn({
          name: 'verified_by',
          type: 'varchar',
          length: '36',
          isNullable: true,
        })
      );
    }

    if (!table.findColumnByName('verified_at')) {
      await queryRunner.addColumn(
        'DOCTORS',
        new TableColumn({
          name: 'verified_at',
          type: 'datetime',
          isNullable: true,
        })
      );
    }

    if (!table.findColumnByName('verification_notes')) {
      await queryRunner.addColumn(
        'DOCTORS',
        new TableColumn({
          name: 'verification_notes',
          type: 'text',
          isNullable: true,
        })
      );
    }

    const refreshed = await queryRunner.getTable('DOCTORS');
    if (!refreshed) return;

    const existingFk = refreshed.foreignKeys.some((fk) => fk.name === 'FK_DOCTORS_VERIFIED_BY');
    if (!existingFk) {
      await queryRunner.createForeignKey(
        'DOCTORS',
        new TableForeignKey({
          name: 'FK_DOCTORS_VERIFIED_BY',
          columnNames: ['verified_by'],
          referencedTableName: 'USERS',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        })
      );
    }

    const hasIndex = refreshed.indices.some(
      (index) => index.name === 'IDX_DOCTORS_VERIFICATION_ADMIN'
    );
    if (!hasIndex) {
      await queryRunner.createIndex(
        'DOCTORS',
        new TableIndex({
          name: 'IDX_DOCTORS_VERIFICATION_ADMIN',
          columnNames: ['verification_status', 'verified_at'],
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('DOCTORS');
    if (!table) return;

    const fk = table.foreignKeys.find((item) => item.name === 'FK_DOCTORS_VERIFIED_BY');
    if (fk) {
      await queryRunner.dropForeignKey('DOCTORS', fk);
    }

    const idx = table.indices.find((item) => item.name === 'IDX_DOCTORS_VERIFICATION_ADMIN');
    if (idx) {
      await queryRunner.dropIndex('DOCTORS', idx);
    }

    if (table.findColumnByName('verification_notes')) {
      await queryRunner.dropColumn('DOCTORS', 'verification_notes');
    }
    if (table.findColumnByName('verified_at')) {
      await queryRunner.dropColumn('DOCTORS', 'verified_at');
    }
    if (table.findColumnByName('verified_by')) {
      await queryRunner.dropColumn('DOCTORS', 'verified_by');
    }
  }
}
