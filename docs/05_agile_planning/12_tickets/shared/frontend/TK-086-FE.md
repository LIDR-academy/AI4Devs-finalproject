---
document: technical_ticket
id: TK-086-FE
related_story: US-023
points: 5
type: frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-023.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
  - DESIGN.md
---

# 🎟️ TK-086-FE: Componentes de la Lámina "Aplicación" (Botón Circular, Chip 4 Niveles, Botón de Fila)

> **Navegación del Framework SDD:**
> [📖 Índice de Tickets](../../indice_tickets.md) | [Anterior: TK-085-FE](./TK-085-FE.md) | [Siguiente: TK-087-FE](./TK-087-FE.md)

---

## 📝 Descripción
Implementa los tres componentes visuales nuevos de la lámina "Aplicación" (`docs/02_architecture_design/05_ui_ux_design_system.md` §v4.1.0), que separan la capa de color de **acción** de la capa de color de **estado/urgencia** — la mezcla que la referencia original arrastraba. Refactoriza los consumidores actuales (`SummaryCards`, `ActiveRemanentesList`) para usarlos. Hereda el shell y los tokens de `TK-085-FE`; no toca routing.

---

## 🔀 Alcance de Modificación (Frontend Architecture)

* **`apps/frontend/src/shared/components/ActionButton.tsx` + `ActionButton.module.css` (NUEVOS):**
  * Círculo de 72×72px, `border-radius: 9999px` (única excepción documentada a `rounded: 0`). Label debajo + hint opcional en `--font-family-mono`.
  * Prop `action: 'extract' | 'add' | 'recipe'` → mapea a `--color-danger` / `--color-primary` / `--color-warning` (capa **acción**, nunca a urgencia).
  * Turno Noche vía CSS (`:root[data-theme="dark"]` ya global de `US-022`): relleno sólido → contorno de 3px + ícono/label en el color.
  * Objetivo táctil real ≥48px cumplido con holgura (72px).
* **`apps/frontend/src/shared/components/UrgencyChip.tsx` + `UrgencyChip.module.css` (NUEVOS):**
  * Prop `level: 'critical' | 'warning' | 'safe'` + `label: string` (`Hoy` / `Mañana` / `2 Días` / `4 Días`).
  * **Siempre** marca cuadrada de 9px (`currentColor`) + texto (WCAG 1.4.1) — la marca no es decorativa, es el canal redundante al color.
  * De día: fondo tintado 12–15% + texto en variante `--color-*-text`; de noche: contorno + texto en color base.
  * Reemplaza el `StatusBadge` tri-color heredado; migrar sus usos y borrarlo si queda huérfano (Guard 5).
* **`apps/frontend/src/shared/components/RowButton.tsx` + `RowButton.module.css` (NUEVOS):** variantes `default` (`--rule` sólido), `urgent` (`--color-danger`, se activa cuando la fila tiene chip `critical`), `ghost` (contorno). La variante se deriva de la urgencia de la fila, no se pasa a mano en cada llamada.
* **`apps/frontend/src/App.tsx` / `InventarioRoute.tsx`:** `SummaryCards` usa `ActionButton` para "Extraer"/"Preparar Receta" (y el nuevo "Agregar" si aplica al flujo de reabastecimiento — si no hay acción real que enganchar, no se añade un botón muerto, Guard 5).
* **`apps/frontend/src/features/kitchen/components/ActiveRemanentesList.tsx`:** cada fila usa `UrgencyChip` (escala completa de 4 etiquetas según `hoursRemaining`) y `RowButton` para "Usar".
* **Tests:** unitarios por componente (render de las 3 variantes, presencia de la marca + texto en el chip, `aria-pressed`/`type="button"`), + ajuste de los tests de `ActiveRemanentesList`/`SummaryCards` que dependían de las clases antiguas.

**Fuera de alcance:** panel Estado de 3 cubetas y leyenda numérica (`TK-087-FE`), auditoría de contraste (`TK-088-FE`), routing (`TK-085-FE`).

---

## ✅ Criterios de Aceptación & DoD

1. **Separación de capas:** ningún `ActionButton` toma un color de urgencia; ningún `UrgencyChip` toma un color de acción — verificable por props tipadas (sin `any`, Guard 1).
2. **Canal redundante (WCAG 1.4.1):** el `UrgencyChip` renderiza marca + texto en las 4 etiquetas; un test lo asevera.
3. **Escala completa:** `ActiveRemanentesList` muestra `Hoy`/`Mañana`/`2 Días`/`4 Días` según `hoursRemaining`, sin cortar la escala.
4. **Excepción de forma documentada:** `ActionButton` es el único componente con `border-radius` ≠ 0; el resto sigue recto.
5. **Turno Noche:** los 3 componentes cambian a contorno de tiza al alternar el interruptor de `US-022`, sin JS adicional.
6. **Guard 29:** 0 `style={{}}` inline; clases desde `--space-*`/`--fs-*`/`--fw-*`; una clase usada por 2+ componentes va a `index.css`, una de un solo componente a su `*.module.css`.
7. **Cero regresión:** `pnpm --filter frontend test -- --run` verde sin cambiar aserciones de comportamiento.
8. **Verificación:** `pnpm --filter frontend run lint`, `pnpm --filter frontend run build`, `pnpm --filter frontend run duplication`, `check_ticket_code_quality.sh` — 0 errores en el diff.
