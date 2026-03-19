## Context

El Worker (`apps/worker`) y el API (`apps/api`) son dos aplicaciones del monorepo que comparten la misma base de datos PostgreSQL (Supabase). Cada una tiene su propio `prisma/schema.prisma`, lo que significa que si no se sincronizan manualmente, pueden tener tipos distintos para el mismo modelo.

**Situación actual:**
- `apps/api/prisma/schema.prisma` define `OrderStatus` con los valores reales de la DB: `PENDING_PAYMENT`, `PENDING_ADDRESS`, `READY_TO_PROCESS`, `COMPLETED`, `CANCELED`.
- `apps/worker/prisma/schema.prisma` define valores distintos para el mismo enum (`ADDRESS_CONFIRMED`, `SYNCED`, `FAILED`...) que no existen en la DB. El Worker corre correctamente porque TypeScript en runtime usa strings, no los tipos generados, pero el sistema de tipos está roto.
- `finalizeAddress()` ya setea `Order.status = 'READY_TO_PROCESS'` correctamente, pero no setea `syncedAt` ni indica el origen del cambio.
- No existe ningún mecanismo para saber si un cambio de estado en un pedido fue iniciado por Adresles o por la tienda online (relevante para auditoría futura y para el panel de administración).

## Goals / Non-Goals

**Goals:**
- Añadir campo `statusSource` al modelo `Order` para registrar el origen de cada cambio de estado.
- Asegurar que `syncedAt` se setea en todo cambio de estado del pedido (en creación y en `finalizeAddress`).
- Sincronizar el schema del Worker con el del API (fuente única de verdad).
- Corregir el flujo TRADITIONAL: eliminar la actualización incorrecta a `COMPLETED` tras la simulación de sync.
- Mejorar el mensaje de confirmación del Worker para incluir el nombre de la tienda.

**Non-Goals:**
- Integración real con eCommerce (WooCommerce, Shopify, etc.) — fuera del alcance del MVP mock.
- Implementar el estado `COMPLETED` para pedidos — reservado para cuando exista integración real.
- Cambios en el frontend `apps/web-admin`.
- Historial de cambios de estado (audit log completo) — `statusSource` cubre el MVP; un log completo requeriría una tabla `order_status_history`.

## Decisions

### Decisión 1 — Schema del Worker: `prisma.schema` apunta al schema del API (Opción C, temporal)

En lugar de mantener un `schema.prisma` propio en el Worker, se configura `apps/worker/package.json` para que Prisma lea el schema del API directamente:

```json
// apps/worker/package.json
"prisma": {
  "schema": "../api/prisma/schema.prisma"
}
```

El Worker elimina su propio `apps/worker/prisma/schema.prisma` y genera su cliente Prisma ejecutando `prisma generate` desde su directorio, leyendo el schema del API. Las migraciones siguen siendo responsabilidad exclusiva del API.

**Alternativas consideradas:**

| Opción | Descripción | Veredicto |
|--------|-------------|-----------|
| **A: Copia manual** | Reemplazar `apps/worker/prisma/schema.prisma` tras cada migración | ❌ Propenso a drift; mismo problema que motivó ADR-007 |
| **C: `prisma.schema` → API** (elegida) | Config en `package.json`, sin nuevo paquete | ✅ Mínima fricción, resuelve el drift para el MVP |
| **B: `packages/prisma-db`** | Nuevo workspace package con `schema.prisma` como fuente neutral | ⏳ Mejor a largo plazo — pendiente ticket `infra-prisma-shared-schema` |
| **D: Cliente Prisma compartido** | Generar y exportar `@prisma/client` desde un package | ❌ Over-engineering; problemático con pools de conexión en contenedores independientes |

**Decisión**: Opción C para este change. Es un **stepping stone** hacia la Opción B: resuelve el problema de drift inmediatamente con el mínimo cambio posible, y deja abierta la refactorización hacia `packages/prisma-db` en un ticket posterior (`infra-prisma-shared-schema`) cuando se justifique añadir ese paquete al monorepo.

> **Trade-off aceptado**: En la Opción C, el Worker tiene una dependencia implícita (no declarada en `package.json`) sobre el archivo `apps/api/prisma/schema.prisma`. Turborepo no puede gestionar esta dependencia automáticamente. Esto es aceptable para el MVP dado que ambas apps siempre están en el mismo repo y se despliegan coordinadamente.

### Decisión 2 — `statusSource` como campo nullable en `Order`

`statusSource StatusSource?` es nullable. Los registros existentes en la DB tendrán `NULL` hasta que se actualice su estado por primera vez.

**Alternativas consideradas:**
- *Valor por defecto en la migración (ej. `ADRESLES`)*: Podría ser incorrecto para pedidos TRADITIONAL ya existentes.
- *Script de backfill*: Añade complejidad a la migración. Los datos históricos sin `statusSource` son aceptables para el MVP — el campo tiene valor auditor solo en datos nuevos.

**Decisión**: Nullable, sin backfill. El campo se pobla desde el momento del despliegue.

### Decisión 3 — Valores del enum `StatusSource`: `ADRESLES` | `STORE`

Dos valores claros para el MVP. `ADRESLES` cuando el sistema Adresles cambia el estado (tras conversación); `STORE` cuando la tienda online lo cambia (creación tradicional, o futura integración real).

**Alternativas consideradas:**
- *String libre*: Más flexible pero pierde type-safety.
- *Más valores (ej. `MANUAL`, `SYSTEM`)*: Innecesario para el MVP.

### Decisión 4 — `syncedAt` como timestamp del último cambio de estado

`syncedAt` se setea en cada transición de estado relevante del pedido (creación TRADITIONAL, confirmación ADRESLES). Permite saber cuándo fue el último sync/cambio de estado, combinado con `statusSource` para saber quién lo causó.

**Nota**: `addressConfirmedAt` sigue siendo el timestamp específico de cuando el usuario confirmó la dirección. `syncedAt` es el timestamp de cuando el sistema procesó ese cambio. En la práctica, para el MVP, ambos se setean simultáneamente en `finalizeAddress`.

## Risks / Trade-offs

- **[Riesgo] Dependencia cross-app implícita (Opción C)** → El Worker depende de `apps/api/prisma/schema.prisma` sin declararlo en `package.json`. Si el API mueve o renombra su schema, el Worker fallará en `prisma generate`. Mitigación: el ticket `infra-prisma-shared-schema` elimina esta dependencia implícita migrando a `packages/prisma-db`. Para el MVP (un único desarrollador, deploys coordinados) el riesgo es bajo.

- **[Riesgo] Tests de `mock-orders.service.spec.ts` rotos** → La eliminación de `updateStatus('COMPLETED')` romperá el test que espera ese comportamiento. Mitigación: actualizar los tests como parte del bloque 3 del DoD.

- **[Trade-off] `statusSource` nullable vs. backfill** → Registros históricos tendrán `NULL`. El panel de admin deberá tratar `NULL` como "origen desconocido" al mostrar el campo. Aceptable para MVP.

- **[Trade-off] No hay transacción Prisma en `finalizeAddress()`** → Si `prisma.order.update` falla, `prisma.conversation.update` no se ejecuta y quedan inconsistentes. Mitigado por reintentos BullMQ (ADR-005). Pendiente para hardening pre-producción.

## Migration Plan

**Orden de despliegue:**

1. Añadir `"prisma": { "schema": "../api/prisma/schema.prisma" }` en `apps/worker/package.json`
2. Eliminar `apps/worker/prisma/schema.prisma` (ya no es la fuente de verdad)
3. Ejecutar migración en la DB de desarrollo: `npx prisma migrate dev --name add-order-status-source` (en `apps/api/`)
4. Regenerar cliente Prisma en `apps/api/`: `npx prisma generate`
5. Regenerar cliente Prisma en `apps/worker/`: `npx prisma generate` (lee el schema del API automáticamente)
6. Desplegar `apps/api/` primero (incluye la migración en el startup, o ejecutar `migrate deploy` manualmente)
7. Desplegar `apps/worker/` después

**Rollback:**
La columna `status_source` es nullable. Si se necesita revertir:
```sql
ALTER TABLE orders DROP COLUMN status_source;
```
Y revertir el enum `StatusSource` si ya fue creado.
Prisma migrate genera el rollback automáticamente con `prisma migrate reset` en dev.
