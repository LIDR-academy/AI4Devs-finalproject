---
document: technical_ticket
id: TK-095-FE
related_story: US-023 · US-024 (auditoría de fidelidad visual vs artefacto "Sistema FEFO")
points: 13
type: frontend
priority: Should Have
status: in-progress
progress:
  - WS-1 (P0) — ✅ Done (commit 86febb2): borde del keypad PIN, login como <AuthScreen> a sangre completa, proporción del grid Acciones|Estado, logout como botón fantasma.
  - WS-2 (P1) — ✅ Done (commit e82c694): `.flex-column { align-items: stretch }` + `.settings-form` — /ajustes/personal, /roles y /configuracion usan el lienzo.
  - WS-4 (P2) — ✅ Done (commit b95e7ec): quitada la nota "≥48px", toggle día/noche al final del cluster de sesión, etiquetas de filtro cortas.
  - WS-3 (P1, decisión de producto) — ⏸️ PENDIENTE: 3 preguntas de IA sin responder (ver abajo).
  - #13 (h1 del dashboard) y #14 (input date nativo) — ⏸️ diferidos (decisión de producto / baja prioridad).
inputs:
  - Artefacto de diseño "Sistema FEFO" — https://claude.ai/code/artifact/699b9f38-d198-47b1-8051-7e764b4a8f22
  - docs/02_architecture_design/05_ui_ux_design_system.md (v4.1.0)
  - DESIGN.md (v4.1.0)
  - docs/04_governance_and_quality/rules/frontend_rules.md
---

# 🎟️ TK-095-FE: Pase de Fidelidad Visual y UX vs. el Artefacto "Sistema FEFO"

> **Navegación del Framework SDD:**
> [📖 Índice de Tickets](../../indice_tickets.md) | [Anterior: TK-090-FE](./TK-090-FE.md)

---

## 📝 Descripción

Auditoría visual comparando el artefacto **Sistema FEFO** (4 láminas: Paleta, Tipografía, Componentes, Aplicación) contra la app implementada (US-022/023/024), capturando las 9 rutas en turno Día y Noche + la pantalla de login.

La base está fiel y pulida (paleta, tipografía Big Shoulders / IBM Plex, barra lateral con perforaciones + wordmark vertical, contraste AAA, contenido de ruta inline, sub-rutas `/ajustes/*` deep-linkables, `UrgencyChip`/`RowButton`/`ActionButton`/`StatusPanel` cableados). Este ticket cierra las **16 desviaciones** detectadas, agrupadas en 4 workstreams con prioridad interna (P0 → P2) para permitir entrega incremental.

**Fuera de alcance:** rediseño; nuevas capacidades; cualquier cambio de contrato de API. Los ítems marcados **[decisión de producto]** requieren respuesta del humano antes de implementarse (Guard 28) — no se resuelven por defecto.

---

## 🔀 Alcance de Modificación

### WS-1 — Bugs de fidelidad (P0)

| # | Defecto | Archivo(s) | Fix |
| :- | :- | :- | :- |
| **1** | Los botones del teclado PIN **no muestran borde**: `.pin-digit-btn` define `border: 2px solid var(--rule)` pero `.btn-touch` (`index.css`) define `border: 2px solid transparent` con **igual especificidad** y gana por orden de cascada → dígitos "flotando" sin la caja de sello, target táctil débil. | `apps/frontend/src/features/auth/components/PinPad.module.css`, `apps/frontend/src/index.css` | Subir especificidad de `.pin-digit-btn` / `.pin-delete-btn` (`.pin-pad-grid .pin-digit-btn`) o dejar de componer `.btn-touch` en el keypad. Verificar borde visible en día y noche. |
| **2** | La pantalla de **login es un `<Modal>` sobre scrim negro** (`PinLoginModal.tsx` → `<Modal size="sm" centered>`). Con `data-theme="light"` el fondo alrededor de la tarjeta es `#1e1e1e` (scrim), no el papel FEFO (`--bg-root`). Mismo patrón que US-024 eliminó en las rutas. | `apps/frontend/src/features/auth/components/PinLoginModal.tsx` (+ `ForceChangePinModal`, `ResetPinModal` si comparten el patrón) | Renderizar el login como **pantalla FEFO a sangre completa** (`--bg-root` papel día / pizarra noche + la tarjeta `--bg-card` centrada), sin overlay `<Modal>`. Coherente con "un sistema, dos turnos". |
| **3** | Grid **Acciones\|Estado desproporcionado**: el artefacto es `1fr 1.2fr`; la app usa `minmax(0, auto) 1fr` → Acciones queda como tira de ~200px y Estado ocupa ~70%. | `apps/frontend/src/app/routes/InventarioRoute.module.css` (`.acciones-estado-grid`) | `grid-template-columns: minmax(240px, 0.7fr) 1fr` (o `1fr 1.4fr`). Ajustar el breakpoint de colapso a 1 columna si hace falta. |
| **4** | Colores fuera de convención del artefacto: (a) enlace "¿Olvidó su PIN…?" en rojo (el artefacto: `a { color: var(--blue) }`); (b) botón "Cerrar Sesión" en `danger` grande para una acción rutinaria (artefacto: texto discreto con borde fino `--ink`); (c) turno **Noche**: "Ingresar" y los pills se renderizan **rellenos** en azul claro — el spec Noche pide **contorno** (`background: transparent`, texto + borde en color). | `PinLoginModal.tsx`, `app/AppTopBar.tsx`, `shared/components/RowButton.module.css`, `PinPad`/submit btn night rules | (a) usar `--color-primary`/link token; (b) variante `ghost`/secundaria para logout; (c) revisar los overrides `:root[data-theme="dark"]` de pill/submit para que sean contorno, no relleno. |

### WS-2 — Uso del espacio (P1)

| # | Defecto | Archivo(s) | Fix |
| :- | :- | :- | :- |
| **5** | `/ajustes/personal` y `/ajustes/roles` **desperdician >50% del lienzo**: formularios/listas en columna estrecha (240–740px) flotando al centro con margen vacío enorme a la izquierda — heredaron el ancho del contexto de modal sin adaptarse a página completa. `/recetas`, `/estaciones`, `/reportes`, `/ajustes/catalogo`, `/ajustes/movimientos` sí usan el ancho bien. | `apps/frontend/src/features/settings/components/RestaurantSettingsPanel.tsx` (+ `.module.css`), `apps/frontend/src/features/security/components/RolesManagementPanel.tsx`, `apps/frontend/src/features/auth/components/UserManagementPanel.tsx` | Quitar los `max-width`/centrados heredados del modal; usar paneles a sangre completa con contenido alineado a la izquierda (patrón de `InsumoCatalogPanel`). Para formularios cortos: rejilla de 2 columnas o panel acotado **alineado a la izquierda**, no centrado. |
| **6** | Input "Nombre Completo" (~240px) demasiado corto para un nombre real. | mismo `RestaurantSettingsPanel` / `CreateUserForm` | Ancho de campo acorde al dato (≥360px o `100%` del panel de formulario). |

### WS-3 — Arquitectura de información (P1 — **[decisión de producto]**)

| # | Hallazgo | Pregunta para el humano |
| :- | :- | :- |
| **7** | Apilamiento de encabezados: `/ajustes/catalogo` = "AJUSTES Y ADMINISTRACIÓN" → pestaña "Catálogo" → toggle "Inventario de Bodega/Recetario" → "CATÁLOGO MAESTRO E INVENTARIO" → "INVENTARIO Y CATÁLOGO DE BODEGA" (5 niveles). | ¿Colapsar a 2 niveles (título de página + título de panel)? ¿Cuál es el jerárquico canónico? |
| **8** | Superficies duplicadas: `/ajustes/catalogo › Inventario de Bodega` = mismo panel que `/estaciones`; `/ajustes/catalogo › Recetario` = mismo que `/recetas`. | ¿La sub-ruta `Catálogo` debe eliminarse (ya cubierta por Estaciones + Recetas) o esos paneles salir de las rutas de nivel superior? |
| **9** | `/estaciones` no muestra estaciones: la nav promete "Estaciones" y la página es el catálogo de bodega ("ESTACIONES Y BODEGA" + "INVENTARIO Y CATÁLOGO DE BODEGA"), con doble título. | ¿Renombrar la ruta a "Bodega"/"Inventario de Bodega", o la página debe pasar a mostrar realmente las estaciones/ubicaciones? |

> Al resolver 7–9, propagar en cascada a `docs/02_architecture_design/05_ui_ux_design_system.md` (tabla de rutas del AppShell) y `14_backlog_map.md`.

### WS-4 — Pulido (P2)

| # | Defecto | Archivo(s) | Fix |
| :- | :- | :- | :- |
| **10** | **"Botones táctiles optimizados a ≥48px"** impreso en la UI de Inventario — nota interna de QA filtrada a copy de producto. | `apps/frontend/src/app/routes/InventarioRoute.tsx` (o el componente del tablero FEFO) | Eliminar el texto. |
| **11** | Toggle DÍA/NOCHE encajado entre la nav y el bloque de usuario en la topbar — encaje incómodo. | `apps/frontend/src/app/AppTopBar.tsx`, `ThemeToggle.tsx` | Mover junto al menú de usuario (o dentro de él) manteniéndolo alcanzable con 1 toque. |
| **12** | Etiquetas de filtro largas ("Refrigerador Principal / Mesa de Preparación / Línea de Servicio") + badges de conteo saturan la fila. Artefacto: "Refrigerador / Mesa Prep / Línea". | componente de tabs de estación en el tablero FEFO | Etiquetas cortas; el nombre completo puede ir en `title`/tooltip. |
| **13** | Dashboard añade h1 "RESTOSTOCK FEFO DASHBOARD" + botones "Conciliar Turno"/"Sincronizar" que la maqueta no tiene (va directo a Acciones\|Estado). h1 redundante con el wordmark lateral. | `apps/frontend/src/app/routes/InventarioRoute.tsx` | **[decisión de producto]** ¿mantener el h1/acciones de página o ir directo a la rejilla como el artefacto? Si se mantiene, reducir el peso del h1. |
| **14** | `/movimientos`: `<input type="date">` nativo (chrome del navegador) choca con la estética de bordes gruesos. | `MovementHistoryPanel.tsx` | Baja prioridad — envolver en el estilo de input FEFO o dejar constancia como deuda aceptada. |

---

## ✅ Criterios de Aceptación & DoD

1. **WS-1 completo:** keypad PIN con borde de sello visible en día y noche; login renderizado como pantalla FEFO a sangre completa (sin scrim `<Modal>`); grid Acciones\|Estado con proporción ~`1fr 1.2–1.4fr`; enlace/logout/pills-noche con los tokens correctos. Verificado con capturas día+noche.
2. **WS-2 completo:** `/ajustes/personal` y `/ajustes/roles` usan el ancho completo del `<main>` (sin columna estrecha centrada); inputs con ancho acorde al dato.
3. **WS-3:** las 3 preguntas de IA respondidas por el humano ANTES de implementar; cambios propagados a `05_ui_ux_design_system.md` + `14_backlog_map.md`.
4. **WS-4:** nota "≥48px" eliminada; toggle reubicado; etiquetas de filtro cortas; ítem 13 resuelto según decisión.
5. **Sin regresión:** `pnpm --filter @restostock/frontend test`, `build`, `pnpm run lint` — 0 errores. Guard 29 (sin estilos inline / tokens del design system) respetado; `check_fefo_contrast.mjs` verde si se tocan colores.
6. **Verificación en vivo (workflow 09):** las 9 rutas + login recapturadas en día y noche, comparadas contra el artefacto; 0 errores de consola.
7. **Docs:** `DESIGN.md` y `05_ui_ux_design_system.md` reflejan cualquier ajuste estructural (login como pantalla, proporción del grid, IA de rutas).
8. **Commits atómicos por workstream:** `fix(design-system): ...(TK-095-FE)` — WS-1, WS-2, WS-4 por separado; WS-3 tras la decisión del humano.

---

## 🔗 Trazabilidad

* Continúa: `US-023` (AppShell FEFO), `US-024` (rutas inline).
* Matriz: `REQ-025`/`REQ-026` (nota de fidelidad) o `REQ-028` a criterio de `SK-12`.
* Relacionado: `TK-083-FE` (tratamiento FEFO de las pantallas PIN — de donde viene el `<Modal>` residual del login), `TK-087-FE` (grid Acciones\|Estado), `TK-090-FE` (paneles `/ajustes`).
