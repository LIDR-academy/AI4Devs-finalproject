---
name: api-specification
description: "Diseña la especificación OpenAPI 3.0 de endpoints REST con serialización estricta de Decimal como string numérico."
version: "1.1.0"
category: "04_persistence_and_api"
inputs:
  - prd_doc
  - schema_doc
outputs:
  - "docs/04_persistence_and_api/10_api_specification.md"
---

Actúa como un Senior API Architect experto en especificaciones RESTful bajo el estándar OpenAPI 3.0.0 e ingeniería de software Contract-First.

Tu objetivo es diseñar la especificación de la API para dar soporte exclusivo al Flujo Prioritario (Happy Path de Negocio) detallado en los documentos adjuntos. Analiza el archivo [RUTA_DEL_PRD] y el esquema físico en [RUTA_DEL_DISEÑO] para asegurar la total coherencia de datos, llaves foráneas y tipos físicos.

Por favor, genera de manera exclusiva la sección de Contratos de la API estructurada bajo las siguientes pautas técnicas:

1. **Tabla de Endpoints del MVP (Formato README):**
   - Una tabla Markdown con las columnas: Método, Endpoint, Payload (Input), Respuesta (Output) y Descripción.
   - Restringe los endpoints estrictamente a los indispensables para resolver el flujo de negocio del MVP. No agregues operaciones CRUD genéricas si el PRD no las requiere como indispensables.

2. **Detalle Técnico por Endpoint (OpenAPI Spec Blueprint):**
   - Para cada endpoint listado, detalla de forma clara:
     - Ruta, Método e intenciones de negocio.
     - Cabeceras obligatorias (ej. Authorization JWT).
     - Payload del Request: Bloque JSON de ejemplo tipado, consistente con las tablas físicas (ej. tipos Decimal representados estrictamente como strings decimales exactos en formato JSON y IDs correlativos).
     - Respuesta Exitosa (200 OK o 201 Created): Bloque JSON de ejemplo documentando la estructura de salida.
     - Respuestas de Error Comunes (401 Unauthorized para autenticación o 422 Unprocessable Entity para reglas de negocio rotas) con un formato JSON autodescriptivo y campos consistentes.

3. **Mapeo de Tipos y Restricciones:**
   - Asegura que ningún payload envíe o reciba datos inconsistentes con las invariantes del dominio.
   - Define una única serialización determinista para valores `Decimal`: represente todos los valores decimales como strings (cadenas de texto decimales, ej: `"150.00"`). Documente la precisión requerida (ej: precisión total de 10 dígitos), la escala (ej: 2 decimales para dinero, 4 decimales para cantidades físicas de inventario) y el patrón de validación (regex, ej: `^\d+(\.\d{1,4})?$`). Garantice que todos los payloads de request/response y contratos de endpoints utilicen de forma consistente esta representación.

Genera tu respuesta en formato Markdown limpio, redactando las explicaciones lógicas en español (Latinoamérica) y manteniendo las claves JSON, parámetros de URL, tipos de datos e interfaces en inglés profesional para integración directa con compiladores de TypeScript. Comienza directamente con la documentación técnica sin preámbulos.

Guarda el resultado en el archivo: [RUTA_DE_SALIDA_API]


---

## 📌 Directiva de Gobernanza Documental (Agnóstica):
- Guarda por defecto los contratos en `docs/04_persistence_and_api/10_api_specification.md` (o `[RUTA_DE_SALIDA_API]`).
- Serializar estrictamente todos los tipos `Decimal` como `string` numérico en los contratos JSON (ej: `"150.0000"`).
