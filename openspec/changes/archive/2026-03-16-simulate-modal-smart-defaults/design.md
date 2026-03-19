## Context

El modal `OrderConfigModal` y el componente `UserCombobox` son los dos componentes React que articulan el flujo de simulación de compra en `/simulate`. Ambos viven en `apps/web-admin/src/components/simulate/` y siguen los patrones de estado local documentados en `memory-bank/patterns/frontend-form-patterns.md` (secciones 1 y 4).

El cambio es exclusivamente de presentación: no afecta al backend, no modifica tipos compartidos y no introduce nuevas dependencias. Toda la lógica vive en `useState` y `useEffect`-free handlers, siguiendo el patrón establecido.

## Goals / Non-Goals

**Goals:**

- Reducir la fricción de apertura del modal: el administrador puede lanzar una simulación sin pulsar ningún botón de aleatorios
- Los campos pre-rellenados siguen siendo editables (no son readonly)
- El filtro de registro en `UserCombobox` agiliza la selección en escenarios de prueba específicos
- Sin regresiones: los botones `[Dirección aleatoria]` y `[Productos aleatorios]` siguen funcionando para regenerar

**Non-Goals:**

- No persistir el filtro de registro entre aperturas del modal (se resetea a "Todos")
- No añadir filtros adicionales al combobox (por tienda, por fecha de creación, etc.)
- No gestionar el estado del filtro desde el padre (`OrderConfigModal`) — el filtro es local a cada instancia de `UserCombobox`
- No cambios en backend, DTOs ni `simulate-data.ts`

## Decisions

### D1 — Inicialización de productos con lazy initializer + handleReset

**Opción elegida**: Usar `useState(() => getRandomOrder().items.map(i => ({...i})))` como lazy initializer y modificar `handleReset()` para poblar con `getRandomOrder()` en lugar de `[]`.

**Alternativa descartada**: `useEffect(() => { handleRandomProducts(); }, [open])`. Requeriría que `open` sea una dependencia, lo que añade complejidad innecesaria. El lazy initializer es más idiomático para estado inicial calculado.

**Razón**: `handleReset()` ya centraliza el reset del formulario y se llama en los dos puntos de cierre (submit exitoso y `handleClose()`). Modificarlo allí garantiza que cada nueva apertura del modal tenga productos aleatorios sin lógica adicional.

### D2 — Auto-fill de dirección solo si vacía (no siempre)

**Opción elegida**: Comprobar si todos los campos de `AddressState` están vacíos antes de llamar a `handleRandomAddress()` en los triggers de modo/switch.

**Alternativa descartada**: Rellenar siempre, incluso si el usuario ya introdujo datos. Sobreescribe trabajo del usuario al volver al mismo modo/switch.

**Razón**: el usuario puede cambiar de modo (ADRESLES → TRADICIONAL → ADRESLES → TRADICIONAL) sin perder la dirección que editó. La lógica de "vacío" es: `!addr.line1 && !addr.postalCode && !addr.city && !addr.country` (campos obligatorios del `AddressState`).

### D3 — Estado del filtro local a cada instancia de UserCombobox

**Opción elegida**: `useState<'all' | 'registered' | 'unregistered'>('all')` dentro del propio `UserCombobox`.

**Alternativa descartada**: Gestionar el filtro desde `OrderConfigModal` y pasar `users` pre-filtrados como prop. Requeriría dos `useState` adicionales en el padre (uno por cada instancia: Comprador y Destinatario) y prop drilling innecesario.

**Razón**: el filtro es puramente una preocupación de presentación del combobox. Al vivir en estado local, se resetea automáticamente al desmontarse el componente (que ocurre cada vez que el modal se cierra vía `handleReset()`). Cada instancia (Comprador / Destinatario) tiene su filtro independiente sin coordinación entre ellas.

### D4 — Pills como control visual para el filtro de registro

**Opción elegida**: Tres botones `<button type="button">` con estilo `rounded-full border` alineados a la derecha del label.

**Alternativa descartada (Select)**: Más espacio vertical y más clicks para cambiar entre opciones.

**Alternativa descartada (Toggle group Shadcn)**: Añade una dependencia de componente que actualmente no está instalada en el proyecto.

**Razón**: las pills son el control más compacto para 3 opciones mutuamente excluyentes. El estilo `bg-foreground text-background` para la opción activa es consistente con el sistema de diseño del proyecto y se puede implementar con clases Tailwind sin componentes adicionales.

## Risks / Trade-offs

- **[Riesgo] Dirección pre-rellenada en TRADICIONAL podría confundir si el usuario esperaba campo vacío** → Mitigación: el campo sigue siendo editable y el botón [Dirección aleatoria] permite regenerar. El usuario puede limpiar el campo si lo desea.
- **[Riesgo] `getRandomOrder()` es `Math.random()` — puede dar el mismo resultado dos veces seguidas** → Mitigación: aceptable para un entorno de testing. No es un requisito que cada apertura tenga productos distintos a la anterior.
- **[Riesgo] El filtro de pills queda en estado "Adresles" cuando el usuario cierra el popover sin seleccionar y reabre** → Mitigación: el filtro es estado interno del componente y persiste mientras el componente está montado. Al cerrar el modal (desmontaje), se resetea a "Todos". Comportamiento esperado y documentado en la spec.
