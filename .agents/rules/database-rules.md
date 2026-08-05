# 🗄️ Reglas de Base de Datos y Persistencia (Database & Prisma Rules)

Esta regla define los estándares obligatorios de diseño, nomenclatura, tipos de datos e integridad referencial en la base de datos PostgreSQL mediante Prisma ORM para RestoStock.

---

## 🏷️ 1. Convenciones de Nomenclatura (snake_case Físico)
Para asegurar la compatibilidad e interoperabilidad de PostgreSQL, el modelo físico debe estar completamente en minúsculas y usar separación por guion bajo:

*   **Modelos/Tablas (Plural):** Todo modelo de Prisma debe definir un mapeo físico en minúsculas y plural mediante `@@map`:
    ```prisma
    model ActiveRemanent {
      // ...
      @@map("active_remanents")
    }
    ```
*   **Campos/Columnas (Singular):** Todo campo que contenga más de una palabra debe usar camelCase en el código TypeScript y mapearse a snake_case en la base de datos usando `@map`:
    ```prisma
    originalExpirationDate DateTime @map("original_expiration_date")
    ```
*   **Enums:** Los nombres de enums lógicos deben estar en PascalCase (ej: `LocationType`), pero sus valores deben estar en UPPERCASE (ej: `MAIN_WAREHOUSE`).

---

## 🔢 2. Aritmética de Cocina y Tipos de Datos
Dado que la aplicación procesa recetas, porciones y mediciones físicas fraccionadas:

*   **Precisión Decimal Obligatoria:** Queda estrictamente prohibido utilizar el tipo `Float` de Prisma para representar stocks, porciones, cantidades o costos. Se debe usar obligatoriamente el tipo `Decimal` mapeado a la base de datos con precisión exacta:
    ```prisma
    quantity Decimal @db.Decimal(12, 4)
    ```
*   **Claves Primarias y Foráneas:** Todos los identificadores (`id`) y claves de relación deben ser de tipo UUID v4 mapeados nativamente a PostgreSQL:
    ```prisma
    id String @id @default(uuid()) @db.Uuid
    ```
*   **Strings Acotados:** Evitar declarar campos `String` genéricos sin límite de tamaño. Utilizar el límite físico adecuado mediante `@db.VarChar(N)` para optimizar el almacenamiento (ej: `@db.VarChar(100)` para nombres, `@db.VarChar(255)` para emails o hashes).

---

## 🛡️ 3. Integridad Referencial e Historial Operativo
Para evitar la eliminación accidental de registros y la aparición de "datos huérfanos":

*   **Historial Inalterable (onDelete: Restrict):** Tablas de logs, auditorías, transacciones de stock o conciliaciones de turno **nunca** deben permitir borrado en cascada sobre entidades maestras. Deben declarar `onDelete: Restrict`:
    ```prisma
    user User @relation(fields: [userId], references: [id], onDelete: Restrict)
    ```
*   **Composición de Datos (onDelete: Cascade):** Las tablas secundarias que pertenezcan de forma indisoluble a un modelo padre (ej. ingredientes de una receta, ítems de una conciliación de turno específica) deben eliminarse automáticamente en cascada al modificarse o eliminarse el padre:
    ```prisma
    recipe Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
    ```
*   **Historial Desvinculable (onDelete: SetNull):** Si un registro de movimiento histórico debe perdurar aunque el recurso principal (ej: el remanente activo de origen) sea eliminado, la clave foránea debe ser opcional y usar `onDelete: SetNull`:
    ```prisma
    remanente Remanente? @relation(fields: [remanenteId], references: [id], onDelete: SetNull)
    ```

---

## ⚡ 4. Rendimiento e Índices
*   **Índices en Claves Foráneas:** Todo campo que sea utilizado como clave foránea en una relación debe estar indexado explícitamente mediante `@@index([campoId])` a menos que sea parte de un índice único.
*   **Índices de Búsqueda Frecuente:** Declarar índices en columnas utilizadas en ordenamientos o filtros recurrentes (ej: estados y fechas de expiración):
    ```prisma
    @@index([status, calculatedExpirationDate])
    ```
*   **Restricciones de Unicidad:** Para llaves compuestas o lógicas de duplicidad, declarar `@@unique` en lugar de controlarlas por código de aplicación.

---

## 🔄 5. Ciclo de Vida de Migraciones
*   **Migraciones Declarativas:** Está prohibido crear o alterar tablas directamente en la base de datos usando SQL crudo. Todas las modificaciones deben realizarse editando `schema.prisma` y generando la migración correspondiente con `prisma migrate dev`.
*   **Datos Iniciales (Seeds):** Cualquier inserción de datos iniciales necesarios para el arranque de la aplicación (roles, insumos base de prueba) debe definirse de manera limpia en `prisma/seed.ts` y ejecutarse de forma idempotente.
