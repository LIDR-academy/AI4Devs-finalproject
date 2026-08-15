---
name: RestoStock UI Design System
version: "1.0.0"
description: "Sistema de diseño y ergonomía táctil para RestoStock, sistema de inventario y trazabilidad FEFO en tiempo real para cocinas de restaurantes."
colors:
  primary: "#006d62"
  secondary: "#475569"
  tertiary: "#9a4900"
  danger: "#b91c1c"
  success: "#047857"
  warning: "#b45309"
  neutral: "#0b1319"
  card: "#101c24"
typography:
  h1:
    fontFamily: "Inter, Roboto, sans-serif"
    fontSize: "2.25rem"
    fontWeight: "700"
  h2:
    fontFamily: "Inter, Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: "700"
  body:
    fontFamily: "Inter, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
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
    textColor: "#ffffff"
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
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  button-warning:
    backgroundColor: "{colors.warning}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  card-container:
    backgroundColor: "{colors.card}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  pin-key:
    backgroundColor: "{colors.neutral}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    height: "64px"
    width: "64px"
---

# 🎨 RestoStock Design System & UI/UX Guidelines (DESIGN.md)

> **Single Source of Truth (SSoT):**  
> Para la especificación técnica completa del Sistema de Diseño UI/UX, consulta [`docs/02_architecture_design/05_ui_ux_design_system.md`](./docs/02_architecture_design/05_ui_ux_design_system.md).  
> Para las reglas innegociables de código Frontend, consulta [`docs/04_governance_and_quality/rules/frontend_rules.md`](./docs/04_governance_and_quality/rules/frontend_rules.md).

---

## 📌 Overview
RestoStock combina ergonomía táctil industrial para pantallas de cocina con la sobriedad y contraste del modo oscuro (*Dark Petrol & Charcoal*). Su propósito es maximizar la legibilidad bajo luz intensa de cocina y prevenir errores en la operación con botones de objetivo grande ($\ge 48\text{px}$).

---

## 🎨 Colors & Contrast (WCAG 2.2 AA)
La paleta cromática utiliza tokens HSL curvados de alto contraste validados contra el estándar Google Labs:
- **Primary (#006d62):** Verde Turquesa profundo para acciones principales y confirmaciones.
- **Danger (#b91c1c):** Rojo carmesí para remanentes con vencimiento en menos de 6 horas.
- **Warning (#b45309):** Ámbar oscuro para remanentes con vencimiento en menos de 24 horas.
- **Neutral (#0b1319):** Fondo base ultra-oscuro para reducir la fatiga visual.
- **Card (#101c24):** Superficie de tarjetas y contenedores elevados.

---

## 📱 Touch Ergonomics & Accessibility (WCAG 2.2)
- **Superficie Táctil Mínima:** Todos los botones e insumos tienen zonas interactivas de **48px × 48px**.
- **Teclado PIN:** Botones numéricos de **64px × 64px**.
- **Contraste de Texto:** Cumplimiento WCAG 2.2 AA (mínimo 4.5:1) y AAA (7:1).
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
