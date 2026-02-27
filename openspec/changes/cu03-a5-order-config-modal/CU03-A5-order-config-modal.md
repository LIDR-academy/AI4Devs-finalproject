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
Campos: calle, número, piso/puerta, código postal, ciudad, provincia, país.  
Botón **"Dirección aleatoria"** → rellena los campos con una de las 20 direcciones ficticias del catálogo (ver sección de catálogos).

**5. ¿Es regalo?** *(toggle, por defecto desactivado)*  
Si activado, aparece sección **Destinatario del regalo** con el mismo combobox que el Comprador (búsqueda en DB o entrada manual con los mismos badges).

**6. Parámetros simulados del eCommerce** *(solo visible si Modo = ADRESLES)*  
- Toggle: **¿El comprador está registrado en el eCommerce?** (por defecto: desactivado)  
  - Si activado: Toggle: **¿Tiene dirección guardada en el eCommerce?** (por defecto: desactivado)  
    - Si activado: campos de dirección (calle, número, piso/puerta, CP, ciudad, país) + botón **"Dirección aleatoria"** (mismo catálogo de 20 ficticias).

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

Distintas a las de la seed. Se definen como constante en `apps/web-admin/src/lib/simulate-data.ts`:

```typescript
export const FAKE_ADDRESSES = [
  { street: 'Calle Atocha', number: '34', floor: '2', door: 'B', postalCode: '28012', city: 'Madrid', province: 'Madrid', country: 'ES', fullAddress: 'Calle Atocha 34, 2º B, 28012 Madrid' },
  { street: 'Calle Pelayo', number: '12', floor: '4', door: 'A', postalCode: '08010', city: 'Barcelona', province: 'Barcelona', country: 'ES', fullAddress: 'Calle Pelayo 12, 4º A, 08010 Barcelona' },
  { street: 'Avenida del Puerto', number: '7', postalCode: '46023', city: 'Valencia', province: 'Valencia', country: 'ES', fullAddress: 'Avenida del Puerto 7, 46023 Valencia' },
  { street: 'Calle Betis', number: '22', floor: '1', postalCode: '41010', city: 'Sevilla', province: 'Sevilla', country: 'ES', fullAddress: 'Calle Betis 22, 1º, 41010 Sevilla' },
  { street: 'Calle Corrida', number: '5', floor: '3', door: 'C', postalCode: '33201', city: 'Gijón', province: 'Asturias', country: 'ES', fullAddress: 'Calle Corrida 5, 3º C, 33201 Gijón' },
  { street: 'Paseo de la Castellana', number: '100', floor: '8', postalCode: '28046', city: 'Madrid', province: 'Madrid', country: 'ES', fullAddress: 'Paseo de la Castellana 100, 8º, 28046 Madrid' },
  { street: 'Rambla de Catalunya', number: '78', floor: '2', postalCode: '08008', city: 'Barcelona', province: 'Barcelona', country: 'ES', fullAddress: 'Rambla de Catalunya 78, 2º, 08008 Barcelona' },
  { street: 'Calle San Vicente Mártir', number: '15', postalCode: '46002', city: 'Valencia', province: 'Valencia', country: 'ES', fullAddress: 'Calle San Vicente Mártir 15, 46002 Valencia' },
  { street: 'Avenida de la Constitución', number: '3', floor: '1', postalCode: '41004', city: 'Sevilla', province: 'Sevilla', country: 'ES', fullAddress: 'Avenida de la Constitución 3, 1º, 41004 Sevilla' },
  { street: 'Calle Larios', number: '9', postalCode: '29015', city: 'Málaga', province: 'Málaga', country: 'ES', fullAddress: 'Calle Larios 9, 29015 Málaga' },
  { street: 'Gran Vía de Don Diego López de Haro', number: '45', floor: '5', postalCode: '48011', city: 'Bilbao', province: 'Vizcaya', country: 'ES', fullAddress: 'Gran Vía 45, 5º, 48011 Bilbao' },
  { street: 'Calle San Telmo', number: '2', floor: '2', door: 'D', postalCode: '20003', city: 'San Sebastián', province: 'Gipuzkoa', country: 'ES', fullAddress: 'Calle San Telmo 2, 2º D, 20003 San Sebastián' },
  { street: 'Calle Real', number: '18', postalCode: '15001', city: 'A Coruña', province: 'A Coruña', country: 'ES', fullAddress: 'Calle Real 18, 15001 A Coruña' },
  { street: 'Calle del Carmen', number: '7', floor: '3', door: 'A', postalCode: '30001', city: 'Murcia', province: 'Murcia', country: 'ES', fullAddress: 'Calle del Carmen 7, 3º A, 30001 Murcia' },
  { street: 'Calle Núñez de Balboa', number: '55', postalCode: '28001', city: 'Madrid', province: 'Madrid', country: 'ES', fullAddress: 'Calle Núñez de Balboa 55, 28001 Madrid' },
  { street: 'Carrer de Balmes', number: '120', floor: '6', postalCode: '08008', city: 'Barcelona', province: 'Barcelona', country: 'ES', fullAddress: 'Carrer de Balmes 120, 6º, 08008 Barcelona' },
  { street: 'Avenida de Aragón', number: '30', floor: '4', postalCode: '50013', city: 'Zaragoza', province: 'Zaragoza', country: 'ES', fullAddress: 'Avenida de Aragón 30, 4º, 50013 Zaragoza' },
  { street: 'Calle Ancha', number: '10', floor: '1', door: 'B', postalCode: '11001', city: 'Cádiz', province: 'Cádiz', country: 'ES', fullAddress: 'Calle Ancha 10, 1º B, 11001 Cádiz' },
  { street: 'Calle Covadonga', number: '6', postalCode: '33002', city: 'Oviedo', province: 'Asturias', country: 'ES', fullAddress: 'Calle Covadonga 6, 33002 Oviedo' },
  { street: 'Calle Mayor', number: '44', floor: '2', postalCode: '31001', city: 'Pamplona', province: 'Navarra', country: 'ES', fullAddress: 'Calle Mayor 44, 2º, 31001 Pamplona' },
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
  gift_recipient: isGift && giftRecipient?.existingUserId === undefined ? {
    first_name: giftRecipient.firstName,
    last_name: giftRecipient.lastName,
    phone: giftRecipient.phone,
  } : undefined,
  items: orderItems,
  total_amount: orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
  currency: currency,
};
```

### `apps/web-admin/src/lib/api.ts` — función `startSimulation()`

```typescript
export interface CreateMockOrderPayload {
  store: { name: string; url: string };
  external_order_id: string;
  buyer: { first_name: string; last_name: string; phone: string; email?: string };
  mode: 'adresles' | 'tradicional';
  address?: { full_address: string; street: string; number?: string; floor?: string; door?: string; postal_code: string; city: string; province?: string; country: string };
  buyer_registered_ecommerce?: boolean;
  buyer_ecommerce_address?: { full_address: string; street: string; number?: string; floor?: string; postal_code: string; city: string; country: string };
  gift_recipient?: { first_name: string; last_name: string; phone: string };
  items?: Array<{ name: string; quantity: number; price: number }>;
  total_amount: number;
  currency: string;
}

export interface StartSimulationResult {
  order_id: string;
  conversation_id: string;
}

export async function startSimulation(payload: CreateMockOrderPayload): Promise<StartSimulationResult> {
  return apiFetch<StartSimulationResult>('/api/mock/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
```

---

## Lista de tareas

- [ ] Crear `apps/web-admin/src/lib/simulate-data.ts` con los 20 FAKE_ADDRESSES, 20 FAKE_ORDERS y funciones helper `getRandomAddress()` y `getRandomOrder()`
- [ ] Crear `apps/web-admin/src/components/simulate/user-combobox.tsx` con búsqueda, selección de usuario DB, entrada manual y badges
- [ ] Crear `apps/web-admin/src/components/simulate/order-config-modal.tsx` con todos los campos en el orden especificado
- [ ] Implementar lógica de campos condicionales: Dirección (solo TRADICIONAL), Parámetros eCommerce (solo ADRESLES), sección destinatario (solo si ¿Es regalo? activado)
- [ ] Implementar botones "Dirección aleatoria" en sección Dirección (TRADICIONAL) y en sección Parámetros eCommerce
- [ ] Implementar botón "Productos aleatorios" y tabla editable de ítems con cálculo de total automático
- [ ] Añadir tipos `CreateMockOrderPayload` y `StartSimulationResult` en `apps/web-admin/src/types/api.ts`
- [ ] Implementar función `startSimulation()` en `apps/web-admin/src/lib/api.ts`
- [ ] Integrar `OrderConfigModal` en `SimulationPage` (ya tiene el placeholder de CU03-A4)
- [ ] Verificar que el botón "Simular Compra" llama a `startSimulation()`, cierra el modal y notifica a `SimulationPage` con `conversationId`, `orderId` y el resumen del pedido
- [ ] Verificar que el formulario valida: Tienda obligatoria, Comprador con al menos nombre y teléfono, campos de Dirección obligatorios si modo TRADICIONAL
