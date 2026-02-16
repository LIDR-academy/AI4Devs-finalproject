import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateDoctorsTable1769057119000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla DOCTORS
    await queryRunner.createTable(
      new Table({
        name: 'DOCTORS',
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
            name: 'user_id',
            type: 'varchar',
            length: '36',
            isUnique: true,
            isNullable: false,
            comment: 'Referencia a USERS.id (relación 1:1)',
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
            isNullable: false,
            comment: 'Dirección completa del consultorio/clínica',
          },
          {
            name: 'postalCode',
            type: 'varchar',
            length: '20',
            isNullable: false,
            comment: 'Código postal (obligatorio para búsqueda fallback)',
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: true,
            comment: 'Coordenada geográfica latitud (geocodificada)',
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: true,
            comment: 'Coordenada geográfica longitud (geocodificada)',
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
            comment: 'Descripción profesional del médico (máximo 1000 caracteres)',
          },
          {
            name: 'verification_status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected'],
            default: "'pending'",
            isNullable: false,
            comment: 'Estado de verificación del médico',
          },
          {
            name: 'rating_average',
            type: 'decimal',
            precision: 3,
            scale: 2,
            isNullable: true,
            default: 0.0,
            comment: 'Promedio de calificaciones (1-5)',
          },
          {
            name: 'total_reviews',
            type: 'int',
            default: 0,
            isNullable: false,
            comment: 'Contador total de reseñas aprobadas',
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

    // Foreign key a USERS (relación 1:1)
    await queryRunner.createForeignKey(
      'DOCTORS',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'USERS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_DOCTORS_USER_ID',
      }),
    );

    // Índice en verification_status para búsquedas
    await queryRunner.createIndex(
      'DOCTORS',
      new TableIndex({
        name: 'IDX_DOCTORS_VERIFICATION_STATUS',
        columnNames: ['verification_status'],
      }),
    );

    // Índice en postalCode para búsqueda fallback
    await queryRunner.createIndex(
      'DOCTORS',
      new TableIndex({
        name: 'IDX_DOCTORS_POSTAL_CODE',
        columnNames: ['postalCode'],
      }),
    );

    // Índice compuesto en latitude y longitude para búsquedas geográficas
    await queryRunner.createIndex(
      'DOCTORS',
      new TableIndex({
        name: 'IDX_DOCTORS_LOCATION',
        columnNames: ['latitude', 'longitude'],
      }),
    );

    // Índice único en user_id (ya está como constraint pero también como índice para búsquedas)
    await queryRunner.createIndex(
      'DOCTORS',
      new TableIndex({
        name: 'IDX_DOCTORS_USER_ID',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices primero
    const table = await queryRunner.getTable('DOCTORS');
    if (table) {
      // Eliminar foreign keys
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('DOCTORS', foreignKey);
      }

      // Eliminar índices
      const indices = table.indices;
      for (const index of indices) {
        await queryRunner.dropIndex('DOCTORS', index);
      }
    }

    // Eliminar tabla
    await queryRunner.dropTable('DOCTORS');
  }
}
