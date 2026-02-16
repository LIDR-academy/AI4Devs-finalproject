# HU7-DB-001: Migración - Tabla VERIFICATION_DOCUMENTS

## Info
- **ID**: HU7-DB-001  
- **Prioridad**: Alta  
- **Estimación**: 3h  
- **Dependencias**: HU2-DB-001

## Estructura requerida
- `id` UUID PK  
- `doctor_id` UUID FK -> DOCTORS (ON DELETE CASCADE)  
- `file_path` VARCHAR(500) NOT NULL  
- `original_filename` VARCHAR(255) NOT NULL  
- `mime_type` VARCHAR(100) NOT NULL  
- `file_size_bytes` BIGINT NOT NULL  
- `document_type` ENUM('cedula','diploma','other') DEFAULT 'cedula'  
- `status` ENUM('pending','approved','rejected') DEFAULT 'pending'  
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
- Índices: doctor_id, status, created_at

## Pasos Técnicos
1) Migración `migrations/1234567898-CreateVerificationDocuments.ts`
2) Entidad `verification-document.entity.ts` alineada.
3) Índices recomendados:
   - `IDX_VERIF_DOCS_DOCTOR_STATUS` (doctor_id, status)
   - `IDX_VERIF_DOCS_CREATED_AT`

## Testing
- Migración up/down.
- Insert ejemplo.
- Índices existen.
