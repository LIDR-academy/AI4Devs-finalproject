# Patrones de Testing — Worker (BullMQ)

> **Última actualización**: 2026-03-09  
> **Origen**: CU03-B3 Worker Registration + fix "open handles"; CU03-B4 libreta (interpretUserIntent mock, mockClear); llm-service-abstraction (ILLMService injection); fix-information-journey-confirmation-message (mock Order con store y orderAddress para INFORMATION).

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

### Mock de Order con `store` y `orderAddress` (journey INFORMATION)

En `conversationProcessor` la Order se carga con `include: { store: true, orderAddress: true }`. Para tests que ejercitan el journey INFORMATION (`conversationType === 'INFORMATION'`), el mock de `order.findUnique` debe devolver un objeto que incluya `store` y `orderAddress` (o `orderAddress: null` para el caso sin dirección). Ejemplo: `{ externalOrderId: 'EXT-123', store: { name: 'Tienda' }, orderAddress: { fullAddress: 'Calle X 1, 28001 Madrid' } }`. Así se verifica tanto el contenido del mensaje (saludo, número de pedido, dirección) como que la query usa el include correcto.

### Alternativa: redis-publisher.spec.ts

Para specs que solo usan `redis-publisher`, se mockea `ioredis` en lugar del módulo completo (ver `redis-publisher.spec.ts`). Así el publisher se carga pero usa un cliente Redis mockeado.

---

## Patrón: Inyección de ILLMService para evitar llamadas a OpenAI

> ⚠️ **Patrón anterior obsoleto** (antes del change `llm-service-abstraction`): se mockeaba `interpretUserIntent` directamente desde `address.service` con `jest.mock('../services/address.service', () => ({ ...actual, interpretUserIntent: jest.fn() }))`. Ese patrón ya no aplica porque `interpretUserIntent` fue eliminada de `address.service.ts`.

### Problema

Los handlers del Worker (`handleWaitingSaveAddress`, `handleConfirmation`, `handleWaitingAddress`, etc.) llaman al servicio LLM para clasificar intenciones y extraer direcciones. En tests esto provoca 429 (quota) o lentitud, y además requería `OPENAI_API_KEY`.

Tras el change `llm-service-abstraction`, todo acceso al LLM pasa por la interfaz `ILLMService` y la función `setLLMService()` exportada por `conversation.processor.ts`.

### Solución: Inyectar jest.Mocked<ILLMService> antes de los tests

```typescript
import type { ILLMService } from '../llm/llm.interface';

// 1. Crear el mock del servicio LLM con jest.fn()
const mockLLMService: jest.Mocked<ILLMService> = {
  generateMessage: jest.fn().mockResolvedValue('[MOCK] Hola, necesitamos tu dirección.'),
  extractAddress: jest.fn().mockResolvedValue({
    isComplete: false,
    missingFields: [],
    couldBeBuilding: false,
    address: null,
  }),
  interpretIntent: jest.fn().mockImplementation(async (_phase: string, msg: string) => {
    const lower = msg.toLowerCase().trim();
    if (['sí', 'si', 'yes', 'ok'].some((w) => lower === w || lower.startsWith(w + ' ')))
      return { type: 'CONFIRM' };
    if (lower.startsWith('no') || lower === 'no')
      return { type: 'REJECT_AND_CORRECT', correction: msg };
    return { type: 'UNKNOWN' };
  }),
};

// 2. Inyectar ANTES de que los tests se ejecuten (beforeAll con dynamic import)
beforeAll(async () => {
  const { setLLMService } = await import('./conversation.processor');
  setLLMService(mockLLMService);
});

// 3. Después de jest.clearAllMocks(), restaurar las implementaciones en beforeEach
beforeEach(async () => {
  jest.clearAllMocks();
  mockLLMService.interpretIntent.mockImplementation(async (_phase: string, msg: string) => {
    const lower = msg.toLowerCase().trim();
    if (['sí', 'si', 'yes', 'ok'].some((w) => lower === w || lower.startsWith(w + ' ')))
      return { type: 'CONFIRM' };
    if (lower.startsWith('no') || lower === 'no')
      return { type: 'REJECT_AND_CORRECT', correction: msg };
    return { type: 'UNKNOWN' };
  });
  mockLLMService.generateMessage.mockResolvedValue('[MOCK] Hola, necesitamos tu dirección.');
  mockLLMService.extractAddress.mockResolvedValue({
    isComplete: false,
    missingFields: [],
    couldBeBuilding: false,
    address: null,
  });
  // ... resto de mocks de Prisma/DynamoDB ...
});
```

### Por qué jest.clearAllMocks() requiere restaurar implementaciones

`jest.clearAllMocks()` limpia los registros de llamadas (`mock.calls`, `mock.results`) pero NO elimina las implementaciones definidas con `mockImplementation()`. Sin embargo, si en un test previo se usó `mockResolvedValueOnce` o se modificó la implementación, el beforeEach garantiza un estado limpio y determinístico para cada test.

### Regla

> Cualquier spec del Worker que pruebe handlers que usan LLM (fases: WAITING_ADDRESS, WAITING_CONFIRMATION, WAITING_DISAMBIGUATION, WAITING_BUILDING_DETAILS, WAITING_REGISTER, WAITING_SAVE_ADDRESS) debe:
> 1. Crear `mockLLMService: jest.Mocked<ILLMService>` a nivel de módulo (fuera de describe)
> 2. Inyectarlo con `setLLMService(mockLLMService)` en `beforeAll`
> 3. Restaurar implementaciones en `beforeEach` después de `jest.clearAllMocks()`

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
