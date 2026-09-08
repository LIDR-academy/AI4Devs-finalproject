---
document: ui_ux_design_system
version: 5.4.0
status: approved
inputs:
  - docs/00_stack_manifest.md
  - docs/01_product_definition/02_prd.md
  - docs/02_architecture_design/04_technical_design.md
  - docs/05_agile_planning/11_user_stories/shared/US-022.md
  - docs/05_agile_planning/11_user_stories/shared/US-023.md
  - docs/05_agile_planning/11_user_stories/shared/US-031.md
---

# 🎨 Especificación de Sistema de Diseño UI/UX y Ergonomía Táctil

> **Navegación del Framework SDD:**
> [⬅️ Volver a Arquitectura de Sistema (04_technical_design.md)](./04_technical_design.md) | [📖 Glosario & Reglas](../01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Modelado de Datos (06_database_schema.md) ➡️](../03_persistence_and_api/06_database_schema.md)

> **Migración a Índice Fijo de Secciones (v5.0.0, SK-05 ≥ 3.10.0, Guard 9):** este documento vivía organizado cronológicamente por versión (`## v4.0.0`, `## v4.1.0`, `## v4.2.0`). Esta revisión consolida ese mismo contenido por categoría — cada tema vive en un único lugar de aquí en adelante; la traza de qué cambió y cuándo se preserva íntegra en la §10 Historial de Versiones, no se pierde.

---

## 1. 🗺️ Arquitectura de Información

**Plataforma objetivo:** Web (confirmado en `docs/00_stack_manifest.md` §4 — React 18 + Vite 5, sin ambigüedad; ninguna pregunta al humano necesaria, Guard 8).

### Sitemap (rutas de nivel superior, `AppShell`)

| Ruta | Path | Contenido | Acceso |
| :--- | :--- | :--- | :--- |
| Inventario | `/` | Tablero FEFO de cocina (remanentes activos, health bar, filtros de estación) | Operario autenticado |
| Bodega | `/bodega` | Extracción de bodega (operario); catálogo/reabastecimiento de insumos y ubicaciones (acciones solo `ADMIN`) | Operario autenticado (ruta); `ADMIN` (gestión) |
| Recetas | `/recetas` | Recetario: consulta (operario); alta de recetas (solo `ADMIN`) | Operario autenticado (ruta); `ADMIN` (alta) |
| Reportes | `/reportes` | Dashboard de mermas + KPIs (TRR, valorización) — inline | **`ADMIN`** |
| Ajustes › Configuración | `/ajustes/configuracion` | Configuración del restaurante y parámetros FEFO | **`ADMIN`** |
| Ajustes › Personal | `/ajustes/personal` | Alta y bloqueo de operarios | **`ADMIN`** |
| Ajustes › Roles | `/ajustes/roles` | Roles y matriz de permisos | **`ADMIN`** |
| Ajustes › Movimientos | `/ajustes/movimientos` | Historial de movimientos de stock | **`ADMIN`** |

### Inventario de Contenido (a nivel de ruta — el detalle elemento-por-elemento vive en el ticket `TK-XXX` de cada pantalla)

| ID | Pantalla/Ruta | Elemento | Tipo de Contenido | Propósito | Fuente de datos/API | Acción |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C-01 | `/` | `FEFOInventoryHealthBar` + 3 cubetas | Widget de estado | Salud de inventario en 1 vistazo | `GET /api/v1/remanentes` | Mantener |
| C-02 | `/` | Tablero de remanentes con `UrgencyChip`/`RowButton` | Tabla/lista priorizada | Priorización FEFO de cocina | `GET /api/v1/remanentes` | Mantener |
| C-03 | `/bodega` | `InsumoCatalogPanel` + `InsumoStockBreakdownRow` | Tabla expandible | Catálogo y desglose de stock por sector | `GET /api/v1/insumos`, `GET /api/v1/locations` | Mantener |
| C-04 | `/recetas` | `RecipeCatalogPanel` | Lista/catálogo | Consulta y preparación de recetas | `GET /api/v1/recipes` | Mantener |
| C-05 | `/reportes` | Dashboard de KPIs | Métricas | Mermas, TRR, valorización | `GET /api/v1/reports/*` | Mantener |
| C-06 | `/ajustes/personal` | `UserStatusForm` | Formulario CRUD | Alta/bloqueo de operarios | `GET/POST /api/v1/users` | Mantener |
| C-07 | `/ajustes/roles` | `RolesManagementModal` | Matriz de permisos | RBAC dinámico | `GET/PUT /api/v1/roles` | Mantener |
| C-08 | (global) | `PinLoginModal` / `AuthScreen` | Autenticación | Acceso táctil por PIN | `POST /api/v1/auth/login` | Mantener |

### User Flow crítico (representativo — extracción de bodega)

```
Operario en "/" → tap "Extraer de Bodega" (ActionButton)
  └─ WarehouseExtractionModal
       ├─ Selecciona sector de origen (StorageSectorSelect)
       │    └─ Ve "Disponible aquí: <n> <u>"
       ├─ Selecciona insumo + cantidad
       ├─ Submit
       │    ├─ 200 OK → remanente creado, modal cierra, tablero se actualiza
       │    └─ 422 INSUFFICIENT_STOCK → ErrorBanner inline (errorMessageMapper), modal permanece abierto
       └─ Cancelar → RowButton--ghost, cierra sin efecto
```

### Wireframe de baja fidelidad (`AppShell`, ya validado en producción)

```
┌────┬──────────────────────────────────────────────┐
│ S  │  [Inventario] Bodega Recetas Reportes Ajustes │  ← topbar: nav + sesión + Cerrar Sesión
│ I  ├──────────────────────────────────────────────┤
│ D  │                                              │
│ E  │            <Outlet /> (ruta activa)           │
│ B  │                                              │
│ A  │                                              │
│ R  │                                              │
└────┴──────────────────────────────────────────────┘
```
Grid `88px 1fr`; en `sm` (<640px) la barra lateral colapsa a franja superior de 44px.

---

## 2. 🎨 Paleta de Color

Fuente real: `apps/frontend/src/styles/variables/colors.css`. Turno **Día** (comanda de papel, valores por defecto en `:root`) / Turno **Noche** (pizarra de turno, `prefers-color-scheme` o `:root[data-theme="dark"]`).

| Token | Día | Noche | Uso |
| :--- | :--- | :--- | :--- |
| `--bg-root` / `--bg-card` | `#efe8d8` / `#f7f2e6` | `#171c18` / `#1f251f` | Fondo base / superficie de tarjeta |
| `--rule` | `#18140f` | `#e9e4d0` | Rellenos sólidos (barra lateral, `RowButton`), borde inferior del topbar `3px`, contorno de controles interactivos (inputs, toggles, botones, keypad PIN — WCAG 1.4.11 ≥ 3:1) |
| `--border-card` | `#18140f` | `#e9e4d0` | Relleno de `neutral-badge` y de los puntos del keypad PIN |
| `--border-hairline` (v5.3.0) | `#d7cfb9` | `#3c433b` | Hairline **decorativo** `1px`: bordes de tarjetas/paneles/modales, tablas y divisores. No es indicador de un control interactivo, por eso puede ir por debajo de 3:1 |
| `--color-primary` (+hover, +on, +text) | `#2e5f76` | `#6faac7` | Acciones principales, navegación activa |
| `--color-secondary` | `#6e6555` | `#9aa394` | Acciones secundarias/no urgentes |
| `--color-danger` (+on, +text) | `#b43a24` | `#e1573a` | Crítico / vencido / destructivo |
| `--color-warning` (+text) | `#8a6414` | `#e6be55` | Atención (vence mañana) |
| `--color-success` (+text) | `#3e6b3a` | `#7cb36e` | Vigente / éxito |
| `--color-info` (+text) | alias de `--color-primary` | alias de `--color-primary` | Informativo |
| `--text-primary` / `--text-secondary` | `#18140f` / `#6e6555` | `#f2eedd` / `#9aa394` | Texto principal/secundario |

> **Regla incondicional de contraste (Discovered `TK-081-FE`, reforzado `TK-084-FE`):** ningún `--color-X` se usa como texto directo sobre su propio badge tintado (`color-mix(... 12–15%, transparent)`) — cada uno tiene su variante `-text` dedicada, verificada por fórmula de luminancia relativa WCAG contra el fondo real donde compone (no un fondo asumido por conveniencia). `--color-X-on` es un tercer caso: texto sobre el relleno **sólido** de un botón (`.btn-primary`, `.btn-danger`).
>
> **Auditoría completa (`TK-088-FE`, `docs/audits/AUDIT-A11Y-001-TK-088-FE-contrast-report.md`):** 40 pares color/fondo (20 por turno), todos ≥ objetivo. `--text-primary`: 13–16:1 (AAA). Variantes `-text` de chip/badge: 5.0–8.8:1 (AA). `--color-*-on` sobre relleno sólido: 4.6–6.8:1 (AA).
>
> **WCAG 1.4.1 (uso del color):** ningún estado se comunica solo por color — todo badge/chip lleva marca geométrica + texto (`UrgencyChip`, ver §7).

---

## 3. 🔤 Tipografía

Fuente real: `apps/frontend/src/styles/variables/typography.css`.

| Familia | Valor | Uso |
| :--- | :--- | :--- |
| `--font-family-display` | `'Big Shoulders Display', 'Arial Narrow', sans-serif` | Titulares, cifras (condensada tipo sello) |
| `--font-family-body` | `'IBM Plex Sans', system-ui, sans-serif` | Cuerpo de texto |
| `--font-family-mono` | `'IBM Plex Mono', 'SFMono-Regular', monospace` | Datos alineados en columna: lotes, cantidades, `HH:MM:SS` |

**Escala de tamaño** (`--fs-*`) — auditada del código real, **no** es una progresión geométrica limpia (ratios entre pasos: 1.13 / 1.06 / 1.11 / 1.25 / 1.12 / 1.29 / 1.11); documentada tal cual, sin forzar un ratio matemático que no corresponde al código:

| Token | Valor | Ratio vs. anterior |
| :--- | :--- | :--- |
| `--fs-xs` | 0.75rem (12px) | — |
| `--fs-sm` | 0.85rem (13.6px) | 1.13× |
| `--fs-md` | 0.9rem (14.4px) | 1.06× |
| `--fs-base` | 1rem (16px) | 1.11× |
| `--fs-lg` | 1.25rem (20px) | 1.25× |
| `--fs-xl` | 1.4rem (22.4px) | 1.12× |
| `--fs-2xl` | 1.8rem (28.8px) | 1.29× |
| `--fs-3xl` | 2rem (32px) | 1.11× |

`--fw-regular` (400) / `--fw-semibold` (600) / `--fw-bold` (700) / `--fw-black` (800).

**Medida (longitud de línea) — v5.4.0.** Utilidad `.measure` (`max-width: 65ch`, en `styles/layout/utilities.css`) para acotar el texto corrido a ~65 caracteres por línea (rango objetivo 45–75). Aplicada a subtítulos de panel (vía `PanelHeader`), textos de ayuda de reportes y descripciones de panel que renderizan en el ancho completo del `<main>` (≤ 1200px). No aplica a texto en modales (ya acotados por `.modal-*` a 420–760px), celdas de tabla ni chips. Fundamentación: legibilidad (líneas > 75ch fuerzan sacádicos de retorno más largos), no estética.

> **Gap declarado (Guard 7):** no existe token de `line-height` — cada regla que necesita interlineado lo fija ad-hoc o hereda el valor por defecto del navegador. Pendiente de una implementación aparte (candidato a ticket), no rellenado con un valor aspiracional.

---

## 4. 📐 Retícula y Espaciado

Fuente real: `apps/frontend/src/styles/variables/spacing.css` — escala de paso fijo de **4px** (no es un híbrido 8pt/4pt; se documenta el valor real):

`--space-1: 4px` · `--space-2: 8px` · `--space-3: 12px` · `--space-4: 16px` · `--space-5: 20px` · `--space-6: 24px` · `--space-7: 28px`.

**Sistema de columnas:** no existe un grid de columnas explícito (no es un layout tipo "12 columnas"). El layout se resuelve con CSS Grid ad-hoc por contenedor: `AppShell` (`grid-template-columns: 88px 1fr`), `.metrics-grid` (`repeat(auto-fit, minmax(240px, 1fr))`), `.edit-user-grid` (`1fr 1fr`). Documentado así en vez de inventar una convención de columnas que el código no tiene.

---

## 5. 🎬 Motion & Micro-interacciones

Fuente real: `apps/frontend/src/styles/variables/motion.css`. Extraídos mecánicamente de los 4 usos reales de `transition` que ya existían en el código — mismos valores exactos, ahora nombrados como token en vez de literales sueltos repetidos (sin inventar ninguna duración/curva nueva):

| Token | Valor | Uso real |
| :--- | :--- | :--- |
| `--duration-fast` | `0.15s` | `.pin-dot-indicator` |
| `--duration-base` | `0.2s` | `body`, `.btn-touch`, `.input-touch` |
| `--ease-standard` | `ease` | `body`, `.input-touch`, `.pin-dot-indicator` |
| `--ease-standard-in-out` | `ease-in-out` | `.btn-touch` |

**Capa compartida** (`apps/frontend/src/styles/`):

| Ubicación | Propiedad | Token |
| :--- | :--- | :--- |
| `base/reset.css` (`body`) | `background-color, color` | `var(--duration-base) var(--ease-standard)` |
| `components/buttons.css` (`.btn-touch`) | `all` | `var(--duration-base) var(--ease-standard-in-out)` |
| `components/inputs.css` (`.input-touch`) | `border-color` | `var(--duration-base) var(--ease-standard)` |
| `components/pin.css` (`.pin-dot-indicator`) | `all` | `var(--duration-fast) var(--ease-standard)` |

**Capa de componente** (`*.module.css` — los tokens de `:root` cascan globalmente, ningún import extra necesario): auditados los 39 `.module.css` del proyecto, 3 usos más consumían el mismo valor exacto sin el token — migrados a los mismos tokens de arriba, cero cambio visual:

| Ubicación | Propiedad | Token |
| :--- | :--- | :--- |
| `PinLoginModal.module.css` (`.btn-link`) | `opacity` | `var(--duration-fast) var(--ease-standard)` |
| `PinLoginModal.module.css` (`.recent-operator-chip`) | `background-color` | `var(--duration-fast) var(--ease-standard)` |
| `ActionButton.module.css` (`.circle`) | `transform` / `background-color, color, border-color` | `var(--duration-fast)` / `var(--duration-base)` (ambos `var(--ease-standard)`) |

**Gap real distinto, no resuelto a propósito (2 valores sin token, en `.module.css`):**

| Ubicación | Propiedad | Valor real | Nota |
| :--- | :--- | :--- | :--- |
| `ReportsDashboard.module.css` (`.progress-bar-fill`) | `width` | `0.4s ease` | Relleno de barra de progreso (reportes) |
| `FEFOInventoryHealthBar.module.css` (`.health-bar-segment`) | `width` | `0.3s` (sin curva explícita) | Relleno de barra de progreso (salud de inventario) — mismo propósito semántico que la anterior, valor distinto, sin comentario que lo justifique |

Ambos son animaciones de "relleno de ancho" con propósito casi idéntico pero duración distinta entre sí, sin evidencia de que sea intencional. No se unificó ni se les asignó un token nuevo en este pase — cambiar cualquiera de los dos valores altera el timing visible de una barra real, una decisión de producto, no de estructura. Candidato a decisión explícita en un ticket aparte (¿un solo valor para ambas, o dos tokens con nombre que refleje un propósito distinto?).

> **Gap real restante (distinto — este es de cobertura, no de tokens):** `prefers-reduced-motion: no-preference` gatea la transición de `body` y el `hover` de `ActionButton.circle`; el resto de transiciones de la tabla no están condicionadas a la preferencia del usuario todavía. No se corrige en este documento (sería un cambio de comportamiento, no de estructura/tokens) — candidato a ticket de accesibilidad aparte.
>
> No hay aún una curva de aceleración diferenciada por dirección (`ease-out` al entrar / `ease-in` al salir, per las mejores prácticas de la Fase 3 de `SK-05`) — las transiciones reales usan `ease`/`ease-in-out` genéricos. Documentado tal cual; no se sustituye por una curva "correcta" no verificada en el código.

---

## 6. 📱 Breakpoints y Layout Responsivo

| Breakpoint | Ancho Mínimo | Layout Dominante | Comportamiento del Shell y Tablero |
| :--- | :--- | :--- | :--- |
| **`sm`** | `<640px` | 1 Columna Apilada (Full Touch) | Barra lateral colapsa a franja superior de 44px; paneles apilados. |
| **`md`** | `768px` | Grid de 2 Columnas (KDS Terminal) | Sidebar de 88px fija; grid `Acciones (minmax(260px, 0.85fr)) \| Estado (1fr)`. |
| **`lg`** | `1024px` | Dashboard Grid Backoffice | Shell completo, catálogos en tabla/grilla de alta densidad. |
| **`xl`** | `1280px` | Ultra-Wide Monitor Grid | Pantalla de supervisión central de múltiples áreas. |

---

## 7. 🧩 Catálogo de Componentes

### Ergonomía táctil (aplica a todos los átomos interactivos)
Superficie mínima **48×48px** con **8px** de margen (`.btn-touch`); teclado de PIN **64×64px**; disclosure de desglose de stock **44×44px**. Feedback visual `:active` en **<50ms**.

### Matriz de Estados por Componente Interactivo

| Componente/Variante | Default | Hover | Active | Focus-visible | Disabled | Loading | Error |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `.btn-primary` | ✅ | ✅ | ⚠️ solo transición genérica | ❌ gap | ❌ gap | ❌ gap | N/A |
| `.btn-secondary` | ✅ | ✅ | ⚠️ solo transición genérica | ❌ gap | ❌ gap | ❌ gap | N/A |
| `.btn-danger` | ✅ | ✅ (`filter: brightness`) | ⚠️ solo transición genérica | ❌ gap | ❌ gap | ❌ gap | N/A |
| `.input-touch` | ✅ | N/A | N/A | ✅ (`box-shadow` anillo) | ❌ gap | N/A | vía `ErrorBanner`, no estilo propio del input |

> **Gap real declarado (Guard 7):** ningún botón tiene estilo explícito de `:focus-visible`, `:disabled` ni estado `Loading` (spinner/`aria-busy`) propio — hoy dependen del estilo nativo del navegador. Candidato a ticket de mejora de accesibilidad/estados, fuera de alcance de este refactor de estructura.

### Atomic Design

- **Átomos:** `.btn-touch` (+variantes primary/secondary/danger/icon), `.input-touch`, `UrgencyChip`, `.card-badge-icon`, `.pin-dot-indicator`.
- **Moléculas:** `.card-header` + `.card-title`, `.banner-alert`/`.banner-success`, `.pin-dots-bar`, `RowButton`.
- **Organismos:** `AppShell` (sidebar+topbar+outlet), `FEFOInventoryHealthBar` + panel de 3 cubetas, `.data-table` + `.table-wrapper`, sistema de modales (§ subsección abajo), `InsumoStockBreakdownRow`.

### `AppShell` — estructura de navegación
Grid `88px 1fr`. Barra lateral = "ficha de comanda" (`background: var(--rule)`, wordmark vertical `writing-mode: vertical-rl`, invierte tono respecto al fondo en ambos turnos). Topbar con `border-bottom: 3px solid var(--rule)`, nav + indicador `● Conectado` + badge de usuario + `Cerrar Sesión`. Contenido de ruta **inline** en `<main>`, nunca `<Modal>` flotante (`US-024`); `/ajustes` es layout route con sub-pestañas. `<ProtectedRoute requiredRole?>` envuelve el `<Outlet />`.

### `ActionButton` — botón de acción circular
Objetivo táctil **72×72px**, `border-radius: 9999px` — **única excepción documentada** a las esquinas rectas del sistema. Capa acción (`Extraer`=danger, `Agregar`=primary, `Receta`=warning) independiente de la capa estado/urgencia (solo en chips/health bar). Noche: relleno sólido → contorno de 3px.

### `UrgencyChip` — escala de urgencia de 4 niveles
| Nivel | Etiqueta | Token | Umbral |
| :--- | :--- | :--- | :--- |
| Crítico | `Vencido` | `--color-danger`/`-text` | `< 0` |
| Crítico | `Hoy` | `--color-danger`/`-text` | `< 24h` |
| Atención | `Mañana` | `--color-warning`/`-text` | `< 48h` |
| Vigente | `N Días` | `--color-success`/`-text` | `>= 48h` |

Segmentación centralizada en `shared/components/urgency.ts` (`urgencyFromHours` + `bucketRemanentes`), consumida por chip de fila, `FEFOInventoryHealthBar` y panel de 3 cubetas. WCAG 1.4.1: marca cuadrada de 9px + texto, nunca solo color.

### `RowButton` — botón de fila con prioridad
`RowButton` normal (`--rule` sólido), `RowButton--urgent` (`--color-danger` sólido, fila con chip `Hoy`), `RowButton--ghost` (contorno, `Cancelar`). Variante crítica decidida por la urgencia de la fila, nunca manual.

### `StorageSectorSelect` + desglose de stock por sector
`<select class="input-touch">` (≥48px) con `<label>` asociado. Opciones desde `GET /api/v1/locations` filtradas por `type`/`isActive`; placeholder deshabilitado `— Seleccionar sector —`; submit bloqueado + `ErrorBanner` si vacío. Desglose por fila: disclosure `▸/▾` (≥44px, `aria-expanded`) → lista de definición `sector — cantidad unidad`.

### Sistema de Ventanas Modales
- **`<AuthScreen>`:** pantalla completa (login PIN, rotación forzada, reset por token) — nunca `<Modal>` con scrim.
- **Rutas principales:** inline en `<main>`, deep-linkables.
- **`.modal-overlay`/`.modal-card`:** exclusivas para operaciones transitorias (`WarehouseExtractionModal`, `RecipeSelectorModal`, `DiscardModal`, `ShiftReconciliationWizard`, CRUD de Ajustes). Cobertura `position: fixed; inset: 0; z-index: 1000`, fondo opaco de alto contraste, borde superior de acento 4px `--color-primary`.

### Patrones adicionales (fusión selectiva Stitch, `US-031`)
Chips de operario reciente (`PinLoginModal`, hasta 3, client-only `localStorage`) · botón de acción rápida circular grande (`.action-target-lg`, 72×72px) · resaltado full-bleed de fila con varianza negativa (`ShiftReconciliationWizard`) · barra de herramientas acoplada de búsqueda/filtro/vista (`BodegaRoute`).

### Formateo Inteligente de Cantidades
Insumos discretos (`UNITS`/`PZA`): enteros sin decimales (`12 Ud.`), decrementos `-1/-2/-5`. Insumos continuos (`KG`/`L`): trim de ceros no significativos (`1,75 KG`), decrementos `-0.25/-0.5/-1.0`.

---

## 8. 🖥️ Estados de UI a Nivel de Pantalla

Transversal a todas las pantallas — obligatorios en cada una:

1. **Data Ready:** tarjetas/tablas sobre `--bg-card`, bordes hairline `1px solid var(--border-hairline)` (v5.3.0 — antes `2px solid var(--rule)`). Los controles interactivos conservan `1px solid var(--rule)`.
2. **Loading State:** skeletons animados sobre `--bg-card`, respetando `prefers-reduced-motion`.
3. **Empty State:** panel con ícono + texto en `--text-secondary` (ej. "¡No hay remanentes abiertos en cocina!").
4. **Error State:** `ErrorBanner` inline con borde `--color-danger`, mapeo semántico vía `errorMessageMapper` (Guard 38 — prohibido `window.alert`/`confirm`).

---

## 9. 🗂️ Mapa de Ubicación en Código

| Categoría | Mecanismo real | Ruta en el repo |
| :--- | :--- | :--- |
| Color (tokens) | CSS custom properties | `apps/frontend/src/styles/variables/colors.css` |
| Tipografía (tokens) | CSS custom properties | `apps/frontend/src/styles/variables/typography.css` |
| Espaciado (tokens) | CSS custom properties | `apps/frontend/src/styles/variables/spacing.css` |
| Motion (tokens) | CSS custom properties | `apps/frontend/src/styles/variables/motion.css` |
| Reset/base | CSS | `apps/frontend/src/styles/base/reset.css`, `base/typography.css` |
| Botones | CSS | `apps/frontend/src/styles/components/buttons.css` |
| Inputs/formularios | CSS | `apps/frontend/src/styles/components/inputs.css` |
| Tarjetas | CSS | `apps/frontend/src/styles/components/cards.css` |
| Tablas | CSS | `apps/frontend/src/styles/components/tables.css` |
| Modales | CSS | `apps/frontend/src/styles/components/modals.css` |
| Banners | CSS | `apps/frontend/src/styles/components/banners.css` |
| PIN/Auth | CSS | `apps/frontend/src/styles/components/pin.css` |
| Gestión de usuarios | CSS | `apps/frontend/src/styles/components/user-management.css` |
| Utilidades de layout/espaciado/tipografía | CSS | `apps/frontend/src/styles/layout/utilities.css` |
| Manifiesto de entrada | `@import` únicamente | `apps/frontend/src/index.css` |
| Capa machine-readable | YAML + Google Labs lint | `/DESIGN.md` |
| Reglas de gobernanza Frontend | Markdown | `docs/04_governance_and_quality/rules/frontend_rules.md` |

---

## 10. 🕰️ Historial de Versiones

| Versión | Ticket/US | Sección(es) afectada(s) | Qué cambió |
| :--- | :--- | :--- | :--- |
| 5.4.0 | — (SK-05 v3.13.0 FASE 4, primer uso) | §1, §2, §3 | Medida de legibilidad. Nueva utilidad `.measure` (`max-width: 65ch`) aplicada a subtítulos de panel (vía `PanelHeader`, 7 paneles), descripciones de `RecipeCatalogPanel`/`InsumoCatalogPanel`/`AlertFeed` y textos de ayuda de 3 paneles de reporte. `frontend_rules.md` §2 pasa a "WCAG 2.2" y gana reglas explícitas de contraste de componente (1.4.11), foco visible (2.4.7/2.4.11), autenticación accesible (3.3.8) y medida 45–75ch; §1 nombra el piso SC 2.5.8 (24px). Auditoría acotada a medida: RestoStock es tabular/denso, sin copy de formato largo — la regla es preventiva; sin hallazgos de Gestalt/Hick en este pase. |
| 5.3.0 | — (petición de producto) | §2, §8 | Bordes más tenues. Nuevo token `--border-hairline` (`#d7cfb9` día / `#3c433b` noche); ~40 bordes de contenedor/panel/modal/tabla/divisor pasan de `2px solid var(--rule)` a `1px solid var(--border-hairline)`. `--rule` se reserva para rellenos sólidos y **controles interactivos** (inputs, toggles, botones, keypad PIN), que además bajan a `1px` conservando el color de tinta para no romper WCAG 1.4.11 (≥ 3:1). El borde inferior `3px` del topbar y el contorno `3px` del `ActionButton` (noche) se mantienen. Gate `check_fefo_contrast.mjs` sigue verde (no toca ningún par documentado). |
| 5.2.0 | — | §5 | Auditados los 39 `.module.css` del proyecto (no solo la capa compartida): 3 transiciones más migradas a los tokens de motion (mismo valor, cero cambio visual). Expuesta y documentada una inconsistencia real sin resolver: 2 barras de progreso con propósito casi idéntico usan duraciones distintas (`0.3s`/`0.4s`) sin token ni justificación — dejado como decisión de producto pendiente. |
| 5.1.0 | — | §5, §9 | Motion deja de ser gap: 4 transiciones reales existentes extraídas a tokens (`variables/motion.css`), sin cambiar ningún valor. Cobertura de `prefers-reduced-motion` sigue incompleta (3 de 4), documentado como gap distinto. |
| 5.0.0 | — (migración SK-05 v3.10.0+, Guard 9) | Todas | Migración de estructura cronológica-por-versión al Índice Fijo de 10 secciones. Sin cambios de tokens/comportamiento — solo reorganización. |
| 4.2.0 | `US-016`/`US-025`/`US-031` | §7, §9 | Sub-sectores de bodega (`StorageSectorSelect`, desglose de stock) y fusión selectiva Stitch (chips operario reciente, resaltado varianza, toolbar catálogo). |
| 4.1.0 | `US-023` (`TK-085-FE`–`TK-088-FE`) | §1, §7 | Lámina "Aplicación": `AppShell`, `ActionButton`, `UrgencyChip` de 4 niveles, `RowButton`, panel de 3 cubetas. |
| 4.0.0 | `US-022` (`TK-081-FE`–`TK-084-FE`) | §2, §3, §6 | Dirección "Sistema FEFO" (turno Día/Noche), reemplaza "Señal Industrial" v3.0.0. Bordes en vez de sombras, esquinas rectas, tipografía Big Shoulders Display/IBM Plex. |
| 3.0.0 | — | §7, §8 | `FEFOInventoryHealthBar` tri-color, desacoplamiento operatoria cocina/administración, `LocationFilterTabs`. |
