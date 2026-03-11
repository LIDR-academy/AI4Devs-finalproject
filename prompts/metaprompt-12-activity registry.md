## METAPROMPT LLM GEMINI

\#\# FEATURE: IMPLEMENTAR FUNCIONALIDAD “RECENT ACTIVITY”  
 Gemini como Arquitecto de Producto refina este prompt para /create-spec de agent-os.  
La especificación describe la funcionalidad “Recent Activity” que existe en la página de inicio de la aplicación pero que es un mock. La implementación incluirá:

- Crear una tabla “activity” en base de datos para guardar la actividad en la aplicación. Campos necesario: Timestamp de la actividad, usuario que realiza la actividad, tipo de actividad, descripción de la actividad, por ejemplo (Template “SEPE Form Indefinidos” analyzed o New version “SEPE Form Indefinidos” saved.
- Las actividades que se deberán tener en cuenta para el tracking son:
  - Login de un usuario (LOGIN). Endpoint /api/v1/auth/login
  - Registro de un usuario (NEW-USER). Endpoint /api/v1/auth/register
  - Analyze de un template (TEMPLATE-ANALYSIS). Endpoint /api/v1/templates/analyze
  - Template guardado Saved (TEMPLATE-SAVED). Endpoint /api/v1/templates/ingest
  - Versión guardada (VERSION-SAVED). Endpoint /api/v1/templates/ingest/version
  - Comparison (COMPARISON-ANALYSIS). Endpoint /api/v1/comparisons/analyze
  - Saved Comparison (COMPARISON-SAVED). Endpoint /api/v1/comparisons/ingest
- Modificar los endpoints en los que queremos añadir el tracking para que guarden la actividad en la tabla activity
- Crear un endpoint para recuperar la actividad más reciente según un un límite de X registros, ordenados por fecha de actividad descendente. Excluir la actividad tipo “LOGIN”
- Modificar la página de inicio (HomePage.tsx) para consumir este servicio y mostrar las 10 ultimas actividades.

\*\*corrige/completa la especificación si es necesario\*\*

## RESPUESTA DE GEMINI (prompt refinado)

/create-spec
Crea la especificación completa para implementar la funcionalidad 'Recent Activity' con una base de datos de auditoría, eliminando el mock actual en el Front-end. El diseño debe garantizar la trazabilidad de los eventos clave.

### 1. Backend: Modificación Crítica del Esquema (Tabla de Actividad)

- **Objetivo:** Crear la nueva tabla 'activity' para auditoría.
- **Tabla: 'activity'** (Nuevo Modelo SQLAlchemy)

  - **id**: (SERIAL, PK)
  - **timestamp**: (TIMESTAMP WITH TIME ZONE, Not Null, Default: now())
  - **user_id**: (INTEGER, FK a users.id, Nullable) - El usuario que realiza la acción.
  - **activity_type**: (VARCHAR(50), Not Null) - El tipo de evento (ej., 'TEMPLATE_SAVED', 'LOGIN').
  - **description**: (TEXT, Not Null) - La descripción legible (ej., 'Template "SEPE Form V2" uploaded by user@example.com').
  - **entity_id**: (INTEGER, Nullable) - ID de la entidad afectada (ej., ID del template o de la comparación).

- **Tipos de Actividad (Definición de ENUM o Constantes):** Asegurar que se manejan los siguientes tipos:
  - `LOGIN`
  - `NEW_USER`
  - `TEMPLATE_ANALYSIS` (Solo si la solicitud de análisis es exitosa)
  - `TEMPLATE_SAVED` (Ingest)
  - `VERSION_SAVED` (Ingest/Version)
  - `COMPARISON_ANALYSIS` (Solo si la comparación se ejecuta con éxito)
  - `COMPARISON_SAVED` (Ingest/Comparison)

### 2. Backend: Lógica de Servicio y Tracking

- **Objetivo:** Inyectar la lógica de tracking en los endpoints sin violar el SRP de los _routers_.
- **Servicio Principal:** Crear o modificar un servicio (`ActivityService`) con la función `log_activity(db, user_id, activity_type, description, entity_id)`.
- **Modificación de Routers CRÍTICOS:** Modificar los siguientes routers (y sus servicios subyacentes) para llamar a `ActivityService.log_activity` **justo antes de devolver la respuesta 200/201**:
  - `POST /auth/login`
  - `POST /auth/register`
  - `POST /templates/analyze` (TEMPLATE-ANALYSIS)
  - `POST /templates/ingest` (TEMPLATE-SAVED)
  - `POST /templates/ingest/version` (VERSION-SAVED)
  - `POST /comparisons/ingest` (COMPARISON-SAVED)

### 3. Backend: Endpoint de Consulta (API)

- **Objetivo:** Crear un endpoint para alimentar el dashboard de la página de inicio.
- **Ruta:** GET /api/v1/activity/recent
- **Input:** Recibe un `limit` (INTEGER, Default 10) para la paginación.
- **Lógica:**
  - Consulta la tabla `activity`.
  - **CRÍTICO:** Excluir la actividad tipo **'LOGIN'** de los resultados (según la petición).
  - Ordenar por `timestamp` descendente.
  - Realizar un JOIN con la tabla `users` para obtener el email o nombre del usuario.
  - **Output:** Devuelve un esquema enriquecido con la actividad, usuario y la descripción.

### 4. Frontend: Visualización (HomePage.tsx)

- **Objetivo:** Sustituir el mock actual por datos reales del backend.
- **Componente:** Modificar 'HomePage.tsx'.
- **Acción:** Consumir el nuevo endpoint **GET /api/v1/activity/recent** y renderizar las últimas actividades en la card de "Recent Activity", mostrando la `description` y el `timestamp`.

### 5. Flujo de Tarea y Validación

1.  Modificar los modelos SQLAlchemy y generar una nueva migración de Alembic para la tabla 'activity'.
2.  Aplicar la migración (`alembic upgrade head`).
3.  Implementar los servicios y modificar los _routers_ afectados.
4.  Implementar el endpoint de consulta y la visualización en el Front-end.
