# T04 — Coherencia de `externalOrderId` como Referencia de Pedido

**Fecha**: 2026-03-13  
**Estado**: Pendiente  
**Prioridad**: Media-Alta  
**Tipo**: Refactor + Feature

---

## 1. Contexto y Motivación

El modelo `Order` tiene dos campos relacionados con la referencia del pedido en la tienda eCommerce:

- `externalOrderId` (`String`, NOT NULL, parte de la clave única `(storeId, externalOrderId)`): el identificador técnico que asigna el eCommerce al pedido.
- `externalOrderNumber` (`String?`, nullable): el número "visible" que se mostraba al cliente y en el admin.

**Problemas actuales detectados:**

1. **Referencia en la UI inconsistente**: La columna "Referencia" de la página Pedidos muestra `externalOrderNumber ?? externalOrderId`, de modo que el campo que realmente identifica de forma única el pedido dentro de una tienda (`externalOrderId`) no es la fuente primaria de lo que se muestra.

2. **Búsqueda que no corresponde a lo que se ve**: El campo `q` del endpoint de pedidos busca por `externalOrderNumber` en lugar de por `externalOrderId`, que es lo que la UI debería mostrar.

3. **Mensajes al usuario incoherentes**: El journey GET_ADDRESS (modo Adresles) pasa `order.externalOrderNumber` al prompt del LLM. Si el campo es `null` (caso habitual en simulaciones), el prompt incluye `"N/A"`. El journey INFORMATION ya usa correctamente `externalOrderId`.

4. **Simulaciones generan `externalOrderId` no realistas**: El modal de simulación envía siempre `SIM-${Date.now()}`, que no refleja el formato que usaría un eCommerce real según su plataforma.

5. **Seed con valores no realistas**: Los `externalOrderId` del seed siguen el patrón `WC-10001`, `SH-20001`, `PS-30001`, que no corresponde al formato real de cada plataforma (WooCommerce usa numérico simple, Shopify secuencial con prefijo/sufijo opcional, PrestaShop usa cadenas alfanuméricas aleatorias).

---

## 2. Decisiones de diseño

| Decisión | Criterio |
|----------|----------|
| **Referencia única = `externalOrderId`** | Es NOT NULL y parte de la clave única `(storeId, externalOrderId)`. `externalOrderNumber` se mantiene en BD pero deja de usarse en la UI y en los mensajes. |
| **Búsqueda `q` solo por `externalOrderId`** | Coherente con lo que se muestra en la columna Referencia. Se elimina la búsqueda por `externalOrderNumber`. |
| **Formato por plataforma (seed + simulación)** | WooCommerce → numérico entero simple. Shopify → numérico secuencial, con prefijo/sufijo posible (hardcodeado en seed; en simulación se extrae el patrón de los pedidos existentes de la tienda). PrestaShop → 9 letras mayúsculas aleatorias. |
| **Sin nuevas columnas en BD** | No se añaden `externalOrderIdPrefix`/`externalOrderIdSuffix` a `Store`. El prefijo/sufijo Shopify se gestiona como convención del seed y se infiere del patrón de pedidos existentes en simulación. |
| **Generación de `externalOrderId` en el backend** | El frontend deja de enviar `external_order_id` en la simulación; el backend lo genera según la plataforma de la tienda. |

---

## 3. Alcance del cambio

### 3.1 Sin cambios en la base de datos
- **No** se crea ninguna migración. El schema Prisma no se modifica: `externalOrderId` sigue siendo `String` NOT NULL y `externalOrderNumber` sigue siendo `String?`.
- La constraint `@@unique([storeId, externalOrderId])` se mantiene sin tocar.
- `externalOrderNumber` permanece en el schema por compatibilidad histórica, pero deja de usarse en la lógica activa.

### 3.2 Con cambios en el seed
Ver sección 4.

---

## 4. Cambios en el Seed (`packages/prisma-db/seed.ts`)

### 4.1 Tiendas de referencia

| Variable | Nombre | Platform | `externalOrderId` actual → nuevo formato |
|----------|--------|----------|------------------------------------------|
| `store1` | ModaMujer Tienda Principal | `WOOCOMMERCE` | `WC-10001` → número entero simple (ej. `"100"`) |
| `store2` | ModaMujer Outlet | `SHOPIFY` | `SH-20001` → `"MM-01001-OUT"` secuencial |
| `store3` | TechGadgets Store | `PRESTASHOP` | `PS-30001` → 9 letras mayúsculas aleatorias |

### 4.2 Nuevos valores de `externalOrderId` por tienda

**store1 (WOOCOMMERCE)** — numérico entero, no siempre consecutivo (saltos +1 a +5):

| Pedido actual | Nuevo `externalOrderId` |
|--------------|-------------------------|
| `WC-10001` | `"100"` |
| `WC-10002` | `"102"` |
| `WC-10003` | `"105"` |
| `WC-10004` | `"108"` |
| `WC-10005` | `"110"` |
| `WC-10006` | `"113"` |
| `WC-10007` | `"115"` |
| `WC-10008` | `"118"` |

**store2 (SHOPIFY)** — `"MM-0{NNNN}-OUT"` empezando en `MM-01001-OUT`, secuencial con paso +1:

| Pedido actual | Nuevo `externalOrderId` |
|--------------|-------------------------|
| `SH-20001` | `"MM-01001-OUT"` |
| `SH-20002` | `"MM-01002-OUT"` |
| `SH-20003` | `"MM-01003-OUT"` |
| `SH-20004` | `"MM-01004-OUT"` |
| `SH-20005` | `"MM-01005-OUT"` |
| `SH-20006` | `"MM-01006-OUT"` |
| `SH-20007` | `"MM-01007-OUT"` |

**store3 (PRESTASHOP)** — 9 letras mayúsculas aleatorias, únicas entre sí:

| Pedido actual | Nuevo `externalOrderId` (ejemplo; deben ser únicos) |
|--------------|-----------------------------------------------------|
| `PS-30001` | `"XCVBGTWQA"` |
| `PS-30002` | `"KLMNPRSTB"` |
| `PS-30003` | `"FGHWQZXCD"` |
| `PS-30004` | `"BVNMKLJHQ"` |
| `PS-30005` | `"RTYUIOPAS"` |

> **Nota**: Los valores concretos de PrestaShop del seed pueden ser los mostrados u otros siempre que sean distintos entre sí. Lo importante es el formato (9 mayúsculas).

### 4.3 Campo `externalOrderNumber` en el seed

Eliminar `externalOrderNumber` de todos los `prisma.order.create` del seed (actualmente `'#10001'`, `'#20001'`, etc.). El campo queda a `null` en todos los pedidos seed, igual que quedará en los pedidos de simulación. Esto es coherente con la decisión de usar `externalOrderId` como única referencia activa.

---

## 5. Cambios en la API (`apps/api`)

### 5.1 Nuevo servicio/helper: generación de `externalOrderId` por plataforma

**Archivo nuevo**: `apps/api/src/orders/external-order-id.service.ts`  
**O bien como método privado de `OrdersService`** si se prefiere no crear un servicio adicional.

**Responsabilidad**: dado un `storeId`, devolver el siguiente `externalOrderId` válido y único para esa tienda.

**Algoritmo por plataforma:**

**WOOCOMMERCE:**
```
1. Obtener todos los orders de la tienda cuyo externalOrderId sea numérico:
   - Filtrar: todos los externalOrderId donde el valor sea solo dígitos (regex /^\d+$/)
   - Obtener el máximo valor numérico entre ellos
2. nextNum = max + random(1, 5)  [random entero entre 1 y 5 inclusive]
3. Si no hay órdenes previas: nextNum = 100
4. Devolver String(nextNum)
```

**PRESTASHOP:**
```
1. Generar una cadena de 9 letras mayúsculas aleatorias (A-Z)
2. Comprobar que no exista ya en la tabla Order un pedido de esa tienda con ese externalOrderId
3. Si existe: volver al paso 1 (máximo 10 intentos; si se supera, lanzar error o usar fallback)
4. Devolver la cadena generada
```

**SHOPIFY:**
```
1. Obtener el externalOrderId más reciente (por createdAt DESC) de esa tienda
2. Si no hay órdenes previas:
   - Devolver "1001" (formato por defecto sin prefijo/sufijo)
3. Si hay al menos una orden:
   - Aplicar regex sobre el externalOrderId más reciente: /^(.*?)(\d{4,})(.*)$/
     - Captura grupo 1 = prefijo (puede ser vacío)
     - Captura grupo 2 = parte numérica (mínimo 4 dígitos; si tiene ceros a la izquierda, preservar el pad)
     - Captura grupo 3 = sufijo (puede ser vacío)
   - Extraer el número, sumar 1
   - Reconstruir con mismo pad de ceros, mismo prefijo y sufijo
   - Ejemplos:
     - "MM-01001-OUT" → prefijo "MM-0", número "1001", sufijo "-OUT" → "MM-01002-OUT"
     - "1001" → prefijo "", número "1001", sufijo "" → "1002"
     - "MM-01007-OUT" → "MM-01008-OUT"
   - Nota: "MM-0" + "1001" se descompone si el regex es /^(MM-0?)(\d+)(-OUT)?$/
     - Con /^(.*?)(\d{4,})(.*)$/ no-greedy: prefijo="MM-", número="01001", sufijo="-OUT" ✓
     - El pad se preserva: String(1002).padStart(5, '0') si número tenía 5 dígitos
4. Devolver el valor construido
```

**Cualquier otra plataforma / tienda sin órdenes previas sin plataforma conocida:**
```
Devolver "SIM-" + Date.now()
```

**Inyección de dependencias**: el servicio necesita acceso a `PrismaService` para consultar órdenes existentes.

> **Importante**: este helper no usa transacciones ni bloqueos porque se ejecuta en el contexto de simulación, que no tiene concurrencia real. Si en el futuro se usa para webhooks reales, habría que revisar esto.

---

### 5.2 `OrdersService.createFromMock` — sin cambios de firma

La firma de `createFromMock` no cambia; `dto.external_order_id` sigue siendo el valor que se guarda en `externalOrderId`. El cambio es que quien llama (MockOrdersService) ya no depende del frontend para tener ese valor: lo genera el backend antes de llamar a `createFromMock`.

---

### 5.3 `MockOrdersService` (`apps/api/src/mock/mock-orders.service.ts`)

**Cambio**: antes de llamar a `orders.createFromMock`, si `dto.external_order_id` no viene en el DTO:
1. Resolver `storeId` con `stores.findOrCreateStore(dto.store)` (como ahora).
2. Cargar `Store` para obtener `platform` (puede hacerse como parte de `findOrCreateStore` o con una llamada adicional a `PrismaService`).
3. Llamar al nuevo helper de generación pasando `storeId`.
4. Asignar el valor generado al DTO (o pasarlo directamente a `createFromMock` como parámetro separado).

**Inyectar** el nuevo `ExternalOrderIdService` (o el método de `OrdersService`) en el constructor de `MockOrdersService`.

---

### 5.4 DTO `CreateMockOrderDto` (`apps/api/src/mock/dto/create-mock-order.dto.ts`)

**Cambio**: hacer `external_order_id` opcional:

```typescript
// Antes:
@IsString()
external_order_id!: string;

// Después:
@IsOptional()
@IsString()
external_order_id?: string;
```

El servicio usa el valor enviado si viene, y genera uno si no.

---

### 5.5 `AdminService.buildOrderBy` (`apps/api/src/admin/admin.service.ts`)

**Cambio**: sustituir las referencias a `externalOrderNumber` en la ordenación por `externalOrderId`.

```typescript
// Antes:
const refSort = { externalOrderNumber: { sort: dir, nulls: 'last' as const } };

// Después:
const refSort = { externalOrderId: dir };
// No se necesita nulls:'last' porque externalOrderId es NOT NULL
```

Aplica a los casos `'ref'` y `'store'` (subsort) del switch.

---

### 5.6 `AdminService.buildWhere` (`apps/api/src/admin/admin.service.ts`)

**Cambio**: en el bloque `OR` del parámetro `q`, sustituir la condición de `externalOrderNumber` por `externalOrderId`:

```typescript
// Antes:
{ externalOrderNumber: { contains: q, mode: 'insensitive' } },

// Después:
{ externalOrderId: { contains: q, mode: 'insensitive' } },
```

Las otras condiciones del `OR` (store name, firstName, lastName) se mantienen igual.

---

### 5.7 `AdminService.getConversationMessages` (`apps/api/src/admin/admin.service.ts`)

**Cambio**: el método actualmente expone `order.externalOrderNumber ?? order.externalOrderId`. Simplificar:

```typescript
// Antes (en el select y en el return):
select: { externalOrderNumber: true, externalOrderId: true }
// ...
order: {
  externalOrderNumber: conversation.order.externalOrderNumber ?? conversation.order.externalOrderId,
},

// Después:
select: { externalOrderId: true }
// ...
order: {
  externalOrderId: conversation.order.externalOrderId,
},
```

---

## 6. Cambios en el Worker (`apps/worker`)

### 6.1 `conversation.processor.ts` — `processGetAddressJourney`

**Cambio 1**: actualizar el tipo del parámetro `order` para que use `externalOrderId: string` en lugar de `externalOrderNumber: string | null`:

```typescript
// Antes:
order: { externalOrderNumber: string | null; store: { name: string } },

// Después:
order: { externalOrderId: string; store: { name: string } },
```

**Cambio 2**: en la llamada a `buildGetAddressUserPrompt`, pasar `externalOrderId` en lugar de `externalOrderNumber`:

```typescript
// Antes:
const userPrompt = buildGetAddressUserPrompt({ name, storeName, orderNumber: order.externalOrderNumber, language });

// Después:
const userPrompt = buildGetAddressUserPrompt({ name, storeName, orderNumber: order.externalOrderId, language });
```

Con este cambio, el prompt al LLM nunca incluirá "N/A" cuando `externalOrderId` tiene valor (siempre lo tiene).

**Cambio 3**: en la llamada raíz a `processGetAddressJourney` (dentro de `conversationProcessor`), verificar que la carga de la `Order` vía Prisma incluye `externalOrderId` en el select/include (actualmente ya viene al hacer `findUnique` sin select explícito, pero confirmarlo).

### 6.2 Journey INFORMATION — sin cambios

`processInformationJourney` ya usa `order.externalOrderId`. No requiere modificaciones.

---

## 7. Cambios en el Frontend (`apps/web-admin`)

### 7.1 Tipos (`apps/web-admin/src/types/api.ts`)

**Cambio 1**: `ConversationContext.order`:
```typescript
// Antes:
order: { externalOrderNumber: string | null };

// Después:
order: { externalOrderId: string };
```

**Cambio 2**: `CreateMockOrderPayload`:
```typescript
// Antes:
external_order_id: string;

// Después:
external_order_id?: string;  // opcional: el backend lo genera si no se envía
```

---

### 7.2 Página Pedidos — tabla (`apps/web-admin/src/components/orders/orders-table.tsx`)

**Cambio**: eliminar el fallback en la variable `orderNumber`:

```typescript
// Antes:
const orderNumber = order.externalOrderNumber ?? order.externalOrderId;

// Después:
const orderNumber = order.externalOrderId;
```

Todo el uso de `orderNumber` en la celda de Referencia y en el `aria-label` del enlace al chat queda igual (solo cambia de dónde viene el valor).

---

### 7.3 Vista de conversación (`apps/web-admin/src/components/chat/chat-view.tsx`)

**Cambio**: en la cabecera "Pedido #…", usar `externalOrderId`:

```typescript
// Antes:
const orderNumber = conversation.order.externalOrderNumber;

// Después:
const orderNumber = conversation.order.externalOrderId;
```

El renderizado del enlace `Pedido #${orderNumber.replace(/^#/, '')}` se mantiene igual.

---

### 7.4 Modal de simulación (`apps/web-admin/src/components/simulate/order-config-modal.tsx`)

**Cambio**: eliminar `external_order_id` del payload de `startSimulation`:

```typescript
// Antes (en handleSubmit):
const payload = {
  store: { ... },
  external_order_id: `SIM-${Date.now()}`,
  ...
};

// Después:
const payload = {
  store: { ... },
  // No se incluye external_order_id; el backend lo genera
  ...
};
```

---

## 8. Tests a actualizar

### 8.1 `apps/api/src/admin/admin.service.spec.ts`

- **Ordenación `sortBy=ref`**: esperar `orderBy: [{ externalOrderId: 'asc' }]` (sin `nulls`, sin `externalOrderNumber`).
- **Subsort por tienda**: esperar `[{ store: { name: 'asc' } }, { externalOrderId: 'asc' }]`.
- **Búsqueda `q`**: esperar que la condición OR incluya `{ externalOrderId: { contains: ..., mode: 'insensitive' } }` en lugar de `externalOrderNumber`.
- **`getConversationMessages`**: actualizar el test que espera `conversation.order.externalOrderNumber` para esperar `conversation.order.externalOrderId`. Actualizar el test del fallback (`usa externalOrderId como fallback si externalOrderNumber es null`) — ese comportamiento desaparece; el campo devuelto es siempre `externalOrderId` directamente.

### 8.2 `apps/api/src/mock/mock-orders.service.spec.ts`

- Añadir o actualizar el mock de la tienda para que el helper de generación de `externalOrderId` sea mockeable.
- Añadir test: cuando el DTO **no** incluye `external_order_id`, el servicio genera uno y lo pasa a `orders.createFromMock`.
- Test existente con `external_order_id: 'ext-001'`: sigue siendo válido (se usa el valor enviado).

### 8.3 `apps/api/src/mock/mock-orders.controller.spec.ts`

- Actualizar el DTO de prueba si se elimina `external_order_id` como campo requerido. El test sigue siendo válido si el controller pasa el DTO tal cual al servicio.

### 8.4 `apps/worker/src/processors/conversation.processor.spec.ts`

- En los tests del journey GET_ADDRESS que construyen el mock de `order`:
  - Cambiar de `{ externalOrderNumber: '...', store: ... }` a `{ externalOrderId: '...', store: ... }`.
  - Verificar que el prompt enviado al LLM contiene el valor de `externalOrderId`, no "N/A".
- Tests del journey INFORMATION: sin cambios (ya usan `externalOrderId`).

### 8.5 Tests de `ExternalOrderIdService` (nuevo)

Crear `apps/api/src/orders/external-order-id.service.spec.ts` con:

- **WOOCOMMERCE sin órdenes previas**: devuelve `"100"`.
- **WOOCOMMERCE con órdenes previas**: devuelve un número mayor que el máximo existente (en el rango max+1 a max+5).
- **PRESTASHOP**: devuelve una cadena de exactamente 9 letras mayúsculas.
- **PRESTASHOP con colisión**: si la primera cadena generada coincide con un pedido existente, genera una nueva (mock del segundo intento devuelve un valor diferente).
- **SHOPIFY sin órdenes previas**: devuelve `"1001"`.
- **SHOPIFY con patrón `MM-01007-OUT`**: devuelve `"MM-01008-OUT"`.
- **SHOPIFY con patrón simple `"1005"`**: devuelve `"1006"`.

---

## 9. Archivos afectados (resumen)

| Archivo | Tipo de cambio |
|---------|----------------|
| `packages/prisma-db/seed.ts` | Actualizar `externalOrderId` de todos los pedidos; eliminar `externalOrderNumber` |
| `apps/api/src/orders/external-order-id.service.ts` | **NUEVO** — lógica de generación por plataforma |
| `apps/api/src/orders/orders.module.ts` | Exportar el nuevo servicio si se declara por separado |
| `apps/api/src/mock/dto/create-mock-order.dto.ts` | Hacer `external_order_id` opcional |
| `apps/api/src/mock/mock-orders.service.ts` | Inyectar helper, generar `externalOrderId` cuando no viene en DTO |
| `apps/api/src/mock/mock.module.ts` | Importar el nuevo servicio si es necesario |
| `apps/api/src/admin/admin.service.ts` | `buildOrderBy`: ref/subsort → `externalOrderId`; `buildWhere`: q → `externalOrderId`; `getConversationMessages`: devolver `externalOrderId` |
| `apps/worker/src/processors/conversation.processor.ts` | GET_ADDRESS: tipo y valor `externalOrderId` en vez de `externalOrderNumber` |
| `apps/web-admin/src/types/api.ts` | `ConversationContext.order`, `CreateMockOrderPayload` |
| `apps/web-admin/src/components/orders/orders-table.tsx` | Eliminar fallback `?? order.externalOrderId` |
| `apps/web-admin/src/components/chat/chat-view.tsx` | `conversation.order.externalOrderId` |
| `apps/web-admin/src/components/simulate/order-config-modal.tsx` | Eliminar `external_order_id` del payload |
| `apps/api/src/admin/admin.service.spec.ts` | Actualizar expectations de sort, subsort, búsqueda y conversación |
| `apps/api/src/mock/mock-orders.service.spec.ts` | Añadir tests de generación automática |
| `apps/api/src/mock/mock-orders.controller.spec.ts` | Ajustar DTO de prueba si hace falta |
| `apps/api/src/orders/external-order-id.service.spec.ts` | **NUEVO** — tests del helper |
| `apps/worker/src/processors/conversation.processor.spec.ts` | Actualizar mocks de `order` en GET_ADDRESS |

---

## 10. Criterios de aceptación

1. **Seed**: al ejecutar `db:seed`, los pedidos de cada tienda tienen `externalOrderId` en el formato correcto para su plataforma (numérico para WooCommerce, `MM-0XXXX-OUT` para Shopify, 9 mayúsculas para PrestaShop) y `externalOrderNumber` es `null` en todos ellos.

2. **Página Pedidos**: la columna "Referencia" muestra siempre `externalOrderId`, sin fallback. Para los pedidos del seed se ven valores como `"100"`, `"MM-01001-OUT"`, `"XCVBGTWQA"`.

3. **Búsqueda `q` en Pedidos**: buscar por el `externalOrderId` de un pedido (ej. `"100"` o `"XCVBGTWQA"`) devuelve ese pedido. Buscar por `externalOrderNumber` (ej. `"#10001"`) no devuelve resultados (ya no se busca por ese campo).

4. **Vista de conversación**: la cabecera muestra `Pedido #<externalOrderId>`, no el antiguo `externalOrderNumber`.

5. **Simulación — generación de `externalOrderId`**: crear un nuevo pedido desde el modal de simulación con una tienda de tipo WOOCOMMERCE, SHOPIFY o PRESTASHOP del seed genera un `externalOrderId` coherente con el formato de esa plataforma y mayor que el máximo existente (WOOCOMMERCE/SHOPIFY) o único (PRESTASHOP).

6. **Mensajes al usuario**: en el journey GET_ADDRESS (Adresles), el prompt al LLM incluye el `externalOrderId` real del pedido (no "N/A").

7. **Tests**: todos los tests existentes pasan. Los nuevos tests de `ExternalOrderIdService` cubren los tres formatos (WooCommerce, Shopify, PrestaShop) con al menos los escenarios listados en la sección 8.5.

8. **Build TypeScript**: `pnpm build` sin errores en todos los workspaces.

---

## 11. Notas adicionales

- `externalOrderNumber` **no se elimina de la BD** (no hay migración). Se mantiene el campo en el schema Prisma como nullable. Los pedidos del seed tendrán `externalOrderNumber = null`; los pedidos reales de producción (cuando los haya) podrían seguir trayendo ese campo desde el webhook del eCommerce. La decisión de si mostrarlo o no en la UI es separada y puede revisarse en una fase futura.

- El helper `ExternalOrderIdService` solo se usa desde `MockOrdersService` (simulación). No se conecta a ningún flujo de webhook real. Si en el futuro se necesita para webhooks, habrá que revisar concurrencia (ej. `SELECT ... FOR UPDATE` o índice de tipo `MAX()`).

- El `StoresService.findOrCreateStore` crea las tiendas nuevas siempre con `platform: 'WOOCOMMERCE'`. Esto significa que las tiendas creadas dinámicamente en simulación siempre usarán el formato numérico de WooCommerce. Si se quiere controlar la plataforma desde la simulación, sería un cambio separado (actualizar el DTO del modal para que acepte `platform`, y actualizar `findOrCreateStore`).

- Los valores concretos de `externalOrderId` para PrestaShop en el seed pueden elegirse libremente siempre que sean exactamente 9 letras mayúsculas distintas entre sí dentro de la misma tienda.
