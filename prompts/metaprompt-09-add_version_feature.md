# Spec:

## METAPROMPT LLM GEMINI

refiname el prompt para una nueva /create-spec para añadir una nueva versión a un template existente: La feature “UPLOAD VERSION” se ejecutará también desde la funcionalidad /analyze, una vez hecho el análisis, el usuario dispondrá de un nuevo botón “Guardar nueva Versión”. Desde este botón se abrirá una modal con los siguientes registros:
Selector con los nombres de los templates disponibles (obligatorio)
Versión
Change summary 
Al guardar la versión si el resultado es correcto redirigir a la ruta /created mostrando los datos de la versión específica
Dado que el endpoint actuall: /api/v1/templates/ingest crea un template (tabla pdf_templates) + versión (tabla template_versions) + fields (tabla template_fields)
El nuevo template  /api/v1/templates/ingest/version debe alimentar solo las tablas template_versions  y template_fields
Para que se distingan mejor las acciones cambiar el label “Guardar como version inicial” por “Guardar nuevo template”

## RESPUESTA

/create-spec
Crea la especificación completa para implementar la funcionalidad "Guardar nueva Versión" para plantillas existentes, aplicando el Principio de Responsabilidad Única a los endpoints de ingesta.

### 1. Backend: Nuevo Endpoint de Ingesta de Versiones (SOLID)

- **Objetivo:** Permitir a un usuario guardar el resultado de un análisis como una nueva versión de una plantilla existente.
- **Nuevo Router:** Implementar una nueva función en el router de ingesta (`ingest.py`).
- **Ruta:** POST /api/v1/templates/ingest/version
- **Autenticación:** Requiere autenticación (usar `current_user: User = Depends(get_current_active_user)`).
- **Lógica Centralizada:** Crear un servicio nuevo o modificar un servicio existente (`TemplateService`) para manejar la lógica de persistencia de versión.

#### Funcionalidad de la API:

1.  **Input:** Recibe el archivo PDF (`UploadFile`), el `template_id` (del template existente), el `change_summary` (el comentario) y los metadatos globales/campos _analizados_.
2.  **Validación:** Verificar que el `template_id` exista en la tabla `pdf_templates`.
3.  **Persistencia Crítica (Solo Actualización):**
    - NO inserta en **`pdf_templates`**.
    - Insertar **un nuevo registro** en **`template_versions`** (con metadatos globales, `page_count`, _checksum_, y FK al `template_id` existente).
    - Marcar el nuevo registro como **`is_current = True`** y marcar la versión anterior como `is_current = False`.
    - Actualiza pdf_templates con la nueva versión insertada
    - Insertar múltiples registros en **`template_fields`** vinculados a la nueva `version_id`.
    - **Output:** Devuelve el ID de la nueva versión creada.

### 2. Frontend: Flujo de Subida de Versión (TemplateAnalyzePage.tsx)

- **Objetivo:** Refactorizar la UX de la página `/analyze` para soportar las dos acciones de guardado.

#### A. Refactorización de Labels:

1.  Cambiar el label del botón existente: **"Guardar como Versión Inicial"** debe ser **"Guardar Nuevo Template"**.

#### B. Botón y Modal de "Upload Version":

1.  Añadir un nuevo botón llamado **"Guardar Nueva Versión"**.
2.  Al hacer clic, mostrar una **modal** (o formulario) con los siguientes campos:
    - **Selector de Template:** Un componente `select` que liste los nombres de los templates existentes (usar un _endpoint_ de la API para obtener esta lista, ej., `GET /api/v1/templates`).
    - **Input:** Campos para `version` (VARCHAR) y `change_summary` (TEXT).
3.  **Acción de Guardado:** El botón 'Guardar' de la modal debe llamar al nuevo endpoint **POST /api/v1/templates/ingest/version**.
4.  **Redirección de Éxito:** Al guardar con éxito, redirigir a la página de visualización: `/templates/created/[ID_DE_LA_VERSIÓN_GUARDADA]`.

### 3. Backend: Servicio de Consulta (Soporte de Modal)

- **Objetivo:** Crear el servicio que alimenta el selector de plantillas en el Front-end.
- **Endpoint:** GET /api/v1/templates/names (Nuevo)
- **Lógica:** Devuelve una lista ligera de todos los templates disponibles (`id` y `name`) para poblar el selector de la modal.

### 4. Convenciones (Código Limpio)

- **Estilo:** Todo el código debe adherirse estrictamente a las reglas de `snake_case` y convenciones de tipado estricto.
