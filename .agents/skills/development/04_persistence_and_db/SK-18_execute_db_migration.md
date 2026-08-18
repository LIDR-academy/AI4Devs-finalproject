---
name: SK-18_execute_db_migration
description: "Guía el proceso de modificación de esquemas de datos, ejecución de migraciones y actualización del cliente de persistencia de forma segura y agnóstica."
version: "2.1.0"
category: "development/04_persistence_and_db"
inputs:
  - schema_changes: "Descripción de los cambios requeridos en el esquema de base de datos"
outputs:
  - "Esquema físico de base de datos actualizado"
  - "Migración generada y aplicada con éxito en el entorno local"
  - "Cliente del ORM o tipos de datos regenerados"
---

Actúa como un Database Administrator (DBA) y DevOps Engineer. Tu objetivo es aplicar los cambios solicitados en `schema_changes` sobre la base de datos del proyecto de forma segura, respetando estrictamente las **Reglas de Persistencia** y el modelo relacional en 3NF.

Sigue estrictamente este flujo de trabajo secuencial:

---

## 🔍 FASE 1: Descubrimiento de Reglas y ORM
1. **Descubrir Reglas de Base de Datos:** Lee `docs/04_governance_and_quality/rules/database_rules.md`. Identifica:
   - Convenciones físicas: Tablas y columnas en `snake_case`.
   - Modelos Prisma en `PascalCase` con `@map()` y `@@map()`.
   - Tipos de datos decimales obligatorios `Decimal(12, 4)` para cantidades o costos.
   - Restricciones de integridad referencial explicitas (`ON DELETE RESTRICT` o `CASCADE`).
2. **Identificar ORM y Variables:** Verifica `prisma/schema.prisma` y las variables de conexión en `.env`.

---

## 🛠️ FASE 2: Modificación del Esquema Lógico/Físico
1. **Editar el Fichero del Esquema:** Modifica `apps/backend/prisma/schema.prisma` integrando los campos o tablas requeridos en `schema_changes`.
2. **Validar Convenciones:** Asegúrate de usar `Decimal(12, 4)`, UUIDs v4 como PK e índices compuestos para consultas FEFO (`status, calculated_expiration_date`).

---

## 🚀 FASE 3: Generación y Ejecución de la Migración
1. **Generar la Migración:** Ejecuta el comando de migración ORM del proyecto (ej. `npx prisma migrate dev --name <migration_name>` o equivalente).
2. **Regenerar el Cliente ORM:** Corre la actualización del cliente ORM del proyecto para sincronizar tipos.

---

## 🧪 FASE 4: Verificación y Datos de Prueba (Seeding)
1. **Validar Estado de la DB:** Verifica la sincronización del esquema local.
2. **Ejecutar Seed Idempotente (SK-28):** Ejecuta la semilla declarativa siguiendo los 5 pilares de `SK-28_manage_database_seeding.md`.
3. **Reporte al Humano:** Detallar las migraciones generadas y el estado de la base de datos estructurados estrictamente según la plantilla universal en `.agents/rules/00_output_reporting_standard.md`.
