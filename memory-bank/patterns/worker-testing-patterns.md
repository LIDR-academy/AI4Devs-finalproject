# Patrones de Testing — Worker (BullMQ)

> **Última actualización**: 2026-03-02  
> **Origen**: CU03-B3 Worker Registration + fix "open handles"; CU03-B4 libreta (interpretUserIntent mock, mockClear)

---

## Patrón: Mock de Prisma/Redis/DynamoDB para evitar open handles

### Problema

Al importar `conversation.processor` (u otros módulos del Worker que cargan infraestructura), se instancian:

- **PrismaClient** — conexión a PostgreSQL
- **redis-publisher** — instancia `ioredis` a Redis
- **dynamodb.service** — cliente AWS SDK

Jest ejecuta los tests en workers que mantienen el proceso activo. Si esos módulos crean conexiones reales, al finalizar los tests las conexiones siguen abiertas y el proceso no puede cerrarse limpiamente. Jest fuerza la salida y muestra:

```
A worker process has failed to exit gracefully and has been force exited.
This is likely caused by tests leaking due to improper teardown.
```

### Solución: Mockear módulos de infraestructura antes del import

En el spec del processor (o de cualquier módulo que cargue Prisma/Redis/DynamoDB), declarar `jest.mock()` **al inicio del archivo** para que Jest los aplique antes de resolver los imports. Así no se crean conexiones reales.

```typescript
// apps/worker/src/processors/conversation.processor.spec.ts

jest.mock('@adresles/prisma-db', () => {
  const mockPrisma = {
    user: { findUnique: jest.fn(), update: jest.fn() },
    conversation: { findUnique: jest.fn(), update: jest.fn() },
    order: { findUnique: jest.fn(), update: jest.fn() },
    orderAddress: { create: jest.fn() },
    address: { findMany: jest.fn(), create: jest.fn() },
    $disconnect: jest.fn().mockResolvedValue(undefined),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('../redis-publisher', () => ({
  publishConversationUpdate: jest.fn().mockResolvedValue(undefined),
  publishConversationComplete: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../dynamodb/dynamodb.service', () => ({
  saveMessage: jest.fn().mockResolvedValue(undefined),
  getMessages: jest.fn().mockResolvedValue([]),
  saveConversationState: jest.fn().mockResolvedValue(undefined),
  getConversationState: jest.fn().mockResolvedValue(null),
}));

// Ahora el import del processor usa los mocks; no se abren conexiones reales
```

### Regla de aplicación

> Si un spec importa un módulo que a su vez importa Prisma, Redis o DynamoDB, mockear esos módulos al inicio del spec para evitar conexiones persistentes.

### Alternativa: redis-publisher.spec.ts

Para specs que solo usan `redis-publisher`, se mockea `ioredis` en lugar del módulo completo (ver `redis-publisher.spec.ts`). Así el publisher se carga pero usa un cliente Redis mockeado.

---

## Patrón: Mock de interpretUserIntent para evitar llamadas a OpenAI

### Problema

Los handlers `handleWaitingSaveAddress`, `handleConfirmation`, etc. llaman a `interpretUserIntent()` (OpenAI) para clasificar Sí/No. En tests esto provoca 429 (quota) o lentitud.

### Solución: Mockear interpretUserIntent en address.service

```typescript
jest.mock('../services/address.service', () => {
  const actual = jest.requireActual('../services/address.service');
  return {
    ...actual,
    interpretUserIntent: jest.fn().mockImplementation(async (_phase: string, msg: string) => {
      const lower = msg.toLowerCase().trim();
      if (['sí', 'si', 'yes', 'ok'].some((w) => lower === w || lower.startsWith(w)))
        return { type: 'CONFIRM' };
      if (lower.startsWith('no') || lower === 'no')
        return { type: 'REJECT_AND_CORRECT', correction: msg };
      return { type: 'UNKNOWN' };
    }),
  };
});
```

### Regla

> Si el spec del processor cubre fases que usan `interpretUserIntent` (WAITING_SAVE_ADDRESS, WAITING_CONFIRMATION, etc.), mockear esa función para devolver intents determinísticos sin OpenAI.

---

## Patrón: mockClear para tests con aserciones "no fue llamado"

### Problema

Cuando un test verifica que un mock **no** fue llamado (ej: `expect(instance.address.create).not.toHaveBeenCalled()`), falla si otros tests del mismo archivo sí lo llamaron, porque el mock acumula todas las invocaciones.

### Solución: mockClear en beforeEach del describe afectado

En el `beforeEach` del bloque de tests que hace aserciones "no llamado", limpiar el mock antes de ejecutar:

```typescript
beforeEach(async () => {
  const instance = new (PrismaClient as jest.Mock)();
  // ... otros mocks ...
  (instance.address.create as jest.Mock).mockClear();
  (instance.address.findMany as jest.Mock).mockClear();
});
```

Así cada test parte con cero invocaciones para esos mocks.

### Regla

> Si un test asevera que un mock no fue llamado, usar `mockClear()` en el beforeEach de ese describe para aislar las aserciones.
