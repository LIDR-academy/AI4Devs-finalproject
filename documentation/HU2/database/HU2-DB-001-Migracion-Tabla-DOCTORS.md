# HU2-DB-001: Migración - Crear Tabla DOCTORS

## Información General
- **ID**: HU2-DB-001
- **Historia de Usuario**: HU2 - Registro de Médico
- **Tipo**: Base de Datos
- **Prioridad**: Alta
- **Estimación**: 3 horas (0.5 story points)
- **Dependencias**: HU1-DB-001 (Tabla USERS debe existir)

## Descripción
Crear la migración de TypeORM para la tabla DOCTORS que almacenará la información profesional de los médicos, incluyendo dirección, coordenadas geográficas, estado de verificación y bio.

## Criterios de Aceptación

### CA1: Estructura de Tabla
- [ ] Tabla `DOCTORS` con columnas:
  - `id` (UUID, PRIMARY KEY)
  - `user_id` (UUID, FOREIGN KEY a USERS)
  - `address` (VARCHAR, NOT NULL)
  - `postalCode` (VARCHAR, NOT NULL)
  - `latitude` (DECIMAL, NULLABLE)
  - `longitude` (DECIMAL, NULLABLE)
  - `bio` (TEXT, NULLABLE, máximo 1000 caracteres)
  - `verification_status` (ENUM: 'pending', 'approved', 'rejected', DEFAULT 'pending')
  - `rating_average` (DECIMAL, NULLABLE)
  - `total_reviews` (INTEGER, DEFAULT 0)
  - `created_at`, `updated_at` (TIMESTAMP)

### CA2: Relación con USERS
- [ ] Foreign key a USERS con ON DELETE CASCADE
- [ ] Constraint UNIQUE en user_id (relación 1:1)

### CA3: Índices
- [ ] Índice en `verification_status` para búsquedas
- [ ] Índice espacial en `latitude`, `longitude` para búsquedas geográficas

## Pasos Técnicos Detallados

### 1. Crear Migración TypeORM
**Ubicación**: `backend/src/migrations/1234567892-CreateDoctorsTable.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateDoctorsTable1234567892 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'postalCode',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'verification_status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected'],
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'rating_average',
            type: 'decimal',
            precision: 3,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'total_reviews',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign key a USERS
    await queryRunner.createForeignKey(
      'DOCTORS',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'USERS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Índices
    await queryRunner.createIndex(
      'DOCTORS',
      new TableIndex({
        name: 'IDX_DOCTORS_VERIFICATION_STATUS',
        columnNames: ['verification_status'],
      }),
    );

    await queryRunner.createIndex(
      'DOCTORS',
      new TableIndex({
        name: 'IDX_DOCTORS_LOCATION',
        columnNames: ['latitude', 'longitude'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('DOCTORS');
  }
}
```

## Archivos a Crear/Modificar

1. `backend/src/migrations/1234567892-CreateDoctorsTable.ts` - Migración
2. `backend/src/entities/doctor.entity.ts` - Entidad Doctor

## Testing

Ver ticket HU2-TEST-001.
