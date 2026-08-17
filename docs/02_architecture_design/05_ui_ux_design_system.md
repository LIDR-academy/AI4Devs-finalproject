---
document: ui_ux_design_system
version: 1.4.0
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
Basado en la referencia de tablero de control industrial de alta precisión (**Dark Petrol Analytics Dashboard**), el sistema de interfaz de **RestoStock** utiliza un tema oscuro elegante (*Dark Petrol & Charcoal*) con contraste acentuado en turquesa reluciente, amarillo miel y alertas tri-color para la gestión táctil e intuitiva del método FEFO en cocina.

> **Integración con Google Labs & Arnés `.agents`:**  
> Este documento actúa como la **SSoT de UI/UX** coordinada por la Habilidad [`SK-05_design_ui_ux_system.md`](../../.agents/skills/specs/02_architecture_design/SK-05_design_ui_ux_system.md) (v3.5.0). Sus tokens cromáticos y reglas táctiles son exportados automáticamente al estándar machine-readable [`/DESIGN.md`](../../DESIGN.md) en la raíz del proyecto y auditados con la CLI de Google Labs (`npx -y @google/design.md lint DESIGN.md`).

---

## 🎨 Paleta Cromática & Tokens de Animación (CSS Variables)

```css
:root {
  /* Fondo de Pantalla y Contenedores */
  --bg-root: hsl(205, 38%, 7%);           /* #0b1319 - Gris Carbón Petróleo Profundo */
  --bg-card: hsl(205, 38%, 10%);          /* #101c24 - Pizarra Petróleo */
  --border-card: hsl(205, 25%, 18%);      /* #192a36 - Línea divisoria sutil */

  /* Colores Primarios y Acentos */
  --color-primary: hsl(173, 100%, 33%);   /* #00a896 - Turquesa Petrol (Teal) */
  --color-primary-hover: hsl(173, 100%, 40%); /* #02c39a */
  --color-secondary: hsl(43, 89%, 60%);   /* #e9c46a - Amarillo Miel (Amber Accent) */

  /* Indicadores de Salud FEFO & Alertas (Gauge & Badges) */
  --color-danger: hsl(0, 100%, 58%);      /* #ff2a2a - Rojo Intenso (< 12h FEFO) */
  --color-warning: hsl(43, 89%, 60%);     /* #f4a261 - Amarillo Calidez (< 24h FEFO) */
  --color-success: hsl(173, 100%, 33%);   /* #00a896 - Verde Turquesa (Fresco / Óptimo) */

  /* Tipografía y Textos */
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --text-primary: hsl(0, 0%, 98%);        /* #fafafa - Blanco Puro */
  --text-secondary: hsl(205, 15%, 70%);    /* #94a3b8 - Gris Azulado para subtextos y ejes */

  /* Tokens de Animación y Feedback Táctil */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --scale-press: scale(0.96);             /* Efecto de compresión táctil al hacer click */
}
```

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
   - `StatusBadge`: Etiqueta tri-color (Rojo/Amarillo/Verde) con indicador pulsante.
   - `NumericInput`: Teclado numérico sanitizado con Zod para cantidades físicas.
2. **Moléculas (Composite UI):**
   - `PinPadModal`: Ventana modal táctil de autenticación por PIN (botones circulares de $64\text{px} \times 64\text{px}$).
   - `GaugeDialCard`: Velocímetro FEFO con aguja indicadora y lectura numérica central.
   - `RemanenteCard`: Tarjeta de insumo abierto con barra de progreso de vida útil.
3. **Organismos (Full Views):**
   - `KitchenTabletView`: Panel táctil de operaciones de cocina.
   - `StockManagerDashboard`: Tablero principal de administración de inventarios.

---

## 👆 Ergonomía Táctil y Accesibilidad (WCAG 2.1)

1. **Superficie Táctil Mínima (`.btn-touch`):**
   - Mínimo **48px de alto por 48px de ancho** con un margen de separación de al menos **8px**.
   - Para el teclado táctil de PIN (`auth`): botones circulares de **64px x 64px**.
   - **Feedback Visual Instantáneo:** Todo toque táctil debe generar un estado visual activo (`:active`) en menos de **$50\text{ms}$**.
2. **Accesibilidad WCAG 2.1 AA/AAA:**
   - Contraste de texto sobre fondo oscuro de al menos `7:1` para números principales y `4.5:1` para texto secundario.
3. **Manejo Obligatorio de 4 Estados de UI:**
   - **Data Ready:** Tarjetas renderizadas con contraste alto.
   - **Loading State:** Skeletons animados pulsantes sobre `--bg-card`.
   - **Empty State:** Ilustración minimalista turquesa con mensaje descriptivo ("No hay remanentes en riesgo").
   - **Error State:** Banner con borde rojo `--color-danger` y botón táctil de reintento.

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

## 🪟 Sistema de Ventanas Emergentes Flotantes (Glassmorphism Floating Overlays)

Todas las ventanas modales de la aplicación (`PinLoginModal`, `WarehouseExtractionModal`, `RecipeSelectorModal`, `DiscardModal`, `ShiftReconciliationWizard` y `ReportsDashboard`) se abren de forma **flotante sobre el tablero principal de la pantalla**:

1. **Capa Oscura Flotante de Fondo (`.modal-overlay` / `.modal-backdrop`):**
   - Cobertura fija (`position: fixed; inset: 0; z-index: 1000;`).
   - Fondo oscuro semitransparente con desenfoque de cristal borroso (`backdrop-filter: blur(8px); background-color: rgba(11, 19, 25, 0.75)`).
   - Mantiene la visibilidad borrosa del contexto del tablero FEFO al fondo.

2. **Tarjeta Emergente Flotante (`.modal-card`):**
   - Posicionamiento centrado en viewport con sombras proyectadas de alta profundidad (`box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 168, 150, 0.15)`).
   - Esquinas redondeadas suaves (`border-radius: 16px`) sobre superficie Pizarra Petróleo (`--bg-card`).
   - Animación de entrada suave tipo *scale-up* (`transform: scale(0.94) -> scale(1)` en $250\text{ms}$).

