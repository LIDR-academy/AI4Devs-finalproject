# HU8-DB-001: Tablas DOCTOR_SCHEDULES y SLOTS (generación automática)

## Info
- **ID**: HU8-DB-001  
- **Prioridad**: Alta  
- **Estimación**: 4h  
- **Dependencias**: HU2-DB-001, HU4-DB-001

## Estructura DOCTOR_SCHEDULES
- `id` UUID PK  
- `doctor_id` UUID FK -> DOCTORS (CASCADE)  
- `dayOfWeek` TINYINT (0-6) NOT NULL  
- `startTime` TIME NOT NULL  
- `endTime` TIME NOT NULL  
- `slotDurationMinutes` INT NOT NULL DEFAULT 30  
- `breakDurationMinutes` INT NOT NULL DEFAULT 0  
- `isActive` BOOLEAN DEFAULT true  
- `deleted_at` DATETIME NULL  
- `created_at`, `updated_at` TIMESTAMP
- Índices: doctor_id+dayOfWeek, isActive, deleted_at

## Estructura SLOTS (complemento HU4)
- Añadir `schedule_id` FK -> DOCTOR_SCHEDULES (nullable).
- Índice compuesto doctor_id+start_time (ya en HU4), schedule_id.

## Pasos Técnicos
1) Migración `migrations/1234567899-CreateDoctorSchedules.ts`
   - Crear tabla DOCTOR_SCHEDULES.
   - Alter SLOTS: add column schedule_id + FK ON DELETE SET NULL; índice schedule_id.
2) Entidades: `doctor-schedule.entity.ts` y ajuste `slot.entity.ts`.

## Testing
- Migración up/down.
- Insert schedule y slots vinculados.
- FK schedule_id en SLOTS se nulifica al borrar horario.
