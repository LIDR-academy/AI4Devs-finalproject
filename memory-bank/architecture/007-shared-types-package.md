# ADR 007: Paquete `packages/shared-types` como Fuente Única de Tipos Compartidos

**Estado**: ✅ Aceptada  
**Fecha**: 2026-02-28  
**Decidido en**: Change `cu03-a3-mock-dto-extension` — extensión del DTO de mock con campos eCommerce  
**Implementado en**: `openspec/changes/cu03-a3-mock-dto-extension` (29/29 tareas)  
**Reemplaza a**: —

---

## Contexto

Al extender el DTO mock con campos de contexto eCommerce (`buyer_registered_ecommerce`, `buyer_ecommerce_address`, `gift_recipient`), fue necesario propagar estos datos del **API** al **Worker** a través de la cola BullMQ. Esto requería que `ProcessConversationJobData` (la interfaz del payload de la cola) incluyera el nuevo tipo `MockOrderContext`.

El problema es que `ProcessConversationJobData` estaba **duplicada** en dos lugares:
- `apps/api/src/queue/queue.service.ts`
- `apps/worker/src/processors/conversation.processor.ts`

Ambas copias tenían que mantenerse en sincronía manualmente, lo que es una fuente directa de bugs silenciosos en sistemas distribuidos.

---

## Decisión

Crear un paquete privado de workspace `packages/shared-types` (`@adresles/shared-types`) que centraliza todas las interfaces TypeScript compartidas entre `api` y `worker`, en particular las relativas al contrato de mensajes de la cola BullMQ.

---

## Justificación

### Análisis de Alternativas

| Opción | Pros | Contras | Veredicto |
|--------|------|---------|-----------|
| **A: `packages/shared-types`** (elegida) | • Single source of truth<br>• TypeScript end-to-end<br>• `workspace:*` en pnpm sin publish<br>• Escalable a más interfaces compartidas | • Requiere `pnpm install` y `build` antes de consumidores<br>• Una dependencia más en cada app | ✅ Seleccionada |
| **B: Duplicar con comentario `// keep in sync`** | • Cero setup<br>• Sin dependencias nuevas | • Drift inevitable entre copias<br>• Sin garantía en tiempo de compilación<br>• Mala práctica en monorepos | ❌ Descartada |
| **C: Generar desde OpenAPI/Prisma** | • Automatizado<br>• Integrado con el contrato del API | • Complejidad elevada<br>• Over-engineering para el alcance actual<br>• Requiere toolchain de codegen | ❌ Descartada |

### Razones Principales

1. **Garantía en compilación**: TypeScript detecta inmediatamente cuando `api` o `worker` usan una interfaz desactualizada.
2. **Escalabilidad**: El paquete actuará como repositorio natural de contratos entre servicios (mensajes de cola, tipos de eventos, enums compartidos) conforme crezca el proyecto.
3. **Convención de monorepo**: `pnpm workspace:*` es la forma canónica de compartir código privado entre apps en un monorepo sin necesidad de publish.

---

## Consecuencias

### ✅ Positivas

- **Sin drift de tipos**: `ProcessConversationJobData`, `ProcessResponseJobData` y `MockOrderContext` tienen una única definición.
- **Mejor DX**: Autocompletado y errores de tipo en ambas apps cuando el contrato cambia.
- **Patrón escalable**: Añadir nuevos tipos compartidos no requiere decisión nueva — van a `packages/shared-types/src/index.ts`. El mismo patrón se extendió a `packages/prisma-db` ([ADR-009](./009-prisma-db-package.md)) para el schema Prisma compartido.

### ❌ Negativas (Trade-offs)

- **Race condition en `dev`**: Si `shared-types` no está compilado antes de arrancar `api` o `worker`, el import falla. Mitigación: `turbo.json` actualizado con `"dev": { "dependsOn": ["^build"] }`, que asegura el build del paquete antes de los `dev` watchers.
- **Build obligatorio en CI/CD**: Cualquier pipeline deberá compilar `shared-types` primero. Mitigación: Turborepo resuelve el orden automáticamente gracias al grafo de dependencias.

### 🔧 Deuda Técnica Introducida

- `packages/shared-types` no tiene tests propios — las interfaces son tipos puros sin lógica, por lo que se validan indirectamente a través de los tests de `api` y `worker`.

---

## Implementación

### Estructura del Paquete

```
packages/shared-types/
├── package.json          # name: @adresles/shared-types, private: true
├── tsconfig.json         # target ES2021, outDir ./dist, declaration: true
└── src/
    └── index.ts          # Exports: MockOrderContext, ProcessConversationJobData, ProcessResponseJobData
```

### Tipos Exportados

```typescript
// packages/shared-types/src/index.ts

export interface MockOrderContext {
  buyerRegisteredEcommerce?: boolean;
  buyerEcommerceAddress?: {
    full_address: string;
    street: string;
    number?: string;
    block?: string;
    staircase?: string;
    floor?: string;
    door?: string;
    additional_info?: string;
    postal_code: string;
    city: string;
    province?: string;
    country: string;
  } | null;
  giftRecipient?: {
    first_name: string;
    last_name: string;
    phone: string;
  } | null;
}

export interface ProcessConversationJobData {
  conversationId: string;
  orderId: string;
  userId: string;
  conversationType: string;
  context?: MockOrderContext;
}

export interface ProcessResponseJobData {
  conversationId: string;
  orderId: string;
  userId: string;
  userMessage: string;
}
```

### Cambios en `turbo.json` para evitar race condition

```json
"dev": {
  "cache": false,
  "persistent": true,
  "dependsOn": ["^build"]
}
```

### Pasos de Incorporación de un Nuevo Tipo Compartido

1. Añadir la interfaz/tipo en `packages/shared-types/src/index.ts`
2. Ejecutar `pnpm build` en `packages/shared-types` (o `turbo build --filter=@adresles/shared-types`)
3. Importar desde `@adresles/shared-types` en `api` y/o `worker`
4. Verificar que ambas apps compilan: `turbo build --filter=api --filter=worker`

---

## Métricas de Éxito

- 📊 **Cero errores TS4023/TS2304** relacionados con tipos de cola tras el cambio
- 📊 **121/121 tests API pasando** con la nueva dependencia resolviendo correctamente
- 📊 **Un único lugar** donde editar cuando cambia el contrato de mensajes BullMQ

---

## Referencias

- **Change**: `openspec/changes/cu03-a3-mock-dto-extension/design.md` — Decisión #2
- **Sesión**: `memory-bank/sessions/2026-02-28-cu03-a3-mock-dto-extension.md`
- **ADRs relacionados**: [ADR-005](./005-bullmq-worker-conversations.md) — BullMQ + Worker Dedicado
- **Documentación pnpm workspaces**: https://pnpm.io/workspaces

---

**Creado por**: Sergio  
**Última actualización**: 2026-02-28  
**Próxima revisión**: Cuando se añadan nuevos tipos de jobs a la cola BullMQ
