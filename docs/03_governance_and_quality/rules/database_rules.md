# 🗄️ Reglas de Base de Datos y Persistencia - Deducción de Especificaciones

Esta directiva rige las convenciones físicas y modelos ORM en PostgreSQL y Prisma.

---

## 🛠️ Pila Tecnológica Detectada
* **Motor Relacional:** PostgreSQL 15+ (3NF Schema)
* **ORM:** Prisma ORM
* **Tipos de Datos Físicos:** `Decimal(12, 4)` & Enums Nativos
* **Mapeo:** `snake_case` físico $\leftrightarrow$ `PascalCase` en Prisma (`@@map`)

---

## 🔤 1. Nomenclatura y Convenciones Fisicas
* **Tablas y Columnas en `snake_case`:** Todos los nombres de tablas y columnas físicas en la BD deben utilizar `snake_case` (ej. `shift_reconciliations`, `unit_cost`).
* **Modelos Prisma en `PascalCase`:** Los modelos en `schema.prisma` usan `PascalCase` mapeados a las tablas con `@@map("table_name")`.

---

## 📐 2. Precisión y Restricciones
* **Campos Decimales:** Toda cantidad o costo debe definirse como `Decimal(12, 4)` en el esquema Prisma.
* **Integridad y Claves:** Todas las relaciones deben exigir claves foráneas con restricciones explícitas de integridad referencial.
* **Consultas FEFO:** Creación obligatoria de índices compuestos sobre `(status, calculated_expiration_date)` para optimizar el ordenamiento de remanentes por vencimiento FEFO.
