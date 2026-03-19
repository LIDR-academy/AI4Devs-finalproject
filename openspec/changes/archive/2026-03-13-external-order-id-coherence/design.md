## Context

El modelo `Order` de Adresles tiene dos campos de referencia del pedido en el eCommerce:
- `externalOrderId` (`String`, NOT NULL, parte de `@@unique([storeId, externalOrderId])`): identificador técnico único.
- `externalOrderNumber` (`String?`, nullable): número visible opcional, no siempre presente.

El estado actual mezcla ambos campos en múltiples capas: la UI hace fallback `externalOrderNumber ?? externalOrderId`, la búsqueda filtra por `externalOrderNumber`, el Worker usa `externalOrderNumber` en el prompt GET_ADDRESS (lo que produce "N/A" en simulaciones), y el frontend genera `externalOrderId` con `SIM-${Date.now()}`, un formato no realista. El seed usa `WC-10001`/`SH-20001`/`PS-30001`, también no realistas.

Este change consolida `externalOrderId` como la única referencia activa en toda la aplicación y delega su generación al backend con formatos coherentes por plataforma.

**Restricciones**:
- Sin migración de BD: el schema Prisma no se modifica. `externalOrderNumber` permanece como campo nullable.
- El helper de generación solo se usa desde `MockOrdersService` (simulación). No aplica a webhooks reales.
- No hay concurrencia real en simulación: no se necesitan bloqueos optimistas ni transacciones para la generación del ID.

## Goals / Non-Goals

**Goals:**
- `externalOrderId` es la fuente única de verdad para la referencia del pedido en UI, búsqueda, ordenación y prompts al LLM.
- El backend genera `externalOrderId` con formato realista según la plataforma de la tienda (`WOOCOMMERCE`, `SHOPIFY`, `PRESTASHOP`).
- El frontend deja de enviar `external_order_id` en la simulación.
- El seed refleja formatos reales por plataforma.
- Build TypeScript sin errores y tests actualizados/nuevos.

**Non-Goals:**
- No se elimina `externalOrderNumber` del schema Prisma ni de la BD.
- No se expone la plataforma de la tienda como campo configurable desde el modal de simulación.
- No se implementa generación de `externalOrderId` para webhooks reales (solo simulación).
- No se añaden columnas `externalOrderIdPrefix`/`externalOrderIdSuffix` al modelo `Store`.
- No se implementan bloqueos de concurrencia para la generación del ID.

## Decisions

### 1. `ExternalOrderIdService` como servicio NestJS independiente (no método privado de `OrdersService`)

**Decisión**: crear `apps/api/src/orders/external-order-id.service.ts` como `@Injectable()` y exportarlo desde `OrdersModule`.

**Por qué no método privado de `OrdersService`**: la lógica de generación es ortogonal al resto de `OrdersService`. Al extraerla en un servicio propio se puede probar aisladamente (sin mockear toda la lógica de órdenes) y se puede inyectar directamente en `MockOrdersService` sin crear un acoplamiento transitivo innecesario.

**Inyección**: `ExternalOrderIdService` recibe `PrismaService` en el constructor para consultar pedidos existentes de la tienda. Se inyecta en `MockOrdersService`.

---

### 2. Algoritmo de generación por plataforma

**WOOCOMMERCE**: numérico entero. Se obtiene el `max` de los `externalOrderId` numéricos existentes de esa tienda (regex `/^\d+$/`), se suma un delta aleatorio entre 1 y 5. Si no hay pedidos, devuelve `"100"`. Justificación: WooCommerce usa IDs post de WordPress (enteros, no consecutivos).

**SHOPIFY**: secuencial con prefijo/sufijo inferido. Se coge el `externalOrderId` más reciente (`createdAt DESC`) y se aplica `/^(.*?)(\d{4,})(.*)$/` con `lastIndex` cero para extraer prefijo, número y sufijo. Se suma 1 al número preservando el pad. Si no hay pedidos previos, devuelve `"1001"`. Justificación: Shopify permite prefijos/sufijos configurables; la regex captura el patrón del primer pedido y lo replica.

**PRESTASHOP**: 9 letras mayúsculas aleatorias (A-Z). Se comprueba unicidad contra la BD con hasta 10 reintentos. Si se supera el límite, lanza error. Justificación: PrestaShop genera referencias alfanuméricas aleatorias por defecto.

**Cualquier otra plataforma / fallback**: `"SIM-" + Date.now()` (comportamiento anterior, solo como fallback de seguridad).

---

### 3. `external_order_id` pasa a opcional en `CreateMockOrderDto`

**Decisión**: `@IsOptional() @IsString() external_order_id?: string`. Si el campo viene en el DTO, se usa directamente (compatibilidad con tests existentes y casos de depuración). Si no viene, `MockOrdersService` llama a `ExternalOrderIdService` para generarlo.

**Por qué no eliminarlo del DTO**: los tests existentes con `external_order_id: 'ext-001'` siguen siendo válidos y el campo puede ser útil para depuración manual.

---

### 4. Sin cambios en la firma de `OrdersService.createFromMock`

`dto.external_order_id` sigue siendo el valor guardado en `Order.externalOrderId`. `MockOrdersService` asigna el valor generado antes de llamar a `createFromMock`, por lo que el contrato de `OrdersService` no cambia.

---

### 5. Actualización del seed con valores fijos

Los valores del seed son deterministas (ver TICKET.md §4). No se usan funciones de generación en el seed para evitar diferencias entre ejecuciones. Los valores de PrestaShop son cadenas fijas de 9 letras mayúsculas únicas dentro de la misma tienda.

---

### 6. `buildOrderBy` en `AdminService` — `externalOrderId` sin `nulls: 'last'`

Como `externalOrderId` es NOT NULL, no se necesita `nulls: 'last'` en la cláusula de ordenación. Simplifica el código respecto al anterior `{ externalOrderNumber: { sort: dir, nulls: 'last' } }`.

## Risks / Trade-offs

- **[Riesgo] Colisión en PrestaShop con muchos pedidos** → Mitigación: el algoritmo reintenta hasta 10 veces. Para simulaciones el espacio de posibilidades es 26^9 ≈ 5.4 × 10^12, extremadamente improbable incluso con miles de pedidos.

- **[Riesgo] Regex de Shopify no cubre todos los patrones posibles** → Mitigación: el fallback a `"SIM-" + Date.now()` cubre cualquier patrón no reconocido. El regex `/^(.*?)(\d{4,})(.*)$/` cubre patrones con prefijo/sufijo opcionales y números de ≥4 dígitos.

- **[Trade-off] `externalOrderNumber` queda en BD pero sin uso activo** → La compatibilidad histórica y la posibilidad de recuperarlo en el futuro justifican mantenerlo. El campo ya era nullable, por lo que no consume espacio significativo.

- **[Riesgo] Tests del Worker que construyen mocks de `order` con `externalOrderNumber`** → Requieren actualización manual. El ticket los identifica explícitamente en §8.4.

## Migration Plan

1. No hay migración de BD. El deploy es un cambio solo de código.
2. Ejecutar `pnpm build` en todos los workspaces antes del deploy.
3. Ejecutar `db:seed` para actualizar los pedidos del seed con los nuevos `externalOrderId`.
4. Rollback: revertir el commit. `externalOrderNumber` sigue en BD; no hay cambio destructivo.

## Open Questions

- Ninguna. El TICKET.md cubre todas las decisiones de diseño con suficiente detalle.
