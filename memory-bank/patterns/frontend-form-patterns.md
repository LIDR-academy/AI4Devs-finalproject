# Patrones de Formularios Frontend (web-admin)

> **Origen**: CU03-A5 — `OrderConfigModal` + `UserCombobox`  
> **Última actualización**: 2026-03-16

---

## 1. Formulario-Modal con `useState` Local

### Cuándo usar

Formularios de una sola página lógica que:
- Tienen secciones condicionales controladas por toggles o selects
- No necesitan validación compleja (p.ej. schemas Zod o Yup)
- Son específicos de una pantalla (estado no compartido)

### Patrón

```typescript
// Estado plano con tipos primitivos por sección
const [storeId, setStoreId] = useState('');
const [mode, setMode] = useState<'ADRESLES' | 'TRADICIONAL'>('ADRESLES');
const [address, setAddress] = useState<AddressState>(EMPTY_ADDRESS);
const [isGift, setIsGift] = useState(false);
const [isLoading, setIsLoading] = useState(false);

// canSubmit derivado — sin función de validación separada
const canSubmit =
  storeId !== '' &&
  buyer.firstName.trim() !== '' &&
  (mode === 'ADRESLES' || (address.line1.trim() !== '' && address.postalCode.trim() !== ''));

// Submit con spinner inline en botón
async function handleSubmit() {
  setIsLoading(true);
  try {
    const result = await startSimulation(buildPayload());
    onSuccess(result);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Error desconocido');
  } finally {
    setIsLoading(false);
  }
}
```

```tsx
<Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
  {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
  Iniciar simulación
</Button>
```

### Convenciones en web-admin

- **Un `useState` por sección lógica** (no un objeto gigante de formulario)
- **`canSubmit` derivado** de los campos obligatorios — no necesita `useEffect`
- **Payload construido** en `handleSubmit()` — no en cada `onChange`
- **Toast de error** con `sonner` (`toast.error()`); no alertas nativas
- **`isLoading` local** — spinner inline en el botón de submit, que se deshabilita

---

## 2. Estado Derivado vs. Estado Redundante en Componentes Controlados

### Problema

```typescript
// ❌ Mal: manual puede desincronizarse de value
const [manual, setManual] = useState(false);
const isReadonly = manual ? false : !!value?.existingUserId;
```

Si el padre actualiza `value` desde fuera (p.ej. seleccionando un usuario), `manual` queda en `true` y el componente no refleja el estado real.

### Solución

```typescript
// ✅ Bien: isReadonly se deriva directamente de la prop
const isFromDb = !!value?.existingUserId;
const isReadonly = isFromDb;

function handleManualEntry() {
  // Limpiar existingUserId hace que isFromDb pase a false, liberando los campos
  onChange({ firstName: value?.firstName ?? '', lastName: value?.lastName ?? '', phone: value?.phone ?? '' });
}
```

### Regla

> Si una pieza de estado se puede derivar de las props, **no la almacenes localmente**. El estado local solo existe cuando necesitas un valor que no puede calcularse desde props/context.

---

## 3. Mapeo de Dirección eCommerce → Payload de Backend

### Contexto del Dominio

El frontend usa el modelo de dos líneas estándar en eCommerce. El backend almacena campos desglosados en Supabase (`street`, `postal_code`, `city`, `province`, `country`) y genera `full_address`.

### Estructura UI (`AddressState`)

```typescript
interface AddressState {
  line1: string;       // Obligatorio: "Calle Atocha 34" o "Calle Atocha 34, 2º B"
  line2: string;       // Opcional: piso, puerta, bloque, escalera
  postalCode: string;  // Obligatorio
  city: string;        // Obligatorio
  province: string;    // Opcional
  country: string;     // Obligatorio (código ISO, p.ej. "ES")
}
```

### Función de Mapeo

```typescript
function buildAddressPayload(addr: AddressState) {
  const streetParts = [addr.line1, addr.line2].filter(Boolean);
  const street = streetParts.join(', ');
  const fullAddress = [street, addr.postalCode, addr.city, addr.province, addr.country]
    .filter(Boolean)
    .join(', ');
  return {
    full_address: fullAddress,
    street,                                  // line1 + ", " + line2 sin normalizar
    postal_code: addr.postalCode,
    city: addr.city,
    province: addr.province || undefined,    // undefined si vacío (no incluir en payload)
    country: addr.country,
  };
}
```

### Decisión de No-Normalización

- `street = line1 + ", " + line2` **sin normalizar** — incluye número, piso, puerta y cualquier información adicional
- La normalización (separar número de calle, piso, puerta) se delegará a **Google Maps API** en una fase posterior
- En Adresles (backend), el campo "Dirección" de la UI rellena `street`; los campos `number`, `floor`, `door` del modelo se dejan vacíos hasta que haya normalización
- Catálogo de datos ficticios (`FAKE_ADDRESSES` en `simulate-data.ts`): refleja la variedad real de eCommerce — algunos usuarios meten todo en `line1`, otros usan `line2` para el piso/puerta

### Campos Obligatorios vs. Opcionales

| Campo UI | Backend | Obligatorio |
|----------|---------|-------------|
| Dirección (`line1`) | `street` (parte) | ✅ |
| Dirección 2 (`line2`) | `street` (parte, si existe) | ❌ |
| C.P. (`postalCode`) | `postal_code` | ✅ |
| Ciudad (`city`) | `city` | ✅ |
| Provincia (`province`) | `province` | ❌ |
| País (`country`) | `country` | ✅ |

---

## 4. Combobox Controlado con Búsqueda y Entrada Manual

### Patrón (`UserCombobox`)

```typescript
interface UserComboboxValue {
  existingUserId?: string;   // Presente = usuario de BD
  firstName: string;
  lastName: string;
  phone: string;
}
```

- Si `existingUserId` está presente → campos en **modo readonly** (usuario de BD seleccionado)
- Si `existingUserId` está ausente → campos **editables** (entrada manual)
- Para pasar a manual: `onChange({ firstName, lastName, phone })` — sin `existingUserId`
- Para volver a selección: seleccionar del desplegable — `onChange` incluye `existingUserId`

### Indicadores de Estado

Los badges en el desplegable usan el campo `status` del tipo `AdminUser`:

```tsx
<Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
  {user.status}
</Badge>
```

---

---

## 5. Parseo defensivo de timestamps de API en componentes de presentación

### Problema

Los datos que llegan de DynamoDB vía API REST pueden incluir ítems técnicos (ej. el item de estado `__state__` del Worker) que no tienen el campo `timestamp`. Si el componente hace `new Date(message.timestamp)` sin validar, obtiene `Invalid Date` y `date-fns format()` lanza `RangeError: Invalid time value`, crashando el componente.

### Solución: helper `safeTimeLabel`

```typescript
function safeTimeLabel(timestamp: string): string {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return isNaN(d.getTime()) ? '' : format(d, 'HH:mm');
}
```

### Regla de aplicación

> Todo componente de presentación que muestre una hora derivada de un campo `timestamp: string` de la API SHALL validar el valor antes de pasarlo a `date-fns format()`. La causa raíz (filtrar ítems inválidos en el backend) sigue siendo la solución correcta; este helper es una defensa adicional.

### Origen

CU03-A6 — `ChatBubble` crashaba con el item `__state__` de DynamoDB que llegaba sin `timestamp` antes de que el backend implementase el filtro.

- **Implementación**: `apps/web-admin/src/components/chat/chat-bubble.tsx:10-14`

---

---

## 6. Reset completo de estado con prop `key` en React

### Cuándo usar

Cuando un componente con estado complejo (`useState` múltiple) debe reiniciarse completamente al cambiar su "identidad" (ej. una conversación diferente, un pedido diferente, un usuario diferente).

### Problema

Si el padre pasa un nuevo `id` como prop pero el componente no se desmonta, todos los `useState` mantienen sus valores anteriores. Los `useEffect` con el `id` en sus deps se re-ejecutan, pero **los estados no se resetean**.

```typescript
// ❌ MAL — finalStatus, messages, etc. persisten al cambiar conversationId
<SimulationChat conversationId={activeConversation.conversationId} />
```

### Solución: prop `key` con el identificador de identidad

```typescript
// ✅ CORRECTO — React desmonta y remonta el componente al cambiar conversationId
<SimulationChat
  key={activeConversation.conversationId}
  conversationId={activeConversation.conversationId}
/>
```

Al cambiar `key`, React:
1. **Desmonta** el componente anterior → los `useEffect` cleanup se ejecutan (ej. cierra `EventSource`)
2. **Monta** un componente nuevo → todos los `useState` se inicializan desde cero

### Regla de aplicación

> Usar `key={entity.id}` siempre que un componente con estado interno complejo deba "empezar de cero" cuando cambia la entidad que representa. No confundir con el `key` de listas (`map`) que es para reconciliación.

### Origen

CU03-A6 — `SimulationChat` se reutilizaba entre simulaciones, lo que hacía que `finalStatus: 'ESCALATED'` de una conversación anterior contaminase la siguiente.

- **Implementación**: `apps/web-admin/src/components/simulate/simulation-page.tsx:40`

---

---

## 7. Lazy Initializer para Estado Pre-Rellenado en Modales

### Cuándo usar

Cuando un modal (o componente con estado complejo) debe abrirse con datos ya pre-rellenados (valores aleatorios, últimos valores usados, etc.) en lugar de un estado vacío.

### Problema

Usar `useState([])` inicializa el estado vacío y luego requiere lógica adicional (`useEffect` + `open` como dependencia, o un botón manual) para pre-rellenar. El `useEffect` es propenso a ciclos de renderizado si no se gestiona bien.

### Solución: Lazy Initializer

```typescript
// ❌ MAL: estado vacío + useEffect para pre-rellenar
const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
useEffect(() => { if (open) handleRandomProducts(); }, [open]);

// ✅ BIEN: lazy initializer calcula el valor inicial en el primer render
const [orderItems, setOrderItems] = useState<OrderItem[]>(() =>
  getRandomOrder().items.map((item) => ({ ...item })),
);
```

### Combinación con `handleReset()`

El lazy initializer solo se ejecuta en el primer render. Para que el estado se re-inicialice en cada apertura del modal (tras cierre y reapertura), el `handleReset()` debe replicar la misma lógica:

```typescript
function handleReset() {
  // ... otros campos ...
  // Regenera datos aleatorios en cada reset, igual que el lazy initializer
  setOrderItems(getRandomOrder().items.map((item) => ({ ...item })));
}
```

### Regla

> Si el modal cierra y reabre (vía `onClose()` + `handleReset()`), ambos puntos de inicialización — lazy initializer y `handleReset()` — deben ser consistentes.

### Origen

`simulate-modal-smart-defaults` — `OrderConfigModal` (`order-config-modal.tsx:79-81`, `207`)

---

## 8. Auto-Fill Condicional en Transiciones de Estado de Formulario

### Cuándo usar

Cuando un cambio de modo, toggle o switch debe pre-rellenar un campo con datos por defecto **solo si estaba vacío**, conservando cualquier dato que el usuario ya hubiera introducido.

### Problema

Auto-rellenar siempre sobreescribe el trabajo del usuario. No auto-rellenar nunca obliga a clicks manuales innecesarios. La solución es verificar si el campo está vacío antes de auto-rellenar.

### Patrón

```typescript
// Definición de "vacío" para un AddressState (campos obligatorios)
const isEmpty = !addr.line1 && !addr.postalCode && !addr.city && !addr.country;

// onClick de botón de modo o onCheckedChange de switch
onClick={() => {
  setMode('TRADICIONAL');
  const isEmpty =
    !deliveryAddress.line1 &&
    !deliveryAddress.postalCode &&
    !deliveryAddress.city &&
    !deliveryAddress.country;
  if (isEmpty) handleRandomAddress(setDeliveryAddress);
}}
```

```typescript
// Switch con tres casos: activar-vacío / activar-relleno / desactivar
onCheckedChange={(v) => {
  setBuyerHasEcommerceAddress(v);
  if (v) {
    const isEmpty = !ecommerceAddress.line1 && !ecommerceAddress.postalCode &&
                    !ecommerceAddress.city && !ecommerceAddress.country;
    if (isEmpty) handleRandomAddress(setEcommerceAddress);
    // Si no está vacío: se conservan los datos existentes (sin else)
  } else {
    setEcommerceAddress(EMPTY_ADDRESS); // desactivar siempre limpia
  }
}}
```

### Regla

> "Vacío" se define por los campos **obligatorios** del objeto, no por todos sus campos. Un campo con solo `line2` (opcional) relleno y los obligatorios vacíos sigue siendo "vacío" a efectos de auto-fill.

### Origen

`simulate-modal-smart-defaults` — `OrderConfigModal` (`order-config-modal.tsx:262-269`, `360-369`)

---

## 9. Filtro Local con Pills en Componente Combobox Reutilizable

### Cuándo usar

Cuando un combobox reutilizable en múltiples instancias necesita filtrar su lista por una categoría discreta (3-5 opciones), y cada instancia debe mantener su propio estado de filtro de forma independiente.

### Patrón

```typescript
// 1. Tipo de filtro y constante de opciones fuera del componente
type RegistrationFilter = 'all' | 'registered' | 'unregistered';

const REGISTRATION_PILLS: { value: RegistrationFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'registered', label: 'Adresles' },
  { value: 'unregistered', label: 'No Adresles' },
];

// 2. Estado local al componente (no prop del padre)
export function UserCombobox({ users, label, value, onChange }: UserComboboxProps) {
  const [registrationFilter, setRegistrationFilter] = useState<RegistrationFilter>('all');

  // 3. Array derivado sincrónico (sin useMemo para listas pequeñas)
  const filteredUsers = users.filter((user) => {
    if (registrationFilter === 'registered') return user.isRegistered;
    if (registrationFilter === 'unregistered') return !user.isRegistered;
    return true;
  });
  // ...
}
```

```tsx
{/* 4. Pills alineadas a la derecha del label */}
<div className="flex items-center justify-between">
  <Label className="text-sm font-medium">{label}</Label>
  <div className="flex gap-1">
    {REGISTRATION_PILLS.map(({ value: filterValue, label: pillLabel }) => (
      <button
        key={filterValue}
        type="button"
        onClick={() => setRegistrationFilter(filterValue)}
        className={cn(
          'px-2 py-0.5 rounded-full text-xs border transition-colors',
          registrationFilter === filterValue
            ? 'bg-foreground text-background border-foreground'
            : 'bg-transparent text-muted-foreground border-muted hover:border-foreground hover:text-foreground',
        )}
      >
        {pillLabel}
      </button>
    ))}
  </div>
</div>
```

### Comportamiento de Reset

El filtro se resetea a `'all'` **automáticamente** cuando el componente se desmonta. Si el componente padre (modal) cierra y reabre, el combobox se desmonta y remonta con estado inicial limpio. No se necesita lógica de reset explícita en el padre.

### Combinación con Búsqueda de Texto (cmdk)

El filtro por pills actúa como pre-filtro del array antes de pasarlo a `CommandGroup`. La búsqueda por texto de cmdk opera sobre el subconjunto ya filtrado, combinándose de forma natural:

```tsx
{/* cmdk busca dentro de filteredUsers, no del array completo */}
<CommandGroup>
  {filteredUsers.map((user) => (
    <CommandItem key={user.id} value={`${display} ${phone}`} onSelect={...}>
      ...
    </CommandItem>
  ))}
</CommandGroup>
```

### Regla

> Usar estado local (no prop del padre) cuando:
> 1. El filtro es puramente presentacional
> 2. Cada instancia del componente debe tener su filtro independiente
> 3. El reset al cerrar el contenedor padre es el comportamiento esperado
>
> Pasar el filtro como prop del padre solo si el padre necesita saber qué está filtrado para lógica de negocio.

### Origen

`simulate-modal-smart-defaults` — `UserCombobox` (`user-combobox.tsx:41-57`, `86-105`)

---

## Referencias

- **`apps/web-admin/src/components/simulate/order-config-modal.tsx`** — Implementación de referencia (patrones 1, 3, 7, 8)
- **`apps/web-admin/src/components/simulate/user-combobox.tsx`** — Implementación de referencia (patrones 2, 4, 9)
- **`apps/web-admin/src/lib/simulate-data.ts`** — Catálogo de direcciones ficticias y `toAddressPayload`
- **`apps/web-admin/src/components/simulate/simulation-chat.tsx`** — Implementación de referencia (patrones 4 y 6)
- **`apps/web-admin/src/components/chat/chat-bubble.tsx`** — Implementación de referencia (patrón 5)
- **Sesión**: [2026-02-28-cu03-a5-order-config-modal.md](../sessions/2026-02-28-cu03-a5-order-config-modal.md)
- **Sesión**: [2026-03-16-simulate-modal-smart-defaults.md](../sessions/2026-03-16-simulate-modal-smart-defaults.md)
