---
document: ui_ux_design_system
version: 2.0.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/02_architecture_design/04_technical_design.md
---

# 🎨 Especificación de Sistema de Diseño UI/UX y Ergonomía Táctil

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Arquitectura de Sistema (04_technical_design.md)](./04_technical_design.md) | [📖 Glosario & Reglas](../01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Modelado de Datos (06_database_schema.md) ➡️](../03_persistence_and_api/06_database_schema.md)

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


