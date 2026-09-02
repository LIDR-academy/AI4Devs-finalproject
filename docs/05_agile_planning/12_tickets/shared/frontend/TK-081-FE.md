---
document: technical_ticket
id: TK-081-FE
related_story: US-022
points: 5
type: frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-022.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
  - DESIGN.md
---

# 🎟️ TK-081-FE: Núcleo del Sistema FEFO (Tokens Día/Noche + Interruptor) — Tablero Principal

> **Navegación del Framework SDD:**
> [📖 Índice de Tickets](../../indice_tickets.md) | [Siguiente: TK-082-FE](./TK-082-FE.md)

---

## 📝 Descripción
Ticket fundacional de `US-022`. Reemplaza el bloque `:root` de `apps/frontend/src/index.css` (paleta "Señal Industrial" v3.0.0, tema oscuro fijo) por el sistema de tokens dual del **Sistema FEFO**: turno **Día** (comanda de papel — fondo claro, tinta oscura) y turno **Noche** (pizarra de turno — fondo oscuro, tinta clara). Introduce el mecanismo de interruptor (estado + persistencia en `localStorage` + fallback a `prefers-color-scheme`) y aplica el resultado al tablero principal (`App.tsx` y sus componentes de cocina). Los tres tickets siguientes (`TK-082-FE`/`TK-083-FE`/`TK-084-FE`) heredan los tokens definidos aquí sin duplicarlos — solo ajustan la forma estructural (bordes, radios, tipografía) de sus propias pantallas.

Un piloto exploratorio validó la viabilidad técnica de este enfoque, acotado al tablero principal con un wrapper de alcance (`.fefo-pilot-scope`); **este ticket reemplaza ese enfoque acotado por una implementación real a nivel `:root`**, ya que la decisión de negocio (Pregunta 3, `US-022`) es reemplazar el tema actual, no coexistir con él.

---

## 🔀 Alcance de Modificación (Frontend Architecture)

*   **`apps/frontend/index.html`:** agrega `Big Shoulders Display` (700/800/900), `IBM Plex Sans` (400/500/600/700) e `IBM Plex Mono` (400/500/600) a la carga de Google Fonts, en reemplazo de `Oswald`/`Barlow`.
*   **`apps/frontend/src/index.css`:**
    *   Bloque `:root`: valores de turno **Día** por defecto (sin scoping — el turno Día es el estado inicial antes de que el JS de arranque evalúe `localStorage`/`prefers-color-scheme`, evitando FOUC).
    *   Bloque `@media (prefers-color-scheme: dark)` guardado como `:root:not([data-theme="light"])`: valores de turno Noche.
    *   Bloque `:root[data-theme="dark"]`: mismos valores de turno Noche (para cuando el interruptor fuerza Noche con el SO en claro).
    *   Redefine los tokens **existentes** (`--bg-root`, `--bg-card`, `--border-card`, `--color-primary`, `--color-primary-hover`, `--color-primary-on`, `--color-secondary`, `--color-danger`, `--color-danger-text`, `--color-warning`, `--color-success`, `--color-info`, `--text-primary`, `--text-secondary`, `--font-family-display`, `--font-family-body`) para que todo componente que ya los consume se re-tematice sin tocar su JSX.
    *   Nuevo token `--rule`: color de borde estructural grueso (reemplaza el uso ad-hoc de `--border-card` para bordes de tarjeta).
    *   Estructura: `.card-dashboard` pasa de `border-radius: 6px` + `box-shadow` a `border: 2px solid var(--rule); border-radius: 0; box-shadow: none`. `.btn-touch`/variantes pasan a `border-radius: 0` con borde de 2px por variante. `.card-badge-icon` pasa de círculo relleno a círculo con borde de 2px. `.card-header` suma `border-bottom: 2px dashed var(--rule)`.
*   **`apps/frontend/src/App.tsx`:**
    *   Hook `useFefoTheme()` (renombrar/promover el prototipo `useFefoPilotTheme` del piloto): estado `'light' | 'dark'`, persistencia en `localStorage` bajo una clave estable, fallback a `window.matchMedia('(prefers-color-scheme: dark)')`.
    *   Aplica `document.documentElement.dataset.theme` (no un wrapper `data-fefo-theme` scoped) para que el tema alcance a **toda** la aplicación, incluidos los modales de `AppModals` — a diferencia del piloto, que los excluía a propósito.
    *   Componente `ThemeToggle` (Día/Noche) en el header, con `aria-pressed` por botón y objetivo táctil ≥48px.
*   **`apps/frontend/src/features/kitchen/components/FEFOInventoryHealthBar.module.css`, `ActiveRemanentesList.module.css`, `LocationFilterTabs.module.css`:** ajustes estructurales (radios a 0, bordes a `var(--rule)`, cantidades en `IBM Plex Mono` con `font-variant-numeric: tabular-nums`) — sin bloque `[data-fefo-theme]` condicional (ya no aplica, el tema es global vía `:root`).

**Fuera de alcance (cubierto por tickets siguientes):** modales de operación de cocina (`TK-082-FE`), pantallas de autenticación/PIN (`TK-083-FE`), backoffice (`TK-084-FE`). Esos componentes heredarán los tokens de este ticket automáticamente (cascada CSS) pero conservarán su forma estructural v3.0.0 (radios, sombras) hasta que su propio ticket los actualice — inconsistencia visual transitoria conocida y aceptada, igual que la ya documentada entre `TK-067`/`TK-068`.

---

## ✅ Criterios de Aceptación & DoD

1. **Interruptor funcional (US-022 Escenario 1):** tocar "Noche"/"Día" cambia la paleta de toda la app visible en ese momento (incluidos modales abiertos) y persiste tras recargar la página en el mismo navegador.
2. **Fallback a preferencia del sistema (US-022 Escenario 2):** sin `localStorage` previo, el tema inicial coincide con `prefers-color-scheme` del navegador de pruebas.
3. **Cero regresión funcional (US-022 Escenario 3):** la suite de tests frontend existente pasa sin modificar ninguna aserción de comportamiento (solo se permiten ajustes de aserciones que dependían de una clase/color ahora reemplazado).
4. **Objetivo táctil:** ningún botón (incluido el interruptor) baja de 48px; el teclado de PIN (fuera de alcance de este ticket) no se toca aquí.
5. **Verificación:** `pnpm --filter frontend test -- --run`, `pnpm --filter frontend run build`, `pnpm --filter frontend run lint` — 0 errores.
