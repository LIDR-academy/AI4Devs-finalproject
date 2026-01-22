# HU3-DB-001: Tabla SPECIALTIES y relación con DOCTORS

## Info
- **ID**: HU3-DB-001  
- **Prioridad**: Alta  
- **Estimación**: 3h  
- **Dependencias**: HU2-DB-001

## Estructura SPECIALTIES
- `id` UUID PK  
- `name_es` VARCHAR(150) NOT NULL  
- `name_en` VARCHAR(150) NOT NULL  
- `is_active` BOOLEAN DEFAULT true  
- `created_at`, `updated_at`
- Índices: is_active

## Relación DOCTOR_SPECIALTIES (muchos a muchos)
- `doctor_id` UUID FK -> DOCTORS (CASCADE)  
- `specialty_id` UUID FK -> SPECIALTIES (CASCADE)  
- `is_primary` BOOLEAN DEFAULT false  
- PK compuesta (doctor_id, specialty_id)

## Pasos Técnicos
1) Migraciones:
   - `CreateSpecialtiesTable`
   - `CreateDoctorSpecialtiesTable`
2) Entidades:
   - `specialty.entity.ts`
   - Relación many-to-many en `doctor.entity.ts` con join table.

## Testing
- Migración up/down.
- Insert especialidades y relación con doctor.
- Consultas por is_active y por doctor.
