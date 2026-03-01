## 1. Tipos y helpers de datos

- [x] 1.1 Añadir `CreateMockOrderPayload` y `StartSimulationResult` en `apps/web-admin/src/types/api.ts`
- [x] 1.2 Crear `apps/web-admin/src/lib/simulate-data.ts` con `FAKE_ADDRESSES` (20 entradas con estructura `line1`/`line2` al estilo eCommerce), `FAKE_ORDERS` (20 entradas), `getRandomAddress()`, `getRandomOrder()` y `toAddressPayload()` (street = line1 + line2, sin normalizar)

## 2. Actualización de lib/api.ts

- [x] 2.1 Actualizar `apiFetch` para aceptar segundo parámetro opcional `init?: RequestInit` (spread sobre `cache: 'no-store'`)
- [x] 2.2 Añadir función `startSimulation(payload: CreateMockOrderPayload): Promise<StartSimulationResult>` que llama a `POST /api/mock/orders`

## 3. Componente UserCombobox

- [x] 3.1 Crear `apps/web-admin/src/components/simulate/user-combobox.tsx` con la interfaz `UserComboboxProps` y `UserComboboxValue`
- [x] 3.2 Implementar búsqueda por `firstName`, `lastName` o `phone.e164` usando Shadcn `Popover` + `Command`
- [x] 3.3 Al seleccionar usuario de DB: rellenar campos con `phone.e164`, marcar como `readonly`, mostrar badge según `isRegistered` y `_count.addresses`
- [x] 3.4 Implementar botón "Introducir manualmente": limpiar selección, campos editables, sin badge

## 4. Componente OrderConfigModal — estructura y campos base

- [x] 4.1 Reemplazar placeholder en `apps/web-admin/src/components/simulate/order-config-modal.tsx` con el Dialog de Shadcn completo
- [x] 4.2 Implementar campo Tienda: `Select` con opciones `"${store.name} — ${store.ecommerceName}"`
- [x] 4.3 Implementar toggle Modo: dos botones ADRESLES / TRADICIONAL, por defecto ADRESLES
- [x] 4.4 Integrar `UserCombobox` para el campo Comprador

## 5. Secciones condicionales del modal

- [x] 5.1 Sección Dirección (solo TRADICIONAL): campos Dirección (line1, obligatorio), Dirección 2 (line2, opcional), C.P., Ciudad, Provincia, País + botón "Dirección aleatoria" con `getRandomAddress()`; payload construido con `buildAddressPayload()` (street = line1 + line2)
- [x] 5.2 Toggle "¿Es regalo?" + sección Destinatario del regalo con `UserCombobox` idéntico al Comprador
- [x] 5.3 Sección Parámetros eCommerce (solo ADRESLES): toggle `buyerRegisteredEcommerce` → toggle `buyerHasEcommerceAddress` → campos de dirección eCommerce + botón "Dirección aleatoria"

## 6. Sección Productos

- [x] 6.1 Implementar botón "Productos aleatorios" que carga `getRandomOrder().items` en el estado
- [x] 6.2 Implementar tabla editable de ítems (nombre, cantidad, precio) con posibilidad de editar cada celda
- [x] 6.3 Implementar cálculo automático del total (`sum(quantity × price)`) y campo Moneda (por defecto `EUR`)

## 7. Submit y validaciones

- [x] 7.1 Implementar lógica de habilitación del botón "Simular Compra": Tienda seleccionada + `firstName` y `phone` del comprador no vacíos + campos de dirección si modo TRADICIONAL o `buyerHasEcommerceAddress`
- [x] 7.2 Implementar construcción del payload `CreateMockOrderPayload` con todos los campos, incluyendo `gift_recipient` siempre que `isGift = true`
- [x] 7.3 Implementar estado de carga: deshabilitar botón + spinner `Loader2` durante la llamada a `startSimulation()`
- [x] 7.4 En éxito: llamar `onConversationStarted({ conversationId: res.conversation_id, orderId: res.order_id, summary })` con `summary = "${storeName} · ${firstName} ${lastName} · ${total.toFixed(2)} ${currency}"` y cerrar modal
- [x] 7.5 En error: mostrar toast destructivo "Error al crear la simulación. Inténtalo de nuevo." y mantener modal abierto

## 8. Integración y verificación

- [x] 8.1 Verificar que `OrderConfigModal` integrado en `SimulationPage` (placeholder CU03-A4) abre y cierra correctamente
- [x] 8.2 Verificar que el flujo completo (abrir modal → configurar pedido → simular) actualiza `activeConversation` en `SimulationPage` y muestra el summary en `OrderSummaryBar`
- [x] 8.3 Verificar ausencia de errores de TypeScript (`tsc --noEmit`) en `apps/web-admin`
