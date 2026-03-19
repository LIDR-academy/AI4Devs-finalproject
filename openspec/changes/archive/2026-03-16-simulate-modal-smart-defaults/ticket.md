# simulate-modal-smart-defaults — Defaults inteligentes y filtro de registro en el modal de simulación

**Fecha**: 2026-03-16  
**Tipo**: Mejora UX/UI  
**Alcance**: Exclusivamente frontend — `apps/web-admin/`  
**Prioridad**: Media  
**Área**: Dashboard Admin → `/simulate` → Modal "Configurar pedido simulado"

---

## Contexto y Problema

El modal `OrderConfigModal` (`apps/web-admin/src/components/simulate/order-config-modal.tsx`) es el punto de entrada para lanzar simulaciones de compra. Actualmente, **todos los campos arrancan vacíos** y el usuario debe rellenarlos manualmente o usar los botones de aleatorios uno a uno. Esto genera fricción innecesaria en un flujo de demostración/testing donde el contenido exacto es secundario.

Adicionalmente, el `UserCombobox` (`apps/web-admin/src/components/simulate/user-combobox.tsx`) muestra todos los usuarios sin distinción, aunque el campo `isRegistered` ya está disponible en el tipo `AdminUser`. En escenarios de prueba es habitual querer restringir la búsqueda a usuarios registrados o no registrados en Adresles sin tener que filtrar visualmente la lista completa.

**Estado actual** (patrón documentado en `memory-bank/patterns/frontend-form-patterns.md`):

```
Modal abre → todos los campos vacíos
Botón [Productos aleatorios] → rellena productos manualmente
Botón [Dirección aleatoria]  → rellena dirección manualmente  
UserCombobox → muestra todos los usuarios sin filtro
```

**Estado objetivo**:

```
Modal abre → productos pre-rellenados aleatoriamente
Modo TRADICIONAL activa → dirección de entrega pre-rellenada (si estaba vacía)
Switch "¿Tiene dirección en eCommerce?" ON → dirección eCommerce pre-rellenada (si estaba vacía)
UserCombobox → pills de filtro [Todos] [Adresles] [No Adresles] alineados a la derecha del label
```

---

## Especificaciones Técnicas

### Backend

**Sin cambios en backend.** Este change es exclusivamente de presentación y estado local de componentes React. No hay nuevos endpoints, DTOs ni cambios en la base de datos.

### Frontend

#### Archivos afectados

| Archivo | Tipo de cambio |
|---------|---------------|
| `apps/web-admin/src/components/simulate/order-config-modal.tsx` | Modificación — lógica de inicialización y triggers de cambio de modo/switch |
| `apps/web-admin/src/components/simulate/user-combobox.tsx` | Modificación — nuevo estado de filtro interno + UI de pills |

---

#### Mejora 1 — Auto-carga de productos al abrir el modal

**Componente**: `OrderConfigModal`

**Comportamiento actual**: `orderItems` se inicializa a `[]` y en `handleReset()` se resetea a `[]`.

**Comportamiento objetivo**: En cada apertura del modal (incluyendo la primera), los productos se pre-rellenan con una entrada aleatoria de `FAKE_ORDERS`.

**Cambios necesarios**:

1. **Inicialización del estado** — lazy initializer para el primer render:
   ```typescript
   // Antes
   const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
   
   // Después
   const [orderItems, setOrderItems] = useState<OrderItem[]>(() =>
     getRandomOrder().items.map((item) => ({ ...item }))
   );
   ```

2. **`handleReset()`** — rellenar con nuevos productos aleatorios en lugar de limpiar:
   ```typescript
   // Antes
   setOrderItems([]);
   
   // Después
   const randomOrder = getRandomOrder();
   setOrderItems(randomOrder.items.map((item) => ({ ...item })));
   ```

**Nota**: Los campos de los productos siguen siendo editables en el formulario. El botón `[Productos aleatorios]` sigue siendo funcional para regenerar aleatoriamente si el usuario lo desea. El texto de estado vacío `"Pulsa 'Productos aleatorios' o añade ítems manualmente."` puede eliminarse ya que el estado vacío ya no es accesible al abrir.

---

#### Mejora 2 — Auto-dirección de entrega al activar modo TRADICIONAL

**Componente**: `OrderConfigModal`

**Comportamiento actual**: Al hacer click en el botón `TRADICIONAL`, `setMode('TRADICIONAL')` se invoca y los campos de dirección de entrega aparecen vacíos.

**Comportamiento objetivo**: Al activar TRADICIONAL, si la dirección de entrega está completamente vacía, se pre-rellena con una dirección aleatoria. Si ya contiene datos (porque el usuario la había rellenado o la modal se reabrió con estado conservado), se conserva.

**Definición de "dirección vacía"**: todos los campos del `AddressState` son cadenas vacías (`''`). Equivalente a comparar con `EMPTY_ADDRESS`.

**Cambio necesario** en el `onClick` del botón TRADICIONAL:

```typescript
// Antes
onClick={() => setMode('TRADICIONAL')}

// Después
onClick={() => {
  setMode('TRADICIONAL');
  const isEmpty = !deliveryAddress.line1 && !deliveryAddress.postalCode &&
                  !deliveryAddress.city && !deliveryAddress.country;
  if (isEmpty) handleRandomAddress(setDeliveryAddress);
}}
```

**Nota**: `handleRandomAddress` ya existe en el componente. Los campos de dirección son **editables** aunque estén pre-rellenados; el botón `[Dirección aleatoria]` sigue visible para regenerar.

---

#### Mejora 3 — Auto-dirección eCommerce al activar "¿Tiene dirección guardada?"

**Componente**: `OrderConfigModal`

**Comportamiento actual**: Al activar el switch `buyerHasEcommerceAddress`, los campos de dirección eCommerce aparecen vacíos.

**Comportamiento objetivo**: Al activar el switch, si la dirección eCommerce está completamente vacía, se pre-rellena con una dirección aleatoria. Si ya contiene datos (el usuario la editó, desactivó y reactivó el switch), se conserva.

**Cambio necesario** en el `onCheckedChange` del switch "¿Tiene dirección guardada?":

```typescript
// Antes
onCheckedChange={(v) => {
  setBuyerHasEcommerceAddress(v);
  if (!v) setEcommerceAddress(EMPTY_ADDRESS);
}}

// Después
onCheckedChange={(v) => {
  setBuyerHasEcommerceAddress(v);
  if (v) {
    const isEmpty = !ecommerceAddress.line1 && !ecommerceAddress.postalCode &&
                    !ecommerceAddress.city && !ecommerceAddress.country;
    if (isEmpty) handleRandomAddress(setEcommerceAddress);
  } else {
    setEcommerceAddress(EMPTY_ADDRESS);
  }
}}
```

---

#### Mejora 4 — Filtro de registro (pills) en `UserCombobox`

**Componente**: `UserCombobox`

**Comportamiento actual**: El combobox muestra todos los usuarios de `users` sin discriminar por `isRegistered`.

**Comportamiento objetivo**: Tres pills alineadas a la derecha del label filtran la lista del dropdown:

- `[Todos]` — muestra todos los usuarios (default al montar)
- `[Adresles]` — muestra solo `user.isRegistered === true`
- `[No Adresles]` — muestra solo `user.isRegistered === false`

El filtro es **acumulativo** con la búsqueda por texto de cmdk: primero se filtra por registro, y cmdk aplica su búsqueda fuzzy sobre el subconjunto resultante.

El filtro es **estado local** del componente (`useState` interno) y se resetea a `'all'` en cada desmontaje/montaje (el modal llama a `handleReset()` en cada cierre, lo que hace que el componente se desmonte y remonte al reabrirse). No es necesario un `key` prop adicional.

**Nuevo tipo**:
```typescript
type RegistrationFilter = 'all' | 'registered' | 'unregistered';
```

**Estado nuevo en `UserCombobox`**:
```typescript
const [registrationFilter, setRegistrationFilter] = useState<RegistrationFilter>('all');
```

**Array filtrado** (derivado, calculado en render):
```typescript
const filteredUsers = users.filter((user) => {
  if (registrationFilter === 'registered') return user.isRegistered;
  if (registrationFilter === 'unregistered') return !user.isRegistered;
  return true;
});
```

**Sustitución** en el `CommandGroup`: usar `filteredUsers` en lugar de `users`.

**UI de las pills** — se añaden al bloque de label, alineadas a la derecha:

```tsx
<div className="flex items-center justify-between">
  <Label className="text-sm font-medium">{label}</Label>
  <div className="flex gap-1">
    {(
      [
        { value: 'all', label: 'Todos' },
        { value: 'registered', label: 'Adresles' },
        { value: 'unregistered', label: 'No Adresles' },
      ] as const
    ).map(({ value, label: pillLabel }) => (
      <button
        key={value}
        type="button"
        onClick={() => setRegistrationFilter(value)}
        className={cn(
          'px-2 py-0.5 rounded-full text-xs border transition-colors',
          registrationFilter === value
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

**Nota**: el mismo `UserCombobox` se usa tanto para el Comprador como para el Destinatario del regalo. Al ser estado interno, cada instancia tiene su propio filtro independiente. No se requiere cambio en `OrderConfigModal` para esta mejora.

---

## Arquitectura

Este change no afecta a ningún ADR. Es una mejora puramente presentacional de componentes React con estado local.

- **Patrón de referencia**: `memory-bank/patterns/frontend-form-patterns.md` — Sección 1 (estado local, `handleReset()`), Sección 4 (UserCombobox controlado)
- **Componentes afectados**: `OrderConfigModal`, `UserCombobox`
- **Datos de simulación**: `apps/web-admin/src/lib/simulate-data.ts` — no requiere cambios, `getRandomAddress()` y `getRandomOrder()` ya existen

---

## Definición de Hecho (DoD)

- [ ] **M1** — `OrderConfigModal` pre-rellena `orderItems` con `getRandomOrder()` en `useState` inicial y en `handleReset()`
- [ ] **M1** — El texto de estado vacío de productos se elimina o actualiza (ya no es alcanzable)
- [ ] **M2** — Al activar modo TRADICIONAL con dirección vacía, `deliveryAddress` se rellena con `getRandomAddress()`
- [ ] **M2** — Al activar modo TRADICIONAL con dirección ya rellenada, `deliveryAddress` se conserva sin cambios
- [ ] **M3** — Al activar switch "¿Tiene dirección guardada?" con dirección eCommerce vacía, `ecommerceAddress` se rellena con `getRandomAddress()`
- [ ] **M3** — Al activar switch con dirección eCommerce ya rellenada, `ecommerceAddress` se conserva
- [ ] **M3** — Al desactivar el switch, `ecommerceAddress` se limpia a `EMPTY_ADDRESS` (comportamiento existente, sin cambio)
- [ ] **M4** — `UserCombobox` muestra pills `[Todos] [Adresles] [No Adresles]` alineadas a la derecha del label, con estilo consistente con el sistema de diseño (TailwindCSS v4 + tokens de marca)
- [ ] **M4** — El filtro de pills es acumulativo con la búsqueda de texto de cmdk
- [ ] **M4** — El filtro se inicializa a `'all'` en cada apertura del modal
- [ ] **M4** — El filtro funciona independientemente en la instancia de Comprador y en la de Destinatario del regalo
- [ ] Build TypeScript sin errores (`pnpm build` en `apps/web-admin/`)
- [ ] Sin errores de ESLint (`pnpm lint` en `apps/web-admin/`)
- [ ] Verificación manual en `http://localhost:3001/simulate`

---

## Requisitos No Funcionales

- **Rendimiento**: El filtrado de usuarios es síncrono y sobre un array en memoria (típicamente <200 usuarios). Sin impacto de rendimiento.
- **Accesibilidad**: Los botones de pill deben ser `<button type="button">` (ya especificado); el combobox mantiene `role="combobox"` y `aria-expanded` intactos.
- **Consistencia visual**: Las pills siguen el patrón `rounded-full` + `border` con fondo `bg-foreground` para el estado activo, consistente con el estilo del proyecto. No se usan componentes Shadcn de Badge para las pills (son botones interactivos), aunque visualmente son similares.
- **Sin regresiones**: Los botones `[Dirección aleatoria]` y `[Productos aleatorios]` siguen siendo funcionales para regenerar los valores pre-rellenados.
