# Spec:

## METAPROMPT LLM GEMINI

Gemini, refina este prompt para la siguiente SPEC y si faltan funcionalidades relevantes, añadelas.

## La siguiente SPEC consistirá en grabar todos los datos de la comparación en base de datos:

- Añadir un botón “Save Comparison” debajo de la card de resultados globales y encima de la card de “Field Changes” a la derecha.
- Al pulsar el botón se debe llamar al nuevo servicio encargado de guardar la comparación en base de datos. Para seguir la lógica de nuestro API el servicio debe llamarse **_/api/v1/comparisons/ingest_**
- Si la respuesta del servicio es correcta se debe redirigir a la ruta /comparisons que mostrará un listado con todas las comparaciones guardadas en base de datos: Esta página será análoga a /templates, se mostrará un buscador y la lista de comparaciones. En la tabla se mostrará:
  - Source: mostrar (template+version)
  - Target: mostrar (template+version)
  - Page Count (source \-\> target)
  - Fields added
  - Fields modified
  - Fields removed
  - Fields unchanged
  - % Modify
- La columna final será de acciones (igual que en templates). Tendrá una acción
  - Ir al detalle de la comparación representada como un icono que redirigirá a la página /comparisons/results en este caso el análisis no se debe ejecutar otra vez, si no recuperar los datos catalogados en base de datos. Se deberá crear un endpoint GET /api/v1/comparision/{comparison_id} que traiga los datos con el mismo modelo que /api/v1/comparisons/analyze pero desde base de datos

## Adaptar el modelo de datos

Las tablas comparisons y comparisons_fields tendrán que ser adaptadas para añadir los campos necesarios y quitar los que no son relevantes. Se adjunta el esquema actual (sepe-database-251027.sql) y un respuesta de[/api/v1/comparisons/analyze](http://localhost:8000/api/v1/comparisons/analyze) (example_response_analyze.json)

## RESPUESTA

/create-spec
Crea la especificación completa para implementar la persistencia de los resultados de comparación, el listado de comparaciones guardadas y la página de detalle, aplicando la arquitectura de datos necesaria.

### 1. Backend: Modificación Crítica del Esquema de Datos

- **Objetivo:** Adaptar las tablas `comparisons` y `comparison_fields` para almacenar el payload completo y correcto del análisis.
- **Acción sobre 'comparisons' (Tabla Base):**

  1. **CRÍTICO - Cambiar FK:** Modificar las columnas `source_template_id` y `target_template_id` para que sean **`source_version_id`** y **`target_version_id`** (ambas FK a la tabla `template_versions`).
  2. **Añadir Métricas Globales:** Añadir columnas para almacenar las métricas clave:
     - **`modification_percentage`** (FLOAT, Not Null)
     - **`fields_added`** (INTEGER, Not Null)
     - **`fields_removed`** (INTEGER, Not Null)
     - **`fields_modified`** (INTEGER, Not Null)
     - **`fields_unchanged`** (INTEGER, Not Null)

- **Acción sobre 'comparison_fields' (Tabla Detalle):**
  1. **Adaptar:** Modificar la tabla para que pueda almacenar todos los campos del payload de 'field_changes' (ej., `source_page_number`, `target_page_number`, `near_text_diff`, `position_change`).
  2. **Flujo de Tarea:** Generar una nueva migración de Alembic para aplicar estos cambios.

### 2. Backend: Endpoint de Persistencia (API/Servicio)

- **Objetivo:** Crear el servicio que guarda el resultado completo del análisis.
- **Nuevo Router:** POST /api/v1/comparisons/ingest
- **Autenticación:** Requiere autenticación (usar `current_user: User = Depends(get_current_active_user)`).
- **Input:** Recibe el Payload completo devuelto por el _endpoint_ /analyze (incluyendo `source_version_id`, `target_version_id`, `global_metrics` y `field_changes`).
- **Lógica de Persistencia:** El servicio debe realizar una única transacción para:
  1.  Insertar el registro principal en **`comparisons`** (usando los datos de `global_metrics`).
  2.  Insertar todos los registros de detalle en **`comparison_fields`** (usando los datos de `field_changes`).
- **Endpoint de Lectura:** Implementar el endpoint **GET /api/v1/comparisons/{comparison_id}**
  - **Lógica:** Recupera el registro de `comparisons` y todos sus `comparison_fields` asociados de la DB.
  - **Output:** Ensambla los datos en el mismo formato de `AnalysisResponse` (el mismo modelo que `/analyze`) para el Front-end, pero leyéndolos directamente de la base de datos.

### 3. Frontend: Interfaz de Usuario (Visualización)

- **Objetivo:** Implementar la visualización y la navegación del listado.

#### A. Botón de Guardado:

1.  En la página de análisis de comparación (actualmente visible): Añadir el botón **"Save Comparison"** debajo de las métricas globales, que llama al endpoint **POST /api/v1/comparisons/ingest** con el payload actual de la comparación.

#### B. Página de Listado ('ComparisonsPage.tsx'):

1.  Implementar la página **`/comparisons`** para listar todas las comparaciones guardadas.
2.  **Tabla de Listado:** La tabla debe mostrar la información de las métricas globales (Source/Target Version, Fields Added, % Modified, etc.) para cada registro.

#### C. Página de Detalle:

1.  Implementar el componente de detalle para la ruta **`/comparisons/results/{comparison_id}`** (o similar).
2.  **Visualización:** Este componente llama al endpoint **GET /api/v1/comparisons/{comparison_id}** y reutiliza el componente de visualización de resultados de la comparación (la tabla de `Field Changes`).

### 4. Convenciones (Código Limpio)

- **SOLID:** Mantener la separación de lógica entre _routers_ y _servicios_.
- **Alembic:** La migración debe ser generada por el Agente.
