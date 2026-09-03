---
document: ui_ux_design_system
version: 4.1.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/02_architecture_design/04_technical_design.md
  - docs/05_agile_planning/11_user_stories/shared/US-022.md
  - docs/05_agile_planning/11_user_stories/shared/US-023.md
---

# 🎨 Especificación de Sistema de Diseño UI/UX y Ergonomía Táctil

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Arquitectura de Sistema (04_technical_design.md)](./04_technical_design.md) | [📖 Glosario & Reglas](../01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Modelado de Datos (06_database_schema.md) ➡️](../03_persistence_and_api/06_database_schema.md)

---

## 🎫 v4.0.0 — Dirección "Sistema FEFO" (Turno Día/Noche)

> **Reemplaza** la dirección v2.0.0/v3.0.0 "Señal Industrial" (tema oscuro único) documentada más abajo, que queda conservada solo como referencia histórica. Cubierto por `US-022` y sus tickets `TK-081-FE` a `TK-084-FE`.

**Concepto:** dos turnos, un mismo sistema. De día la interfaz es una **comanda de papel** — ficha clara, tinta oscura, bordes de sello. De noche es la **pizarra del turno** — fondo oscuro tipo pizarrón, texto y acentos en tiza (tonos más brillantes para sostener el mismo contraste objetivo). El operario alterna entre ambos con un interruptor visible en el header; la elección se guarda por dispositivo (`localStorage`) y, si no hay elección guardada, arranca según `prefers-color-scheme` del sistema operativo.

### Paleta de Tokens (CSS Variables)

```css
/* Turno Día (valores por defecto en :root) */
:root {
  --bg-root: #efe8d8;        --bg-card: #f7f2e6;        --border-card: #18140f;   --rule: #18140f;
  --color-primary: #2e5f76;  --color-primary-hover: #24495c;  --color-primary-on: #fbf8ef;
  --color-secondary: #6e6555;
  --color-danger: #b43a24;   --color-danger-text: #a03420;   --color-danger-on: #fbf8ef;
  --color-warning: #8a6414;  --color-warning-text: #6b4c0e;
  --color-success: #3e6b3a;  --color-success-text: #345c2f;  --color-info: #2e5f76;  --color-info-text: #244d61;
  --text-primary: #18140f;   --text-secondary: #6e6555;
  --font-family-display: 'Big Shoulders Display', 'Arial Narrow', sans-serif;
  --font-family-body: 'IBM Plex Sans', system-ui, sans-serif;
  --font-family-mono: 'IBM Plex Mono', 'SFMono-Regular', monospace; /* lotes, cantidades, timestamps */
}

/* Turno Noche — @media (prefers-color-scheme: dark), guardado :root:not([data-theme="light"]),
   y repetido en :root[data-theme="dark"] para que el interruptor gane en ambos sentidos */
:root[data-theme="dark"] {
  --bg-root: #171c18;        --bg-card: #1f251f;        --border-card: #e9e4d0;   --rule: #e9e4d0;
  --color-primary: #6faac7;  --color-primary-hover: #8bc0d8;  --color-primary-on: #171c18;
  --color-secondary: #9aa394;
  --color-danger: #e1573a;   --color-danger-text: #f0806a;   --color-danger-on: #171c18;
  --color-warning: #e6be55;  --color-warning-text: #e6be55;
  --color-success: #7cb36e;  --color-success-text: #7cb36e;  --color-info: #6faac7;  --color-info-text: #6faac7;
  --text-primary: #f2eedd;   --text-secondary: #9aa394;
}
```

> **Nota de contraste (validada con formula de luminancia relativa WCAG, no estimada — corregido durante `TK-081-FE` y `TK-084-FE`):** `--color-danger`/`--color-warning`/`--color-success`/`--color-info` son fondos/rellenos, no texto directo. Cada uno tiene su propia variante `-text` para usarse como texto sobre el badge tintado al 12–15% de su propio color (el caso mas exigente, contra el fondo real donde compone el badge — `--bg-root` o `--bg-card` segun el contenedor, **verificar contra el fondo real de cada uso, no asumir uno**: un primer calculo de `TK-084-FE` contra `--bg-card` dio numeros optimistas que no correspondian al `--bg-root` real detras de `.location-row`, y ademas nunca se habia verificado `--color-success` como texto — resultó en un fallo AA real de ~4.19:1 en turno dia, encontrado recien en la revision adversarial de `TK-084-FE`): de dia, `--color-danger-text` (`#a03420`, ~5.6:1), `--color-warning-text` (`#6b4c0e`, ~5.84:1 — `--color-warning` solo da ~3.98:1), `--color-success-text` (`#345c2f`, ~5.2:1 — `--color-success` solo da ~4.19:1, bajo AA) y `--color-info-text` (`#244d61`, ~6:1 — `--color-info` solo pasaba por apenas ~4.63:1, sin margen real); de noche, `--color-danger-text` (`#f0806a`, ~5.02:1 — igualarlo a `--color-danger` daba ~3.55:1) y `--color-warning-text`/`--color-success-text`/`--color-info-text` iguales a su color base (ya suficientemente claros de noche, verificado ≥4.7:1 en los cuatro casos). `--color-danger-on`/`--color-primary-on` son un tercer caso distinto: texto sobre el **relleno solido** de un boton (`.btn-danger`, `.btn-primary`), no sobre un tinte transparente.

> **Auditoría v4.1.0 completa (`TK-088-FE`, `docs/audits/AUDIT-A11Y-001-TK-088-FE-contrast-report.md`):** 40 pares color/fondo (20 por turno) verificados con calculadora WCAG real contra el fondo compuesto real. **Todos ≥ objetivo.** `--text-primary` (cuerpo, label de nav, wordmark de sidebar, texto sobre `--rule`): 13–16:1 en ambos turnos (AAA con holgura). Variantes `-text` de chip/cubeta: 5.0–8.8:1 (AA, convención v4.0.0). **Un fallo AA real corregido:** el chip de urgencia crítico en **turno Noche** usaba `--color-danger` (`#e1573a`) como texto sobre `--bg-card` → **4.19:1, bajo AA**; cambiado a `--color-danger-text` (`#f0806a`) → **5.96:1**. Los 3 chips de noche pasan a usar su variante `-text` (para warning/success `-text` == base de noche, sin cambio visual). `--color-*-on` sobre relleno sólido (`RowButton--urgent`, `.btn-primary`, `.btn-danger`): 4.6–6.8:1 (AA, tercer caso ya documentado arriba).

### Cambios Estructurales (no solo de color)
* **Bordes en vez de sombras:** `box-shadow` se elimina de `.card-dashboard` y equivalentes; se reemplaza por `border: 2px solid var(--rule)`.
* **Esquinas rectas:** `border-radius: 0` en tarjetas, botones e inputs (antes 4–8px).
* **Tipografía:** `Big Shoulders Display` (titulares/cifras, condensada tipo sello) + `IBM Plex Sans` (cuerpo) + `IBM Plex Mono` (datos alineados en columna: lotes, cantidades, `HH:MM:SS`) — reemplazan `Oswald`/`Barlow` en todo el sistema, no solo en el tablero de cocina.
* **Objetivos táctiles sin cambio:** `.btn-touch` sigue en 48×48px mínimo; el teclado de PIN sigue en 64×64px — ver `TK-083-FE`.

---

## 🧾 v4.1.0 — Lámina "Aplicación": Shell de Rutas, Componentes y Panel de Estado

> **Amplía** la dirección v4.0.0 con la tercera lámina de la propuesta Sistema FEFO. Cubierto por `US-023` y sus tickets `TK-085-FE` a `TK-088-FE`. No cambia ningún token cromático de v4.0.0 — añade estructura de navegación y tres componentes nuevos.

### 1. `AppShell` — estructura de navegación

```
┌────┬──────────────────────────────────────────────┐
│ S  │  [Inventario] Estaciones Recetas Reportes …   │  ← topbar: nav + sesión + Cerrar Sesión
│ I  ├──────────────────────────────────────────────┤
│ D  │                                              │
│ E  │            <Outlet /> (ruta activa)           │
│ B  │                                              │
│ A  │                                              │
│ R  │                                              │
└────┴──────────────────────────────────────────────┘
```

* **Grid:** `grid-template-columns: 88px 1fr`. En breakpoint `sm` (<640px) la barra lateral colapsa a una franja superior de 44px con el wordmark horizontal.
* **Barra lateral (ficha de comanda):** `background: var(--rule)`; wordmark del restaurante en `writing-mode: vertical-rl; transform: rotate(180deg)`, `--font-family-display`, color `var(--bg-root)` (invertido, contrasta en ambos turnos); dos perforaciones circulares decorativas (`aria-hidden`) de 18px sobre el borde derecho. El nombre sale de `SystemSettings` (branding dinámico, `TK-075-FE`) con fallback `"RestoStock"`.
* **Topbar:** `border-bottom: 3px solid var(--rule)`. Contiene `<nav>` de rutas, indicador `● Conectado` (`--color-success`), badge de usuario y botón `Cerrar Sesión` (`.btn-danger`). El interruptor Día/Noche de `US-022` se mantiene aquí.
* **Rutas y acceso:**

  | Ruta | Path | Contenido | Acceso |
  | :--- | :--- | :--- | :--- |
  | Inventario | `/` | Tablero FEFO de cocina (remanentes activos, health bar, filtros de estación) | Operario autenticado |
  | Estaciones | `/estaciones` | Extracción de bodega (operario); catálogo/reabastecimiento de insumos y ubicaciones (acciones solo `ADMIN`, ocultas a operario) | Operario autenticado (ruta); `ADMIN` (acciones de gestión) |
  | Recetas | `/recetas` | Recetario: consulta (operario); alta de recetas (solo `ADMIN`, oculta a operario) | Operario autenticado (ruta); `ADMIN` (alta) |
  | Reportes | `/reportes` | Dashboard de mermas + KPIs (TRR, valorización) | **`ADMIN`** |
  | Ajustes | `/ajustes` | Configuración del restaurante + usuarios + roles + historial de movimientos | **`ADMIN`** |

* **Gating de acción por rol (dentro de rutas de operario):** los componentes reutilizados en rutas de menor restricción que su montaje anterior (`InsumoCatalogPanel`, `RecipeCatalogPanel`) reciben un prop `canManage` (default `false`) que oculta cada `<button>` de mutación cuyo endpoint exige `ADMIN`. Un botón que devolvería 403 no debe renderizarse (evita la falsa regresión de "cero cambio funcional").

* **`<ProtectedRoute requiredRole?>`:** envuelve el `<Outlet />`. Sin sesión → render de `PinLoginModal` (comportamiento actual). Con sesión pero sin el rol requerido → `<Navigate to="/" replace />`. Alinea con la autoredirección por permisos que introducirá `US-015` (Dynamic RBAC) sin bloquearse a ella: hoy compara `currentUser.role`.
* **Operaciones transitorias:** `WarehouseExtractionModal`, `RecipeSelectorModal`, `DiscardModal`, `ShiftReconciliationWizard` **siguen siendo modales** lanzados desde su ruta padre — no son rutas. Nav activa con `border-bottom: 3px solid var(--color-primary)`.

### 2. `ActionButton` — botón de acción circular

* **Objetivo táctil:** 72×72px (supera el mínimo de 48px). `border-radius: 9999px` — **única excepción documentada** a la regla de esquinas rectas del sistema; su forma redonda es la señal que lo distingue de todo lo demás (que es cuadrado).
* **Dos capas de color independientes** (la confusión que la referencia original mezclaba):
  * capa **acción** — cuál botón es cuál: `Extraer` = `--color-danger`, `Agregar` = `--color-primary`, `Receta` = `--color-warning`.
  * capa **estado/urgencia** — vive solo en los chips y la health bar, nunca en los botones.
* **Turno Noche:** relleno sólido → contorno de 3px + ícono/label en el color (mismo patrón "tiza" que los badges v4.0.0). Borde exterior siempre `var(--rule)` de día.
* **Composición:** círculo + label debajo (`--font-family-body`, 600) + hint opcional (`--font-family-mono`, `--text-secondary`).

### 3. `UrgencyChip` — escala de urgencia de 4 niveles

Reemplaza el `StatusBadge` tri-color heredado. Escala completa, sin cortar a la mitad:

| Nivel | Etiqueta | Token de color | Umbral (`hoursRemaining`) |
| :--- | :--- | :--- | :--- |
| Crítico | `Vencido` | `--color-danger` / `--color-danger-text` | `< 0` (ya vencido) |
| Crítico | `Hoy` | `--color-danger` / `--color-danger-text` | `< 24` |
| Atención | `Mañana` | `--color-warning` / `--color-warning-text` | `< 48` |
| Vigente | `N Días` | `--color-success` / `--color-success-text` | `>= 48` (`Math.ceil(h/24)`) |

> La segmentación vive en **un solo helper** (`shared/components/urgency.ts`: `urgencyFromHours` + `bucketRemanentes`), consumido por el chip de fila, la `FEFOInventoryHealthBar` y el panel Estado de 3 cubetas — todos muestran los mismos conteos (TK-087-FE).

* **Regla WCAG 1.4.1:** siempre marca cuadrada de 9px (`currentColor`) **+ texto**, nunca solo color.
* De día: relleno tintado al 12–15% del color + texto en la variante `-text`. De noche: contorno + texto en el color base (más brillante).

### 4. `RowButton` — botón de fila con prioridad

* `RowButton` normal (`--rule` sólido), `RowButton--urgent` (`--color-danger` sólido, para la fila cuyo chip es `Hoy`), `RowButton--ghost` (transparente + contorno, para `Cancelar`).
* La variante crítica se decide por la urgencia de la fila, no manualmente.

### 5. Panel `Estado` de 3 cubetas + leyenda numérica

* El bloque de resumen del tablero pasa de 2 tarjetas (`Remanentes Abiertos`, `Vencimiento Próximo <24h`) a **3 cubetas de severidad** alineadas con los 3 segmentos de la health bar:
  * `Vigentes` (`--color-success`) · `Vencimiento Próximo` (`--color-warning`) · `Críticos Hoy` (`--color-danger`).
* `FEFOInventoryHealthBar` gana una **leyenda numérica** bajo la barra: `58% vigente (7)` · `25% próximo (3)` · `17% crítico (2)` — `--font-family-mono`, cada entrada con su punto de color. La barra en sí conserva `role="img"` con `aria-label` descriptivo.
* **Grid `Acciones | Estado`:** en breakpoint `md+`, panel izquierdo con los 3 `ActionButton`, panel derecho con las 3 cubetas + health bar, separados por `border-left: 2px dashed var(--rule)`. En `sm` se apilan.

### Cambios estructurales de layout

* Nuevo contenedor raíz `<AppShell>` en `App.tsx`; el contenido actual del tablero se mueve a una ruta `IndexRoute`.
* `App.module.css` reescribe `.dashboard-container` como el grid del shell; el header full-width apilado se sustituye por sidebar + topbar.

---

## 📝 Visión General y Estilo Visual
**v2.0.0 — Dirección "Señal Industrial":** reemplaza el tema *Dark Petrol & Charcoal* (v1.x) para la **pantalla táctil de cocina** (login por PIN, consulta FEFO, extracción, alertas críticas, cierre de turno). El sistema utiliza negro industrial casi puro, un único ámbar de seguridad como acento estructural/de marca y un rojo de alerta reservado en exclusiva a la urgencia FEFO crítica — inspirado en señalética de planta, pensado para leerse a distancia de brazo bajo la luz intensa de cocina. Tipografía condensada en titulares (`Oswald`) + grotesca robusta en cuerpo/datos (`Barlow`), bordes gruesos y esquinas casi rectas en lugar de sombras suaves.

> **Alcance:** cubre las pantallas táctiles de cocina (`TK-067`) y, por decisión explícita del humano, también el **Dashboard administrativo** de escritorio (`StockManagerDashboard`: Catálogo, Reabastecimiento, Reportes de Mermas, panel de acciones; `TK-068`) — mismos tokens de color/tipografía en ambos contextos, sin adaptación de densidad/layout específica para escritorio más allá de lo ya definido en la Matriz de Breakpoints.

> **Nota de diseño — ámbar compartido:** `--color-primary` y `--color-warning` usan intencionalmente el mismo tono. En una señalética industrial el ámbar ya significa "atención/precaución", así que reforzar la marca con ese mismo tono es coherente con un producto anti-merma. La contrapartida: reservar el relleno ámbar sólido para elementos que realmente ameritan atención (acciones primarias, estados "usar antes de 24h"); para acciones neutras (secundarias, navegación) usar `--color-secondary` (gris oscuro) o contorno, nunca ámbar sólido decorativo.

> **Integración con Google Labs & Arnés `.agents`:**  
> Este documento actúa como la **SSoT de UI/UX** coordinada por la Habilidad [`SK-05_design_ui_ux_system.md`](../../.agents/skills/specs/02_architecture_design/SK-05_design_ui_ux_system.md) (v3.5.0). Sus tokens cromáticos y reglas táctiles son exportados automáticamente al estándar machine-readable [`/DESIGN.md`](../../DESIGN.md) en la raíz del proyecto y auditados con la CLI de Google Labs (`npx -y @google/design.md lint DESIGN.md`).

---

## 🎨 Paleta Cromática & Tokens de Animación (CSS Variables)

```css
:root {
  /* Fondo de Pantalla y Contenedores */
  --bg-root: hsl(0, 0%, 6%);              /* #101010 - Negro Industrial */
  --bg-card: hsl(0, 0%, 10%);             /* #1a1a1a - Superficie de Tarjeta */
  --border-card: hsl(0, 0%, 40%);         /* #666666 - Borde de componente táctil (≥3:1 no-texto, WCAG 1.4.11) */

  /* Colores Primarios y Acentos */
  --color-primary: hsl(24, 100%, 50%);      /* #ff6a00 - Ámbar de Seguridad Industrial */
  --color-primary-hover: hsl(24, 100%, 44%); /* #e05f00 */
  --color-primary-on: hsl(0, 0%, 6%);       /* #101010 - texto/icono sobre fondo --color-primary (7.06:1 AAA) */
  --color-secondary: hsl(0, 0%, 20%);       /* #333333 - Gris Neutro (acciones secundarias/no urgentes) */

  /* Indicadores de Salud FEFO & Alertas (Badges & Franjas) */
  --color-danger: hsl(2, 100%, 44%);        /* #e10600 - Rojo de Alerta (< 6h FEFO). SOLO fondo/badge/borde — nunca texto pequeño directo, ver --color-danger-text */
  --color-danger-text: hsl(4, 100%, 71%);   /* #ff6b5e - variante clara para texto/labels de alerta (6.2–6.8:1 sobre --bg-root/--bg-card) */
  --color-warning: hsl(24, 100%, 50%);      /* #ff6a00 - mismo tono que --color-primary, ver nota de diseño arriba (< 24h FEFO) */
  --color-success: hsl(148, 61%, 47%);      /* #2fbf6e - Verde de Confirmación (cierre de turno, matches OK) */

  /* Tipografía y Textos */
  --font-family-display: 'Oswald', system-ui, sans-serif;   /* Titulares, labels, cifras destacadas */
  --font-family-body: 'Barlow', system-ui, sans-serif;      /* Cuerpo de texto, metadatos */
  --text-primary: hsl(84, 12%, 96%);      /* #f5f5f0 - ~18:1 sobre --bg-root */
  --text-secondary: hsl(60, 2%, 55%);     /* #8a8a86 - 5.0–5.5:1 sobre --bg-root/--bg-card (cumple el mínimo 4.5:1 de texto secundario) */

  /* Tokens de Animación y Feedback Táctil */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --scale-press: scale(0.96);             /* Efecto de compresión táctil al hacer click */
}
```

> **Regla de contraste de texto sobre color:** `--color-primary` y `--color-success` son suficientemente claros para llevar texto/ícono oscuro (`--color-primary-on` / `#101010`, ≥7:1). `--color-danger` es más oscuro de lo que parece (`#e10600`, luminancia relativa ~0.16) — como fondo de botón/badge lleva **texto blanco** (`#ffffff`, 4.97:1, nivel AA; para AAA usar tamaño ≥19px en negrita) y **nunca** se usa como color de texto directo sobre `--bg-root`/`--bg-card` (3.5–3.8:1, insuficiente) — para eso está `--color-danger-text`.

---

## 📱 Matriz de Breakpoints y Layout Responsivo

| Breakpoint | Ancho Mínimo | Layout Dominante | Dispositivo Objetivo |
| :--- | :--- | :--- | :--- |
| **`sm`** | `640px` | 1 Columna Apilada (Full Touch) | Móvil Operativo / Terminal Táctil Vertical |
| **`md`** | `768px` | Grid de 2 Columnas | Tablet de Cocina Horizon (KDS Terminal) |
| **`lg`** | `1024px` | Dashboard Grid (3 Columnas) | Laptop / Terminal Backoffice Administración |
| **`xl`** | `1280px` | Ultra-Wide Monitor Grid (4 Columnas) | Pantalla de Supervisión Central de Cocinas |

---

## 🧱 Catálogo de Componentes (Atomic Design)

1. **Átomos (Base Elements):**
   - `TouchButton`: Botón táctil con respuesta visual $<50\text{ms}$ y transform `--scale-press`.
   - `StatusBadge`: Etiqueta tri-color (Rojo `--color-danger-text` / Ámbar `--color-warning` / Verde `--color-success`) con indicador pulsante.
   - `NumericInput`: Teclado numérico sanitizado con Zod para cantidades físicas.
2. **Moléculas (Composite UI):**
   - `PinPadModal`: Ventana modal táctil de autenticación por PIN (botones **cuadrados/blocky** de mínimo $64\text{px} \times 64\text{px}$, esquinas casi rectas — sustituye el estilo circular de v1.x, alineado a la identidad de señalética industrial).
   - `GaugeDialCard`: Velocímetro FEFO con aguja indicadora y lectura numérica central.
   - `RemanenteCard`: Tarjeta de insumo abierto con borde izquierdo de acento (6px) por nivel de urgencia y barra de progreso de vida útil.
3. **Organismos (Full Views):**
   - `KitchenTabletView`: Panel táctil de operaciones de cocina.
   - `StockManagerDashboard`: Tablero principal de administración de inventarios.

---

## 👆 Ergonomía Táctil y Accesibilidad (WCAG 2.1)

1. **Superficie Táctil Mínima (`.btn-touch`):**
   - Mínimo **48px de alto por 48px de ancho** con un margen de separación de al menos **8px**.
   - Para el teclado táctil de PIN (`auth`): botones cuadrados/blocky de **64px x 64px** mínimo.
   - **Feedback Visual Instantáneo:** Todo toque táctil debe generar un estado visual activo (`:active`) en menos de **$50\text{ms}$**.
2. **Accesibilidad WCAG 2.1 AA/AAA:**
   - Contraste de texto sobre fondo oscuro de al menos `7:1` para números principales y `4.5:1` para texto secundario.
3. **Manejo Obligatorio de 4 Estados de UI:**
   - **Data Ready:** Tarjetas renderizadas con contraste alto.
   - **Loading State:** Skeletons animados pulsantes sobre `--bg-card`.
   - **Empty State:** Ilustración minimalista en `--color-primary` (ámbar) con mensaje descriptivo ("No hay remanentes en riesgo").
   - **Error State:** Banner con borde rojo `--color-danger` (uso decorativo/no-textual, ≥3:1) y botón táctil de reintento; el texto del banner usa `--text-primary` o `--color-danger-text`, nunca `--color-danger` directo.

---

## 🔢 Formateo Inteligente de Cantidades y Adaptación por Unidad (UX Anti-Ambigüedad)

1. **Insumos Discretos/Contables (`UNITS`, `UNIDADES`, `PZA`, `PACK`):**
   - Renderizado en números enteros directos sin decimales (ej. **`12 Ud.`** en lugar de `12.000 UNITS`) cuando el valor es entero.
   - Etiqueta de unidad localizada en español: `UNITS` $\rightarrow$ **`Ud.`**
   - Controles de consumo rápido táctiles adaptativos: **`-1`**, **`-2`**, **`-5`**.

2. **Insumos Continuos por Peso/Volumen (`KG`, `L`, `ML`, `G`):**
   - Supresión de ceros no significativos a la derecha (*trim trailing zeros*) (ej. **`1,75 KG`** en lugar de `1.750 KG`, **`4,5 L`** en lugar de `4.500 L`).
   - Controles de consumo rápido táctiles fraccionales: **`-0.25`**, **`-0.5`**, **`-1.0`**.

---

## 🪟 Sistema de Ventanas Emergentes Flotantes (Solid Industrial Overlays)

Todas las ventanas modales de la aplicación (`PinLoginModal`, `WarehouseExtractionModal`, `RecipeSelectorModal`, `DiscardModal`, `ShiftReconciliationWizard` y `ReportsDashboard`) se abren de forma **flotante sobre el tablero principal de la pantalla**. v2.0.0 sustituye el tratamiento *glassmorphism* de v1.x por superficies **opacas y de alto contraste**: bajo luz intensa de cocina, un fondo translúcido con desenfoque reduce legibilidad justo donde más se necesita máxima definición.

1. **Capa Oscura Flotante de Fondo (`.modal-overlay` / `.modal-backdrop`):**
   - Cobertura fija (`position: fixed; inset: 0; z-index: 1000;`).
   - Fondo **opaco**, sin desenfoque (`background-color: rgba(16, 16, 16, 0.92)`; sin `backdrop-filter`).
   - Oculta por completo el tablero de fondo — prioriza foco absoluto sobre el modal frente a mantener contexto visual borroso.

2. **Tarjeta Emergente Flotante (`.modal-card`):**
   - Posicionamiento centrado en viewport, sobre `--bg-card`, con borde superior de acento de 4px en `--color-primary` (misma firma visual que los encabezados de pantalla) en lugar de resplandor de color.
   - Esquinas casi rectas (`border-radius: 4px`), consistentes con el resto de componentes de esta dirección.
   - Animación de entrada suave tipo *scale-up* (`transform: scale(0.94) -> scale(1)` en $250\text{ms}$), sin cambios respecto a v1.x.

---

## ⚡ 7. Arquitectura UI/UX v3.0: Salud de Inventario, Navegación Táctica y Filtros de Estación

**v3.0.0 — Innovaciones de Experiencia Operativa:**
1. **Medidor Visual de Salud de Inventario (FEFO Inventory Health Bar - "1-Second Glance"):**
   - Barra de progreso tri-color en tiempo real en la cabecera del tablero que permite al Chef Ejecutivo evaluar el nivel de riesgo global de mermas del turno en 1 segundo:
     - 🟢 **Seguro ($>24\text{h}$):** Verde `--color-success`.
     - 🟡 **Atención ($6\text{h}-24\text{h}$):** Ámbar `--color-primary`.
     - 🔴 **Crítico ($<6\text{h}$):** Rojo `--color-danger`.
2. **Desacoplamiento de Header (Barra Táctica vs. Drawer de Administración):**
   - **Acciones Tácticas de Cocina (Foco Operatorio Mantenido):** `Extraer Bodega`, `Preparar Receta`, `Conciliar Turno`.
   - **Menú Flotante de Administración (`Administración ▾`):** Agrupa `Personal`, `Roles`, `Sectores`, `Ajustes`, `Movimientos` y `Catálogo` bajo un menú desplegable de acceso controlado para evitar saturación cognitiva en la línea de servicio.
3. **Filtros por Estación Física en Cocina (`LocationFilterTabs`):**
   - Pestañas táctiles en la vista de remanentes para filtrar por sector físico: `[ Todos ]`, `[ Refrigerador Principal ]`, `[ Mesa de Preparación ]`, `[ Línea de Servicio ]`.
4. **Reloj Regresivo en Vivo (Live Countdown):**
   - Temporizador dinámico en formato `HH:MM:SS` con micro-animación pulsante para insumos críticos ($<6\text{h}$).


