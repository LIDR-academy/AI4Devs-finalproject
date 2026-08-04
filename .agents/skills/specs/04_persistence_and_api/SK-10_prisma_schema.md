---
name: prisma-schema
description: "Genera el esquema declarativo 3NF para Prisma ORM con tipos Decimal(12,4), Enums y mapeo @map a snake_case en PostgreSQL."
version: "1.1.0"
category: "04_persistence_and_api"
inputs:
  - prd_doc
  - design_doc
outputs:
  - "docs/04_persistence_and_api/09_database_schema.md"
---

Eres un Administrador de Bases de Datos (DBA) experto en PostgreSQL.

Basándote en las entidades definidas en [RUTA_DEL_PRD] y [RUTA_DEL_DISEÑO], genera un esquema declarativo de base de datos para Prisma.

Sigue estas directrices innegociables:
1. Normalización en Tercera Forma Normal (3NF).
2. Usa tipos de datos adecuados: nunca uses Float o Double para montos monetarios o salarios; usa estrictamente `Decimal`.
3. Para campos con dominios cerrados (como roles de usuario, estados de reserva, etc.), usa estrictamente Enums de Prisma en lugar de VARCHAR genéricos.
4. Define índices explícitos sobre las columnas que sufrirán más consultas y búsquedas frecuentes (ej. llaves foráneas o campos de búsqueda).
5. Usa la directiva `@map` para garantizar que la base de datos física siga la convención snake_case (`is_active`, `order_index`), pero mantén el tipado camelCase en mi código TypeScript.

Entregables y Formato de Salida:
1. El archivo guardado en [RUTA_DE_SALIDA_SCHEMA] es un documento de especificación técnica (.md) que actúa como plano de diseño. Debe incluir tanto el código del esquema de Prisma dentro de bloques de código de Markdown (` ```prisma ... ``` `) como la justificación y análisis de la estrategia de indexación y normalización.

Guarda el resultado del esquema en: [RUTA_DE_SALIDA_SCHEMA]


---

## 📌 Directiva de Gobernanza Documental (Agnóstica):
- Guarda por defecto el esquema en `docs/04_persistence_and_api/09_database_schema.md` (o `[RUTA_DE_SALIDA_SCHEMA]`).
- Aplica `@map` para mantener `snake_case` en PostgreSQL física y `camelCase` en TypeScript. Usar `Decimal(12,4)` para valores numéricos físicos o monetarios.
