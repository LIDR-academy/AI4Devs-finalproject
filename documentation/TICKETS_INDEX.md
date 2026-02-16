# Índice de Tickets de Trabajo - CitaYa MVP

Este documento contiene el índice completo de todos los tickets de trabajo generados para el desarrollo del MVP de CitaYa, organizados por Historia de Usuario (HU).

## Estructura de Tickets

Cada HU tiene la siguiente estructura:
- `frontend/` - Tickets de desarrollo frontend
- `backend/` - Tickets de desarrollo backend
- `database/` - Tickets de migraciones y base de datos
- `testing/` - Tickets de testing

## Nomenclatura

Los tickets siguen el formato: `HU{N}-{TIPO}-{NUMERO}-{DESCRIPCION}.md`

Donde:
- `{N}` = Número de Historia de Usuario (1-12)
- `{TIPO}` = FE (Frontend), BE (Backend), DB (Database), TEST (Testing)
- `{NUMERO}` = Número secuencial del ticket
- `{DESCRIPCION}` = Descripción breve del ticket

---

## HU1: Registro de Paciente

### Frontend
- **HU1-FE-001**: Formulario de Registro de Paciente
  - Prioridad: Alta
  - Estimación: 8 horas
  - Dependencias: HU1-BE-001, HU1-DB-001

### Backend
- **HU1-BE-001**: Endpoint de Registro de Paciente
  - Prioridad: Alta
  - Estimación: 10 horas
  - Dependencias: HU1-DB-001, HU1-DB-002

### Database
- **HU1-DB-001**: Migración - Crear Tabla USERS
  - Prioridad: Alta
  - Estimación: 3 horas
  - Dependencias: Ninguna

- **HU1-DB-002**: Migración - Crear Tabla audit_logs
  - Prioridad: Alta
  - Estimación: 2 horas
  - Dependencias: HU1-DB-001

### Testing
- **HU1-TEST-001**: Testing - Registro de Paciente
  - Prioridad: Alta
  - Estimación: 8 horas
  - Dependencias: HU1-FE-001, HU1-BE-001, HU1-DB-001, HU1-DB-002

---

## HU2: Registro de Médico

### Frontend
- **HU2-FE-001**: Formulario de Registro de Médico
  - Prioridad: Alta
  - Estimación: 10 horas
  - Dependencias: HU2-BE-001, HU2-DB-001

### Backend
- **HU2-BE-001**: Endpoint de Registro de Médico
  - Prioridad: Alta
  - Estimación: 12 horas
  - Dependencias: HU2-DB-001, HU1-DB-001

### Database
- **HU2-DB-001**: Migración - Crear Tabla DOCTORS
  - Prioridad: Alta
  - Estimación: 3 horas
  - Dependencias: HU1-DB-001

### Testing
- **HU2-TEST-001**: Testing - Registro de Médico
  - Prioridad: Alta
  - Estimación: 8 horas
  - Dependencias: HU2-FE-001, HU2-BE-001, HU2-DB-001

---

## HU3: Búsqueda de Médicos por Especialidad y Proximidad

### Frontend
- **HU3-FE-001**: Búsqueda de Médicos por Especialidad y Proximidad
  - Prioridad: Alta
  - Estimación: 12 horas
  - Dependencias: HU3-BE-001, HU3-DB-001

- **HU3-FE-002**: Ajustes UX Home/Search y Estado Inicial
  - Prioridad: Alta
  - Estimación: 6 horas
  - Dependencias: HU3-BE-002, HU3-FE-001

### Backend
- **HU3-BE-001**: Endpoint de Búsqueda de Médicos
  - Prioridad: Alta
  - Estimación: 15 horas
  - Dependencias: HU3-DB-001, HU2-DB-001

- **HU3-BE-002**: Fallback Automático Geolocalización -> Código Postal y Endpoint Latest
  - Prioridad: Alta
  - Estimación: 8 horas
  - Dependencias: HU3-BE-001, HU2-DB-001

### Database
- **HU3-DB-001**: Migración - Crear Tabla SPECIALTIES y relación con DOCTORS
  - Prioridad: Alta
  - Estimación: 3 horas
  - Dependencias: HU2-DB-001

### Testing
- **HU3-TEST-001**: Testing - Búsqueda de Médicos
  - Prioridad: Alta
  - Estimación: 10 horas
  - Dependencias: HU3-FE-001, HU3-BE-001, HU3-DB-001

- **HU3-TEST-002**: Testing - Home Search, Fallback y Listado Inicial
  - Prioridad: Alta
  - Estimación: 6 horas
  - Dependencias: HU3-FE-002, HU3-BE-002

---

## HU4: Reserva de Cita Médica

### Frontend
- **HU4-FE-001**: Reserva de Cita Médica
  - Prioridad: Crítica
  - Estimación: 15 horas
  - Dependencias: HU4-BE-001, HU4-DB-001

### Backend
- **HU4-BE-001**: Endpoint de Reserva de Cita Médica
  - Prioridad: Crítica
  - Estimación: 20 horas
  - Dependencias: HU4-DB-001

### Database
- **HU4-DB-001**: Migración - Crear Tablas APPOINTMENTS, SLOTS, APPOINTMENT_HISTORY
  - Prioridad: Crítica
  - Estimación: 5 horas
  - Dependencias: HU1-DB-001, HU2-DB-001

### Testing
- **HU4-TEST-001**: Testing - Reserva de Cita Médica
  - Prioridad: Crítica
  - Estimación: 12 horas
  - Dependencias: HU4-FE-001, HU4-BE-001, HU4-DB-001

---

## HU5: Reprogramación y Cancelación de Cita

### Frontend
- **HU5-FE-001**: Reprogramación y Cancelación de Cita
  - Prioridad: Alta
  - Estimación: 12 horas
  - Dependencias: HU5-BE-001, HU4-DB-001

### Backend
- **HU5-BE-001**: Endpoint de Reprogramación y Cancelación de Cita
  - Prioridad: Alta
  - Estimación: 15 horas
  - Dependencias: HU4-DB-001

### Database
- **HU5-DB-001**: Migración - Actualizar Tabla APPOINTMENTS (agregar cancellation_reason)
  - Prioridad: Alta
  - Estimación: 2 horas
  - Dependencias: HU4-DB-001

### Testing
- **HU5-TEST-001**: Testing - Reprogramación y Cancelación
  - Prioridad: Alta
  - Estimación: 10 horas
  - Dependencias: HU5-FE-001, HU5-BE-001, HU5-DB-001

---

## HU6: Gestión de Perfil Médico

### Frontend
- **HU6-FE-001**: Gestión de Perfil Médico
  - Prioridad: Media
  - Estimación: 10 horas
  - Dependencias: HU6-BE-001, HU2-DB-001

### Backend
- **HU6-BE-001**: Endpoint de Gestión de Perfil Médico
  - Prioridad: Media
  - Estimación: 12 horas
  - Dependencias: HU2-DB-001

### Database
- **HU6-DB-001**: Migración - Actualizar Tabla DOCTORS (si necesario)
  - Prioridad: Media
  - Estimación: 1 hora
  - Dependencias: HU2-DB-001

### Testing
- **HU6-TEST-001**: Testing - Gestión de Perfil Médico
  - Prioridad: Media
  - Estimación: 8 horas
  - Dependencias: HU6-FE-001, HU6-BE-001

---

## HU7: Carga de Documentos de Verificación

### Frontend
- **HU7-FE-001**: Carga de Documentos de Verificación
  - Prioridad: Alta
  - Estimación: 10 horas
  - Dependencias: HU7-BE-001, HU7-DB-001

### Backend
- **HU7-BE-001**: Endpoint de Carga de Documentos de Verificación
  - Prioridad: Alta
  - Estimación: 15 horas
  - Dependencias: HU7-DB-001

### Database
- **HU7-DB-001**: Migración - Crear Tabla VERIFICATION_DOCUMENTS
  - Prioridad: Alta
  - Estimación: 3 horas
  - Dependencias: HU2-DB-001

### Testing
- **HU7-TEST-001**: Testing - Carga de Documentos
  - Prioridad: Alta
  - Estimación: 10 horas
  - Dependencias: HU7-FE-001, HU7-BE-001, HU7-DB-001

---

## HU8: Gestión de Horarios de Trabajo

### Frontend
- **HU8-FE-001**: Gestión de Horarios de Trabajo
  - Prioridad: Alta
  - Estimación: 12 horas
  - Dependencias: HU8-BE-001, HU8-DB-001

### Backend
- **HU8-BE-001**: Endpoint de Gestión de Horarios de Trabajo
  - Prioridad: Alta
  - Estimación: 18 horas
  - Dependencias: HU8-DB-001

### Database
- **HU8-DB-001**: Migración - Crear Tablas DOCTOR_SCHEDULES y SLOTS
  - Prioridad: Alta
  - Estimación: 4 horas
  - Dependencias: HU2-DB-001

### Testing
- **HU8-TEST-001**: Testing - Gestión de Horarios
  - Prioridad: Alta
  - Estimación: 12 horas
  - Dependencias: HU8-FE-001, HU8-BE-001, HU8-DB-001

---

## HU9: Creación de Reseña Después de la Cita

### Frontend
- **HU9-FE-001**: Creación de Reseña Después de la Cita
  - Prioridad: Media
  - Estimación: 8 horas
  - Dependencias: HU9-BE-001, HU9-DB-001

### Backend
- **HU9-BE-001**: Endpoint de Creación de Reseña
  - Prioridad: Media
  - Estimación: 10 horas
  - Dependencias: HU9-DB-001, HU4-DB-001

### Database
- **HU9-DB-001**: Migración - Crear Tabla REVIEWS
  - Prioridad: Media
  - Estimación: 3 horas
  - Dependencias: HU4-DB-001, HU2-DB-001

### Testing
- **HU9-TEST-001**: Testing - Creación de Reseña
  - Prioridad: Media
  - Estimación: 8 horas
  - Dependencias: HU9-FE-001, HU9-BE-001, HU9-DB-001

---

## HU10: Dashboard Administrativo

### Frontend
- **HU10-FE-001**: Dashboard Administrativo para Gestión de Médicos
  - Prioridad: Media
  - Estimación: 20 horas
  - Dependencias: HU10-BE-001, HU10-DB-001

### Backend
- **HU10-BE-001**: Endpoints de Dashboard Administrativo
  - Prioridad: Media
  - Estimación: 25 horas
  - Dependencias: HU10-DB-001

### Database
- **HU10-DB-001**: Migración - Crear Tablas para Dashboard (si necesario)
  - Prioridad: Media
  - Estimación: 2 horas
  - Dependencias: Todas las tablas anteriores

### Testing
- **HU10-TEST-001**: Testing - Dashboard Administrativo
  - Prioridad: Media
  - Estimación: 15 horas
  - Dependencias: HU10-FE-001, HU10-BE-001

---

## HU11: Confirmación de Cita Pendiente por Médico

### Frontend
- **HU11-FE-001**: Confirmación de Citas Pendientes en Perfil Médico
  - Prioridad: Alta
  - Estimación: 8 horas
  - Dependencias: HU11-BE-001, HU4-DB-001

### Backend
- **HU11-BE-001**: Endpoint de Confirmación de Cita por Médico
  - Prioridad: Alta
  - Estimación: 10 horas
  - Dependencias: HU4-DB-001, HU5-BE-001

### Testing
- **HU11-TEST-001**: Testing - Confirmación de Cita por Médico
  - Prioridad: Alta
  - Estimación: 8 horas
  - Dependencias: HU11-FE-001, HU11-BE-001

---

## HU12: Cancelación de Cita por Médico

### Frontend
- **HU12-FE-001**: Cancelación de Citas en Perfil Médico
  - Prioridad: Alta
  - Estimación: 8 horas
  - Dependencias: HU12-BE-001, HU11-FE-001

### Backend
- **HU12-BE-001**: Endpoint de Cancelación de Cita por Médico
  - Prioridad: Alta
  - Estimación: 10 horas
  - Dependencias: HU4-DB-001, HU11-BE-001

### Testing
- **HU12-TEST-001**: Testing - Cancelación de Cita por Médico
  - Prioridad: Alta
  - Estimación: 8 horas
  - Dependencias: HU12-FE-001, HU12-BE-001

---

## Resumen de Estimaciones

### Por Tipo de Trabajo
- **Frontend**: ~149 horas (~24 story points)
- **Backend**: ~190 horas (~32 story points)
- **Database**: ~26 horas (~4 story points)
- **Testing**: ~133 horas (~21 story points)

### Total Estimado
- **Total**: ~498 horas (~81 story points)
- **Semanas estimadas** (asumiendo 40 horas/semana): ~13 semanas

---

## Prioridades de Implementación

### Fase 1: Fundamentos (Semanas 1-3)
1. HU1: Registro de Paciente
2. HU2: Registro de Médico
3. HU3: Búsqueda de Médicos

### Fase 2: Funcionalidad Core (Semanas 4-6)
4. HU4: Reserva de Cita Médica
5. HU5: Reprogramación y Cancelación
6. HU8: Gestión de Horarios de Trabajo

### Fase 3: Funcionalidades Adicionales (Semanas 7-9)
7. HU6: Gestión de Perfil Médico
8. HU7: Carga de Documentos de Verificación
9. HU9: Creación de Reseña

### Fase 4: Administración (Semanas 10-11)
10. HU10: Dashboard Administrativo

### Fase 5: Operación Clínica (Semana 12)
11. HU11: Confirmación de Cita Pendiente por Médico
12. HU12: Cancelación de Cita por Médico

---

## Notas Importantes

1. **Dependencias**: Respetar las dependencias entre tickets antes de comenzar el desarrollo
2. **Testing**: Los tickets de testing deben ejecutarse en paralelo con el desarrollo
3. **Prioridades**: Las prioridades pueden ajustarse según necesidades del negocio
4. **Estimaciones**: Las estimaciones son aproximadas y pueden variar según la experiencia del equipo

---

**Última actualización**: 2026-02-15
**Versión**: 1.3
