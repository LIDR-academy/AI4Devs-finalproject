# HU9-DB-001: Tabla REVIEWS

## Info
- **ID**: HU9-DB-001  
- **Prioridad**: Media  
- **Estimación**: 3h  
- **Dependencias**: HU4-DB-001, HU2-DB-001

## Estructura
- `id` UUID PK  
- `appointment_id` UUID UNIQUE FK -> APPOINTMENTS  
- `patient_id` UUID FK -> USERS  
- `doctor_id` UUID FK -> DOCTORS  
- `rating` INT (1-5) NOT NULL  
- `comment` TEXT NOT NULL (10-1000, sanitized)  
- `moderation_status` ENUM('pending','approved','rejected') DEFAULT 'pending'  
- `moderated_by` UUID NULL  
- `moderated_at` DATETIME NULL  
- `moderation_notes` TEXT NULL  
- `created_at`, `updated_at` TIMESTAMP
- Índices: doctor_id, moderation_status, created_at

## Pasos Técnicos
1) Migración `migrations/1234567900-CreateReviewsTable.ts`
2) Entidad `review.entity.ts`
3) Constraint UNIQUE (appointment_id).

## Testing
- Migración up/down.
- Insert review; constraint UNIQUE.
- Índices presentes.
