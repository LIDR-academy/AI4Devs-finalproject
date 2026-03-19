## 1. OrderConfigModal — Auto-carga de productos al abrir

- [x] 1.1 [frontend] Cambiar la inicialización de `orderItems` en `useState` de `[]` a lazy initializer `() => getRandomOrder().items.map(i => ({ ...i }))`
- [x] 1.2 [frontend] Modificar `handleReset()` para poblar `orderItems` con `getRandomOrder().items.map(i => ({ ...i }))` en lugar de `[]`
- [x] 1.3 [frontend] Eliminar el párrafo de estado vacío (`"Pulsa 'Productos aleatorios' o añade ítems manualmente."`) ya que el estado vacío ya no es alcanzable al abrir

## 2. OrderConfigModal — Auto-dirección al activar modo TRADICIONAL

- [x] 2.1 [frontend] Modificar el `onClick` del botón TRADICIONAL para comprobar si `deliveryAddress` está vacía (`!line1 && !postalCode && !city && !country`) y llamar a `handleRandomAddress(setDeliveryAddress)` solo en ese caso
- [x] 2.2 [frontend] Verificar que al volver a TRADICIONAL con dirección ya rellenada, los campos se conservan sin sobreescribirse

## 3. OrderConfigModal — Auto-dirección al activar switch de dirección eCommerce

- [x] 3.1 [frontend] Modificar el `onCheckedChange` del switch "¿Tiene dirección guardada en el eCommerce?" para llamar a `handleRandomAddress(setEcommerceAddress)` cuando `v = true` y los campos eCommerce estén vacíos
- [x] 3.2 [frontend] Verificar que al desactivar el switch, `setEcommerceAddress(EMPTY_ADDRESS)` sigue ejecutándose (comportamiento existente sin cambio)
- [x] 3.3 [frontend] Verificar que al reactivar el switch con dirección ya rellenada, los campos se conservan sin sobreescribirse

## 4. UserCombobox — Pills de filtro de registro

- [x] 4.1 [frontend] Añadir tipo `type RegistrationFilter = 'all' | 'registered' | 'unregistered'` en `user-combobox.tsx`
- [x] 4.2 [frontend] Añadir `useState<RegistrationFilter>('all')` dentro de `UserCombobox`
- [x] 4.3 [frontend] Calcular `filteredUsers` como array derivado: `users.filter(u => filter === 'registered' ? u.isRegistered : filter === 'unregistered' ? !u.isRegistered : true)`
- [x] 4.4 [frontend] Sustituir `users.map(...)` por `filteredUsers.map(...)` en el `CommandGroup`
- [x] 4.5 [frontend] Añadir el bloque de pills al lado derecho del label: tres `<button type="button">` con estilo `rounded-full border text-xs` y `bg-foreground text-background` para el activo

## 5. Verificación y calidad

- [x] 5.1 [qa] Verificar build TypeScript sin errores: `pnpm build` desde `apps/web-admin/`
- [x] 5.2 [qa] Verificar sin errores de ESLint: `pnpm lint` desde `apps/web-admin/`
- [x] 5.3 [qa] Verificación manual en `http://localhost:3001/simulate`: abrir modal → productos pre-rellenados
- [x] 5.4 [qa] Verificación manual: cambiar a TRADICIONAL con dirección vacía → dirección pre-rellenada
- [x] 5.5 [qa] Verificación manual: cambiar a TRADICIONAL con dirección rellenada → dirección conservada
- [x] 5.6 [qa] Verificación manual: activar switch dirección eCommerce vacía → dirección pre-rellenada
- [x] 5.7 [qa] Verificación manual: activar switch con dirección ya rellenada → dirección conservada
- [x] 5.8 [qa] Verificación manual: pills `[Todos]` / `[Adresles]` / `[No Adresles]` filtran correctamente el dropdown
- [x] 5.9 [qa] Verificación manual: filtro de pills se combina con búsqueda por texto
- [x] 5.10 [qa] Verificación manual: los filtros de Comprador y Destinatario del regalo son independientes
- [x] 5.11 [qa] Verificación manual: el filtro se resetea a `Todos` al cerrar y reabrir el modal
