# Spec:

## METAPROMPT LLM GEMINI

SPEC “CREATE COMPARISON”: Gemini, por favor, refina este prompt primero como un product owner y luego como un arquitecto de producto, si hay comparativas que faltan añadelas:
El usuario tiene que tener la posibilidad de seleccionar dos versiones de documentos (del mismo template o distinto template) y ejecutar una comparativa. La funcionalidad será similar a la de añadir el template, primero se mostrarán en pantalla los resultados de la comparativa y después el usuario tendrá la opción de almacenar la comparativa en base de datos para consultarla posteriormente (esta funcionalidad se centrará en el siguiente spec, el scope de este spec es crear el endpoint de análisis y la página de visualización).
La ruta para crear la comparación ya existe: /comparisons/create
Deben aparecer los siguientes campos:
Template source: Selector con los templates disponibles
Versión source: selector con las versiones disponibles del template inicial
Template target : Selector con los templates disponibles
Versión target: selector con las versiones disponibles del template inicial
Botón para ejecutar la comparativa: crear un servicio: /api/v1/comparisons/analyze que realice la comparativa
Control antes de enviar a comparar: si template+version source= template+version target. Mostrar  un error “los templates son iguales, nada que comparar”
Una vez se obtengan los datos del endpoint /api/v1/comparisons/analyze se mostrarán en pantalla. 
El análisis debe mostrar comparativas globales y comparativa de campos en detalle
Comparativas globales 
Igual o distinto numero de paginas
Igual o distinto numero global de campos 
Comparativa de los metadatos del documento (creation_date y modification_date)
El análisis se debe centrar en las diferencias entre el template target y el source. Y se deben mostrar tanto las similitudes como las diferencias (campo a campo)
Si el campo existe en el template inicial y es igual o diferente
Si el texto near_text existe en template inicial  y es igual o diferente
Si el campo está en la misma página o es diferente 
A nivel técnico la comparativa se hará con los datos almacenados en base datos, no con los documentos en sí.

## RESPUESTA

/create-spec
Crea la especificación completa para implementar la funcionalidad 'CREATE COMPARISON', abarcando el Back-end (API) y el Front-end (React/Vite).

### 1. Backend: Servicio de Análisis Comparativo (Nueva Función)

- **Objetivo:** Crear un nuevo servicio para realizar la comparación de dos versiones de plantillas usando ÚNICAMENTE los datos de la base de datos ('template_fields' y 'template_versions').
- **Router:** POST /api/v1/comparisons/analyze (Nuevo router 'comparison.py').
- **Input Pydantic:** Recibe 'source_version_id' (UUID) y 'target_version_id' (UUID).
- **Lógica de Servicio:**
  1.  Consulta la base de datos para obtener los objetos 'TemplateVersion' y 'TemplateFields' completos para ambas IDs.
  2.  Realiza el 'diff' en memoria.
- **Output Pydantic (ComparisonResult):** Debe devolver dos secciones:
  - **GlobalMetrics:** Igual/Distinto número de páginas (`page_count`), Igual/Distinto número total de campos (`field_count`), % de campos modificados, y los metadatos de las fechas.
  - **FieldChanges (La Tabla de Visualización):** Una lista de objetos que muestren el resultado del campo a campo.

### 2. Backend: Estructura del Output FieldChanges

Para cada campo comparado, el output debe mostrar las diferencias de forma bidireccional (campo por campo):

| Atributo (Inglés)      | Tipo | Propósito                                                                                      |
| :--------------------- | :--- | :--------------------------------------------------------------------------------------------- |
| **field_id**           | str  | El ID del campo (ej: A0101).                                                                   |
| **status**             | str  | **'ADDED'** (solo en Target), **'REMOVED'** (solo en Source), **'MODIFIED'**, **'UNCHANGED'**. |
| **source_page_number** | int  | Página en la plantilla Source.                                                                 |
| **target_page_number** | int  | Página en la plantilla Target.                                                                 |
| **near_text_diff**     | str  | 'EQUAL', 'DIFFERENT' (si la etiqueta ha cambiado).                                             |
| **value_options_diff** | str  | 'EQUAL', 'DIFFERENT' (si las opciones de selección han cambiado).                              |
| **position_change**    | str  | 'EQUAL', 'DIFFERENT' (si las coordenadas han cambiado significativamente).                     |

### 3. Frontend: Componente de Creación y Visualización

- **Ruta Activa:** Trabajar sobre el componente **'CreateComparisonPage.tsx'** (Ruta `/comparisons/create`).
- **Formulario UX (React):**
  - Implementar dos sets de selectores encadenados (Template Source -> Version Source, y Template Target -> Version Target).
  - **Validación UX:** Implementar una validación de Front-end para mostrar un error si `source_version_id` == `target_version_id` ("Templates are identical. Nothing to compare.").
- **Botón:** Implementar el botón "Execute Comparison".
- **Visualización:** Al obtener los datos del endpoint, mostrar el resultado:
  - **Card de Métricas Globales:** Mostrar las métricas solicitadas (Page Count, Field Count, Metadatos).
  - **Tabla de Cambios Detallados:** Mostrar una tabla principal con las columnas: **Field ID | Status | Source Page | Target Page | Near Text Diff | Value options diff | Position chage**.
  - La tabla de campos detallados debe tener filtros para poder visualizar solo los campos ADDED, REMOVED o MODIFIED.
