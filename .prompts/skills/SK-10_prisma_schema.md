Eres un Administrador de Bases de Datos (DBA) experto en PostgreSQL.

Basándote en las entidades definidas en [RUTA_DEL_PRD] y [RUTA_DEL_DISEÑO], genera un esquema declarativo de base de datos para Prisma (`schema.prisma`).

Sigue estas directrices innegociables:
1. Normalización en Tercera Forma Normal (3NF).
2. Usa tipos de datos adecuados: nunca uses Float o Double para montos monetarios o salarios; usa estrictamente `Decimal`.
3. Para campos con dominios cerrados (como roles de usuario, estados de reserva, etc.), usa estrictamente Enums de Prisma en lugar de VARCHAR genéricos.
4. Define índices explícitos sobre las columnas que sufrirán más consultas y búsquedas frecuentes (ej. llaves foráneas o campos de búsqueda semántica), y justifica por qué elegiste indexar esos campos.
5. Usa la directiva `@map` para garantizar que la base de datos física siga la convención snake_case (`is_active`, `order_index`), pero mantén el tipado camelCase en mi código TypeScript.

Guarda el resultado en el archivo: [RUTA_DE_SALIDA_SCHEMA]
