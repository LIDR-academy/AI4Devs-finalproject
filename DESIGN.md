---
name: RestoStock UI Design System
version: "4.0.0"
description: "Sistema FEFO — turno Dia (comanda de papel) / Noche (pizarra de turno), con interruptor persistido por dispositivo. Reemplaza 'Señal Industrial' v3.0 como unico tema. Ver docs/02_architecture_design/05_ui_ux_design_system.md."
colors:
  light:
    primary: "#2e5f76"
    secondary: "#6e6555"
    tertiary: "#3e6b3a"
    danger: "#b43a24"
    success: "#3e6b3a"
    warning: "#8a6414"
    neutral: "#efe8d8"
    card: "#f7f2e6"
  dark:
    primary: "#6faac7"
    secondary: "#9aa394"
    tertiary: "#7cb36e"
    danger: "#e1573a"
    success: "#7cb36e"
    warning: "#e6be55"
    neutral: "#171c18"
    card: "#1f251f"
typography:
  h1:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "2.25rem"
    fontWeight: "900"
  h2:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: "900"
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: "500"
  data:
    fontFamily: "IBM Plex Mono, SFMono-Regular, monospace"
    fontSize: "1rem"
    fontWeight: "400"
rounded:
  sm: "0px"
  md: "0px"
  lg: "0px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  # Valores de referencia = turno Dia ({colors.light.*}); el turno Noche usa
  # los mismos componentes con {colors.dark.*} y --text-primary/--color-primary-on
  # equivalentes de ese turno (ver docs/02_architecture_design/05_ui_ux_design_system.md).
  button-primary:
    backgroundColor: "{colors.light.primary}"
    textColor: "#fbf8ef"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  button-secondary:
    backgroundColor: "{colors.light.secondary}"
    textColor: "#fbf8ef"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  button-tertiary:
    backgroundColor: "{colors.light.tertiary}"
    textColor: "#fbf8ef"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  button-danger:
    backgroundColor: "{colors.light.danger}"
    textColor: "#fbf8ef"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  button-success:
    backgroundColor: "{colors.light.success}"
    textColor: "#fbf8ef"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  button-warning:
    backgroundColor: "{colors.light.warning}"
    textColor: "#fbf8ef"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "{spacing.md}"
  card-container:
    backgroundColor: "{colors.light.card}"
    textColor: "#18140f"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  pin-key:
    backgroundColor: "{colors.light.card}"
    textColor: "#18140f"
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
RestoStock combina ergonomía táctil industrial para pantallas de cocina con el **Sistema FEFO** (v4.0.0 — turno **Día**, comanda de papel de alto contraste sobre fondo claro; turno **Noche**, pizarra de turno de fondo oscuro con acentos en tiza), reemplazando la dirección anterior de tema único oscuro *Señal Industrial* (v3.0.0). El operario alterna entre turnos con un interruptor persistido por dispositivo (`US-022`). Su propósito es maximizar la legibilidad tanto bajo luz intensa de cocina de día como en turnos con luz baja, y prevenir errores en la operación con botones de objetivo grande ($\ge 48\text{px}$).

---

## 🎨 Colors & Contrast (WCAG 2.1 AA/AAA)
Dos paletas — ver bloque `colors.light` / `colors.dark` del frontmatter y el detalle completo en `docs/02_architecture_design/05_ui_ux_design_system.md` §v4.0.0:
- **Primary (Acento Frío — `#2e5f76` día / `#6faac7` noche):** acciones principales, navegación activa.
- **Danger (Sello Crítico — `#b43a24` día / `#e1573a` noche):** remanentes que vencen hoy. Solo fondo/badge/borde de día; ambos turnos lo permiten como texto directo tras validar contraste (ver nota de `05_ui_ux_design_system.md`).
- **Warning (Sello Atención — `#8a6414` día / `#e6be55` noche):** remanentes que vencen mañana. El valor de día es deliberadamente oscuro para sostener contraste como texto directo sobre el papel claro.
- **Success / Tertiary (Sello Vigente — `#3e6b3a` día / `#7cb36e` noche):** stock seguro (2+ días).
- **Secondary (`#6e6555` día / `#9aa394` noche):** acciones secundarias/no urgentes.
- **Neutral / Card:** fondo base y superficie de tarjeta — papel de comanda claro de día, pizarra oscura de noche (ver `colors.light.neutral/card` y `colors.dark.neutral/card`).

---

## 📱 UI/UX v3.0 Component Specifications (heredados, sin cambio de comportamiento en v4.0.0)
1. **Inventory Health Bar (`FEFOInventoryHealthBar`):** Visualización tri-color en tiempo real del % de stock seguro (verde), en precaución (ámbar) y crítico (rojo).
2. **Tactical Action Bar vs. Admin Drawer:** Acciones de cocina (`Extraer`, `Receta`, `Conciliar`) en primer plano táctil ($56\text{px}$); módulos administrativos agrupados bajo el menú `Administración ▾`.
3. **Location Filter Tabs (`LocationFilterTabs`):** Pestañas táctiles para filtrar insumos por estación (`Todos`, `Refrigerador`, `Mesa Prep`, `Línea`).
4. **Live Countdown Timers:** Reloj dinámico en tiempo real (`HH:MM:SS`) para remanentes $<6\text{h}$.

