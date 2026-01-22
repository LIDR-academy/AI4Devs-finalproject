# Tickets - Registro de Incidentes

## Índice
- [US-009: Registro rápido de incidentes](#us-009-registro-rápido-de-incidentes)
- [US-010: Control de visibilidad de incidentes](#us-010-control-de-visibilidad-de-incidentes)
- [US-011: Consulta de incidentes por niño](#us-011-consulta-de-incidentes-por-niño)
- [US-012: Generación de resumen diario](#us-012-generación-de-resumen-diario)

---

## US-009: Registro rápido de incidentes

### TICKET-009-DB: Diseño del modelo de datos de incidentes

**Tipo:** Database  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 3

#### Descripción
Crear esquema completo de incidentes en PostgreSQL con soporte para categorías, etiquetas y visibilidad.

#### Tareas técnicas
- [ ] Definir schema de Prisma para `Incident`
  - Campos: id, child_id, class_room_id, date_time, type (POSITIVE, NEGATIVE, PEDAGOGICAL, HEALTH, BEHAVIOR, ACHIEVEMENT), description, tags (array de FINE_MOTOR, GROSS_MOTOR, SOCIALIZATION, LANGUAGE, AUTONOMY, CREATIVITY), shared_with_family, recorded_by, created_at, updated_at
- [ ] FK a Child, ClassRoom, User
- [ ] Índices optimizados:
  - `INDEX(child_id, date_time DESC)`
  - `INDEX(class_room_id, date_time DESC)`
  - `INDEX(type)`
  - `INDEX(shared_with_family)`
- [ ] Constraint description max 500 caracteres
- [ ] Generar migration
- [ ] Seeds de datos de prueba (varios tipos de incidentes)

#### Criterios de aceptación
- Schema compilado correctamente
- Índices creados para queries frecuentes
- Constraint de longitud funciona
- FK constraints funcionando
- Seeds cargados con variedad de ejemplos

#### Dependencias
- TICKET-001-DB

#### Notas técnicas
- date_time debe ser timestamp con zona horaria
- tags es array PostgreSQL (o tabla intermedia)
- shared_with_family default FALSE para privacidad

---

### TICKET-009-BE-01: Implementación de entidades de dominio de incidentes

**Tipo:** Backend - Domain Layer  
**Prioridad:** Crítica  
**Estimación:** 8 puntos  
**Sprint:** 3

#### Descripción
Crear entidades de dominio para Incident con validaciones y enums.

#### Tareas técnicas
- [ ] Crear entity `Incident` en `domains/incidents/entities/`
  - Propiedades completas según schema
  - Métodos: `create()`, `updateVisibility()`, `validate()`
- [ ] Crear enums:
  - `IncidentType`: POSITIVE, NEGATIVE, PEDAGOGICAL, HEALTH, BEHAVIOR, ACHIEVEMENT
  - `DevelopmentArea`: FINE_MOTOR, GROSS_MOTOR, SOCIALIZATION, LANGUAGE, AUTONOMY, CREATIVITY
- [ ] Validaciones de dominio:
  - description requerido, max 500 caracteres
  - type requerido
  - tags opcional (array)
  - shared_with_family default false
- [ ] Domain Events:
  - `IncidentCreated`
  - `IncidentVisibilityChanged`
- [ ] Tests unitarios >85% coverage

#### Criterios de aceptación
- Entidades cumplen DDD
- Validaciones funcionan correctamente
- Default shared_with_family = false
- Domain events emitidos
- Tests pasan con alta cobertura

#### Dependencias
- TICKET-009-DB

---

### TICKET-009-BE-02: Implementación de IncidentRepository

**Tipo:** Backend - Infrastructure  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 3

#### Descripción
Repositorio de incidentes con operaciones CRUD y consultas optimizadas.

#### Tareas técnicas
- [ ] Crear interfaz `IIncidentRepository` en `domains/incidents/repositories/`
  - Métodos: `create()`, `findById()`, `findByChildId()`, `findByClassRoomId()`, `update()`, `delete()`, `findByChildAndDateRange()`, `findSharedIncidents()`
- [ ] Implementar `PrismaIncidentRepository`
- [ ] Optimizar queries:
  - Usar índices apropiadamente
  - JOIN a Child para información completa
  - Filtros por tipo, área de desarrollo, visibilidad
- [ ] Mappers entre dominio y persistencia
- [ ] Tests de integración

#### Criterios de aceptación
- Todas las operaciones CRUD funcionan
- Queries optimizadas con índices
- Filtros funcionan correctamente
- Mappers preservan integridad
- Tests de integración pasan

#### Dependencias
- TICKET-009-BE-01

---

### TICKET-009-BE-03: Implementación de IncidentService

**Tipo:** Backend - Domain Services  
**Prioridad:** Crítica  
**Estimación:** 8 puntos  
**Sprint:** 3

#### Descripción
Servicio con lógica de negocio para registro y gestión de incidentes.

#### Tareas técnicas
- [ ] Crear `IncidentService` en `domains/incidents/services/`
  - `createIncident(dto, userId): Promise<Incident>`
    - Validar child existe y pertenece a classRoom
    - Capturar timestamp automático
    - Default shared_with_family = false
    - Asociar usuario que registra
  - `updateVisibility(incidentId, shared, userId): Promise<Incident>`
    - Solo autor o DIRECTOR puede cambiar
  - `getIncidentsByChild(childId, filters): Promise<Incident[]>`
  - `getSharedIncidents(childId, date): Promise<Incident[]>`
- [ ] Emitir domain events apropiados
- [ ] Tests unitarios con mocks

#### Criterios de aceptación
- Incidente se crea correctamente
- Validaciones previenen datos inválidos
- Visibilidad controlada por permisos
- Consultas con filtros funcionan
- Tests >85% coverage

#### Dependencias
- TICKET-009-BE-02

---

### TICKET-009-BE-04: Implementación de IncidentController y endpoints

**Tipo:** Backend - API Layer  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 3

#### Descripción
Controlador REST para operaciones de incidentes.

#### Tareas técnicas
- [ ] Crear `IncidentController` en `interfaces/controllers/`
  - `POST /api/incidents`
  - `PATCH /api/incidents/:id/visibility`
  - `GET /api/incidents/child/:childId`
  - `GET /api/incidents/:id`
- [ ] DTOs con validación Zod:
  - `CreateIncidentDto`: { childId, classRoomId, type, description, tags?, sharedWithFamily? }
  - Validar description max 500 chars
  - Validar type en enum
  - Validar tags en enum
- [ ] Respuestas estandarizadas
- [ ] Aplicar middlewares de autenticación y autorización
- [ ] Documentación Swagger
- [ ] Tests E2E

#### Criterios de aceptación
- Endpoints responden correctamente
- Validación de inputs funciona
- Autorización aplicada (solo docentes del aula)
- Documentación actualizada
- Tests E2E pasan

#### Dependencias
- TICKET-009-BE-03
- TICKET-002-BE-04

---

### TICKET-009-FE-01: Implementación de state management de incidentes

**Tipo:** Frontend - State Management  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 3

#### Descripción
Provider/notifier para gestionar estado de incidentes.

#### Tareas técnicas
- [ ] Crear `IncidentState` en `lib/state/incidents/`
  - Campos: incidents, isLoading, error, filters
- [ ] Crear `IncidentNotifier extends StateNotifier<IncidentState>`
  - Métodos: `createIncident()`, `updateVisibility()`, `loadIncidentsByChild()`, `applyFilters()`
- [ ] Filtros locales por tipo, área, visibilidad
- [ ] Manejo de errores
- [ ] Tests unitarios

#### Criterios de aceptación
- Estado reactivo funciona
- Creación de incidente actualiza estado
- Filtros funcionan correctamente
- Tests >80% coverage

#### Dependencias
- TICKET-002-FE-01

---

### TICKET-009-FE-02: Implementación de IncidentService en Flutter

**Tipo:** Frontend - Services  
**Prioridad:** Crítica  
**Estimación:** 5 puntos  
**Sprint:** 3

#### Descripción
Servicio HTTP para comunicación con API de incidentes.

#### Tareas técnicas
- [ ] Crear `IncidentService` en `lib/services/`
  - Métodos: `createIncident()`, `updateVisibility()`, `getIncidentsByChild()`, `getIncidentById()`
- [ ] DTOs: `CreateIncidentRequest`, `IncidentDTO`, `UpdateVisibilityRequest`
- [ ] Configurar timeouts y retry
- [ ] Tests con mocks

#### Criterios de aceptación
- Llamadas HTTP funcionan
- DTOs mapeados correctamente
- Tests pasan

#### Dependencias
- TICKET-009-BE-04

---

### TICKET-009-FE-03: Implementación de UI de registro rápido de incidentes

**Tipo:** Frontend - UI  
**Prioridad:** Crítica  
**Estimación:** 13 puntos  
**Sprint:** 3

#### Descripción
Pantalla/dialog optimizado para registro rápido de incidentes.

#### Tareas técnicas
- [ ] Crear `CreateIncidentPage` o `CreateIncidentDialog`
- [ ] Selector de niño del aula
- [ ] Selector de categoría (chips visuales con iconos):
  - ✅ Positivo, ⚠️ Negativo, 📚 Pedagógico, 🏥 Salud, 😊 Comportamiento, 🏆 Logro
- [ ] Campo de descripción (multiline, max 500 chars)
  - Contador de caracteres visible
  - Validación en tiempo real
- [ ] Selector múltiple de áreas de desarrollo (chips):
  - 🤏 Motricidad fina, 🏃 Motricidad gruesa, 👥 Socialización, 💬 Lenguaje, 🎒 Autonomía, 🎨 Creatividad
- [ ] Toggle de visibilidad (default: Solo interno)
  - Explicación clara de cada opción
- [ ] Botón de guardar
  - Loading state
  - Validaciones frontend
- [ ] Feedback visual tras creación exitosa
- [ ] Tests de widgets

#### Criterios de aceptación
- Formulario intuitivo y rápido
- Validaciones frontend correctas
- Contador de caracteres funciona
- Default visibility = false (interno)
- Selector múltiple funciona
- Feedback claro
- Tests pasan

#### Dependencias
- TICKET-009-FE-01
- TICKET-009-FE-02

#### Notas técnicas
- Optimizar para tablets
- Usar Material Design 3
- Chips deben ser fáciles de seleccionar
- Considerar plantillas de descripción rápida (opcional)

---

### TICKET-009-INT: Pruebas E2E de registro de incidentes

**Tipo:** Integration & Testing  
**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Sprint:** 3

#### Descripción
Tests end-to-end del flujo completo de registro de incidentes.

#### Tareas técnicas
- [ ] Tests de flujos:
  - Creación exitosa con todos los campos
  - Creación con campos mínimos
  - Validación de descripción max 500 chars
  - Validación de campos requeridos
  - Default visibility = false
  - Docente sin acceso al aula (debe fallar)
- [ ] Tests de UI:
  - Selectores funcionan
  - Validaciones frontend funcionan
  - Contador de caracteres correcto
- [ ] Tests de autorización:
  - Solo docentes del aula pueden crear

#### Criterios de aceptación
- Todos los flujos funcionan E2E
- Validaciones correctas
- Autorización funciona
- Tests pasan

#### Dependencias
- TICKET-009-BE-04
- TICKET-009-FE-03

---

## US-010: Control de visibilidad de incidentes

### TICKET-010-BE-01: Validación de permisos para cambio de visibilidad

**Tipo:** Backend - Domain Services  
**Prioridad:** Alta  
**Estimación:** 3 puntos  
**Sprint:** 3

#### Descripción
Asegurar que solo usuarios autorizados puedan cambiar visibilidad de incidentes.

#### Tareas técnicas
- [ ] Validación en `IncidentService.updateVisibility()`:
  - Solo autor del incidente puede cambiar
  - DIRECTOR puede cambiar cualquier incidente
  - Emitir evento `IncidentVisibilityChanged`
- [ ] Tests unitarios de permisos

#### Criterios de aceptación
- Solo autor o DIRECTOR pueden cambiar
- Validación bloquea usuarios no autorizados
- Evento emitido correctamente
- Tests pasan

#### Dependencias
- TICKET-009-BE-03

---

### TICKET-010-BE-02: Endpoint de actualización de visibilidad

**Tipo:** Backend - API Layer  
**Prioridad:** Alta  
**Estimación:** 3 puntos  
**Sprint:** 3

#### Descripción
Endpoint dedicado para cambiar visibilidad de incidentes.

#### Tareas técnicas
- [ ] Implementar en `IncidentController`:
  - `PATCH /api/incidents/:id/visibility`
- [ ] DTO: `UpdateVisibilityDto`: { sharedWithFamily: boolean }
- [ ] Aplicar middlewares de autorización
- [ ] Documentación Swagger
- [ ] Tests E2E

#### Criterios de aceptación
- Endpoint funciona correctamente
- Solo usuarios autorizados pueden cambiar
- Tests pasan

#### Dependencias
- TICKET-010-BE-01

---

### TICKET-010-FE-01: UI para cambiar visibilidad de incidentes

**Tipo:** Frontend - UI  
**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Sprint:** 3

#### Descripción
Toggle/switch para cambiar visibilidad de incidentes desde lista o detalle.

#### Tareas técnicas
- [ ] Agregar toggle de visibilidad en:
  - Vista detallada de incidente
  - Lista de incidentes (opcional)
- [ ] Indicadores visuales claros:
  - 🔒 Solo interno
  - 👨‍👩‍👧 Compartir con familia
- [ ] Confirmación antes de cambiar a compartible
- [ ] Solo visible para autor o DIRECTOR
- [ ] Tests de widgets

#### Criterios de aceptación
- Toggle funciona correctamente
- Indicadores visuales claros
- Solo visible para usuarios autorizados
- Confirmación funciona
- Tests pasan

#### Dependencias
- TICKET-009-FE-01

---

### TICKET-010-INT: Pruebas E2E de visibilidad

**Tipo:** Integration & Testing  
**Prioridad:** Media  
**Estimación:** 3 puntos  
**Sprint:** 3

#### Descripción
Tests de control de visibilidad.

#### Tareas técnicas
- [ ] Tests de flujos:
  - Autor cambia visibilidad exitosamente
  - DIRECTOR cambia visibilidad exitosamente
  - Otro docente intenta cambiar (debe fallar)
  - Incidente interno no aparece en resumen
  - Incidente compartible aparece en resumen

#### Criterios de aceptación
- Permisos funcionan correctamente
- Filtrado por visibilidad funciona
- Tests pasan

#### Dependencias
- TICKET-010-BE-02
- TICKET-010-FE-01

---

## US-011: Consulta de incidentes por niño

### TICKET-011-BE-01: Servicio de consulta con filtros avanzados

**Tipo:** Backend - Domain Services  
**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Sprint:** 4

#### Descripción
Servicio para consultar incidentes con múltiples filtros.

#### Tareas técnicas
- [ ] Extender `IncidentService` con método:
  - `getIncidentsByChild(childId, filters): Promise<Incident[]>`
  - Filtros: dateRange, types[], tags[], sharedWithFamily?, searchText
- [ ] Búsqueda full-text en description (PostgreSQL)
- [ ] Ordenamiento por fecha descendente
- [ ] Paginación (opcional)
- [ ] Tests unitarios

#### Criterios de aceptación
- Consulta con filtros funciona
- Búsqueda por texto funciona
- Ordenamiento correcto
- Tests pasan

#### Dependencias
- TICKET-009-BE-02

---

### TICKET-011-BE-02: Endpoint de consulta de incidentes

**Tipo:** Backend - API Layer  
**Prioridad:** Alta  
**Estimación:** 3 puntos  
**Sprint:** 4

#### Descripción
Endpoint con filtros query params.

#### Tareas técnicas
- [ ] Implementar:
  - `GET /api/incidents/child/:childId?types=&tags=&sharedWithFamily=&search=&startDate=&endDate=`
- [ ] Validación de query params
- [ ] Documentación Swagger
- [ ] Tests E2E

#### Criterios de aceptación
- Endpoint con filtros funciona
- Validación correcta
- Tests pasan

#### Dependencias
- TICKET-011-BE-01

---

### TICKET-011-FE-01: State management con filtros

**Tipo:** Frontend - State Management  
**Prioridad:** Alta  
**Estimación:** 3 puntos  
**Sprint:** 4

#### Descripción
Extender notifier con soporte de filtros.

#### Tareas técnicas
- [ ] Agregar filtros a `IncidentState`:
  - types, tags, dateRange, searchText, sharedWithFamily
- [ ] Método `applyFilters()` en `IncidentNotifier`
- [ ] Filtrado local + remoto
- [ ] Tests unitarios

#### Criterios de aceptación
- Filtros funcionan correctamente
- Combinación de filtros funciona
- Tests pasan

#### Dependencias
- TICKET-009-FE-01

---

### TICKET-011-FE-02: UI de historial de incidentes con filtros

**Tipo:** Frontend - UI  
**Prioridad:** Alta  
**Estimación:** 13 puntos  
**Sprint:** 4

#### Descripción
Pantalla completa de historial de incidentes con filtros avanzados.

#### Tareas técnicas
- [ ] Crear `IncidentHistoryPage`
- [ ] Lista cronológica de incidentes:
  - Fecha y hora
  - Tipo con icono y color
  - Descripción resumida (primeros 100 chars)
  - Tags visuales
  - Indicador de visibilidad
  - Docente responsable
- [ ] Vista detallada al tocar incidente
- [ ] Panel de filtros:
  - Selector múltiple de tipos
  - Selector múltiple de áreas
  - Rango de fechas
  - Toggle de visibilidad
  - Búsqueda por texto
- [ ] Indicador de filtros activos
- [ ] Botón de limpiar filtros
- [ ] Diferenciación visual incidentes internos vs compartibles
- [ ] Tests de widgets

#### Criterios de aceptación
- Lista muestra incidentes correctamente
- Filtros funcionan independientemente y combinados
- Vista detallada completa
- Diferenciación visual clara
- Performance fluida con muchos incidentes
- Tests pasan

#### Dependencias
- TICKET-011-FE-01

#### Notas técnicas
- ListView.builder para performance
- Implementar infinite scroll (opcional)
- Cache de resultados filtrados

---

### TICKET-011-INT: Pruebas E2E de consulta de incidentes

**Tipo:** Integration & Testing  
**Prioridad:** Media  
**Estimación:** 3 puntos  
**Sprint:** 4

#### Descripción
Tests de consulta con filtros.

#### Tareas técnicas
- [ ] Tests de flujos:
  - Consulta sin filtros
  - Filtro por tipo
  - Filtro por área de desarrollo
  - Filtro por visibilidad
  - Búsqueda por texto
  - Combinación de filtros
- [ ] Tests de UI:
  - Filtros funcionan
  - Limpiar filtros funciona
  - Vista detallada funciona

#### Criterios de aceptación
- Todos los filtros funcionan correctamente
- Tests pasan

#### Dependencias
- TICKET-011-BE-02
- TICKET-011-FE-02

---

## US-012: Generación de resumen diario

### TICKET-012-BE-01: Servicio de generación de resumen diario

**Tipo:** Backend - Domain Services  
**Prioridad:** Alta  
**Estimación:** 8 puntos  
**Sprint:** 4

#### Descripción
Servicio para agregar datos de asistencia e incidentes y generar resumen textual.

#### Tareas técnicas
- [ ] Crear `DailySummaryService` en `domains/summary/services/`
  - `generateSummary(childId, date): Promise<DailySummary>`
  - Consultar asistencia del día
  - Consultar incidentes compartibles del día
  - Generar texto estructurado:
    - Header: "Resumen del día [fecha]"
    - Asistencia: hora llegada, estado, hora salida, quién recogió
    - Incidentes: cada incidente compartible con formato
    - Footer: mensaje positivo si no hay incidentes
- [ ] `generateBulkSummaries(classRoomId, date): Promise<Map<childId, DailySummary>>`
  - Generar resúmenes para todos los niños del aula que asistieron
- [ ] Plantilla de texto customizable
- [ ] Tests unitarios

#### Criterios de aceptación
- Resumen se genera correctamente
- Solo incluye incidentes compartibles
- Formato de texto claro y profesional
- Mensaje predeterminado positivo si no hay incidentes
- Bulk generation funciona
- Tests >80% coverage

#### Dependencias
- TICKET-003-BE-02
- TICKET-009-BE-02

---

### TICKET-012-BE-02: Endpoint de generación de resumen

**Tipo:** Backend - API Layer  
**Prioridad:** Alta  
**Estimación:** 3 puntos  
**Sprint:** 4

#### Descripción
Endpoints para generar resúmenes individuales y masivos.

#### Tareas técnicas
- [ ] Crear `DailySummaryController`:
  - `GET /api/summary/child/:childId/date/:date`
  - `POST /api/summary/classroom/:classRoomId/bulk`
    - Body: { date: string }
    - Response: { summaries: Map<childId, summary> }
- [ ] Aplicar autorización (solo docentes del aula o DIRECTOR)
- [ ] Documentación Swagger
- [ ] Tests E2E

#### Criterios de aceptación
- Endpoints funcionan correctamente
- Generación masiva eficiente
- Autorización aplicada
- Tests pasan

#### Dependencias
- TICKET-012-BE-01

---

### TICKET-012-FE-01: State management de resúmenes

**Tipo:** Frontend - State Management  
**Prioridad:** Alta  
**Estimación:** 3 puntos  
**Sprint:** 4

#### Descripción
Notifier para gestionar generación y visualización de resúmenes.

#### Tareas técnicas
- [ ] Crear `DailySummaryState` en `lib/state/summary/`
  - Campos: summaries (Map), isGenerating, error
- [ ] Crear `DailySummaryNotifier`
  - Métodos: `generateSummary(childId)`, `generateBulkSummaries(classRoomId)`, `editSummary(childId, text)`
- [ ] Cache de resúmenes generados
- [ ] Tests unitarios

#### Criterios de aceptación
- Estado gestiona resúmenes correctamente
- Generación masiva funciona
- Cache funciona
- Tests pasan

#### Dependencias
- TICKET-009-FE-01

---

### TICKET-012-FE-02: Servicio de resúmenes en Flutter

**Tipo:** Frontend - Services  
**Prioridad:** Alta  
**Estimación:** 3 puntos  
**Sprint:** 4

#### Descripción
Servicio HTTP para generación de resúmenes.

#### Tareas técnicas
- [ ] Crear `DailySummaryService` en `lib/services/`
  - Métodos: `generateSummary()`, `generateBulkSummaries()`
- [ ] DTOs: `DailySummaryDTO`
- [ ] Tests con mocks

#### Criterios de aceptación
- Llamadas HTTP funcionan
- Tests pasan

#### Dependencias
- TICKET-012-BE-02

---

### TICKET-012-FE-03: UI de generación y visualización de resúmenes

**Tipo:** Frontend - UI  
**Prioridad:** Alta  
**Estimación:** 13 puntos  
**Sprint:** 4

#### Descripción
Pantalla para generar y revisar resúmenes diarios antes de compartir.

#### Tareas técnicas
- [ ] Crear `DailySummaryPage`
- [ ] Botón "Generar resúmenes del día" en dashboard
- [ ] Vista de resúmenes generados:
  - Lista de niños que asistieron
  - Resumen generado por niño (expandible/colapsable)
  - Estado: "Generado", "Editado", "Listo para compartir"
- [ ] Editor de resumen:
  - TextField multiline editable
  - Botón de "Guardar cambios"
  - Botón de "Restaurar original"
- [ ] Acciones por resumen:
  - ✏️ Editar
  - 📋 Copiar al portapapeles
  - ✅ Marcar como "listo para compartir"
- [ ] Acción masiva:
  - "Marcar todos como listos"
  - "Copiar todos"
- [ ] Formato visual claro del resumen
- [ ] Loading state durante generación masiva
- [ ] Tests de widgets

#### Criterios de aceptación
- Generación masiva funciona
- Editor de resumen funciona
- Copiar al portapapeles funciona
- Estados gestionados correctamente
- UI clara e intuitiva
- Tests pasan

#### Dependencias
- TICKET-012-FE-01
- TICKET-012-FE-02

#### Notas técnicas
- Usar Clipboard API de Flutter
- Formato markdown simple para resumen (opcional)
- Considerar preview antes de compartir

---

### TICKET-012-INT: Pruebas E2E de resúmenes diarios

**Tipo:** Integration & Testing  
**Prioridad:** Alta  
**Estimación:** 5 puntos  
**Sprint:** 4

#### Descripción
Tests end-to-end de generación de resúmenes.

#### Tareas técnicas
- [ ] Tests de flujos:
  - Generar resumen individual
  - Generar resúmenes masivos
  - Editar resumen antes de compartir
  - Resumen sin incidentes (mensaje positivo)
  - Resumen con incidentes compartibles
  - Resumen excluye incidentes internos
  - Copiar al portapapeles
- [ ] Tests de UI:
  - Editor funciona
  - Estados visuales correctos
  - Acciones masivas funcionan
- [ ] Tests de contenido:
  - Resumen incluye todos los datos esperados
  - Formato de texto correcto
  - Tono profesional y positivo

#### Criterios de aceptación
- Generación funciona correctamente
- Filtrado de incidentes correcto
- Edición funciona
- Formato apropiado
- Tests pasan

#### Dependencias
- TICKET-012-BE-02
- TICKET-012-FE-03

---

## Resumen de Tickets por Tipo

### Database (1 ticket)
- TICKET-009-DB: Modelo de datos de incidentes

### Backend (12 tickets)
- TICKET-009-BE-01: Entidades de dominio
- TICKET-009-BE-02: IncidentRepository
- TICKET-009-BE-03: IncidentService
- TICKET-009-BE-04: IncidentController y endpoints
- TICKET-010-BE-01: Validación permisos visibilidad
- TICKET-010-BE-02: Endpoint de visibilidad
- TICKET-011-BE-01: Servicio de consulta con filtros
- TICKET-011-BE-02: Endpoint de consulta
- TICKET-012-BE-01: Servicio de resumen diario
- TICKET-012-BE-02: Endpoint de resumen

### Frontend (13 tickets)
- TICKET-009-FE-01: State management de incidentes
- TICKET-009-FE-02: IncidentService
- TICKET-009-FE-03: UI de registro de incidentes
- TICKET-010-FE-01: UI de visibilidad
- TICKET-011-FE-01: State management con filtros
- TICKET-011-FE-02: UI de historial con filtros
- TICKET-012-FE-01: State management de resúmenes
- TICKET-012-FE-02: Servicio de resúmenes
- TICKET-012-FE-03: UI de resúmenes

### Integration & Testing (5 tickets)
- TICKET-009-INT: Tests E2E registro
- TICKET-010-INT: Tests E2E visibilidad
- TICKET-011-INT: Tests E2E consulta
- TICKET-012-INT: Tests E2E resúmenes

---

## Orden de Implementación Sugerido

### Sprint 3 - Semana 1-2
1. TICKET-009-DB
2. TICKET-009-BE-01
3. TICKET-009-BE-02
4. TICKET-009-BE-03
5. TICKET-009-FE-01
6. TICKET-009-FE-02

### Sprint 3 - Semana 2-3
7. TICKET-009-BE-04
8. TICKET-009-FE-03
9. TICKET-009-INT

### Sprint 3 - Semana 3
10. TICKET-010-BE-01
11. TICKET-010-BE-02
12. TICKET-010-FE-01
13. TICKET-010-INT

### Sprint 4 - Semana 1-2
14. TICKET-011-BE-01
15. TICKET-011-BE-02
16. TICKET-011-FE-01
17. TICKET-011-FE-02
18. TICKET-011-INT

### Sprint 4 - Semana 2-3
19. TICKET-012-BE-01
20. TICKET-012-BE-02
21. TICKET-012-FE-01
22. TICKET-012-FE-02

### Sprint 4 - Semana 3-4
23. TICKET-012-FE-03
24. TICKET-012-INT

---

**Total estimación:** ~125 puntos  
**Duración estimada:** 6 semanas (1.5 Sprints)  
**Equipo sugerido:** 2 backend, 2 frontend, 1 QA

**Prioridad crítica (US-009):** ~54 puntos
**Prioridad alta (US-010, US-011, US-012):** ~71 puntos
