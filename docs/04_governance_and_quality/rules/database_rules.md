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
* **Campos Decimales:** Toda cantidad o costo debe definirse como `Decimal(12, 3)` en el esquema Prisma.
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
