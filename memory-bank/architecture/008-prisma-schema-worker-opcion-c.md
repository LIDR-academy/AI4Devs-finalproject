# ADR 008: Worker apunta al schema Prisma del API (Opción C, stepping stone)

**Estado**: ✅ Aceptada  
**Fecha**: 2026-03-02  
**Decidido en**: Change `cu03-b1-worker-db-sync` — sincronización de schema y trazabilidad de estado de pedido  
**Implementado en**: `openspec/changes/cu03-b1-worker-db-sync` (30/30 tareas)  
**Reemplaza a**: — (solución temporal; será reemplazada por ADR-009 cuando se implemente `packages/prisma-db`)

---

## Contexto

El Worker (`apps/worker`) y el API (`apps/api`) son dos aplicaciones del monorepo que comparten la misma base de datos PostgreSQL. Cada una tenía su propio `prisma/schema.prisma`, con definiciones **divergentes** del enum `OrderStatus`:

- **API**: `PENDING_PAYMENT | PENDING_ADDRESS | READY_TO_PROCESS | COMPLETED | CANCELED`
- **Worker**: `PENDING_ADDRESS | ADDRESS_CONFIRMED | SYNCED | FAILED | CANCELLED` ← valores que no existen en la DB

El Worker funcionaba en runtime porque Prisma usa strings en runtime (no los tipos generados), pero el sistema de tipos TypeScript estaba silenciosamente roto: las garantías de compilación no reflejaban la realidad de la base de datos.

El problema se descubrió al añadir el campo `statusSource` (ADR implícito de esta sesión) que requería coordinar un solo schema de fuente de verdad.

---

## Decisión

El Worker **elimina su propio `schema.prisma`** y pasa a leer el schema del API directamente, declarando en `apps/worker/package.json`:

```json
"prisma": {
  "schema": "../api/prisma/schema.prisma"
}
```

`prisma generate` en el Worker ahora genera el cliente Prisma a partir del schema del API. Las migraciones siguen siendo responsabilidad exclusiva del API.

> Esta es la **Opción C** de las cuatro alternativas evaluadas. Es una solución temporal ("stepping stone") hasta que se implemente `packages/prisma-db` (Opción B), documentada en el ticket `infra-prisma-shared-schema`.

---

## Justificación

### Análisis de Alternativas

| Opción | Descripción | Pros | Contras | Veredicto |
|--------|-------------|------|---------|-----------|
| **A: Copia manual** | Copiar `schema.prisma` del API al Worker tras cada migración | • Sin nueva estructura | • Drift inevitable<br>• Mismo problema que motivó ADR-007<br>• Proceso manual = error humano | ❌ Descartada |
| **C: `prisma.schema` → API** (elegida) | 3 líneas en `package.json`, sin nuevo paquete | • Mínima fricción<br>• Resuelve el drift inmediatamente<br>• Zero config adicional<br>• Desplegable en minutos | • Dependencia cross-app implícita (no en `package.json` como dep formal)<br>• Turborepo no gestiona esta dependencia automáticamente | ✅ Seleccionada (temporal) |
| **B: `packages/prisma-db`** | Nuevo workspace package con `schema.prisma` como fuente neutral | • Fuente de verdad explícita<br>• Turborepo puede gestionar el grafo<br>• Escalable a más workers | • Requiere refactorizar ambas apps<br>• Añade un paquete al monorepo<br>• Más fricción inicial | ⏳ Pendiente — ticket `infra-prisma-shared-schema` |
| **D: Cliente Prisma compartido** | Generar y exportar `@prisma/client` desde un package | • Un solo `generate` | • Problemático con connection pools en contenedores independientes<br>• Over-engineering para MVP | ❌ Descartada |

### Razones Principales

1. **Urgencia vs. corrección**: El drift de schema era un bug silencioso que necesitaba corrección inmediata antes de añadir `statusSource`. La Opción C resuelve el problema en minutos.
2. **Coherencia con ADR-007**: Del mismo modo que `packages/shared-types` centraliza los tipos de contratos de cola, la Opción B centralizaría el schema. La Opción C es un puente coherente hacia ese modelo.
3. **Riesgo bajo en MVP**: Con un único desarrollador y deploys coordinados, la dependencia cross-app implícita es manejable. El riesgo aumentaría si hubiera múltiples equipos o despliegues independientes.

---

## Consecuencias

### ✅ Positivas

- **Sin drift de schema**: `OrderStatus`, `StatusSource` y todos los enums/modelos tienen una única definición para ambas apps.
- **TypeScript correcto**: `npx tsc --noEmit` en el Worker ahora valida contra los tipos reales de la DB.
- **Migraciones en un solo lugar**: El API mantiene la responsabilidad exclusiva de `prisma migrate`. El Worker solo ejecuta `prisma generate`.
- **Cambio mínimo**: 3 líneas de configuración + eliminar un archivo.

### ❌ Negativas (Trade-offs)

- **Dependencia implícita**: El Worker depende de `apps/api/prisma/schema.prisma` sin declararlo como dependencia formal en `package.json`. Si el API mueve o renombra su schema, el Worker fallará en `prisma generate` con un error opaco.
  - *Mitigación*: Documentado en el ticket `infra-prisma-shared-schema`. Para el MVP (repo único, un desarrollador, deploys coordinados) el riesgo es bajo.
- **Turborepo no gestiona la dependencia**: El grafo de tareas de Turborepo no puede optimizar automáticamente el build del Worker tras cambios en el schema del API.
  - *Mitigación*: Ejecutar `prisma generate` manualmente en ambas apps tras cualquier migración.

### 🔧 Deuda Técnica Introducida

- La dependencia implícita del Worker sobre `apps/api/prisma/schema.prisma` queda documentada como deuda técnica a resolver con el ticket `infra-prisma-shared-schema` (Opción B: `packages/prisma-db`).

---

## Implementación

### Cambios Aplicados

```
apps/worker/
├── package.json                    # + "prisma": { "schema": "../api/prisma/schema.prisma" }
└── prisma/
    └── schema.prisma               # ELIMINADO — ya no es la fuente de verdad
```

### Flujo tras una Migración (workflow actualizado)

```bash
# 1. Modificar schema en apps/api/prisma/schema.prisma
# 2. Aplicar migración
cd apps/api && npx prisma db push        # o migrate dev

# 3. Regenerar cliente en el API
npx prisma generate

# 4. Regenerar cliente en el Worker (lee el schema del API automáticamente)
cd ../worker && npx prisma generate

# 5. Verificar TypeScript en ambas apps
cd ../api && npx tsc --noEmit
cd ../worker && npx tsc --noEmit
```

### Añadir un Nuevo App/Worker al Monorepo

Hasta que se implemente la Opción B, cualquier nueva app que necesite acceder a la DB debe añadir en su `package.json`:

```json
"prisma": {
  "schema": "../api/prisma/schema.prisma"
}
```

Y no debe tener su propio `prisma/schema.prisma`.

---

## Métricas de Éxito

- 📊 **`npx tsc --noEmit` en Worker**: 0 errores de tipo relacionados con `OrderStatus` o `StatusSource`
- 📊 **Un único `schema.prisma`** en el repo (en `apps/api/prisma/`) como fuente de verdad
- 📊 **Sin drift**: Cualquier valor de enum nuevo en el API es inmediatamente visible en el Worker tras `prisma generate`

---

## Referencias

- **Change**: `openspec/changes/cu03-b1-worker-db-sync/design.md` — Decisión 1
- **Sesión**: `memory-bank/sessions/2026-03-02-cu03-b1-worker-db-sync.md`
- **Ticket pendiente**: `openspec/changes/infra-prisma-shared-schema/infra-prisma-shared-schema.md` — Opción B
- **ADRs relacionados**: [ADR-007](./007-shared-types-package.md) — `packages/shared-types` (patrón análogo para tipos de cola)

---

**Creado por**: Sergio  
**Última actualización**: 2026-03-02  
**Próxima revisión**: Al implementar `infra-prisma-shared-schema` (Opción B → `packages/prisma-db`)
