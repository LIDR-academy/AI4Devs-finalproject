# Spec: PDF Template Analysis API Endpoint PROMPT

## METAPROMPT LLM GEMINI

Teniendo en cuenta nuestro fronT-end de vite actua como un experto en front y dame el /create-spec de .agent-os para crear la página front /analyze de análisis de pdf. La página deberá tener el formulario para cargar el fichero, ejecutar y que se muestre el resultado del servicio de una forma visual ¿Cómo mostrarías el resultado del servicio /api/v1/templates/analyze? En una tabla con las cabeceras field_id | type | near-text| value-options?

## RESPUESTA

/create-spec

Crea la especificación completa para el componente de Front-end para el análisis de plantillas PDF. El componente se llamará 'TemplateAnalyzePage' y utilizará TypeScript y TailwindCSS.

### 1. Detalles del Componente

- **Ruta del Front-end:** /analyze
- **Objetivo:** Permitir al usuario subir un archivo PDF, ejecutar el análisis del backend, y visualizar la estructura del formulario AcroForm resultante.
- **Tecnología:** React + TypeScript, TailwindCSS.

### 2. Funcionalidad Requerida

1.  **Formulario de Subida:** Un componente simple de tipo 'drag-and-drop' o botón para seleccionar un archivo PDF (usar la API nativa de 'fetch' o 'Axios' si ya está configurado para la llamada a la API).
2.  **Llamada a la API:** El botón de 'Analizar' debe enviar el archivo PDF como 'multipart/form-data' al endpoint del backend: POST /api/v1/templates/analyze.
3.  **Manejo de Estado:** Implementar estados de UI: 'idle', 'processing' (con spinner visible), y 'results'.

### 3. Visualización de Resultados

El resultado de la API (una lista de objetos TemplateField) debe mostrarse en un componente de tabla.

- **Diseño de la Tabla:** Usar TailwindCSS para un diseño limpio y responsivo.
- **Cabeceras de la Tabla (Mejoradas para Análisis):** La tabla debe usar las siguientes cabeceras para facilitar la comparación:

  | Cabecera (Inglés) | Propósito                                     | Mapping del JSON |
  | :---------------- | :-------------------------------------------- | :--------------- |
  | **Field ID**      | Identificador único del campo (ej: A0101).    | `id_campo`       |
  | **Type**          | Tipo de control (text, radiobutton).          | `tipo`           |
  | **Nearest Label** | **Etiqueta descriptiva** (Texto próximo).     | `texto_proximo`  |
  | **Options**       | Valores predefinidos disponibles (si aplica). | `value_options`  |

- **Detalle de la Fila:** Cada fila de la tabla mostrará la información de un campo.
- **Visualización de Opciones:** Mostrar 'N/A' o '—' si `value_options` es nulo. Si existen, mostrarlas como una lista separada por comas.

### 4. Estructura de la Especificación

Crea los archivos de especificación para:

- `TemplateAnalyzePage.tsx` (El componente principal)
- `TemplateFieldTable.tsx` (El componente de la tabla de resultados)
- Los `interfaces` de TypeScript para el Input/Output de la API.
