# Esquema de base de datos – SIGQ

Documentación del esquema PostgreSQL usado por el backend. Las tablas se crean mediante migraciones TypeORM en el orden indicado.

---

## Orden de migraciones

| Orden | Migración | Módulo |
|-------|-----------|--------|
| 1 | CreateHCETables | HCE (Historia Clínica Electrónica) |
| 2 | CreatePlanningTables | Planificación quirúrgica |
| 3 | CreateChecklistsTable | Checklist WHO |
| 4 | CreateChecklistVersionsTable | Historial de versiones del checklist WHO |
| 5 | CreateResourcesTables | Recursos (equipos, asignación de personal) |
| 6 | CreateNotificationsTable | Notificaciones |
| 7 | CreateFollowupTables | Seguimiento postoperatorio y alta |
| 8 | CreateDocumentationsTable | Documentación intraoperatoria |
| 9 | CreateDocumentationVersionsTable | Historial de versiones de documentación |

Además, TypeORM mantiene la tabla `migrations` para el control de migraciones ejecutadas.

### Rollback de migraciones

Para **deshacer** migraciones (por ejemplo en desarrollo o para corregir un despliegue):

1. Desde el directorio `backend/`:  
   `npm run migration:revert`
2. Cada ejecución deshace **una** migración: la última que figure en la tabla `migrations`.
3. **Orden inverso** al aplicar (si quieres deshacer todas): DocumentationVersions → Documentations → Followup → Notifications → Resources → ChecklistVersions → Checklists → Planning → HCE. Ejecutar `migration:revert` tantas veces como migraciones quieras deshacer (9 para deshacer todas).
4. **Precaución**: el rollback ejecuta el método `down()` de la migración; si la migración no implementa `down()` o borra datos, haz backup de la base de datos antes.

Las migraciones de SIGQ son principalmente `CREATE TABLE`; el `down()` suele hacer `DROP TABLE` en orden inverso a las dependencias (FK). Tras un revert, volver a aplicar con `npm run migration:run`.

#### Verificación del rollback (Ticket 14)

Para **probar** que el rollback funciona en un entorno de desarrollo:

1. Desde `backend/`, con la BD levantada y migraciones ya aplicadas:
   ```bash
   npm run migration:revert
   ```
   Repetir 7 veces (una por cada migración) para deshacer todas, o hasta que TypeORM indique que no hay migraciones que revertir.

2. Comprobar que las tablas creadas por las migraciones ya no existen (o que las que dependen de ellas fallan al usarse).

3. Volver a aplicar todas las migraciones:
   ```bash
   npm run migration:run
   ```

4. Opcional: ejecutar el seed tras el `migration:run` si necesitas datos de prueba:
   ```bash
   npm run seed
   ```

---

## 1. HCE – Historia Clínica Electrónica

### Enums

- **patients_gender_enum**: `'M' | 'F' | 'Other'`
- **allergies_severity_enum**: `'Low' | 'Medium' | 'High' | 'Critical'`

### patients

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| first_name | varchar(100) | NOT NULL |
| last_name | varchar(100) | NOT NULL |
| date_of_birth | date | NOT NULL |
| gender | patients_gender_enum | NOT NULL |
| ssn_encrypted | bytea | |
| phone | varchar(20) | |
| email | varchar(255) | |
| address | text | |
| created_by | uuid | NOT NULL |
| created_at | timestamp | NOT NULL, DEFAULT now() |
| updated_at | timestamp | NOT NULL, DEFAULT now() |

Índices: `created_by`.

### medical_records

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| patient_id | uuid | NOT NULL, FK → patients(id) ON DELETE CASCADE |
| medical_history | text | |
| family_history | text | |
| current_condition | text | |
| created_at, updated_at | timestamp | NOT NULL |

Índices: `patient_id`.

### allergies

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| patient_id | uuid | NOT NULL, FK → patients(id) ON DELETE CASCADE |
| allergen | varchar(100) | NOT NULL |
| severity | allergies_severity_enum | NOT NULL |
| notes | text | |
| created_at | timestamp | NOT NULL |

Índices: `patient_id`.

### medications

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| patient_id | uuid | NOT NULL, FK → patients(id) ON DELETE CASCADE |
| name | varchar(100) | NOT NULL |
| dosage | varchar(50) | NOT NULL |
| frequency | varchar(50) | NOT NULL |
| start_date | date | NOT NULL |
| end_date | date | |
| created_at | timestamp | NOT NULL |

Índices: `patient_id`.

### lab_results

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| medical_record_id | uuid | NOT NULL, FK → medical_records(id) ON DELETE CASCADE |
| test_name | varchar(100) | NOT NULL |
| results | jsonb | NOT NULL |
| test_date | date | NOT NULL |
| created_at | timestamp | NOT NULL |

Índices: `medical_record_id`.

### images

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| medical_record_id | uuid | NOT NULL, FK → medical_records(id) ON DELETE CASCADE |
| file_path | varchar(500) | NOT NULL |
| image_type | varchar(50) | NOT NULL |
| uploaded_at | timestamp | NOT NULL |

Índices: `medical_record_id`.

---

## 2. Planificación quirúrgica

### Enums

- **surgeries_type_enum**: `'elective' | 'urgent' | 'emergency'`
- **surgeries_status_enum**: `'planned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'`

### operating_rooms

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| name | varchar(100) | NOT NULL |
| code | varchar(50) | |
| description | text | |
| floor | varchar(50) | |
| building | varchar(50) | |
| is_active | boolean | NOT NULL, DEFAULT true |
| equipment | jsonb | |
| capacity | integer | |
| created_at, updated_at | timestamp | NOT NULL |

### surgeries

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| patient_id | uuid | NOT NULL, FK → patients(id) ON DELETE CASCADE |
| surgeon_id | uuid | NOT NULL |
| procedure | varchar(200) | NOT NULL |
| type | surgeries_type_enum | NOT NULL, DEFAULT 'elective' |
| status | surgeries_status_enum | NOT NULL, DEFAULT 'planned' |
| scheduled_date | timestamp | |
| start_time | timestamp | |
| end_time | timestamp | |
| operating_room_id | uuid | FK → operating_rooms(id) ON DELETE SET NULL |
| preop_notes | text | |
| postop_notes | text | |
| risk_scores | jsonb | |
| created_at, updated_at | timestamp | NOT NULL |

Índices: `patient_id`, `surgeon_id`, `operating_room_id`, `status`.

### surgical_plannings

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| surgery_id | uuid | NOT NULL, UNIQUE, FK → surgeries(id) ON DELETE CASCADE |
| analysis_data | jsonb | |
| approach_selected | varchar(100) | |
| simulation_data | jsonb | |
| guide_3d_id | uuid | |
| planning_notes | text | |
| created_at, updated_at | timestamp | NOT NULL |

Índices: `surgery_id`.

### dicom_images

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| planning_id | uuid | NOT NULL, FK → surgical_plannings(id) ON DELETE CASCADE |
| orthanc_instance_id | varchar(500) | NOT NULL |
| series_id | varchar(100) | |
| study_id | varchar(100) | |
| modality | varchar(50) | |
| description | varchar(200) | |
| metadata | jsonb | |
| created_at | timestamp | NOT NULL |

Índices: `planning_id`.

---

## 3. Checklist WHO

### checklists

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| surgery_id | uuid | NOT NULL, UNIQUE, FK → surgeries(id) ON DELETE CASCADE |
| pre_induction_complete | boolean | NOT NULL, DEFAULT false |
| pre_incision_complete | boolean | NOT NULL, DEFAULT false |
| post_procedure_complete | boolean | NOT NULL, DEFAULT false |
| checklist_data | jsonb | NOT NULL, DEFAULT '{}' |
| completed_at | timestamp | |
| created_at, updated_at | timestamp | NOT NULL |

Índices: `surgery_id`.

### checklist_versions (historial)

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| checklist_id | uuid | NOT NULL, FK → checklists(id) ON DELETE CASCADE |
| version_number | integer | NOT NULL |
| phase_updated | varchar(20) | (preInduction, preIncision, postProcedure, completed) |
| checklist_data_snapshot | jsonb | NOT NULL |
| pre_induction_complete, pre_incision_complete, post_procedure_complete | boolean | NOT NULL, DEFAULT false |
| completed_at_snapshot | timestamp | |
| created_by | uuid | |
| created_at | timestamp | NOT NULL |

Índices: `checklist_id`, `created_at` DESC.

---

## 4. Recursos

### equipment

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| name | varchar(100) | NOT NULL |
| code | varchar(50) | |
| type | varchar(80) | |
| operating_room_id | uuid | FK → operating_rooms(id) ON DELETE SET NULL |
| is_available | boolean | NOT NULL, DEFAULT true |
| description | text | |
| created_at, updated_at | timestamp | NOT NULL |

Índices: `operating_room_id`, `type`.

### staff_assignments

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| surgery_id | uuid | NOT NULL, FK → surgeries(id) ON DELETE CASCADE |
| user_id | uuid | NOT NULL |
| role | varchar(50) | NOT NULL |
| assigned_at | timestamp | NOT NULL, DEFAULT now() |
| notes | text | |
| created_at | timestamp | NOT NULL |

Índices: `surgery_id`, `user_id`.

---

## 5. Notificaciones

### notifications

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| user_id | uuid | NOT NULL |
| type | varchar(50) | NOT NULL |
| title | varchar(200) | NOT NULL |
| message | text | |
| related_id | uuid | |
| related_type | varchar(80) | |
| read_at | timestamp | |
| created_at | timestamp | NOT NULL |

Índices: `user_id`, `read_at`.

---

## 6. Seguimiento postoperatorio y alta

### postop_evolutions

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| surgery_id | uuid | NOT NULL, FK → surgeries(id) ON DELETE CASCADE |
| evolution_date | date | NOT NULL |
| clinical_notes | text | |
| vital_signs | jsonb | |
| has_complications | boolean | NOT NULL, DEFAULT false |
| complications_notes | text | |
| medications | jsonb | |
| recorded_by | uuid | |
| created_at | timestamp | NOT NULL |

Índices: `surgery_id`.

### discharge_plans

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| surgery_id | uuid | NOT NULL, UNIQUE, FK → surgeries(id) ON DELETE CASCADE |
| surgery_summary | text | |
| instructions | text | |
| custom_instructions | jsonb | |
| medications_at_discharge | jsonb | |
| follow_up_appointments | jsonb | |
| status | varchar(50) | NOT NULL, DEFAULT 'draft' |
| generated_by | uuid | |
| created_at, updated_at | timestamp | NOT NULL |

Índices: `surgery_id`.

---

## 7. Documentación intraoperatoria

### Enums

- **documentations_status_enum**: `'draft' | 'in_progress' | 'completed' | 'archived'`

### documentations

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | uuid | PK |
| surgery_id | uuid | NOT NULL, UNIQUE, FK → surgeries(id) ON DELETE CASCADE |
| preoperative_notes | text | |
| intraoperative_notes | text | |
| postoperative_notes | text | |
| procedure_details | jsonb | |
| status | documentations_status_enum | NOT NULL, DEFAULT 'draft' |
| created_by | uuid | |
| last_modified_by | uuid | |
| change_history | jsonb | |
| last_saved_at | timestamp | |
| created_at, updated_at | timestamp | NOT NULL |

Índices: `surgery_id`, `status`.

---

## Diagrama de dependencias (tablas)

```
patients
  ├── medical_records → lab_results, images
  ├── allergies
  └── medications

operating_rooms
surgeries (patient_id → patients, operating_room_id → operating_rooms)
  ├── surgical_plannings → dicom_images
  ├── checklists
  ├── staff_assignments
  ├── postop_evolutions
  ├── discharge_plans
  └── documentations → documentation_versions

notifications (user_id referencia usuarios del sistema de auth)
equipment (operating_room_id → operating_rooms)
```

---

## Rollback de migraciones

Para revertir, ejecutar las migraciones en orden inverso (cada migración implementa `down()`). Ver `backend/package.json` y TypeORM para `migration:revert`. El orden de borrado debe respetar las claves foráneas (primero tablas que referencian, después las referenciadas).
