# HU12-TEST-001: Testing - Cancelación de Cita por Médico

## Info
- **ID**: HU12-TEST-001  
- **Tipo**: Testing  
- **Prioridad**: Alta  
- **Estimación**: 8h  
- **Dependencias**: HU12-FE-001, HU12-BE-001

## Plan
### Backend
- Doctor dueño cancela cita `confirmed` o `pending` (200).
- Se libera slot al cancelar.
- Otro doctor cancela cita ajena -> 403.
- Estado no permitido -> 400.
- Se generan registros de historial y auditoría.

### Frontend
- Botón cancelar visible para estados permitidos.
- Confirmación previa antes de disparar mutation.
- Loading y deshabilitado de acciones durante operación.
- Mensaje de éxito/error y refresco de listado.

### E2E
- Flujo: doctor login -> citas -> cancelar -> estado cambia a `cancelled`.
- Flujo negativo: cita ajena/no permitida -> mensaje de error.

## Comportamientos implementados en esta rama
- Cobertura de cancelación por médico en pruebas de integración de citas.
- Verificación explícita de liberación de slot posterior a cancelación.

## Decisiones de negocio
- Enfocar regresión en estados permitidos/no permitidos y ownership.

## Limitaciones actuales
- La cobertura E2E dedicada HU12 depende de completar fixtures de datos clínicos por rol.

## Archivos sugeridos
- `backend/tests/integration/api/appointments/reprogram-cancel.test.ts` (extender suite existente)
- `frontend/tests/components/doctors/DoctorProfileAppointments.test.tsx`
- `frontend/cypress/e2e/doctor-cancel-appointment.cy.ts`

## Métricas
- Cobertura backend del flujo de cancelación por doctor >= 85%.
- Cobertura frontend del flujo de acción >= 80% branches.
