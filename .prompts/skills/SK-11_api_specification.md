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
     - Payload del Request: Bloque JSON de ejemplo tipado, consistente con las tablas físicas (ej. tipos Decimal representados como números/strings exactos y IDs correlativos).
     - Respuesta Exitosa (200 OK o 201 Created): Bloque JSON de ejemplo documentando la estructura de salida.
     - Respuestas de Error Comunes (401 Unauthorized para autenticación o 422 Unprocessable Entity para reglas de negocio rotas) con un formato JSON autodescriptivo y campos consistentes.

3. **Mapeo de Tipos y Restricciones:**
   - Asegura que ningún payload envíe o reciba datos inconsistentes con las invariantes del dominio (ej. si el modelo de base de datos prohíbe el uso de Float para pesos, los endpoints deben manejar cantidades exactas con representación de alta precisión).

Genera tu respuesta en formato Markdown limpio, redactando las explicaciones lógicas en español (Latinoamérica) y manteniendo las claves JSON, parámetros de URL, tipos de datos e interfaces en inglés profesional para integración directa con compiladores de TypeScript. Comienza directamente con la documentación técnica sin preámbulos.

Guarda el resultado en el archivo: [RUTA_DE_SALIDA_API]
