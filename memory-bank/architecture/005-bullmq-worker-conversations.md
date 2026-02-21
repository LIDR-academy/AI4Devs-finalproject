# ADR-005: Arquitectura Asíncrona con BullMQ y Worker Dedicado para Conversaciones IA

**Estado**: ✅ Aceptada  
**Fecha**: 2026-02-21  
**Decidido en**: Implementación CU-01 Procesar Compra Mock  
**Implementado en**: [`cu01-procesar-compra-mock`](../../openspec/changes/cu01-procesar-compra-mock/) (archivado)  
**Reemplaza a**: —

---

## Contexto

El flujo principal de Adresles requiere procesar conversaciones IA entre el sistema y el usuario final para obtener/confirmar su dirección de entrega. Este procesamiento implica:

- **Llamadas a OpenAI GPT-4** con latencia variable (1–5 segundos típicos)
- **Llamadas a Google Maps API** para validar y normalizar direcciones
- **Operaciones de escritura en DynamoDB** (guardar mensajes)
- **Múltiples actualizaciones en Supabase** (estado de orden, OrderAddress)
- **Lógica de máquina de estados** multi-turno (puede requerir varios intercambios de mensajes)

El punto de entrada del sistema es `POST /api/mock/orders`, que debe responder en tiempo razonable sin esperar la resolución completa de la conversación.

**Restricciones**:
- API NestJS debe responder con `201 Created` rápidamente (sin bloquear por latencia IA)
- El procesamiento de conversaciones puede extenderse varios minutos (múltiples turnos usuario–IA)
- El Worker debe poder escalar independientemente de la API
- Los fallos transitorios (red, timeout OpenAI) deben reintentarse automáticamente

---

## Decisión

**Arquitectura desacoplada API → Cola → Worker**:

El API encola un job en Redis (via BullMQ) al recibir un pedido y responde inmediatamente. Un proceso Worker independiente (`apps/worker`) consume la cola y ejecuta todo el procesamiento IA de forma asíncrona.

> "El API no procesa conversaciones IA directamente. Encola jobs en Redis y un Worker dedicado los consume de forma asíncrona."

**Colas definidas**:
- `process-conversation` — Job inicial: arranca el journey (GET_ADDRESS o INFORMATION)
- `process-response` — Job por cada respuesta del usuario: avanza la máquina de estados

---

## Justificación

### Análisis de Alternativas

| Opción | Pros | Contras | Veredicto |
|--------|------|---------|-----------|
| **Cola BullMQ + Worker** (elegida) | • API no bloqueada<br>• Reintentos automáticos<br>• Worker escala independiente<br>• Visibilidad de jobs (BullMQ Board) | • Infraestructura Redis adicional<br>• Mayor complejidad operacional | ✅ Seleccionada |
| **Procesamiento síncrono en API** | • Arquitectura simple<br>• Sin infraestructura adicional | • API bloqueada 1–5 seg por llamada IA<br>• Sin reintentos nativos<br>• No escala con carga | ❌ Descartada |
| **WebSockets directos sin cola** | • Comunicación bidireccional en tiempo real | • Dificulta reintentos<br>• Estado en memoria (no persistente)<br>• Complejidad mayor para MVP | ❌ Descartada |
| **AWS Lambda / Serverless** | • Escala a cero<br>• Sin infraestructura propia | • Cold starts inaceptables para conversaciones<br>• Coste por invocación con volumen | ❌ Descartada (ver ADR-001) |

### Razones Principales

1. **Latencia de IA inaceptable en síncronía**: Las llamadas a OpenAI GPT-4 tienen latencia variable (1–5 s típicos, hasta 30 s en sobrecarga). Bloquear el hilo del API durante ese tiempo degradaría la experiencia y agotaría los workers de Express.

2. **Resiliencia ante fallos transitorios**: BullMQ ofrece reintentos con backoff exponencial de forma nativa. Si OpenAI o Google Maps fallan momentáneamente, el job se reintenta sin intervención manual.

3. **Desacoplamiento de escalado**: El API puede manejar muchas solicitudes de entrada simultáneamente; el Worker escala según la carga de procesamiento IA. Son recursos con perfiles distintos.

4. **Conversaciones multi-turno**: Una conversación implica varios intercambios (pregunta dirección → usuario responde → validar → preguntar detalles → confirmar). La cola `process-response` modela cada turno como un job independiente, manteniendo el estado en DynamoDB.

### Criterios de Evaluación

- ✅ **Tiempo de respuesta del API**: `POST /api/mock/orders` responde en < 200ms (sin esperar IA)
- ✅ **Resiliencia**: Reintentos automáticos en fallos transitorios (BullMQ backoff)
- ✅ **Observabilidad**: Jobs visibles en Redis; estado de conversación en DynamoDB
- ⚠️ **Complejidad**: Requiere Redis como infraestructura adicional — aceptado para MVP

---

## Consecuencias

### ✅ Positivas

- **API no bloqueada**: El endpoint `POST /api/mock/orders` retorna `201 Created` inmediatamente tras crear la Order y encolar el job
- **Reintentos automáticos**: BullMQ reintenta con backoff exponencial ante fallos transitorios de OpenAI o Google Maps (3 intentos máx.)
- **Escalado independiente**: `apps/worker` puede desplegarse con más réplicas si crece el volumen de conversaciones sin tocar el API
- **Separación de responsabilidades**: API = orquestación de datos; Worker = procesamiento IA y efectos secundarios
- **Consistencia con ADR-002**: Los mensajes de conversación ya residen en DynamoDB — el Worker es el único consumidor, sin acoplamiento con la API

### ❌ Negativas (Trade-offs)

- **Redis como infraestructura requerida**: Añade un servicio de infraestructura al stack. Mitigación: Redis ya era necesario para caché; se reutiliza para la cola.
- **Debugging más complejo**: Un fallo en el procesamiento IA no es visible de forma inmediata en la respuesta del API. Mitigación: logs estructurados en el Worker y visibilidad via BullMQ Dashboard.
- **Consistencia eventual**: El usuario ve su pedido creado antes de que el Worker haya procesado la conversación. Mitigación: el estado de la Order (`PENDING_ADDRESS`) refleja que la conversación está en curso.

### 🔧 Deuda Técnica Introducida

- **Alertas de fallos**: No se implementó notificación cuando los 3 reintentos fallan. Pendiente: dead-letter queue + alertas Slack/email.
- **EcommerceSyncService usa `console.log`**: Pendiente migrar a `NestJS Logger` antes de producción.

---

## Implementación

### Estructura

```
apps/api/src/queue/
├── queue.module.ts          — Registra la cola BullMQ en el API
└── queue.service.ts         — addProcessConversationJob(), addProcessResponseJob()

apps/worker/src/
├── main.ts                  — Bootstrap del Worker: consume 'process-conversation' y 'process-response'
├── processors/
│   └── conversation.processor.ts  — Lógica de journeys y máquina de estados
├── services/
│   └── address.service.ts   — Validación Google Maps, detección de edificios
└── dynamodb/
    └── dynamodb.service.ts  — Persistencia de mensajes (saveMessage, getMessages)
```

### Flujo por tipo de job

**`process-conversation`** (job inicial):
```
API encola → Worker recibe conversationId + conversationType
  → GET_ADDRESS: llama OpenAI → guarda en DynamoDB → envía mensaje al usuario
  → INFORMATION: envía confirmación de dirección → actualiza Order a COMPLETED
```

**`process-response`** (por cada respuesta del usuario):
```
MockConversationsController recibe respuesta → encola job
  → ResponseProcessor avanza máquina de estados:
      estado: WAITING_ADDRESS → validar con GMaps → pedir confirmación
      estado: WAITING_CONFIRMATION → confirmar → crear OrderAddress → sync → COMPLETED
      estado: WAITING_DETAILS → preguntar escalera/piso/puerta → volver a validar
```

### Ejemplo de código

```typescript
// API: encolado inmediato tras crear Order
const conversation = await this.conversations.createAndEnqueue({
  orderId: order.id,
  userId,
  conversationType: 'GET_ADDRESS',
  userType: UserType.BUYER,
});
// Responde 201 sin esperar procesamiento IA
return { order_id: order.id, conversation_id: conversation.id };

// Worker: consumo del job
const worker = new Worker('process-conversation', async (job) => {
  const { conversationId, conversationType } = job.data;
  if (conversationType === 'GET_ADDRESS') return processGetAddressJourney(...);
  if (conversationType === 'INFORMATION') return processInformationJourney(...);
}, { connection: redisConnection });
```

---

## Métricas de Éxito

- 📊 **Latencia API**: `POST /api/mock/orders` responde en < 500ms en condiciones normales
- 📊 **Tasa de reintentos**: < 5% de jobs requieren reintento en condiciones estables
- 📊 **Jobs fallidos**: 0 jobs en dead-letter sin notificación (a implementar)
- 📊 **Throughput Worker**: Procesa ≥ 10 conversaciones/min con una sola réplica

---

## Referencias

- **Documento fuente**: [Adresles_Business.md — Sección 4.3 (Arquitectura Async)](../../Adresles_Business.md)
- **Change implementado**: [`cu01-procesar-compra-mock`](../../openspec/changes/cu01-procesar-compra-mock/)
- **ADRs relacionados**:
  - [ADR-001](./001-monolith-modular.md) — Monolito modular (motivo del Worker como app separada, no microservicio)
  - [ADR-002](./002-supabase-dynamodb.md) — DynamoDB para mensajes (complementario: Worker es el consumidor de DynamoDB)
  - [ADR-004](./004-openai-gpt4.md) — OpenAI GPT-4 (el Worker es quien llama a OpenAI)
- **Documentación externa**: [BullMQ Docs](https://docs.bullmq.io/)

---

## Notas de Revisión

### 2026-02-21: Decisión tomada en CU-01

- Implementado y validado con 37 tests pasando (100%)
- Los reintentos están configurados a 3 intentos con backoff exponencial (patrón BullMQ por defecto)
- Pendiente: alertas cuando se agoten los reintentos (dead-letter queue)

---

**Creado por**: Sergio  
**Última actualización**: 2026-02-21  
**Próxima revisión**: Antes de producción (implementar alertas de fallos)
