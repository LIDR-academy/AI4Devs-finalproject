import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

/**
 * Migración para crear la tabla trip_participants.
 * Crea la tabla con relaciones a trips y users, y constraints de integridad.
 */
export class CreateTripParticipantsTable1735689601000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trip_participants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'trip_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '20',
            default: "'MEMBER'",
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
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Crear índices para mejorar el rendimiento de las consultas
    await queryRunner.createIndex(
      'trip_participants',
      new TableIndex({
        name: 'IDX_trip_participants_trip_id',
        columnNames: ['trip_id'],
      }),
    );

    await queryRunner.createIndex(
      'trip_participants',
      new TableIndex({
        name: 'IDX_trip_participants_user_id',
        columnNames: ['user_id'],
      }),
    );

    // Crear constraint único para evitar duplicados (un usuario solo puede estar una vez por viaje)
    await queryRunner.createUniqueConstraint(
      'trip_participants',
      new TableUnique({
        name: 'UQ_trip_participants_trip_user',
        columnNames: ['trip_id', 'user_id'],
      }),
    );

    // Crear foreign key hacia trips
    await queryRunner.createForeignKey(
      'trip_participants',
      new TableForeignKey({
        columnNames: ['trip_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'trips',
        onDelete: 'CASCADE',
        name: 'FK_trip_participants_trip',
      }),
    );

    // Crear foreign key hacia users
    await queryRunner.createForeignKey(
      'trip_participants',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_trip_participants_user',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign keys
    await queryRunner.dropForeignKey(
      'trip_participants',
      'FK_trip_participants_user',
    );
    await queryRunner.dropForeignKey(
      'trip_participants',
      'FK_trip_participants_trip',
    );

    // Eliminar constraint único
    await queryRunner.dropUniqueConstraint(
      'trip_participants',
      'UQ_trip_participants_trip_user',
    );

    // Eliminar índices
    await queryRunner.dropIndex(
      'trip_participants',
      'IDX_trip_participants_user_id',
    );
    await queryRunner.dropIndex(
      'trip_participants',
      'IDX_trip_participants_trip_id',
    );

    // Eliminar tabla
    await queryRunner.dropTable('trip_participants');
  }
}
