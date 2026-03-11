# Spec: Adds template metadata and AcroForm field support

## METAPROMPT LLM GEMINI

Actua como product arquitect y crea un prompt para usar en /create-spec de agent-os para crear estas modificaciones que hemos hablado

Paso 0: Modificar la base de datos para que pueda contener las nuevas especificaciones (nuevos campos en tabla templates y template_versions, nueva tabla fields)

Añadir a template_versions:
Columna,Tipo de Dato SQL,Propiedades,Propósito
title,VARCHAR(255),Nullable,"Almacena el Título del documento (ej., ""Contrato de trabajo..."")."
author,VARCHAR(255),Nullable,"Almacena el Autor (ej., ""Servicio Público de Empleo Estatal (SEPE)"")."
subject,VARCHAR(255),Nullable,Almacena el Asunto del documento.
creation_date,TIMESTAMP,Nullable,"Fecha de creación del archivo (del campo ""Creado el"")."
modification_date,TIMESTAMP,Nullable,Fecha de última modificación del archivo.
page_count,INTEGER,Not Null,(Tu sugerencia anterior) Número de páginas.

Nueva tabla fields: id_template, template_version  
 "field_id": "A0101",
"type": se podría sustituir por
"near_text": "empresaria, hasta un máximo de",
"value_options": (diccionario posibles valores)
page_number,
field_page_order
position_data (diccionario de coordenadas)
raw_type

Paso 1: Modificar el servicio /api/v1/templates/analyze y añadir los campos nuevos en fields y en metadata:

- Campos nuevos en fields:
  "page_number": 1,
  "page_order_index": 0,
  "position_data": {
  "x0": 450.0,
  "y0": 690.5,
  "x1": 500.5,
  "y1": 700.5
- Campos nuevos en "metadata" (a extraer del documento pdf):
  title, author, asunto (en inglés), "created" (date), "modified" (date)

Paso 2: Modificar el frontEnd

- Mostrar estos campos en la página /analyze del front-end
- En la pagina /analyze añadir un botón "guardar nuevo documento": Este botón llamará al servicio que guardará este análisis como nuevo.
  - Insert en las tablas: pdf_templates, template_versions, fields

NOTAS ADICIONALES

- Añade cualquier mejora que consideres relevante o en la propia especificación, por ejemplo si los nombre de campos no son correctos
- Pregúntame antes de hacer el prompt si hay algo que no está claro
- Es muy importante poder validar cada paso del desarrollo y que cursor no haga "tareas de más"
- podemos crear distintos specs de agent-os si lo consideras mejor practica
- En el siguiente spec crearemos la página para visualizar las plantillas archivadas

## RESPUESTA

/create-spec
Crea la especificación completa para las modificaciones del esquema de la base de datos del proyecto SEPE Templates Comparator.

### 1. Detalles de la Tarea

- **Objetivo:** Modificar las tablas existentes (`template_versions`) y crear la nueva tabla `template_fields` para dar soporte al análisis de documentos.
- **Validación:** El código debe ser verificado con un nuevo script de migración de Alembic.

### 2. Modificación de la Tabla 'template_versions'

Modifica el modelo SQLAlchemy de la tabla 'template_versions' para añadir las siguientes columnas de metadatos globales. Usar tipos SQL adecuados para cada dato:

| Columna (Inglés)      | Tipo de Dato SQL | Propiedades | Propósito                                        |
| :-------------------- | :--------------- | :---------- | :----------------------------------------------- |
| **title**             | VARCHAR(255)     | Nullable    | Almacena el Título del documento.                |
| **author**            | VARCHAR(255)     | Nullable    | Almacena el Autor.                               |
| **subject**           | VARCHAR(255)     | Nullable    | Almacena el Asunto del documento.                |
| **creation_date**     | TIMESTAMP        | Nullable    | Fecha de creación del archivo (date).            |
| **modification_date** | TIMESTAMP        | Nullable    | Fecha de última modificación del archivo (date). |
| **page_count**        | INTEGER          | Not Null    | Número total de páginas del documento.           |

### 3. Creación de la Nueva Tabla 'template_fields'

Crea el nuevo modelo SQLAlchemy para la tabla `template_fields`. Esta tabla almacenará los datos extraídos de cada campo del formulario AcroForm.

- **Nombre de la Tabla:** `template_fields`
- **Relación:** 1:N con `template_versions` (un registro de versión tiene múltiples campos)

| Columna (Inglés)     | Tipo de Dato SQL | Propiedades                        | Propósito                                              |
| :------------------- | :--------------- | :--------------------------------- | :----------------------------------------------------- |
| **id**               | UUID             | PK, Not Null                       | Identificador único del registro de campo.             |
| **version_id**       | UUID             | FK a `template_versions`, Not Null | Referencia a la versión a la que pertenece este campo. |
| **field_id**         | VARCHAR(255)     | Not Null                           | ID del campo del formulario (ej: A0101).               |
| **field_type**       | VARCHAR(50)      | Not Null                           | Tipo de control final (ej: 'text', 'radiobutton').     |
| **raw_type**         | VARCHAR(50)      | Nullable                           | Tipo de campo nativo de PDF (ej: '/Tx', '/Btn').       |
| **page_number**      | INTEGER          | Not Null                           | Número de página del PDF.                              |
| **field_page_order** | INTEGER          | Not Null                           | Índice de orden del campo dentro de la página.         |
| **near_text**        | TEXT             | Nullable                           | Texto más cercano (etiqueta descriptiva).              |
| **value_options**    | JSONB            | Nullable                           | Opciones disponibles (para listbox/radio).             |
| **position_data**    | JSONB            | Nullable                           | Coordenadas/Bounding box (`x0`, `y0`, `x1`, `y1`).     |

### 4. Flujo de Tarea

1.  Modificar los modelos SQLAlchemy para incluir las nuevas columnas y crear el modelo 'template_fields'.
2.  Generar una nueva migración de Alembic con el comando `alembic revision --autogenerate -m "Add template metadata and template_fields table"`.
