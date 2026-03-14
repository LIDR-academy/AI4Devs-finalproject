# HU6-TEST-001: Testing - Gestión de Perfil Médico

## Info
- **ID**: HU6-TEST-001  
- **Tipo**: Testing  
- **Prioridad**: Media  
- **Estimación**: 8h  
- **Dependencias**: HU6-FE-001, HU6-BE-001, HU6-DB-001

## Plan
### Backend
- GET /doctors/me retorna datos completos (user + doctor + specialties + rating).
- PATCH exitoso actualiza USERS y DOCTORS; guarda coords si geocoding ok; warning si falla.
- Cache invalidado (perfil y búsqueda).
- Auditoría creada con old/new values.
- Errores: 403 si no doctor, 400 validaciones, 404 nunca (usa token).

### Frontend
- Formulario valida bio<=1000, address/postal obligatorios al editar, phone E.164.
- Manejo de advertencia de geocoding y mensajes de éxito/error.
- Refresco de datos tras guardar.

### E2E
- Flujo: ver perfil -> editar bio y dirección -> guardar -> ver datos actualizados.
- Flujo negativo: phone inválido -> muestra error; geocoding falla -> guarda con warning.

## Archivos sugeridos
- `backend/tests/integration/doctors/profile.test.ts`
- `frontend/tests/components/ProfileForm.test.tsx`
- `frontend/tests/e2e/doctor/profile.spec.ts`

## Métricas
- Cobertura servicio profile ≥85%
- Cobertura formulario frontend ≥80% branches
