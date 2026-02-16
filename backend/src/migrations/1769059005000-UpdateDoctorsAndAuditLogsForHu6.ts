import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class UpdateDoctorsAndAuditLogsForHu61769059005000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const doctorsTable = await queryRunner.getTable('DOCTORS');
    const auditLogsTable = await queryRunner.getTable('audit_logs');

    if (auditLogsTable && !auditLogsTable.findColumnByName('old_values')) {
      await queryRunner.addColumn(
        'audit_logs',
        new TableColumn({
          name: 'old_values',
          type: 'text',
          isNullable: true,
          comment: 'Valores previos de la entidad en formato JSON',
        })
      );
    }

    if (auditLogsTable && !auditLogsTable.findColumnByName('new_values')) {
      await queryRunner.addColumn(
        'audit_logs',
        new TableColumn({
          name: 'new_values',
          type: 'text',
          isNullable: true,
          comment: 'Valores nuevos de la entidad en formato JSON',
        })
      );
    }

    if (
      doctorsTable &&
      !doctorsTable.indices.some(
        (index) => index.name === 'IDX_DOCTORS_POSTAL_VERIFICATION'
      )
    ) {
      await queryRunner.createIndex(
        'DOCTORS',
        new TableIndex({
          name: 'IDX_DOCTORS_POSTAL_VERIFICATION',
          columnNames: ['postalCode', 'verification_status'],
        })
      );
    }

    if (
      doctorsTable &&
      !doctorsTable.indices.some((index) => index.name === 'IDX_DOCTORS_UPDATED_AT')
    ) {
      await queryRunner.createIndex(
        'DOCTORS',
        new TableIndex({
          name: 'IDX_DOCTORS_UPDATED_AT',
          columnNames: ['updated_at'],
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const doctorsTable = await queryRunner.getTable('DOCTORS');
    const auditLogsTable = await queryRunner.getTable('audit_logs');

    if (
      doctorsTable &&
      doctorsTable.indices.some(
        (index) => index.name === 'IDX_DOCTORS_POSTAL_VERIFICATION'
      )
    ) {
      await queryRunner.dropIndex('DOCTORS', 'IDX_DOCTORS_POSTAL_VERIFICATION');
    }

    if (
      doctorsTable &&
      doctorsTable.indices.some((index) => index.name === 'IDX_DOCTORS_UPDATED_AT')
    ) {
      await queryRunner.dropIndex('DOCTORS', 'IDX_DOCTORS_UPDATED_AT');
    }

    if (auditLogsTable && auditLogsTable.findColumnByName('old_values')) {
      await queryRunner.dropColumn('audit_logs', 'old_values');
    }

    if (auditLogsTable && auditLogsTable.findColumnByName('new_values')) {
      await queryRunner.dropColumn('audit_logs', 'new_values');
    }
  }
}
