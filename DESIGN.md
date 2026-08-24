---
name: RestoStock UI Design System
version: "2.0.0"
description: "Sistema de diseño 'Señal Industrial' y ergonomía táctil para RestoStock, sistema de inventario y trazabilidad FEFO en tiempo real para cocinas de restaurantes."
colors:
  primary: "#ff6a00"
  secondary: "#333333"
  tertiary: "#2fbf6e"
  danger: "#e10600"
  success: "#2fbf6e"
  warning: "#ff6a00"
  neutral: "#101010"
  card: "#1a1a1a"
typography:
  h1:
    fontFamily: "Oswald, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: "700"
  h2:
    fontFamily: "Oswald, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: "700"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: "500"
rounded:
  sm: "2px"
  md: "4px"
  lg: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#101010"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  button-tertiary:
    backgroundColor: "{colors.tertiary}"
    textColor: "#101010"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  button-success:
    backgroundColor: "{colors.success}"
    textColor: "#101010"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  button-warning:
    backgroundColor: "{colors.warning}"
    textColor: "#101010"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  card-container:
    backgroundColor: "{colors.card}"
    textColor: "#f5f5f0"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  pin-key:
    backgroundColor: "{colors.card}"
    textColor: "#f5f5f0"
    rounded: "{rounded.sm}"
    height: "64px"
    width: "64px"
---

# 🎨 RestoStock Design System & UI/UX Guidelines (DESIGN.md)

> **Single Source of Truth (SSoT):**  
> Para la especificación técnica completa del Sistema de Diseño UI/UX, consulta [`docs/02_architecture_design/05_ui_ux_design_system.md`](./docs/02_architecture_design/05_ui_ux_design_system.md).  
> Para las reglas innegociables de código Frontend, consulta [`docs/04_governance_and_quality/rules/frontend_rules.md`](./docs/04_governance_and_quality/rules/frontend_rules.md).

---

## 📌 Overview
RestoStock combina ergonomía táctil industrial para pantallas de cocina con la sobriedad y máximo contraste del modo oscuro *Señal Industrial* (v2.0.0 — negro industrial + ámbar de seguridad + rojo de alerta exclusivo). Su propósito es maximizar la legibilidad bajo luz intensa de cocina y prevenir errores en la operación con botones de objetivo grande ($\ge 48\text{px}$). Alcance: pantallas táctiles de cocina; el dashboard administrativo de escritorio conserva su lenguaje visual anterior hasta que se decida una dirección propia.

---

## 🎨 Colors & Contrast (WCAG 2.1 AA/AAA)
La paleta cromática utiliza tokens HSL curvados y validados por cálculo de luminancia relativa (fórmula WCAG):
- **Primary / Warning (#ff6a00):** Ámbar de seguridad industrial — acciones principales, marca y remanentes con vencimiento en menos de 24 horas. Comparte tono con Warning por diseño (ver `docs/02_architecture_design/05_ui_ux_design_system.md`); lleva texto/ícono oscuro (`#101010`, 7.06:1).
- **Danger (#e10600):** Rojo de alerta para remanentes con vencimiento en menos de 6 horas. **Solo como fondo/badge/borde** (4.97:1 con texto blanco) — como texto directo sobre `neutral`/`card` cae a 3.5–3.8:1, insuficiente; para texto/labels de alerta usar la variante clara `#ff6b5e` (6.2–6.8:1).
- **Success / Tertiary (#2fbf6e):** Verde de confirmación (cierre de turno, coincidencias de conciliación). Lleva texto/ícono oscuro (7.97:1).
- **Secondary (#333333):** Gris neutro para acciones secundarias/no urgentes; texto blanco (12.6:1).
- **Neutral (#101010):** Fondo base negro industrial.
- **Card (#1a1a1a):** Superficie de tarjetas y contenedores elevados.

---

## 📱 Touch Ergonomics & Accessibility (WCAG 2.1)
- **Superficie Táctil Mínima:** Todos los botones e insumos tienen zonas interactivas de **48px × 48px**.
- **Teclado PIN:** Botones cuadrados/blocky de **64px × 64px** mínimo (no circulares).
- **Contraste de Texto:** Mínimo `7:1` para números principales/texto primario y `4.5:1` para texto secundario — ver la nota de contraste por color arriba antes de usar `danger` como texto.
- **Foco Visible:** Navegación obligatoria por teclado (`outline: 2px solid var(--color-primary)`).

---

## ⚡ Core Web Vitals (CWV Preventivos)
- **LCP (Largest Contentful Paint):** `< 2.5s` (dimensiones explícitas).
- **INP (Interaction to Next Paint):** `< 200ms` (feedback instantáneo $< 50\text{ms}$).
- **CLS (Cumulative Layout Shift):** `< 0.1` (cero saltos de layout).

---

## 🛡️ Defensive UI States
Toda pantalla DEBE implementar los 4 estados defensivos:
1. **Loading State:** Esqueleto pulsante con reservación de espacio.
2. **Data Ready State:** Vista interactiva con datos.
3. **Empty State:** Ilustración/mensaje amigable sin registros.
4. **Error State:** Banner de error com botón de reintento + Banner persistente offline.
