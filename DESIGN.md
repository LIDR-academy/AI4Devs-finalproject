# 🎨 RestoStock Design System & UI/UX Guidelines (DESIGN.md)

> **Single Source of Truth (SSoT):**  
> Para la especificación técnica completa del Sistema de Diseño UI/UX, consulta [`docs/02_architecture_design/05_ui_ux_design_system.md`](./docs/02_architecture_design/05_ui_ux_design_system.md).  
> Para las reglas innegociables de código Frontend, consulta [`docs/04_governance_and_quality/rules/frontend_rules.md`](./docs/04_governance_and_quality/rules/frontend_rules.md).

---

## ⚡ Directivas Rápidas para Agentes de IA & Copilotos

Cualquier subagente o copiloto de codificación (Cursor, Claude Code, Windsurf, Copilot) debe aplicar estrictamente estas directivas al generar código de interfaz de usuario para **RestoStock**:

### 🎨 1. Paleta Cromática & Variables CSS (HSL)
- **Modo Principal:** Dark Petrol & Charcoal.
- **Root Background:** `--bg-root: hsl(205, 38%, 7%)` (`#0b1319`).
- **Card Background:** `--bg-card: hsl(205, 38%, 10%)` (`#101c24`).
- **Primary Accent:** `--color-primary: hsl(173, 100%, 33%)` (`#00a896`).
- **Warning Alert:** `--color-warning: hsl(27, 87%, 67%)` (`#f4a261`).
- **Danger Alert:** `--color-danger: hsl(0, 100%, 58%)` (`#ff2a2a`).
- **Success Accent:** `--color-success: hsl(173, 100%, 33%)` (`#00a896`).

### 📱 2. Ergonomía Táctil & Accesibilidad (WCAG 2.2)
- **Objetivos Táctiles:** Superficie mínima de contacto de **48px × 48px** en botones y elementos clicables.
- **Teclado PIN:** Botones numéricos de **64px × 64px**.
- **Contraste de Texto:** Cumplimiento estricto WCAG 2.2 AA (mínimo 4.5:1) y AAA (7:1).
- **Navegación:** Foco visible innegociable (`outline: 2px solid var(--color-primary)`).

### ⚡ 3. Core Web Vitals (CWV Preventivos)
- **LCP (Largest Contentful Paint):** `< 2.5s` (dimensiones de imagen/tarjeta explícitas).
- **INP (Interaction to Next Paint):** `< 200ms` (feedback de pulsación $< 50\text{ms}$).
- **CLS (Cumulative Layout Shift):** `< 0.1` (cero saltos de layout, contenedores con altura reservada).

### 🛡️ 4. Los 4 Estados Defensivos de UI
Toda vista o componente contenedor DEBE implementar sus 4 estados obligatorios:
1. **Loading State:** Esqueleto pulsante con reservación de espacio.
2. **Data Ready State:** Interfaz funcional con datos.
3. **Empty State:** Ilustración/mensaje amigable cuando no hay registros.
4. **Error State:** Banner de error con botón de reintento + Banner persistente en pérdida de red.

---

*Este archivo sirve como puente de compatibilidad nativa para herramientas asistidas por IA.*
