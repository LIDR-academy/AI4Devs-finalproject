# HU5-TEST-001: Testing - Reprogramación y Cancelación de Cita

## Información General
- **ID**: HU5-TEST-001  
- **Historia**: HU5  
- **Tipo**: Testing  
- **Prioridad**: Alta  
- **Estimación**: 10h (1.5 sp)  
- **Dependencias**: HU5-FE-001, HU5-BE-001, HU5-DB-001, HU4-DB-001

## Alcance
- Cancelar cita (confirmed/pending) con y sin motivo.
- Reprogramar cita al mismo médico, validando disponibilidad y locks.
- Manejo de errores: 403, 404, 400 (estado inválido), 409 (slot tomado).
- Historial y liberación/bloqueo de slots.

## Plan de Tests
### Backend (unit/integration)
- **Cancelar**: cambia status, guarda reason, libera slot, historial registra cambio.
- **Reprogramar**: mueve slot, libera anterior, registra historial, previene doble booking.
- **Errores**: no dueño, estado inválido, slot ajeno, slot no disponible, cita no encontrada.
- **Concurrencia**: dos reprogramaciones simultáneas al mismo slot -> 409.

### Frontend (unit/integration)
- CancelModal: validación de motivo (<=500), manejo de estados loading/error.
- RescheduleModal: carga de slots, selección, validación de disponibilidad, manejo de errores del backend.
- Lista de citas: refresco tras cancelar/reprogramar, mensajes de éxito/error.

### E2E
- Flujo: ver citas -> reprogramar a nuevo slot -> ver detalle actualizado.
- Flujo: cancelar cita -> slot vuelve a disponible -> listado refleja cancelación.
- Flujo negativo: intentar reprogramar a slot ya tomado → mostrar error 409.

## Archivos sugeridos
- `backend/tests/integration/appointments/reprogram-cancel.test.ts`
- `backend/tests/unit/appointments/appointment.service.test.ts`
- `frontend/tests/e2e/appointments/reprogram-cancel.spec.ts`
- `frontend/tests/components/CancelModal.test.tsx`
- `frontend/tests/components/RescheduleModal.test.tsx`

## Datos/Setup
- Crear fixtures: paciente, médico, slots (uno disponible, uno bloqueado), cita confirmada.
- Usar transacciones o limpieza por tabla entre tests.

## Métricas de cobertura objetivo
- Servicio de citas: ≥90%
- Modales frontend: ≥80% branches
- E2E críticos: 3 flujos principales verdes
