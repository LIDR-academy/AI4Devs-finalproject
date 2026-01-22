import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAuditLogsTable1769055138000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla audit_logs
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: '(UUID())',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Tipo de acción: register, login, update, delete, etc.',
          },
          {
            name: 'entityType',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Tipo de entidad: user, appointment, doctor, etc.',
          },
          {
            name: 'entityId',
            type: 'varchar',
            length: '36',
            isNullable: false,
            comment: 'ID de la entidad afectada',
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: 'ID del usuario que realizó la acción',
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '45',
            isNullable: false,
            comment: 'IPv4 o IPv6',
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Crear índices
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_USER_ID',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_ENTITY',
        columnNames: ['entityType', 'entityId'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_TIMESTAMP',
        columnNames: ['timestamp'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_ACTION_TIMESTAMP',
        columnNames: ['action', 'timestamp'],
      }),
    );

    // Foreign key opcional a USERS (si se requiere integridad referencial)
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'USERS',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // Si se elimina usuario, mantener log pero sin userId
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key
    const table = await queryRunner.getTable('audit_logs');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('audit_logs', foreignKey);
      }
    }

    // Eliminar índices
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_ACTION_TIMESTAMP');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_TIMESTAMP');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_ENTITY');
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_LOGS_USER_ID');

    // Eliminar tabla
    await queryRunner.dropTable('audit_logs');
  }
}
