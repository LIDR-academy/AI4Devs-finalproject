# HU2-TEST-001: Testing - Registro de Médico

## Info
- **ID**: HU2-TEST-001  
- **Prioridad**: Alta  
- **Estimación**: 8h  
- **Dependencias**: HU2-FE-001, HU2-BE-001, HU2-DB-001

## Plan
### Backend
- Registro exitoso crea usuario doctor y perfil DOCTORS con verification_status=pending y coords (si geocoding ok).
- Validaciones: email único (409), reCAPTCHA inválido (400), rate limit (429), campos obligatorios/dirección/CP.
- Geocoding falla -> guarda sin coords y devuelve warning flag.
- Auditoría creada.

### Frontend
- Validación de campos (dirección/CP obligatorios, bio<=1000, teléfono opcional).
- Manejo de advertencia de geocoding y mensajes 409/429.
- Mapa muestra coordenadas cuando geocoding ok.

### E2E
- Flujo: llenar formulario -> registro -> redirige a panel médico con estado pending.
- Flujo negativo: email duplicado -> mensaje claro.

## Archivos sugeridos
- `backend/tests/integration/auth/register-doctor.test.ts`
- `frontend/tests/components/auth/RegisterDoctorForm.test.tsx`
- `frontend/tests/e2e/auth/register-doctor.spec.ts`

## Métricas
- Cobertura servicio registerDoctor ≥85%
- Validaciones frontend ≥80% branches
