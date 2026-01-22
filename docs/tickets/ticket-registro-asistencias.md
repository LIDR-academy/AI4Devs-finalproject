# Tickets - Registro de Asistencias

## Índice
- [US-003: Registro rápido de check-in](#us-003-registro-rápido-de-check-in)
- [US-004: Registro rápido de check-out](#us-004-registro-rápido-de-check-out)
- [US-005: Visualización en tiempo real del estado del aula](#us-005-visualización-en-tiempo-real-del-estado-del-aula)
- [US-006: Registro de ausencia justificada](#us-006-registro-de-ausencia-justificada)
- [US-007: Consulta de historial de asistencia](#us-007-consulta-de-historial-de-asistencia)
- [US-008: Corrección de registros de asistencia](#us-008-corrección-de-registros-de-asistencia)

---

## US-003: Registro rápido de check-in

### TICKET-003-DB: Diseño del modelo de datos de asistencias

**Tipo:** Database  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 2

#### Descripción
Crear esquema completo de asistencias en PostgreSQL con soporte para check-in, check-out, estados y trazabilidad.

#### Tareas técnicas
- [ ] Definir schema de Prisma para `Attendance`
  - Campos: id, child_id, class_room_id, date, check_in_time, check_out_time, status (PRESENT, ABSENT), state (CALM, TIRED, HYPERACTIVE, MEDICATED, FED, NOT_FED), notes, recorded_by, created_at
  - **Nota:** El estado "checkedOut" es un valor derivado calculado como `check_out_time != null`, no es un valor del enum status
- [ ] Constraint UNIQUE(child_id, date) para evitar duplicados
- [ ] FK a Child, ClassRoom, User
- [ ] Índices optimizados:
  - `INDEX(child_id, date)`
  - `INDEX(class_room_id, date)`
  - `INDEX(recorded_by)`
- [ ] Generar migration
- [ ] Seeds de datos de prueba (varios registros de asistencia)

#### Criterios de aceptación
- Schema compilado correctamente
- Constraint de unicidad funciona (no duplicados mismo día)
- Índices creados y optimizados
- FK constraints funcionando
- Seeds cargados correctamente

#### Dependencias
- TICKET-001-DB

#### Notas técnicas
- check_in_time y check_out_time deben ser timestamps con zona horaria
- date debe ser DATE type para comparaciones
- notes columna en DB: 200 caracteres (permite motivos de ausencia extensos)
- regla de negocio: check-in/check-out notes limitadas a 100 caracteres (validar en lógica de entrada, no en DB)

---

### TICKET-003-BE-01: Implementación de entidades de dominio de asistencias

**Tipo:** Backend - Domain Layer  
**Prioridad:** Crítica  
**Estimación:** 8 puntos  
**Sprint:** 2

#### Descripción
Crear entidades de dominio para Attendance con validaciones de negocio y enums.

#### Tareas técnicas
- [ ] Crear entity `Attendance` en `domains/attendance/entities/`
  - Propiedades completas según schema
  - Métodos: `create()`, `checkOut()`, `validate()`
- [ ] Crear enums:
  - `AttendanceStatus`: PRESENT, ABSENT
  - `ChildState`: CALM, TIRED, HYPERACTIVE, MEDICATED, FED, NOT_FED
  - **Nota:** El estado "checkedOut" se calcula como: `attendance.check_out_time !== null` (no es un valor del enum)
- [ ] Value Objects si necesario (notas con validación de longitud)
- [ ] Validaciones de dominio:
  - No duplicado mismo día
  - check_out_time > check_in_time
  - notes máximo 100 caracteres
- [ ] Domain Events:
  - `ChildCheckedIn`
  - `ChildCheckedOut`
- [ ] Tests unitarios >85% coverage

#### Criterios de aceptación
- Entidades cumplen DDD
- Validaciones funcionan correctamente
- Domain events emitidos apropiadamente
- Tests pasan con alta cobertura
- ESLint sin warnings usando `@typescript-eslint/parser` y `@typescript-eslint/eslint-plugin`

#### Dependencias
- TICKET-003-DB

---

### TICKET-003-BE-02: Implementación de AttendanceRepository

**Tipo:** Backend - Infrastructure  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 2

#### Descripción
Repositorio de asistencias con operaciones optimizadas para consultas frecuentes.

#### Tareas técnicas
- [ ] Crear interfaz `IAttendanceRepository` en `domains/attendance/repositories/`
  - Métodos: `create()`, `findByChildAndDate()`, `findByClassRoomAndDate()`, `update()`, `findById()`, `getTodayPresent()`, `getTodayAbsent()`, `getTodayCheckedOut()`
  - **Nota:** `getTodayCheckedOut()` filtra por `status === PRESENT AND check_out_time IS NOT NULL`
- [ ] Implementar `PrismaAttendanceRepository`
- [ ] Optimizar query `findByClassRoomAndDate` con JOIN a Child
- [ ] Mappers entre dominio y persistencia
- [ ] Tests de integración con testcontainers

#### Criterios de aceptación
- Todas las operaciones CRUD funcionan
- Queries optimizadas con JOINs
- Índices utilizados correctamente (verificar EXPLAIN)
- Mappers preservan integridad
- Tests de integración pasan

#### Dependencias
- TICKET-003-BE-01

#### Notas técnicas
- Cachear resultados de `getTodayPresent` por 30 segundos (opcional)
- Usar transacciones para updates críticos

---

### TICKET-003-BE-03: Implementación de AttendanceService con lógica de check-in

**Tipo:** Backend - Domain Services  
**Prioridad:** Crítica  
**Estimación:** 8 puntos  
**Sprint:** 2

#### Descripción
Servicio con lógica de negocio para registro de check-in con validaciones.

#### Tareas técnicas
- [ ] Crear `AttendanceService` en `domains/attendance/services/`
  - `checkIn(dto, userId): Promise<Attendance>`
  - Validar no duplicación mismo día
  - Validar child existe y pertenece a classRoom
  - Capturar timestamp automático
  - Asociar usuario que registra
- [ ] Método `getTodayStatus(classRoomId)` para dashboard
- [ ] Manejo de casos edge:
  - Niño ya tiene check-in hoy
  - ClassRoom no válido
  - Child no existe
- [ ] Emitir domain event `ChildCheckedIn`
- [ ] Tests unitarios con mocks

#### Criterios de aceptación
- Check-in se registra correctamente
- Validaciones previenen duplicados
- Timestamp capturado automáticamente e inmutable
- Usuario responsable asociado
- Domain events emitidos
- Tests >85% coverage

#### Dependencias
- TICKET-003-BE-02

---

### TICKET-003-BE-04: Implementación de AttendanceController y endpoints

**Tipo:** Backend - API Layer  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 2

#### Descripción
Controlador REST para operaciones de asistencia.

#### Tareas técnicas
- [ ] Crear `AttendanceController` en `interfaces/controllers/`
  - `POST /api/attendance/check-in`
  - `GET /api/attendance/classroom/:classRoomId/today`
- [ ] DTOs con validación Zod:
  - `CheckInDto`: { childId, classRoomId, state?, notes? }
  - Validar notes max 100 chars
- [ ] Respuestas estandarizadas
- [ ] Aplicar middlewares de autenticación y autorización
- [ ] Documentación Swagger
- [ ] Tests E2E con supertest

#### Criterios de aceptación
- Endpoints responden correctamente
- Validación de inputs funciona
- Autorización aplicada (solo docentes del aula)
- Documentación actualizada
- Tests E2E pasan

#### Dependencias
- TICKET-003-BE-03
- TICKET-002-BE-04

#### Notas técnicas
- Timeout recomendado: 5 segundos
- Rate limiting: 100 requests/minuto por usuario

---

### TICKET-003-FE-01: Implementación de state management de asistencias

**Tipo:** Frontend - State Management  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 2

#### Descripción
Provider/notifier para gestionar estado de asistencias del aula.

#### Tareas técnicas
- [ ] Crear `AttendanceState` en `lib/state/attendance/`
  - Campos: childrenList, todayAttendances, presentChildren, absentChildren, checkedOutChildren, stats, isLoading, error
  - **Nota:** checkedOutChildren se deriva filtrando attendances con check_out_time != null
- [ ] Crear `AttendanceNotifier extends StateNotifier<AttendanceState>`
  - Métodos: `checkIn()`, `loadTodayAttendance()`, `refreshStatus()`
- [ ] Optimistic updates en check-in
- [ ] Auto-refresh cada 30 segundos (opcional)
- [ ] Manejo de errores con retry
- [ ] Tests unitarios

#### Criterios de aceptación
- Estado reactivo funciona
- Optimistic updates sin flickering
- Manejo de errores apropiado
- Tests >80% coverage

#### Dependencias
- TICKET-002-FE-01

---

### TICKET-003-FE-02: Implementación de AttendanceService en Flutter

**Tipo:** Frontend - Services  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 2

#### Descripción
Servicio HTTP para comunicación con API de asistencias.

#### Tareas técnicas
- [ ] Crear `AttendanceService` en `lib/services/`
  - Métodos: `checkIn()`, `getTodayStatus()`, `checkOut()` (futuro)
- [ ] DTOs: `CheckInRequest`, `AttendanceDTO`, `ClassRoomStatusDTO`
- [ ] Configurar timeouts (5 segundos)
- [ ] Retry automático (max 2 intentos)
- [ ] Tests con mocks

#### Criterios de aceptación
- Llamadas HTTP funcionan
- Timeouts implementados
- Retry logic funciona
- Tests pasan

#### Dependencias
- TICKET-003-BE-04

---

### TICKET-003-FE-03: Implementación de UI de check-in rápido

**Tipo:** Frontend - UI  
**Prioridad:** Crítica  
**Estimación:** 13 puntos  
**Sprint:** 2

#### Descripción
Pantalla optimizada para registro rápido de check-in (<15 segundos).

#### Tareas técnicas
- [ ] Crear `AttendanceCheckInPage` en `lib/pages/attendance/`
- [ ] Lista de niños del aula con búsqueda rápida
  - ListView.builder para performance
  - Búsqueda con debouncing (300ms)
  - Tarjeta de niño con foto, nombre
- [ ] Selector rápido de estado (chips horizontales)
  - 😊 Tranquilo, 😴 Cansado, 🏃 Inquieto, 💊 Medicado, 🍎 Desayunó, ⚠️ No desayunó
- [ ] Campo opcional de notas (max 100 chars)
- [ ] Botón de confirmar check-in prominente
- [ ] Feedback visual:
  - Loading spinner durante request
  - Animación de éxito
  - Mensaje de error si falla
- [ ] Navegación de vuelta a lista actualizada
- [ ] Tests de widgets

#### Criterios de aceptación
- Flujo completo <15 segundos
- UI responsive en tablets
- Búsqueda rápida funciona
- Validaciones frontend correctas
- Feedback visual claro
- Tests pasan

#### Dependencias
- TICKET-003-FE-01
- TICKET-003-FE-02

#### Notas técnicas
- Optimizar para tablets (principal dispositivo)
- Usar Material Design 3
- Implementar accesibilidad (semantic labels)
- Considerar modo offline (post-MVP)

---

### TICKET-003-INT: Pruebas E2E de check-in

**Tipo:** Integration & Testing  
**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Sprint:** 2

#### Descripción
Tests end-to-end del flujo completo de check-in.

#### Tareas técnicas
- [ ] Tests de flujos:
  - Check-in exitoso con todos los datos
  - Check-in solo con datos mínimos
  - Check-in duplicado (debe fallar)
  - Check-in con classRoom no autorizado (debe fallar)
- [ ] Tests de performance:
  - Tiempo total <15 segundos
  - API response <2 segundos
- [ ] Tests de UI:
  - Búsqueda de niños funciona
  - Selección de estado funciona
  - Feedback visual correcto
- [ ] Tests de errores:
  - Red caída
  - Timeout
  - Validación fallida

#### Criterios de aceptación
- Todos los flujos funcionan E2E
- Performance dentro de SLA
- Errores manejados correctamente
- Documentación completa

#### Dependencias
- TICKET-003-BE-04
- TICKET-003-FE-03

---

## US-004: Registro rápido de check-out

### TICKET-004-BE-01: Implementación de lógica de check-out en AttendanceService

**Tipo:** Backend - Domain Services  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 2

#### Descripción
Extender AttendanceService con método de check-out y validaciones.

#### Tareas técnicas
- [ ] Agregar método `checkOut(dto, userId)` a `AttendanceService`
  - Validar existe check-in hoy
  - Validar no tiene check-out previo
  - Validar pickupNote no vacío
  - Actualizar checkOutTime
  - Agregar info de pickup a notes
- [ ] Emitir domain event `ChildCheckedOut`
- [ ] Tests unitarios exhaustivos

#### Criterios de aceptación
- Check-out se registra correctamente
- Validaciones previenen check-out sin check-in
- Validaciones previenen doble check-out
- pickupNote es requerido
- Tests >85% coverage

#### Dependencias
- TICKET-003-BE-03

---

### TICKET-004-BE-02: Endpoint de check-out

**Tipo:** Backend - API Layer  
**Prioridad:** Crítica  
**Estimación:** 3 puntos  
**Sprint:** 2

#### Descripción
Endpoint REST para check-out.

#### Tareas técnicas
- [ ] Agregar a `AttendanceController`:
  - `POST /api/attendance/check-out`
- [ ] DTO con validación:
  - `CheckOutDto`: { childId, classRoomId, notes }
  - Validar notes requerido (información sobre quién recoge)
- [ ] Aplicar middlewares de autorización
- [ ] Documentación Swagger
- [ ] Tests E2E

#### Criterios de aceptación
- Endpoint funciona correctamente
- Validación aplicada
- Autorización correcta
- Tests pasan

#### Dependencias
- TICKET-004-BE-01

---

### TICKET-004-FE-01: Extensión de AttendanceNotifier con check-out

**Tipo:** Frontend - State Management  
**Prioridad:** Crítica  
**Estimación:** 3 puntos  
**Sprint:** 2

#### Descripción
Agregar método de check-out al notifier.

#### Tareas técnicas
- [ ] Agregar método `checkOut(childId, pickupNote)` a `AttendanceNotifier`
- [ ] Optimistic update del estado
- [ ] Actualizar listas (mover de present a checkedOut)
- [ ] Tests unitarios

#### Criterios de aceptación
- Check-out actualiza estado correctamente
- Optimistic updates funcionan
- Tests pasan

#### Dependencias
- TICKET-003-FE-01

---

### TICKET-004-FE-02: UI de check-out

**Tipo:** Frontend - UI  
**Prioridad:** Crítica  
**Estimación:** 8 puntos  
**Sprint:** 2

#### Descripción
Dialog/página para registrar check-out con información de quién recoge.

#### Tareas técnicas
- [ ] Crear `CheckOutDialog` widget
  - Campo de texto para pickupNote
  - Botón de confirmar (deshabilitado si vacío)
  - Loading state
  - Validación de campo requerido
- [ ] Integrar en lista de niños presentes
  - Botón de check-out por niño
  - Solo visible para niños con check-in
- [ ] Feedback visual tras check-out exitoso
- [ ] Manejo de errores
- [ ] Tests de widgets

#### Criterios de aceptación
- Dialog simple y rápido
- Validación funciona
- Solo niños presentes muestran botón
- Feedback claro
- Tests pasan

#### Dependencias
- TICKET-004-FE-01
- TICKET-003-FE-03

---

### TICKET-004-INT: Pruebas E2E de check-out

**Tipo:** Integration & Testing  
**Prioridad:** Alta  
**Estimación:** 3 puntos  
**Sprint:** 2

#### Descripción
Tests end-to-end de check-out.

#### Tareas técnicas
- [ ] Tests de flujos:
  - Check-out exitoso
  - Check-out sin check-in previo (debe fallar)
  - Check-out sin pickupNote (debe fallar)
  - Check-out duplicado (debe fallar)
- [ ] Tests de UI:
  - Dialog funciona
  - Validación frontend funciona
  - Estado actualiza correctamente

#### Criterios de aceptación
- Todos los flujos funcionan
- Validaciones correctas
- Tests pasan

#### Dependencias
- TICKET-004-BE-02
- TICKET-004-FE-02

---

## US-005: Visualización en tiempo real del estado del aula

### TICKET-005-BE-01: Endpoint optimizado de estado del aula

**Tipo:** Backend - API Layer  
**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Sprint:** 2

#### Descripción
Endpoint optimizado que retorna estado completo del aula con una sola query.

#### Tareas técnicas
- [ ] Crear método `getTodayStatus(classRoomId)` en `AttendanceService`
  - Single query con JOIN entre Child y Attendance
  - Agrupar por estado (present, absent, checkedOut)
  - **Nota:** checkedOut se determina por `status = PRESENT AND check_out_time IS NOT NULL`
  - Calcular estadísticas (totales, porcentajes)
- [ ] Endpoint `GET /api/attendance/classroom/:classRoomId/today`
  - Respuesta: { present: Child[], absent: Child[], checkedOut: Child[], stats: Stats }
- [ ] Optimizar query con índices
- [ ] Cachear resultado 15 segundos (opcional)
- [ ] Tests de performance

#### Criterios de aceptación
- Query optimizada (<200ms para 50 niños)
- Respuesta incluye todos los datos necesarios
- Estadísticas calculadas correctamente
- Tests pasan

#### Dependencias
- TICKET-003-BE-04

---

### TICKET-005-FE-01: State management de estado del aula en tiempo real

**Tipo:** Frontend - State Management  
**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Sprint:** 2

#### Descripción
Notifier que gestiona polling y actualización automática del estado del aula.

#### Tareas técnicas
- [ ] Crear `ClassRoomStatusState` en `lib/state/attendance/`
  - Campos: present, absent, checkedOut, stats, lastUpdate, isLoading
  - **Nota:** checkedOut son los niños con status=PRESENT y check_out_time != null
- [ ] Crear `ClassRoomStatusNotifier`
  - Métodos: `startPolling()`, `stopPolling()`, `refresh()`
  - Timer periódico cada 30 segundos
- [ ] Manejo de lifecycle (dispose timer)
- [ ] Tests unitarios

#### Criterios de aceptación
- Polling funciona correctamente
- Timer se cancela en dispose
- Estado actualizado automáticamente
- Tests pasan

#### Dependencias
- TICKET-003-FE-01

---

### TICKET-005-FE-02: UI de dashboard de estado del aula

**Tipo:** Frontend - UI  
**Prioridad:** Alta  
**Estimación:** 13 puntos  
**Sprint:** 2

#### Descripción
Pantalla principal con vista en tiempo real del estado del aula con tres secciones diferenciadas.

#### Tareas técnicas
- [ ] Crear `ClassRoomStatusPage` en `lib/pages/attendance/`
- [ ] Header con estadísticas:
  - Contadores totales por estado
  - Porcentaje de asistencia
  - Última actualización
- [ ] Tres secciones con códigos de color:
  - 🟢 Presentes (verde #4CAF50)
  - ⚫ Ausentes (gris #9E9E9E)
  - 🔵 Retirados (azul #2196F3)
- [ ] Lista de niños por sección:
  - Nombre, foto
  - Hora de check-in (para presentes)
  - Hora de check-out (para retirados)
  - Estado al llegar
- [ ] Pull-to-refresh manual
- [ ] Auto-refresh con indicador
- [ ] Acceso rápido a check-in/check-out
- [ ] Tests de widgets

#### Criterios de aceptación
- Dashboard visualmente claro
- Códigos de color diferenciados
- Contadores actualizados en tiempo real
- Pull-to-refresh funciona
- Performance fluida (60fps)
- Tests pasan

#### Dependencias
- TICKET-005-FE-01

#### Notas técnicas
- Usar ListView.builder para listas
- Implementar animaciones suaves (AnimatedSwitcher)
- Considerar accesibilidad (no solo color)

---

### TICKET-005-INT: Pruebas E2E de visualización en tiempo real

**Tipo:** Integration & Testing  
**Prioridad:** Media  
**Estimación:** 3 puntos  
**Sprint:** 2

#### Descripción
Tests de actualización en tiempo real y visualización.

#### Tareas técnicas
- [ ] Tests de flujos:
  - Dashboard carga estado correcto
  - Check-in actualiza lista automáticamente
  - Check-out mueve niño a sección correcta
  - Pull-to-refresh funciona
- [ ] Tests de UI:
  - Tres secciones visibles
  - Contadores correctos
  - Colores apropiados

#### Criterios de aceptación
- Actualización en tiempo real funciona
- Tests pasan

#### Dependencias
- TICKET-005-BE-01
- TICKET-005-FE-02

---

## US-006: Registro de ausencia justificada

### TICKET-006-BE-01: Lógica de registro de ausencias

**Tipo:** Backend - Domain Services  
**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Sprint:** 2

#### Descripción
Extender AttendanceService con capacidad de registrar ausencias justificadas.

#### Tareas técnicas
- [ ] Agregar método `registerAbsence(dto, userId)` a `AttendanceService`
  - Crear registro de Attendance con status=ABSENT
  - Guardar motivo de ausencia en campo notes (texto libre, max 200 caracteres)
  - Permitir registro anticipado (día anterior)
  - Asociar usuario que registra
- [ ] Validación: no duplicar si ya existe registro ese día
- [ ] Tests unitarios

#### Criterios de aceptación
- Ausencia se registra correctamente
- Motivo almacenado en notes como texto libre
- Registro anticipado funciona
- Validaciones correctas
- Tests >85% coverage

#### Dependencias
- TICKET-003-BE-03

**Nota técnica:** El frontend puede ofrecer categorías predefinidas (Enfermedad, Cita médica, Viaje familiar, Otro), pero el backend almacena el motivo como texto libre en el campo `notes`. Esto simplifica el modelo de datos para el MVP.

---

### TICKET-006-BE-02: Endpoint de registro de ausencia

**Tipo:** Backend - API Layer  
**Prioridad:** Alta  
**Estimación:** 3 puntos  
**Sprint:** 2

#### Descripción
Endpoint REST para registrar ausencias justificadas.

#### Tareas técnicas
- [ ] Agregar a `AttendanceController`:
  - `POST /api/attendance/absent`
- [ ] DTO:
  - `RegisterAbsenceDto`: { childId, classRoomId, date, notes }
  - notes: campo de texto libre (max 200 caracteres) para describir el motivo de la ausencia
- [ ] Aplicar autorización
- [ ] Documentación Swagger
- [ ] Tests E2E

#### Criterios de aceptación
- Endpoint funciona correctamente
- Validación aplicada (notes obligatorio)
- Tests pasan

#### Dependencias
- TICKET-006-BE-01

**Nota técnica:** Se usa el campo genérico `notes` del modelo de datos (columna `notes` en tabla Attendance) para almacenar el motivo de la ausencia en formato libre. Esto evita agregar columnas específicas en la tabla en el MVP. Las categorías predefinidas (Enfermedad, Cita médica, etc.) se pueden manejar en el frontend, pero se almacenan como texto libre en el backend.

---

### TICKET-006-FE-01: UI de registro de ausencia

**Tipo:** Frontend - UI  
**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Sprint:** 2

#### Descripción
Dialog para registrar ausencias con selección de motivo.

#### Tareas técnicas
- [ ] Crear `RegisterAbsenceDialog` widget
  - Selector de niño
  - Selector de fecha (hoy o mañana)
  - Dropdown de motivos predefinidos
  - Campo de texto condicional para "Otro"
  - Validación frontend
- [ ] Botón de "Registrar Ausencia" en dashboard
- [ ] Feedback visual tras registro
- [ ] Tests de widgets

#### Criterios de aceptación
- Dialog funciona correctamente
- Validaciones frontend correctas
- Campo condicional funciona
- Tests pasan

#### Dependencias
- TICKET-003-FE-01

---

### TICKET-006-INT: Pruebas E2E de ausencias

**Tipo:** Integration & Testing  
**Prioridad:** Media  
**Estimación:** 3 puntos  
**Sprint:** 2

#### Descripción
Tests de registro de ausencias justificadas.

#### Tareas técnicas
- [ ] Tests de flujos:
  - Ausencia con motivo predefinido
  - Ausencia con motivo personalizado
  - Ausencia anticipada
  - Ausencia duplicada (debe fallar)

#### Criterios de aceptación
- Todos los flujos funcionan
- Tests pasan

#### Dependencias
- TICKET-006-BE-02
- TICKET-006-FE-01

---

## US-007: Consulta de historial de asistencia

### TICKET-007-BE-01: Servicio de consulta de historial

**Tipo:** Backend - Domain Services  
**Prioridad:** Media  
**Estimación:** 5 puntos  
**Sprint:** 3

#### Descripción
Servicio para consultar historial completo de asistencia con filtros y estadísticas.

#### Tareas técnicas
- [ ] Agregar métodos a `AttendanceService`:
  - `getHistory(childId, startDate, endDate): Promise<Attendance[]>`
  - `getStatistics(childId, startDate, endDate): Promise<Stats>`
- [ ] Calcular estadísticas:
  - Total días asistidos
  - Total ausencias justificadas
  - Total ausencias no justificadas
  - Porcentaje de asistencia
- [ ] Optimizar queries con paginación (opcional)
- [ ] Tests unitarios

#### Criterios de aceptación
- Historial se consulta correctamente
- Filtros de fecha funcionan
- Estadísticas calculadas correctamente
- Tests >80% coverage

#### Dependencias
- TICKET-003-BE-02

---

### TICKET-007-BE-02: Endpoint de historial de asistencia

**Tipo:** Backend - API Layer  
**Prioridad:** Media  
**Estimación:** 3 puntos  
**Sprint:** 3

#### Descripción
Endpoint para consultar historial.

#### Tareas técnicas
- [ ] Crear endpoint:
  - `GET /api/attendance/child/:childId/history?startDate=&endDate=`
- [ ] Respuesta incluye lista y estadísticas
- [ ] Validación de fechas
- [ ] Documentación Swagger
- [ ] Tests E2E

#### Criterios de aceptación
- Endpoint funciona
- Filtros aplicados correctamente
- Tests pasan

#### Dependencias
- TICKET-007-BE-01

---

### TICKET-007-FE-01: UI de historial de asistencia

**Tipo:** Frontend - UI  
**Prioridad:** Media  
**Estimación:** 8 puntos  
**Sprint:** 3

#### Descripción
Pantalla para consultar historial de asistencia de un niño.

#### Tareas técnicas
- [ ] Crear `AttendanceHistoryPage`
- [ ] Lista cronológica de registros:
  - Fecha, hora check-in, hora check-out
  - Estado al llegar
  - Quién recogió
- [ ] Filtros de rango de fechas
- [ ] Panel de estadísticas:
  - Total asistencias
  - % de asistencia
  - Ausencias justificadas/no justificadas
- [ ] Tests de widgets

#### Criterios de aceptación
- Historial se visualiza correctamente
- Filtros funcionan
- Estadísticas visibles
- Tests pasan

#### Dependencias
- TICKET-007-BE-02

---

## US-008: Corrección de registros de asistencia

### TICKET-008-BE-01: Lógica de corrección con validación temporal

**Tipo:** Backend - Domain Services  
**Prioridad:** Media  
**Estimación:** 5 puntos  
**Sprint:** 3

#### Descripción
Permitir corrección de registros dentro de ventana de 24 horas.

#### Tareas técnicas
- [ ] Agregar método `correctAttendance(attendanceId, updates, userId)` a `AttendanceService`
  - Validar ventana temporal (24 horas desde created_at)
  - Validar permisos (autor original o DIRECTOR)
  - Permitir editar: state, checkInTime, checkOutTime, notes
  - No permitir cambiar: childId, date, recorded_by original
- [ ] Guardar registro de corrección (opcional: tabla de audit)
- [ ] Tests unitarios

#### Criterios de aceptación
- Corrección funciona dentro de 24h
- Bloquea corrección fuera de ventana
- Solo autor o director pueden corregir
- Tests >80% coverage

#### Dependencias
- TICKET-003-BE-03

---

### TICKET-008-BE-02: Endpoint de corrección

**Tipo:** Backend - API Layer  
**Prioridad:** Media  
**Estimación:** 3 puntos  
**Sprint:** 3

#### Descripción
Endpoint para corregir registros.

#### Tareas técnicas
- [ ] Agregar a `AttendanceController`:
  - `PATCH /api/attendance/:id`
- [ ] DTO: `UpdateAttendanceDto`
- [ ] Aplicar validaciones de permisos
- [ ] Documentación Swagger
- [ ] Tests E2E

#### Criterios de aceptación
- Endpoint funciona
- Validaciones aplicadas
- Tests pasan

#### Dependencias
- TICKET-008-BE-01

---

### TICKET-008-FE-01: UI de corrección de asistencia

**Tipo:** Frontend - UI  
**Prioridad:** Media  
**Estimación:** 5 puntos  
**Sprint:** 3

#### Descripción
Dialog para corregir registros de asistencia.

#### Tareas técnicas
- [ ] Crear `EditAttendanceDialog`
  - Campos editables: state, times, notes
  - Validación de ventana temporal
  - Mensaje si fuera de ventana
- [ ] Botón de "Editar" en cada registro
- [ ] Tests de widgets

#### Criterios de aceptación
- Dialog funciona
- Validaciones correctas
- Tests pasan

#### Dependencias
- TICKET-008-BE-02

---

## Resumen de Tickets por Tipo

### Database (1 ticket)
- TICKET-003-DB: Modelo de datos de asistencias

### Backend (17 tickets)
- TICKET-003-BE-01: Entidades de dominio
- TICKET-003-BE-02: AttendanceRepository
- TICKET-003-BE-03: AttendanceService con check-in
- TICKET-003-BE-04: AttendanceController y endpoints
- TICKET-004-BE-01: Lógica de check-out
- TICKET-004-BE-02: Endpoint de check-out
- TICKET-005-BE-01: Endpoint de estado del aula
- TICKET-006-BE-01: Lógica de ausencias
- TICKET-006-BE-02: Endpoint de ausencias
- TICKET-007-BE-01: Servicio de historial
- TICKET-007-BE-02: Endpoint de historial
- TICKET-008-BE-01: Lógica de corrección
- TICKET-008-BE-02: Endpoint de corrección

### Frontend (14 tickets)
- TICKET-003-FE-01: State management de asistencias
- TICKET-003-FE-02: AttendanceService
- TICKET-003-FE-03: UI de check-in
- TICKET-004-FE-01: Extension notifier con check-out
- TICKET-004-FE-02: UI de check-out
- TICKET-005-FE-01: State management tiempo real
- TICKET-005-FE-02: UI de dashboard
- TICKET-006-FE-01: UI de ausencias
- TICKET-007-FE-01: UI de historial
- TICKET-008-FE-01: UI de corrección

### Integration & Testing (6 tickets)
- TICKET-003-INT: Tests E2E check-in
- TICKET-004-INT: Tests E2E check-out
- TICKET-005-INT: Tests E2E visualización
- TICKET-006-INT: Tests E2E ausencias
- (TICKET-007 y 008 incluyen tests en tickets principales)

---

## Orden de Implementación Sugerido

### Sprint 2 - Semana 1
1. TICKET-003-DB
2. TICKET-003-BE-01
3. TICKET-003-BE-02
4. TICKET-003-FE-01
5. TICKET-003-FE-02

### Sprint 2 - Semana 2
6. TICKET-003-BE-03
7. TICKET-003-BE-04
8. TICKET-003-FE-03
9. TICKET-003-INT

### Sprint 2 - Semana 3
10. TICKET-004-BE-01
11. TICKET-004-BE-02
12. TICKET-004-FE-01
13. TICKET-004-FE-02
14. TICKET-004-INT

### Sprint 2 - Semana 4
15. TICKET-005-BE-01
16. TICKET-005-FE-01
17. TICKET-005-FE-02
18. TICKET-005-INT

### Sprint 3 - Semana 1-2
19. TICKET-006-BE-01
20. TICKET-006-BE-02
21. TICKET-006-FE-01
22. TICKET-006-INT
23. TICKET-007-BE-01
24. TICKET-007-BE-02
25. TICKET-007-FE-01

### Sprint 3 - Semana 2
26. TICKET-008-BE-01
27. TICKET-008-BE-02
28. TICKET-008-FE-01

---

**Total estimación:** ~150 puntos  
**Duración estimada:** 6 semanas (1.5 Sprints)  
**Equipo sugerido:** 2 backend, 2 frontend, 1 QA

**Prioridad crítica (US-003, US-004, US-005):** 38 tickets, ~115 puntos
**Prioridad alta/media (US-006, US-007, US-008):** ~35 puntos
