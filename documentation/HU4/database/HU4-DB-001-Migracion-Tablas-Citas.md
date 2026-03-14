# HU4-DB-001: Migración - Crear Tablas APPOINTMENTS, SLOTS, APPOINTMENT_HISTORY

## Información General
- **ID**: HU4-DB-001
- **Historia de Usuario**: HU4 - Reserva de Cita Médica
- **Tipo**: Base de Datos
- **Prioridad**: Crítica
- **Estimación**: 5 horas (1 story point)
- **Dependencias**: HU1-DB-001 (Tabla USERS), HU2-DB-001 (Tabla DOCTORS)

## Descripción
Crear las migraciones de TypeORM para las tablas APPOINTMENTS, SLOTS y APPOINTMENT_HISTORY que soportan el sistema de reserva de citas médicas con prevención de doble booking.

## Criterios de Aceptación

### CA1: Tabla SLOTS
- [ ] Tabla `SLOTS` con columnas:
  - `id` (UUID, PRIMARY KEY)
  - `doctor_id` (UUID, FOREIGN KEY a DOCTORS)
  - `schedule_id` (UUID, FOREIGN KEY a DOCTOR_SCHEDULES, NULLABLE)
  - `start_time` (DATETIME, NOT NULL)
  - `end_time` (DATETIME, NOT NULL)
  - `is_available` (BOOLEAN, DEFAULT TRUE)
  - `locked_by` (UUID, NULLABLE) - ID del paciente que bloqueó
  - `locked_until` (DATETIME, NULLABLE) - Expiración del lock
  - `created_at`, `updated_at` (TIMESTAMP)

### CA2: Tabla APPOINTMENTS
- [ ] Tabla `APPOINTMENTS` con columnas:
  - `id` (UUID, PRIMARY KEY)
  - `patient_id` (UUID, FOREIGN KEY a USERS)
  - `doctor_id` (UUID, FOREIGN KEY a DOCTORS)
  - `slot_id` (UUID, FOREIGN KEY a SLOTS)
  - `appointment_date` (DATETIME, NOT NULL)
  - `status` (ENUM: 'confirmed', 'pending', 'completed', 'cancelled', 'no_show')
  - `notes` (TEXT, NULLABLE, máximo 500 caracteres)
  - `cancellation_reason` (TEXT, NULLABLE)
  - `reminder_sent` (BOOLEAN, DEFAULT FALSE)
  - `created_at`, `updated_at` (TIMESTAMP)

### CA3: Tabla APPOINTMENT_HISTORY
- [ ] Tabla `APPOINTMENT_HISTORY` con columnas:
  - `id` (UUID, PRIMARY KEY)
  - `appointment_id` (UUID, FOREIGN KEY a APPOINTMENTS)
  - `old_status` (VARCHAR, NULLABLE)
  - `new_status` (VARCHAR, NOT NULL)
  - `change_reason` (TEXT, NULLABLE)
  - `changed_by` (UUID, NULLABLE) - ID del usuario que hizo el cambio
  - `metadata` (JSON, NULLABLE) - Información adicional
  - `changed_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### CA4: Índices
- [ ] Índice en `SLOTS.doctor_id` y `SLOTS.start_time` para búsquedas eficientes
- [ ] Índice en `SLOTS.is_available` y `SLOTS.locked_until` para verificación de disponibilidad
- [ ] Índice en `APPOINTMENTS.patient_id` y `APPOINTMENTS.status` para búsquedas de paciente
- [ ] Índice en `APPOINTMENTS.doctor_id` y `APPOINTMENTS.appointment_date` para búsquedas de médico
- [ ] Índice en `APPOINTMENT_HISTORY.appointment_id` para historial

## Pasos Técnicos Detallados

### 1. Crear Migración para Tabla SLOTS
**Ubicación**: `backend/src/migrations/1234567893-CreateSlotsTable.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateSlotsTable1234567893 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'SLOTS',
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
            name: 'doctor_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'schedule_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'start_time',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'end_time',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'is_available',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'locked_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'locked_until',
            type: 'datetime',
            isNullable: true,
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

    // Foreign keys
    await queryRunner.createForeignKey(
      'SLOTS',
      new TableForeignKey({
        columnNames: ['doctor_id'],
        referencedTableName: 'DOCTORS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Índices
    await queryRunner.createIndex(
      'SLOTS',
      new TableIndex({
        name: 'IDX_SLOTS_DOCTOR_START',
        columnNames: ['doctor_id', 'start_time'],
      }),
    );

    await queryRunner.createIndex(
      'SLOTS',
      new TableIndex({
        name: 'IDX_SLOTS_AVAILABILITY',
        columnNames: ['is_available', 'locked_until'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('SLOTS');
  }
}
```

### 2. Crear Migración para Tabla APPOINTMENTS
**Ubicación**: `backend/src/migrations/1234567894-CreateAppointmentsTable.ts`

```typescript
export class CreateAppointmentsTable1234567894 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'APPOINTMENTS',
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
            name: 'slot_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'appointment_date',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['confirmed', 'pending', 'completed', 'cancelled', 'no_show'],
            default: "'confirmed'",
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'cancellation_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'reminder_sent',
            type: 'boolean',
            default: false,
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

    // Foreign keys
    await queryRunner.createForeignKey(
      'APPOINTMENTS',
      new TableForeignKey({
        columnNames: ['patient_id'],
        referencedTableName: 'USERS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'APPOINTMENTS',
      new TableForeignKey({
        columnNames: ['doctor_id'],
        referencedTableName: 'DOCTORS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'APPOINTMENTS',
      new TableForeignKey({
        columnNames: ['slot_id'],
        referencedTableName: 'SLOTS',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // Índices
    await queryRunner.createIndex(
      'APPOINTMENTS',
      new TableIndex({
        name: 'IDX_APPOINTMENTS_PATIENT_STATUS',
        columnNames: ['patient_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'APPOINTMENTS',
      new TableIndex({
        name: 'IDX_APPOINTMENTS_DOCTOR_DATE',
        columnNames: ['doctor_id', 'appointment_date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('APPOINTMENTS');
  }
}
```

### 3. Crear Migración para Tabla APPOINTMENT_HISTORY
**Ubicación**: `backend/src/migrations/1234567895-CreateAppointmentHistoryTable.ts`

```typescript
export class CreateAppointmentHistoryTable1234567895 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'APPOINTMENT_HISTORY',
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
            name: 'appointment_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'old_status',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'new_status',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'change_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'changed_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'changed_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'APPOINTMENT_HISTORY',
      new TableForeignKey({
        columnNames: ['appointment_id'],
        referencedTableName: 'APPOINTMENTS',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Índice
    await queryRunner.createIndex(
      'APPOINTMENT_HISTORY',
      new TableIndex({
        name: 'IDX_APPOINTMENT_HISTORY_APPOINTMENT',
        columnNames: ['appointment_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('APPOINTMENT_HISTORY');
  }
}
```

## Archivos a Crear/Modificar

1. `backend/src/migrations/1234567893-CreateSlotsTable.ts`
2. `backend/src/migrations/1234567894-CreateAppointmentsTable.ts`
3. `backend/src/migrations/1234567895-CreateAppointmentHistoryTable.ts`
4. `backend/src/entities/slot.entity.ts`
5. `backend/src/entities/appointment.entity.ts`
6. `backend/src/entities/appointment-history.entity.ts`

## Testing

Ver ticket HU4-TEST-001.
