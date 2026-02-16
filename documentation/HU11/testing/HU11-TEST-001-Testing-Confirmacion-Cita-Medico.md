# HU11-TEST-001: Testing - Confirmación de Cita por Médico

## Info
- **ID**: HU11-TEST-001  
- **Tipo**: Testing  
- **Prioridad**: Alta  
- **Estimación**: 8h  
- **Dependencias**: HU11-FE-001, HU11-BE-001

## Plan
### Backend
- Confirmación exitosa por doctor dueño (`pending -> confirmed`).
- Rechazo 403 cuando otro doctor intenta confirmar cita ajena.
- Rechazo 400 cuando la cita no está en `pending`.
- Rechazo 403 cuando un paciente intenta confirmar.
- Verificar creación de `APPOINTMENT_HISTORY` y `audit_logs`.

### Frontend
- Botón "Confirmar cita" visible solo en cards `pending`.
- Estado loading del botón durante la petición.
- Mensaje de éxito al confirmar y actualización de listado.
- Mensaje de error cuando API falla.

### E2E
- Flujo: doctor inicia sesión -> ve pendientes -> confirma cita -> aparece como confirmada.
- Flujo negativo: doctor intenta confirmar cita ya confirmada -> mensaje de error.

## Comportamientos implementados en esta rama
- Cobertura de endpoints compartidos de actualización de cita con bifurcación por rol.
- Validación de ownership y estado permitido con aserciones explícitas.

## Decisiones de negocio
- Priorizar casos negativos de ownership y estado para evitar regresiones operativas.

## Limitaciones actuales
- Falta suite E2E dedicada exclusiva HU11; hoy se apoya en escenarios integrados.

## Archivos sugeridos
- `backend/tests/integration/api/appointments/reprogram-cancel.test.ts` (o suite dedicada HU11)
- `frontend/tests/components/doctors/DoctorProfileAppointments.test.tsx`
- `frontend/cypress/e2e/doctor-confirm-appointment.cy.ts`

## Métricas
- Cobertura backend del flujo de confirmación >= 85% (líneas críticas).
- Cobertura frontend del flujo de acción >= 80% branches.
