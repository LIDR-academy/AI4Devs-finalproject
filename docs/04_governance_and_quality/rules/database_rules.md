# 🗄️ Reglas de Base de Datos y Persistencia - Deducción de Especificaciones

Esta directiva rige las convenciones físicas y modelos ORM en PostgreSQL y Prisma.

---

## 🛠️ Pila Tecnológica Detectada
* **Motor Relacional:** PostgreSQL 15+ (3NF Schema)
* **ORM:** Prisma ORM
* **Tipos de Datos Físicos:** `Decimal(12, 3)` & Enums Nativos
* **Mapeo:** `snake_case` físico $\leftrightarrow$ `PascalCase` en Prisma (`@@map`)

---

## 🔤 1. Nomenclatura y Convenciones Fisicas
* **Tablas y Columnas en `snake_case`:** Todos los nombres de tablas y columnas físicas en la BD deben utilizar `snake_case` (ej. `shift_reconciliations`, `unit_cost`).
* **Modelos Prisma en `PascalCase`:** Los modelos en `schema.prisma` usan `PascalCase` mapeados a las tablas con `@@map("table_name")`.

---

## 📐 2. Precisión y Restricciones
* **Campos Decimales:** Toda cantidad física (stock, consumo, merma) debe definirse como `Decimal(12, 3)` o `Decimal(12, 4)` en el esquema Prisma, según el precedente ya usado por el campo análogo más cercano. **Excepción — montos monetarios (Discovered in `TK-078`):** un costo o precio en moneda (ej. `Insumo.unitCost`) se define como `Decimal(12, 2)` — 2 decimales, no 3 — reflejando la precisión estándar de céntimos/centavos, nunca la escala de las cantidades físicas. La validación Zod en el controlador HTTP debe coincidir exactamente con la escala elegida (ver `backend_rules.md §3`).
* **Integridad y Claves:** Todas las relaciones deben exigir claves foráneas con restricciones explícitas de integridad referencial.
* **Consultas FEFO:** Creación obligatoria de índices compuestos sobre `(status, calculated_expiration_date)` para optimizar el ordenamiento de remanentes por vencimiento FEFO.

---

## 🌱 3. Gobernanza y Manejo Profesional de Semillas (5 Pilares del Seeding)

Toda estrategia de datos semilla (*seeding*) creada en el proyecto DEBE cumplir estrictamente con los siguientes 5 pilares agnósticos de ingeniería:

1. **Separación Estricta de Entornos (Environments Separation):**
   - **Essential Seeds (Estructurales):** Datos maestros necesarios para el funcionamiento del sistema en cualquier entorno (ej. catálogo de unidades, roles, permisos). Ejecutables en producción y desarrollo.
   - **Synthetic Fixtures Seeds (Simulaciones):** Datos de prueba para desarrollo local, staging o demos (ej. insumos simulados, mermas falsas). **Nunca deben ejecutarse en entornos de producción**.

2. **Idempotencia Obligatoria (Idempotent Execution):**
   - El script o función de sembrado DEBE ser $100\%$ idempotente. Ejecutar el sembrado $N$ veces debe producir el mismo estado en la base de datos sin lanzar errores de clave duplicada (`upsert`, `ON CONFLICT DO UPDATE`, o verificación de existencia previa).

3. **Desacoplamiento del Servidor de Producción (CLI Dedicated Runner):**
   - Prohibido incluir semillas pesadas de prueba dentro del arranque del servidor de producción (`app.ts`). El sembrado debe ejecutarse a través de comandos CLI desacoplados:
     - `prisma/seed.ts` (vía `PrismaClient` con `upsert`) para la base física PostgreSQL.
     - `src/infrastructure/seeds/seed.ts` (vía Repositorios) para entornos en memoria efímeros.

4. **Aislamiento en Pruebas Automatizadas (Test Factories):**
   - Los tests unitarios e integración TDD NO deben depender de semillas globales mutadas. Cada test debe generar sus propios datos limpios e independientes usando el patrón *Test Factory* (`beforeEach`).

5. **Gobernanza PII y Sanitización Sintética (EU AI Act & GDPR):**
   - Las semillas de desarrollo DEBEN utilizar datos sintéticos anónimos. Queda strictly prohibido usar nombres, correos o teléfonos de clientes reales. Toda credencial o PIN de prueba debe soportar sobreescritura por variables de entorno (`SEED_ADMIN_PIN`, `SEED_KITCHEN_PIN`) y almacenarse mediante hash seguro (Argon2id / bcrypt / Salted Hash).

---

## 🔄 4. Gobernanza de Cero Desviación de Esquema (Zero Schema Drift)
* **Sincronización Obligatoria DDL $\leftrightarrow$ Spec:** Toda creación, modificación o eliminación de un modelo, columna o enum en la capa de persistencia (`schema.prisma`) DEBE actualizar simultáneamente la especificación técnica en `docs/03_persistence_and_api/06_database_schema.md` §4.
* **Verificación Automatizada:** Antes de marcar como completado cualquier ticket que altere la base de datos, el agente debe ejecutar obligatoriamente `bash docs/04_governance_and_quality/scripts/check_schema_drift.sh` para certificar cero desviaciones no documentadas.

