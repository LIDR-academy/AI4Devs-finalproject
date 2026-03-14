import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSpecialtiesTable1769058000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla SPECIALTIES
    await queryRunner.createTable(
      new Table({
        name: 'SPECIALTIES',
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
            name: 'name_es',
            type: 'varchar',
            length: '150',
            isNullable: false,
            comment: 'Nombre de la especialidad en español',
          },
          {
            name: 'name_en',
            type: 'varchar',
            length: '150',
            isNullable: false,
            comment: 'Nombre de la especialidad en inglés',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Indica si la especialidad está activa',
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

    // Índice en is_active para filtrar especialidades activas
    await queryRunner.createIndex(
      'SPECIALTIES',
      new TableIndex({
        name: 'IDX_SPECIALTIES_IS_ACTIVE',
        columnNames: ['is_active'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices primero
    const table = await queryRunner.getTable('SPECIALTIES');
    if (table) {
      const indices = table.indices;
      for (const index of indices) {
        await queryRunner.dropIndex('SPECIALTIES', index);
      }
    }

    // Eliminar tabla
    await queryRunner.dropTable('SPECIALTIES');
  }
}
