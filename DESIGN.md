---
name: RestoStock UI Design System
version: "3.0.0"
description: "Sistema de diseño 'Señal Industrial' v3.0 con Barra de Salud FEFO, Filtros por Estación Física y Ergonomía Táctil Industrial."
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
RestoStock combina ergonomía táctil industrial para pantallas de cocina con la sobriedad y máximo contraste del modo oscuro *Señal Industrial* (v3.0.0 — negro industrial + ámbar de seguridad + Medidor de Salud FEFO + Filtros de Estación Física). Su propósito es maximizar la legibilidad bajo luz intensa de cocina y prevenir errores en la operación con botones de objetivo grande ($\ge 48\text{px}$).

---

## 🎨 Colors & Contrast (WCAG 2.1 AA/AAA)
La paleta cromática utiliza tokens HSL curvados y validados por cálculo de luminancia relativa (fórmula WCAG):
- **Primary / Warning (#ff6a00):** Ámbar de seguridad industrial — acciones principales, marca y remanentes con vencimiento en menos de 24 horas.
- **Danger (#e10600):** Rojo de alerta para remanentes con vencimiento en menos de 6 horas. **Solo como fondo/badge/borde** (4.97:1 con texto blanco).
- **Success / Tertiary (#2fbf6e):** Verde de confirmación y stock seguro (>24h).
- **Secondary (#333333):** Gris neutro para acciones secundarias/no urgentes.
- **Neutral (#101010):** Fondo base negro industrial.
- **Card (#1a1a1a):** Superficie de tarjetas y contenedores elevados.

---

## 📱 UI/UX v3.0 Component Specifications
1. **Inventory Health Bar (`FEFOInventoryHealthBar`):** Visualización tri-color en tiempo real del % de stock seguro (verde), en precaución (ámbar) y crítico (rojo).
2. **Tactical Action Bar vs. Admin Drawer:** Acciones de cocina (`Extraer`, `Receta`, `Conciliar`) en primer plano táctil ($56\text{px}$); módulos administrativos agrupados bajo el menú `Administración ▾`.
3. **Location Filter Tabs (`LocationFilterTabs`):** Pestañas táctiles para filtrar insumos por estación (`Todos`, `Refrigerador`, `Mesa Prep`, `Línea`).
4. **Live Countdown Timers:** Reloj dinámico en tiempo real (`HH:MM:SS`) para remanentes $<6\text{h}$.

