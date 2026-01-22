# HU6-DB-001: Ajustes a Tabla DOCTORS para Perfil

## Info
- **ID**: HU6-DB-001  
- **Tipo**: Base de Datos  
- **Prioridad**: Media  
- **Estimación**: 1h  
- **Dependencias**: HU2-DB-001

## Cambios (si no existen)
- Asegurar columnas: `bio` (TEXT, nullable, max 1000), `address` (VARCHAR 500), `postalCode` (VARCHAR 20), `latitude` DECIMAL(10,8), `longitude` DECIMAL(11,8).
- Índice en (`postalCode`, `verification_status`) para búsquedas.
- Índice en `updated_at` para invalidación rápida.

## Pasos Técnicos
1) Migración `migrations/1234567897-AdjustDoctorsProfile.ts`
   - Alter/modify columnas si faltan o ajustar longitudes.
   - Crear índice `IDX_DOCTORS_POSTAL_VERIF`.
2) Entidad `doctor.entity.ts`
   - Alinear tipos/longitudes con la migración.

## Testing
- Migración up/down.
- Insert/update de bio/address/postalCode.
- EXPLAIN busca por postalCode + verification_status.
