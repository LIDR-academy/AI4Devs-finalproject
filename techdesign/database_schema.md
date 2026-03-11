# Esquema de Base de Datos - SEPE Templates Comparator

## Resumen General

El sistema SEPE Templates Comparator utiliza una base de datos relacional diseñada para gestionar usuarios, plantillas PDF del SEPE, versiones de plantillas y comparaciones detalladas entre plantillas. La arquitectura está optimizada para rastrear cambios estructurales en formularios PDF y proporcionar análisis comparativos detallados.

## Modelos de Datos

### 1. Tabla: `users`

**Propósito:** Gestión de usuarios del sistema, incluyendo autenticación y perfiles de usuario para el acceso al comparador de plantillas SEPE.
Analiza la estructura de la base de datos del proyecto leyendo exclusivamente los modelos de SQLAlchemy definidos en la carpeta `app/models/`.

### Requisito

Genera un documento Markdown (`database_schema.md`) con el esquema de la base de datos.

### Formato de Salida

Para cada modelo (tabla), proporciona la siguiente información:

1.  **Nombre de la Tabla** (Ejemplo: `users`).
2.  **Propósito** (Una breve descripción basada en el contexto del proyecto SEPE Comparator).
3.  **Columnas:** Lista el `nombre_de_la_columna`, su `Tipo de Dato SQL` (ej: UUID, VARCHAR), y las propiedades clave (`PK`, `FK`, `Nullable`).
4.  **Relaciones:** Indica las relaciones (Relationships) de SQLAlchemy definidas con otros modelos (Ej: `users` tiene una relación de 1:N con `pdf_templates`).

### Enfoque Específico para Análisis

1.  **Analiza la tabla 'users'**: Verifica su estructura básica.
2.  **Analiza 'pdf_templates' y 'template_versions'**: Describe cómo se maneja el versionado.
3.  **Analiza las tablas 'comparison_fields' y 'comparisons'**: Describe cómo se guarda el resultado de la comparación, que es el núcleo del negocio.

Genera el documento completo basado en el código de los modelos de SQLAlchemy.
**Columnas:**
| Nombre | Tipo SQL | Propiedades | Descripción |
|--------|----------|-------------|-------------|
| `id` | INTEGER | PK, Index | Identificador único del usuario |
| `email` | VARCHAR(255) | Unique, Not Null, Index | Email del usuario (usado para login) |
| `hashed_password` | VARCHAR(255) | Not Null | Contraseña hasheada del usuario |
| `full_name` | VARCHAR(255) | Nullable | Nombre completo del usuario |
| `is_active` | BOOLEAN | Default: True, Index | Estado activo del usuario |
| `is_superuser` | BOOLEAN | Default: False | Permisos de superusuario |
| `created_at` | DATETIME | Server Default: now() | Fecha de creación del usuario |
| `updated_at` | DATETIME | On Update: now() | Fecha de última actualización |

**Relaciones:**

- **1:N con `pdf_templates`**: Un usuario puede subir múltiples plantillas PDF (`uploaded_templates`)
- **1:N con `comparisons`**: Un usuario puede crear múltiples comparaciones (`created_comparisons`)

---

### 2. Tabla: `pdf_templates`

**Propósito:** Almacenamiento de metadatos de plantillas PDF del SEPE, incluyendo información del archivo, versiones y estadísticas básicas de campos.

**Columnas:**
| Nombre | Tipo SQL | Propiedades | Descripción |
|--------|----------|-------------|-------------|
| `id` | INTEGER | PK, Index | Identificador único de la plantilla |
| `name` | VARCHAR(255) | Not Null, Index | Nombre de la plantilla PDF |
| `version` | VARCHAR(50) | Not Null, Index | Versión actual de la plantilla |
| `file_path` | VARCHAR(500) | Not Null | Ruta del archivo PDF en el sistema |
| `file_size_bytes` | INTEGER | Not Null | Tamaño del archivo en bytes |
| `field_count` | INTEGER | Default: 0 | Número de campos detectados en el PDF |
| `sepe_url` | VARCHAR(1000) | Nullable | URL oficial del SEPE donde se encuentra la plantilla |
| `uploaded_by` | INTEGER | FK to users.id, Nullable | Usuario que subió la plantilla |
| `created_at` | DATETIME | Server Default: now(), Index | Fecha de creación |
| `updated_at` | DATETIME | On Update: now() | Fecha de última actualización |

**Relaciones:**

- **N:1 con `users`**: Múltiples plantillas pueden ser subidas por un usuario (`uploader`)
- **1:N con `template_versions`**: Una plantilla puede tener múltiples versiones (`versions`)
- **1:N con `comparisons` (como source)**: Una plantilla puede ser fuente en múltiples comparaciones (`source_comparisons`)
- **1:N con `comparisons` (como target)**: Una plantilla puede ser objetivo en múltiples comparaciones (`target_comparisons`)

---

### 3. Tabla: `template_versions`

**Propósito:** Gestión del historial de versiones de plantillas PDF, permitiendo rastrear cambios y mantener un registro de evolución de las plantillas del SEPE a lo largo del tiempo. Incluye metadatos extraídos del documento PDF para análisis detallado.

**Columnas:**
| Nombre | Tipo SQL | Propiedades | Descripción |
|--------|----------|-------------|-------------|
| `id` | INTEGER | PK, Index | Identificador único de la versión |
| `template_id` | INTEGER | FK to pdf_templates.id, Not Null, Index | Referencia a la plantilla base |
| `version_number` | VARCHAR(50) | Not Null | Número/código de versión |
| `change_summary` | TEXT | Nullable | Resumen de cambios en esta versión |
| `is_current` | BOOLEAN | Default: False, Index | Indica si es la versión actual |
| `created_at` | DATETIME | Server Default: now() | Fecha de creación de la versión |
| **`title`** | **VARCHAR(255)** | **Nullable** | **Título del documento PDF extraído de metadatos** |
| **`author`** | **VARCHAR(255)** | **Nullable** | **Autor del documento PDF extraído de metadatos** |
| **`subject`** | **VARCHAR(255)** | **Nullable** | **Asunto/tema del documento PDF** |
| **`creation_date`** | **DATETIME WITH TIME ZONE** | **Nullable** | **Fecha de creación original del archivo PDF** |
| **`modification_date`** | **DATETIME WITH TIME ZONE** | **Nullable** | **Fecha de última modificación del archivo PDF** |
| **`page_count`** | **INTEGER** | **Not Null, Default: 0** | **Número total de páginas del documento PDF** |

**Relaciones:**

- **N:1 con `pdf_templates`**: Múltiples versiones pertenecen a una plantilla (`template`)
- **1:N con `template_fields`**: Una versión tiene múltiples campos AcroForm (`fields`)

**Estrategia de Versionado:**

- Cada plantilla PDF puede tener múltiples versiones históricas
- Solo una versión puede estar marcada como `is_current = True` por plantilla
- El `change_summary` permite documentar qué cambió entre versiones
- **Metadatos del documento** permiten búsqueda y filtrado por propiedades del PDF
- **`page_count`** facilita validación de estructura y cambios de contenido
- Facilita la trazabilidad de evolución de formularios SEPE

---

### 4. Tabla: `template_fields`

**Propósito:** Almacenamiento de campos individuales extraídos de formularios AcroForm de PDF, permitiendo análisis granular campo por campo y comparaciones detalladas entre versiones de plantillas.

**Columnas:**
| Nombre | Tipo SQL | Propiedades | Descripción |
|--------|----------|-------------|-------------|
| `id` | INTEGER | PK, Index | Identificador único del campo |
| `version_id` | INTEGER | FK to template_versions.id, Not Null, Index | Referencia a la versión que contiene este campo |
| `field_id` | VARCHAR(255) | Not Null | Identificador del campo en el PDF (ej: "A0101", "nombre_completo") |
| `field_type` | VARCHAR(50) | Not Null | Tipo de control final: text, checkbox, radiobutton, select, textarea |
| `raw_type` | VARCHAR(50) | Nullable | Tipo nativo del campo PDF: /Tx, /Btn, /Ch |
| `page_number` | INTEGER | Not Null | Número de página donde aparece el campo (1-indexed) |
| `field_page_order` | INTEGER | Not Null | Orden secuencial del campo dentro de la página |
| `near_text` | TEXT | Nullable | Texto cercano o etiqueta descriptiva del campo |
| `value_options` | JSONB | Nullable | Opciones disponibles para campos select/radio (array JSON) |
| `position_data` | JSONB | Nullable | Coordenadas del bounding box: {x0, y0, x1, y1} |
| `created_at` | DATETIME | Server Default: now() | Fecha de registro del campo |

**Relaciones:**

- **N:1 con `template_versions`**: Múltiples campos pertenecen a una versión (`version`)

**Lógica de Negocio:**

- **Análisis Granular**: Cada campo del formulario AcroForm se almacena individualmente para permitir comparaciones precisas
- **Ordenamiento por página**: `page_number` + `field_page_order` permite reconstruir el orden original de los campos
- **Tipos de Campo**:
  - `field_type`: Tipo normalizado para la aplicación (text, checkbox, radiobutton, select, textarea, button, signature)
  - `raw_type`: Tipo original del PDF para referencia técnica
- **Datos JSON** (JSONB en PostgreSQL):
  - `value_options`: Para campos select/radio - array de strings con las opciones disponibles
  - `position_data`: Objeto con coordenadas `{x0, y0, x1, y1}` para mapeo visual
- **Etiquetas contextuales**: `near_text` captura texto cercano que actúa como etiqueta del campo
- **CASCADE Delete**: Al eliminar una versión, todos sus campos se eliminan automáticamente

**Ejemplos de Datos:**

```json
// Campo de texto simple
{
  "field_id": "A0101",
  "field_type": "text",
  "raw_type": "/Tx",
  "page_number": 1,
  "field_page_order": 0,
  "near_text": "Nombre completo:",
  "value_options": null,
  "position_data": {"x0": 100, "y0": 200, "x1": 300, "y1": 220}
}

// Campo radiobutton con opciones
{
  "field_id": "A0102",
  "field_type": "radiobutton",
  "raw_type": "/Btn",
  "page_number": 1,
  "field_page_order": 1,
  "near_text": "Sexo:",
  "value_options": ["Hombre", "Mujer", "Otro"],
  "position_data": {"x0": 100, "y0": 240, "x1": 200, "y1": 260}
}
```

---

### 5. Tabla: `comparisons`

**Propósito:** Núcleo del negocio - almacena metadatos de comparaciones entre plantillas PDF del SEPE, incluyendo estado del proceso, estadísticas y referencias a las plantillas comparadas.

**Columnas:**
| Nombre | Tipo SQL | Propiedades | Descripción |
|--------|----------|-------------|-------------|
| `id` | INTEGER | PK, Index | Identificador único de la comparación |
| `source_template_id` | INTEGER | FK to pdf_templates.id, Not Null, Index | Plantilla fuente de la comparación |
| `target_template_id` | INTEGER | FK to pdf_templates.id, Not Null, Index | Plantilla objetivo de la comparación |
| `comparison_type` | VARCHAR(50) | Default: "structure" | Tipo de comparación realizada |
| `status` | VARCHAR(50) | Default: "pending", Index | Estado del proceso de comparación |
| `differences_count` | INTEGER | Default: 0 | Número total de diferencias encontradas |
| `created_by` | INTEGER | FK to users.id, Nullable | Usuario que creó la comparación |
| `created_at` | DATETIME | Server Default: now(), Index | Fecha de inicio de la comparación |
| `completed_at` | DATETIME | Nullable | Fecha de finalización de la comparación |

**Relaciones:**

- **N:1 con `pdf_templates` (source)**: Múltiples comparaciones pueden usar la misma plantilla como fuente (`source_template`)
- **N:1 con `pdf_templates` (target)**: Múltiples comparaciones pueden usar la misma plantilla como objetivo (`target_template`)
- **N:1 con `users`**: Múltiples comparaciones pueden ser creadas por un usuario (`creator`)
- **1:N con `comparison_fields`**: Una comparación tiene múltiples diferencias a nivel de campo (`field_differences`)

---

### 6. Tabla: `comparison_fields`

**Propósito:** Corazón del análisis comparativo - almacena las diferencias detalladas a nivel de campo entre plantillas PDF, incluyendo cambios de contenido, posición y tipo de modificación.

**Columnas:**
| Nombre | Tipo SQL | Propiedades | Descripción |
|--------|----------|-------------|-------------|
| `id` | INTEGER | PK, Index | Identificador único de la diferencia |
| `comparison_id` | INTEGER | FK to comparisons.id, Not Null, Index | Referencia a la comparación padre |
| `field_name` | VARCHAR(255) | Not Null | Nombre del campo que cambió |
| `field_type` | VARCHAR(100) | Nullable | Tipo de campo (text, checkbox, etc.) |
| `change_type` | VARCHAR(50) | Nullable, Index | Tipo de cambio: 'added', 'removed', 'modified', 'unchanged' |
| `old_value` | TEXT | Nullable | Valor anterior del campo (si aplica) |
| `new_value` | TEXT | Nullable | Valor nuevo del campo (si aplica) |
| `position_x` | FLOAT | Nullable | Coordenada X del campo en el PDF |
| `position_y` | FLOAT | Nullable | Coordenada Y del campo en el PDF |
| `created_at` | DATETIME | Server Default: now() | Fecha de detección de la diferencia |

**Relaciones:**

- **N:1 con `comparisons`**: Múltiples diferencias de campo pertenecen a una comparación (`comparison`)

**Lógica de Negocio:**

- **`change_type`** categoriza el impacto:
  - `'added'`: Campo nuevo en la plantilla objetivo
  - `'removed'`: Campo eliminado de la plantilla fuente
  - `'modified'`: Campo existente con cambios en contenido/propiedades
  - `'unchanged'`: Campo sin cambios (para referencia)
- **Coordenadas** (`position_x`, `position_y`) permiten mapear cambios espaciales
- **Valores** (`old_value`, `new_value`) capturan cambios de contenido específicos

## Diagrama de Relaciones

```
users (1) -----> (N) pdf_templates
  |                     |
  |                     +----> (N) template_versions
  |                     |              |
  |                     |              +----> (N) template_fields [NUEVO]
  |                     |
  +----> (N) comparisons (N) <----- (1) pdf_templates (source)
              |                              |
              |                              | (target)
              +----> (N) comparison_fields   |
                                             |
                                    pdf_templates (target)
```

**Nuevas Relaciones (Actualización 2025-10-19):**

- **template_versions (1) → (N) template_fields**: Una versión contiene múltiples campos AcroForm
- Relación con CASCADE DELETE: eliminar una versión elimina automáticamente todos sus campos
- Permite análisis granular de estructura de formularios PDF

## Índices y Optimizaciones

**Índices Principales:**

- `users.email` (unique, para login rápido)
- `users.is_active` (para filtrar usuarios activos)
- `pdf_templates.name`, `pdf_templates.version` (búsquedas de plantillas)
- `pdf_templates.created_at` (ordenamiento temporal)
- `template_versions.is_current` (para encontrar versión actual rápidamente)
- **`template_fields.id`** **(PK, nuevo)**
- **`template_fields.version_id`** **(FK, nuevo - para joins con template_versions)**
- `comparisons.status` (filtrar por estado de proceso)
- `comparisons.created_at` (histórico de comparaciones)
- `comparison_fields.change_type` (análisis por tipo de cambio)

**Claves Foráneas con Índices:**

- Todas las FK tienen índices para optimizar joins
- **Nueva FK**: `template_fields.version_id` → `template_versions.id` con CASCADE DELETE
- Los índices en FK mejoran significativamente el rendimiento de queries con JOINs

**Índices Futuros Recomendados (template_fields):**

- Índice compuesto `(version_id, page_number, field_page_order)` para consultas ordenadas por página
- Índice GIN en columnas JSONB (`value_options`, `position_data`) si se realizan búsquedas JSON frecuentes

## Consideraciones de Diseño

1. **Versionado Flexible**: El sistema permite múltiples versiones por plantilla con marcado de versión actual
2. **Comparaciones Bidireccionales**: Las plantillas pueden ser tanto fuente como objetivo en diferentes comparaciones
3. **Análisis Granular**: `comparison_fields` permite análisis detallado hasta nivel de campo individual
4. **Trazabilidad Completa**: Timestamps y referencias de usuario en todas las operaciones principales
5. **Escalabilidad**: Diseño preparado para grandes volúmenes de plantillas y comparaciones del SEPE
6. **Almacenamiento de Estructura PDF** (Nuevo): `template_fields` permite análisis detallado de formularios AcroForm
7. **JSONB para Datos Variables**: Uso de PostgreSQL JSONB para almacenar datos estructurados flexibles (opciones, coordenadas)
8. **Integridad Referencial**: CASCADE DELETE en `template_fields` asegura limpieza automática de datos huérfanos

## Ejemplos de Consultas SQL

### Consultas para template_fields

**1. Obtener todos los campos de una versión ordenados por página:**

```sql
SELECT
    field_id,
    field_type,
    page_number,
    field_page_order,
    near_text
FROM template_fields
WHERE version_id = 1
ORDER BY page_number, field_page_order;
```

**2. Contar campos por tipo en una versión:**

```sql
SELECT
    field_type,
    COUNT(*) as field_count
FROM template_fields
WHERE version_id = 1
GROUP BY field_type
ORDER BY field_count DESC;
```

**3. Buscar campos con opciones específicas (usando JSONB):**

```sql
SELECT
    field_id,
    near_text,
    value_options
FROM template_fields
WHERE version_id = 1
  AND value_options @> '["Hombre"]'::jsonb;
```

**4. Obtener campos en una página específica:**

```sql
SELECT
    field_id,
    field_type,
    near_text,
    position_data
FROM template_fields
WHERE version_id = 1
  AND page_number = 1
ORDER BY field_page_order;
```

**5. Consulta con JOIN para obtener metadata del documento y sus campos:**

```sql
SELECT
    tv.version_number,
    tv.title,
    tv.author,
    tv.page_count,
    tf.field_id,
    tf.field_type,
    tf.page_number
FROM template_versions tv
JOIN template_fields tf ON tv.id = tf.version_id
WHERE tv.is_current = true
  AND tv.template_id = 1
ORDER BY tf.page_number, tf.field_page_order;
```

**6. Analizar coordenadas de campos (usando operadores JSONB):**

```sql
SELECT
    field_id,
    page_number,
    position_data->>'x0' as x_start,
    position_data->>'y0' as y_start,
    position_data->>'x1' as x_end,
    position_data->>'y1' as y_end
FROM template_fields
WHERE version_id = 1
  AND position_data IS NOT NULL
ORDER BY page_number, (position_data->>'y0')::float DESC;
```

### Consultas con Metadatos de template_versions

**7. Buscar versiones por metadata del documento:**

```sql
SELECT
    id,
    version_number,
    title,
    author,
    page_count,
    creation_date
FROM template_versions
WHERE author ILIKE '%SEPE%'
  AND page_count > 5
ORDER BY creation_date DESC;
```

**8. Comparar page_count entre versiones de una plantilla:**

```sql
SELECT
    version_number,
    page_count,
    created_at
FROM template_versions
WHERE template_id = 1
ORDER BY created_at;
```

---

## Historial de Cambios

### 2025-10-19: Añadido soporte para análisis de formularios AcroForm

**Cambios en `template_versions`:**

- ✅ Añadidas 6 columnas de metadatos del documento PDF: `title`, `author`, `subject`, `creation_date`, `modification_date`, `page_count`

**Nueva tabla `template_fields`:**

- ✅ Creada tabla para almacenar campos individuales de formularios AcroForm
- ✅ 11 columnas incluyendo identificación, tipo, página, orden, texto cercano, y datos JSON
- ✅ Relación 1:N con `template_versions` con CASCADE DELETE
- ✅ Uso de PostgreSQL JSONB para `value_options` y `position_data`
- ✅ Índices en PK y FK para optimización de consultas

**Migración:**

- Archivo: `backend/alembic/versions/fa338313b3a3_add_template_metadata_and_template_.py`
- Reversible: `alembic downgrade -1` elimina cambios limpiamente
