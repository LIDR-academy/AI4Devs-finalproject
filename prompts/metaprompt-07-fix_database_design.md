# Spec: 2025-10-26-01-database-version-refactor

## METAPROMPT LLM GEMINI

Gemini, por favor, refiname este prompt para usarlo en /create-spec de agent-os:
Bugfixing: después de un análisis más profundo se ha detectado que ciertos campos deberían estar en template_versions y no en pdf_templates porque varían dentro del mismo documento de una versión a otra.

- Numero de campos (file_count)
- Tamaño del documento pdf (file_path)
- Ruta del documento pdf  (file_size_bytes)
- Sepe URL (sepe_url)
  Adicionalmente al cambio de campos en tablas, realizar estas mejoras:
- En pdf_templates cambiar el nombre de version por current_version
- Añadir un campo comment a pdf_templates.
  Realizar el cambio del modelo de datos, con su correspondiente alembic y cambiar el backend (fastAPI) y el front donde se haga uso de estos campos.

## RESPUESTA

/create-spec
Crea la especificación completa para refactorizar la estructura de las tablas 'pdf_templates' y 'template_versions'. El objetivo es aplicar el principio de atomicidad del versionado moviendo las propiedades que varían de versión a versión a la tabla 'template_versions'.

### 1. Backend: Refactorización Crítica del Modelo de Datos

- **Objetivo:** Aplicar la corrección de persistencia moviendo atributos a la tabla de versionado.
- **Acción sobre 'pdf_templates' (Tabla Base):**

  1. **Renombrar:** Cambiar el nombre de la columna `version` a **`current_version`** (VARCHAR(50), Not Null). Esto indica cuál es la versión activa de la plantilla.
  2. **Añadir:** Añadir la columna **`comment`** (TEXT, Nullable) para notas sobre la plantilla base.
  3. **Eliminar y Mover (Bugfix):** Eliminar las siguientes columnas de `pdf_templates` ya que varían por versión: `file_size_bytes`, `field_count`, `file_path`, y `sepe_url`.

- **Acción sobre 'template_versions' (Tabla de Versión):**
  1. **Añadir (Bugfix):** Añadir las siguientes columnas movidas desde `pdf_templates`: **`file_size_bytes`** (INTEGER), **`field_count`** (INTEGER), **`file_path`** (VARCHAR(500)), y **`sepe_url`** (VARCHAR(1000), Nullable).

### 2. Backend: Capa de Aplicación (Ajustes de Código)

- **Objetivo:** Ajustar todos los archivos Python (FastAPI Routers, Pydantic Schemas, Servicios) que hacen referencia a las columnas movidas o renombradas.
- **Routers Afectados:**
  - Ajustar el _router_ **`templates.py`** (y cualquier otro _router_ de CRUD) para que lea `current_version` y acceda a los datos de archivo a través de la relación `template_versions`.
  - Ajustar el _router_ **`ingest.py`** para asegurar que los metadatos movidos se guarden en la nueva ubicación (`template_versions`) durante el proceso de persistencia.
- **Pydantic Schemas:** Actualizar todos los esquemas (`TemplateResponse`, `TemplateUploadResponse`, etc.) para reflejar los cambios de `version` a `current_version` y para obtener los detalles del archivo de la tabla `template_versions`.

### 3. Frontend: Componentes de UI (Ajustes de Visualización)

- **Objetivo:** Actualizar los componentes de React/TypeScript para reflejar la nueva nomenclatura y estructura de datos.
- **Ajustes Críticos:**
  - Modificar la lógica de cualquier componente que muestre la URL, el tamaño del archivo o el número de campos (ej., la página `/templates/:id`) para que estos atributos se lean de la versión actual (`current_version`) de la plantilla.
  - Actualizar los _types_ de TypeScript para `current_version` y los datos movidos.

### 4. Flujo de Tarea y Validación

1.  Modificar los modelos SQLAlchemy y generar una nueva migración de Alembic con `alembic revision --autogenerate -m "Refactor template versioning structure"`.
2.  Aplicar la migración (`alembic upgrade head`).
3.  Implementar los cambios en el Backend y Frontend.
4.  Verificar que la documentación de la API (`/docs`) y los componentes de visualización (`/templates`) funcionen sin errores de base de datos.
