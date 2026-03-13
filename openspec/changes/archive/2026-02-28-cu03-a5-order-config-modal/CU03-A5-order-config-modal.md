# CU03-A5 — Modal de configuración del pedido simulado

**App**: `apps/web-admin` (Next.js 16 — componentes cliente)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU03-A3 completado (DTO extendido), CU03-A4 completado (estructura de ruta y `SimulationPage`)

---

## Historia de Usuario

**Como** administrador del Dashboard Admin,  
**quiero** configurar visualmente los parámetros de una compra simulada mediante un modal con campos condicionales,  
**para** poder probar cualquier sub-journey de Adresles sin necesidad de escribir JSON manualmente.

---

## Descripción funcional

Al pulsar "Nueva Simulación" o "Cambiar pedido" se abre un **Dialog** (Shadcn) con los campos en este orden:

### Campos del modal (en orden)

**1. Tienda** *(obligatorio, select)*  
Desplegable con todas las tiendas de la DB. Muestra nombre de tienda + nombre del eCommerce. No permite continuar sin seleccionar.

**2. Modo** *(toggle)*  
Dos botones: `ADRESLES` / `TRADICIONAL`. Por defecto: `ADRESLES`.

**3. Comprador**  
Combobox de búsqueda (Shadcn `Popover` + `Command`). Al escribir filtra por nombre o teléfono sobre los usuarios de la DB. Al seleccionar un usuario:
- Los campos nombre, apellidos y teléfono se autocompletan y se marcan como readonly.
- Aparece un badge debajo:
  - Usuario registrado en Adresles: badge verde `Registrado Adresles · N dirección(es)`
  - Usuario no registrado: badge gris `No Registrado Adresles · 0 direcciones`
- Un botón/enlace "Introducir manualmente" limpia la selección y permite rellenar los campos a mano (sin badge).

Si se rellena manualmente: campos nombre, apellidos y teléfono editables.

**4. Dirección** *(solo visible si Modo = TRADICIONAL)*  
Campos al estilo eCommerce: **Dirección** (texto libre, obligatorio), **Dirección 2** (texto libre, opcional — piso, puerta, bloque, escalera u otra info), **C.P.**, **Ciudad**, **Provincia** (opcional), **País**.  
El `street` del payload = Dirección + Dirección 2 (sin normalizar). `full_address` = street + C.P. + Ciudad + Provincia + País.  
Botón **"Dirección aleatoria"** → rellena los campos con una de las 20 direcciones ficticias del catálogo (ver sección de catálogos).

**5. ¿Es regalo?** *(toggle, por defecto desactivado)*  
Si activado, aparece sección **Destinatario del regalo** con el mismo combobox que el Comprador (búsqueda en DB o entrada manual con los mismos badges).

**6. Parámetros simulados del eCommerce** *(solo visible si Modo = ADRESLES)*  
- Toggle: **¿El comprador está registrado en el eCommerce?** (por defecto: desactivado)  
  - Si activado: Toggle: **¿Tiene dirección guardada en el eCommerce?** (por defecto: desactivado)  
    - Si activado: campos de dirección (Dirección, Dirección 2, CP, Ciudad, Provincia, País) + botón **"Dirección aleatoria"** (mismo catálogo de 20 ficticias).

**7. Productos**  
Botón **"Productos aleatorios"** → selecciona aleatoriamente una de las 20 compras ficticias del catálogo.  
Bajo el botón: tabla editable con los ítems seleccionados (nombre, cantidad, precio).  
Campo **Moneda** (texto, por defecto `EUR`).  
El importe total se calcula automáticamente (suma de `cantidad × precio` de cada ítem).

Botón **"Simular Compra"** (deshabilitado hasta que Tienda y al menos un campo de Comprador estén rellenos):
- Llama a `POST /api/mock/orders` con el payload construido
- Cierra el modal
- Notifica a `SimulationPage` con `{ conversationId, orderId, summary }`

---

## Catálogos de datos ficticios

### 20 direcciones ficticias

Distintas a las de la seed. Estructura de dos líneas al estilo eCommerce (Dirección + Dirección 2). La variedad refleja la realidad: algunos usuarios ponen todo en la primera línea, otros separan piso/puerta en la segunda. Se definen como constante en `apps/web-admin/src/lib/simulate-data.ts`:

```typescript
// line1: dirección principal (calle + número, o todo junto)
// line2: información adicional opcional (piso, puerta, bloque, escalera)
export const FAKE_ADDRESSES = [
  { line1: 'Calle Atocha 34', line2: '2º B', postalCode: '28012', city: 'Madrid', province: 'Madrid', country: 'ES' },
  { line1: 'Calle Pelayo 12, 4º A', line2: '', postalCode: '08010', city: 'Barcelona', province: 'Barcelona', country: 'ES' },
  { line1: 'Avenida del Puerto 7', line2: '', postalCode: '46023', city: 'Valencia', province: 'Valencia', country: 'ES' },
  { line1: 'Calle Betis 22', line2: 'Piso 1', postalCode: '41010', city: 'Sevilla', province: 'Sevilla', country: 'ES' },
  { line1: 'Calle Corrida 5 3ºC', line2: '', postalCode: '33201', city: 'Gijón', province: 'Asturias', country: 'ES' },
  { line1: 'Paseo de la Castellana 100', line2: 'Planta 8', postalCode: '28046', city: 'Madrid', province: 'Madrid', country: 'ES' },
  { line1: 'Rambla de Catalunya 78, 2º', line2: '', postalCode: '08008', city: 'Barcelona', province: 'Barcelona', country: 'ES' },
  { line1: 'Calle San Vicente Mártir 15', line2: '', postalCode: '46002', city: 'Valencia', province: 'Valencia', country: 'ES' },
  { line1: 'Avenida de la Constitución 3', line2: '1º izquierda', postalCode: '41004', city: 'Sevilla', province: 'Sevilla', country: 'ES' },
  { line1: 'Calle Larios 9, Apto 4', line2: '', postalCode: '29015', city: 'Málaga', province: 'Málaga', country: 'ES' },
  { line1: 'Gran Vía 45', line2: '5º dcha', postalCode: '48011', city: 'Bilbao', province: 'Vizcaya', country: 'ES' },
  { line1: 'Calle San Telmo 2', line2: 'Esc. B, 2º D', postalCode: '20003', city: 'San Sebastián', province: 'Gipuzkoa', country: 'ES' },
  { line1: 'Calle Real 18', line2: '', postalCode: '15001', city: 'A Coruña', province: 'A Coruña', country: 'ES' },
  { line1: 'Calle del Carmen 7, 3ºA', line2: '', postalCode: '30001', city: 'Murcia', province: 'Murcia', country: 'ES' },
  { line1: 'Calle Núñez de Balboa 55', line2: '', postalCode: '28001', city: 'Madrid', province: 'Madrid', country: 'ES' },
  { line1: 'Carrer de Balmes 120', line2: 'Piso 6, puerta 2', postalCode: '08008', city: 'Barcelona', province: 'Barcelona', country: 'ES' },
  { line1: 'Avenida de Aragón 30 4º', line2: '', postalCode: '50013', city: 'Zaragoza', province: 'Zaragoza', country: 'ES' },
  { line1: 'Calle Ancha 10', line2: '1º B', postalCode: '11001', city: 'Cádiz', province: 'Cádiz', country: 'ES' },
  { line1: 'Calle Covadonga 6', line2: '', postalCode: '33002', city: 'Oviedo', province: 'Asturias', country: 'ES' },
  { line1: 'Calle Mayor 44, 2º izq', line2: '', postalCode: '31001', city: 'Pamplona', province: 'Navarra', country: 'ES' },
] as const;

export function getRandomAddress() {
  return FAKE_ADDRESSES[Math.floor(Math.random() * FAKE_ADDRESSES.length)];
}
```

### 20 compras ficticias

```typescript
export const FAKE_ORDERS = [
  { items: [{ name: 'Vestido floral manga corta', quantity: 1, price: 59.99 }], total: 59.99, currency: 'EUR' },
  { items: [{ name: 'Zapatillas running Adidas', quantity: 1, price: 89.95 }], total: 89.95, currency: 'EUR' },
  { items: [{ name: 'Camiseta algodón orgánico', quantity: 2, price: 24.50 }], total: 49.00, currency: 'EUR' },
  { items: [{ name: 'Auriculares inalámbricos Sony', quantity: 1, price: 149.00 }], total: 149.00, currency: 'EUR' },
  { items: [{ name: 'Libro "El nombre del viento"', quantity: 1, price: 18.90 }], total: 18.90, currency: 'EUR' },
  { items: [{ name: 'Pantalón vaquero slim fit', quantity: 1, price: 69.99 }, { name: 'Cinturón de cuero', quantity: 1, price: 29.99 }], total: 99.98, currency: 'EUR' },
  { items: [{ name: 'Smartwatch Fitbit Sense', quantity: 1, price: 249.00 }], total: 249.00, currency: 'EUR' },
  { items: [{ name: 'Perfume Chanel N°5 50ml', quantity: 1, price: 119.00 }], total: 119.00, currency: 'EUR' },
  { items: [{ name: 'Funda nórdica 150x200cm', quantity: 1, price: 45.00 }, { name: 'Almohada viscoelástica', quantity: 2, price: 35.00 }], total: 115.00, currency: 'EUR' },
  { items: [{ name: 'Tablet Samsung Galaxy Tab A8', quantity: 1, price: 299.00 }], total: 299.00, currency: 'EUR' },
  { items: [{ name: 'Bolso de mano piel', quantity: 1, price: 135.00 }], total: 135.00, currency: 'EUR' },
  { items: [{ name: 'Cafetera Nespresso Vertuo', quantity: 1, price: 129.95 }], total: 129.95, currency: 'EUR' },
  { items: [{ name: 'Jersey de lana merino', quantity: 1, price: 79.00 }], total: 79.00, currency: 'EUR' },
  { items: [{ name: 'Kit manicura profesional', quantity: 1, price: 34.99 }], total: 34.99, currency: 'EUR' },
  { items: [{ name: 'Silla de oficina ergonómica', quantity: 1, price: 349.00 }], total: 349.00, currency: 'EUR' },
  { items: [{ name: 'Tenis Nike Air Max 90', quantity: 1, price: 109.95 }], total: 109.95, currency: 'EUR' },
  { items: [{ name: 'Set pintura acuarela 36 colores', quantity: 1, price: 42.50 }, { name: 'Block de dibujo A3', quantity: 2, price: 12.00 }], total: 66.50, currency: 'EUR' },
  { items: [{ name: 'Bicicleta estática plegable', quantity: 1, price: 420.00 }], total: 420.00, currency: 'EUR' },
  { items: [{ name: 'Cámara instantánea Fujifilm Instax', quantity: 1, price: 89.00 }, { name: 'Película Instax (20 fotos)', quantity: 2, price: 14.50 }], total: 118.00, currency: 'EUR' },
  { items: [{ name: 'Juego de sábanas percal 180cm', quantity: 1, price: 62.00 }], total: 62.00, currency: 'EUR' },
] as const;

export function getRandomOrder() {
  return FAKE_ORDERS[Math.floor(Math.random() * FAKE_ORDERS.length)];
}
```

---

## Arquitectura de la solución

### `apps/web-admin/src/lib/simulate-data.ts` (nuevo)

Contiene las constantes `FAKE_ADDRESSES`, `FAKE_ORDERS` y las funciones `getRandomAddress()`, `getRandomOrder()`.

### `apps/web-admin/src/components/simulate/user-combobox.tsx` (nuevo)

Componente reutilizable para seleccionar usuario de la DB o introducir datos manualmente:

```typescript
'use client';

interface UserComboboxProps {
  users: AdminUser[];
  label: string;                        // "Comprador" o "Destinatario del regalo"
  value: UserComboboxValue | null;
  onChange: (v: UserComboboxValue | null) => void;
}

interface UserComboboxValue {
  existingUserId?: string;              // si seleccionado de DB
  firstName: string;
  lastName: string;
  phone: string;
  isRegistered?: boolean;
  addressCount?: number;
}
```

El combobox filtra usuarios por `firstName`, `lastName` o teléfono. Al seleccionar, establece `existingUserId` y bloquea los campos de texto. Un botón "Introducir manualmente" limpia la selección y permite editar.

### `apps/web-admin/src/components/simulate/order-config-modal.tsx` (nuevo)

Dialog de Shadcn que orquesta todos los campos. Props:

```typescript
interface OrderConfigModalProps {
  open: boolean;
  onClose: () => void;
  stores: SimulateStore[];
  users: AdminUser[];
  onConversationStarted: (data: {
    conversationId: string;
    orderId: string;
    summary: string;
  }) => void;
}
```

El componente mantiene el estado local del formulario y construye el payload para `POST /api/mock/orders` al pulsar "Simular Compra":

```typescript
const payload: CreateMockOrderPayload = {
  store: { name: selectedStore.name, url: selectedStore.url },
  external_order_id: `SIM-${Date.now()}`,
  buyer: { first_name: buyer.firstName, last_name: buyer.lastName, phone: buyer.phone },
  mode: mode === 'ADRESLES' ? 'adresles' : 'tradicional',
  address: mode === 'TRADICIONAL' ? deliveryAddress : undefined,
  buyer_registered_ecommerce: mode === 'ADRESLES' ? buyerRegisteredEcommerce : undefined,
  buyer_ecommerce_address: (mode === 'ADRESLES' && buyerRegisteredEcommerce && buyerHasEcommerceAddress)
    ? ecommerceAddress : undefined,
  // Nota: siempre enviar gift_recipient cuando isGift=true, ya sea usuario DB o manual;
  // la presencia del objeto implica is_gift en el backend (no hay campo is_gift separado).
  gift_recipient: isGift && giftRecipient
    ? { first_name: giftRecipient.firstName, last_name: giftRecipient.lastName, phone: giftRecipient.phone }
    : undefined,
  items: orderItems,
  total_amount: orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
  currency: currency,
};
```

**Construcción del campo `summary`** (para `onConversationStarted`):

```typescript
const summary = `${selectedStore.name} · ${buyer.firstName} ${buyer.lastName} · ${payload.total_amount.toFixed(2)} ${currency}`;
```

**Mapeo de `FAKE_ADDRESSES` al payload de dirección** — `toAddressPayload()` en `simulate-data.ts`:

```typescript
export function toAddressPayload(a: FakeAddress): NonNullable<CreateMockOrderPayload['address']> {
  const streetParts = [a.line1, a.line2].filter(Boolean);
  const street = streetParts.join(', ');           // Dirección + Dirección 2, sin normalizar
  const fullAddress = [street, a.postalCode, a.city, a.province, a.country]
    .filter(Boolean)
    .join(', ');
  return { full_address: fullAddress, street, postal_code: a.postalCode,
           city: a.city, province: a.province || undefined, country: a.country };
}
```

**`buildAddressPayload()` en `order-config-modal.tsx`** aplica el mismo mapeo para direcciones introducidas manualmente en el modal (`AddressState = { line1, line2, postalCode, city, province, country }`).

**Manejo de errores y estado de carga:**

- Durante la llamada a `startSimulation()`, deshabilitar el botón "Simular Compra" y mostrar un spinner (Shadcn `Loader2`).
- Si la llamada falla (cualquier excepción), mostrar un toast destructivo con `useToast()`: `"Error al crear la simulación. Inténtalo de nuevo."`. El modal permanece abierto.
- Si la llamada tiene éxito, llamar a `onConversationStarted({ conversationId, orderId, summary })` y cerrar el modal.

**Formato del teléfono al poblar `UserComboboxValue` desde un `AdminUser`:**

```typescript
// Usar siempre e164 ("+34612345678"), que es el formato que acepta el backend.
phone: adminUser.phone?.e164 ?? '',
```

### `apps/web-admin/src/types/api.ts` — tipos nuevos a añadir

```typescript
export interface CreateMockOrderPayload {
  store: { name: string; url: string };
  external_order_id: string;
  buyer: { first_name: string; last_name: string; phone: string; email?: string };
  mode: 'adresles' | 'tradicional';
  address?: {
    full_address: string; street: string; number?: string;
    floor?: string; door?: string; postal_code: string;
    city: string; province?: string; country: string;
  };
  buyer_registered_ecommerce?: boolean;
  buyer_ecommerce_address?: {
    full_address: string; street: string; number?: string;
    floor?: string; postal_code: string; city: string;
    province?: string; country: string;
  };
  gift_recipient?: { first_name: string; last_name: string; phone: string };
  items?: Array<{ name: string; quantity: number; price: number }>;
  total_amount: number;
  currency: string;
}

export interface StartSimulationResult {
  order_id: string;
  conversation_id: string;
}
```

> **Patrón del proyecto**: los tipos van en `types/api.ts`, las funciones en `lib/api.ts`.

### `apps/web-admin/src/lib/api.ts` — dos cambios

**1. Actualizar `apiFetch` para soportar POST:**

```typescript
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}
```

**2. Añadir `startSimulation()`:**

```typescript
import type { ..., CreateMockOrderPayload, StartSimulationResult } from '@/types/api';

export async function startSimulation(
  payload: CreateMockOrderPayload,
): Promise<StartSimulationResult> {
  return apiFetch<StartSimulationResult>('/api/mock/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
```

---

## Lista de tareas

- [ ] Crear `apps/web-admin/src/lib/simulate-data.ts` con los 20 FAKE_ADDRESSES, 20 FAKE_ORDERS, funciones helper `getRandomAddress()`, `getRandomOrder()` y helper `toAddressPayload()`
- [ ] Añadir tipos `CreateMockOrderPayload` y `StartSimulationResult` en `apps/web-admin/src/types/api.ts`
- [ ] Actualizar `apiFetch` en `apps/web-admin/src/lib/api.ts` para aceptar segundo parámetro opcional `init?: RequestInit` y añadir función `startSimulation()`
- [ ] Crear `apps/web-admin/src/components/simulate/user-combobox.tsx` con búsqueda (por `firstName`, `lastName` o `phone.e164`), selección de usuario DB (usa `phone.e164` al poblar), entrada manual y badges
- [ ] Crear `apps/web-admin/src/components/simulate/order-config-modal.tsx` con todos los campos en el orden especificado
- [ ] Implementar lógica de campos condicionales: Dirección (solo TRADICIONAL), Parámetros eCommerce (solo ADRESLES), sección destinatario (solo si ¿Es regalo? activado)
- [ ] Implementar botones "Dirección aleatoria" en sección Dirección (TRADICIONAL) y en sección Parámetros eCommerce (ambos usan `toAddressPayload(getRandomAddress())`)
- [ ] Implementar botón "Productos aleatorios" y tabla editable de ítems con cálculo de total automático
- [ ] Implementar botón "Simular Compra": deshabilitar + spinner durante la llamada, construir payload completo, llamar `startSimulation()`, en éxito llamar `onConversationStarted` con `summary` construido según la fórmula documentada; en error mostrar toast destructivo y mantener modal abierto
- [ ] Integrar `OrderConfigModal` en `SimulationPage` (ya tiene el placeholder de CU03-A4; el contrato de props ya está fijado)
- [ ] Verificar validaciones de formulario: Tienda obligatoria, Comprador con al menos `firstName` y `phone` (no vacíos), campos `full_address`/`street`/`postal_code`/`city`/`country` obligatorios si modo TRADICIONAL y si `buyerHasEcommerceAddress = true`
