# HU10-DB-001: Soporte de Datos para Dashboard Administrativo

## Info
- **ID**: HU10-DB-001  
- **Prioridad**: Media  
- **Estimación**: 2h  
- **Dependencias**: Tablas previas (APPOINTMENTS, REVIEWS, VERIFICATION_DOCUMENTS, DOCTORS, USERS)

## Objetivo
No se requieren tablas nuevas para MVP; usar vistas/consultas agregadas y cache Redis. Si se prefiere, crear vistas/materializadas para métricas.

## Opcional: Vistas SQL
- `vw_admin_reservations`: join citas + pacientes + médicos + especialidades.
- `vw_admin_cancellations`: filtro status cancelled + motivo.
- `vw_admin_ratings`: agregados por especialidad.

## Índices recomendados
- APPOINTMENTS: idx por status+appointment_date, doctor_id+appointment_date.
- REVIEWS: idx moderation_status, doctor_id.
- VERIFICATION_DOCUMENTS: idx status, doctor_id.

## Testing
- Verificar consultas agregadas cumplen SLA (<2s).
- Explain de queries principales (reservas/cancelaciones/ratings).
