import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateDoctorSpecialtiesTable1769058001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla DOCTOR_SPECIALTIES (relación many-to-many)
    await queryRunner.createTable(
      new Table({
        name: 'DOCTOR_SPECIALTIES',
        columns: [
          {
            name: 'doctor_id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            comment: 'Referencia a DOCTORS.id',
          },
          {
            name: 'specialty_id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            comment: 'Referencia a SPECIALTIES.id',
          },
          {
            name: 'is_primary',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Indica si es la especialidad principal del médico',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign key a DOCTORS
    await queryRunner.createForeignKey(
      'DOCTOR_SPECIALTIES',
      new TableForeignKey({
        columnNames: ['doctor_id'],
        referencedTableName: 'DOCTORS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_DOCTOR_SPECIALTIES_DOCTOR_ID',
      }),
    );

    // Foreign key a SPECIALTIES
    await queryRunner.createForeignKey(
      'DOCTOR_SPECIALTIES',
      new TableForeignKey({
        columnNames: ['specialty_id'],
        referencedTableName: 'SPECIALTIES',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_DOCTOR_SPECIALTIES_SPECIALTY_ID',
      }),
    );

    // Índice en doctor_id para búsquedas por médico
    await queryRunner.createIndex(
      'DOCTOR_SPECIALTIES',
      new TableIndex({
        name: 'IDX_DOCTOR_SPECIALTIES_DOCTOR_ID',
        columnNames: ['doctor_id'],
      }),
    );

    // Índice en specialty_id para búsquedas por especialidad
    await queryRunner.createIndex(
      'DOCTOR_SPECIALTIES',
      new TableIndex({
        name: 'IDX_DOCTOR_SPECIALTIES_SPECIALTY_ID',
        columnNames: ['specialty_id'],
      }),
    );

    // Índice en is_primary para encontrar especialidad principal
    await queryRunner.createIndex(
      'DOCTOR_SPECIALTIES',
      new TableIndex({
        name: 'IDX_DOCTOR_SPECIALTIES_IS_PRIMARY',
        columnNames: ['is_primary'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices primero
    const table = await queryRunner.getTable('DOCTOR_SPECIALTIES');
    if (table) {
      // Eliminar foreign keys
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('DOCTOR_SPECIALTIES', foreignKey);
      }

      // Eliminar índices
      const indices = table.indices;
      for (const index of indices) {
        await queryRunner.dropIndex('DOCTOR_SPECIALTIES', index);
      }
    }

    // Eliminar tabla
    await queryRunner.dropTable('DOCTOR_SPECIALTIES');
  }
}
