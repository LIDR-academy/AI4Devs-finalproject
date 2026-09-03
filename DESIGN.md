---
name: RestoStock UI Design System
version: "4.1.0"
description: "Sistema FEFO — turno Dia (comanda de papel) / Noche (pizarra de turno), con interruptor persistido por dispositivo. Reemplaza 'Señal Industrial' v3.0 como unico tema. v4.1.0 anade la lamina Aplicacion (shell de rutas con barra lateral comanda, boton de accion circular, chip de urgencia de 4 niveles, panel Estado de 3 cubetas) — US-023. Ver docs/02_architecture_design/05_ui_ux_design_system.md."
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
  # v4.1.0 (US-023 / lamina Aplicacion). El boton circular es la unica
  # excepcion deliberada a rounded:0 del sistema (ver 05_ui_ux_design_system.md).
  action-button-circular:
    backgroundColor: "{colors.light.danger}"
    textColor: "#fbf8ef"
    rounded: "9999px"
    height: "72px"
    width: "72px"
  urgency-chip:
    backgroundColor: "{colors.light.card}"
    textColor: "#18140f"
    rounded: "{rounded.sm}"
    height: "32px"
    padding: "{spacing.sm}"
  app-shell-sidebar:
    backgroundColor: "#18140f"
    textColor: "#fbf8ef"
    rounded: "{rounded.sm}"
    padding: "{spacing.lg}"
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

---

## 🧾 v4.1.0 — Lámina "Aplicación": Shell de Rutas y Componentes (US-023)

Formaliza la tercera lámina de la propuesta Sistema FEFO (el artefacto de diseño validado por el humano). Detalle técnico completo en [`docs/02_architecture_design/05_ui_ux_design_system.md`](./docs/02_architecture_design/05_ui_ux_design_system.md) §v4.1.0.

1. **Shell de aplicación (`AppShell`):** Grid `sidebar (88px) + main`. La **barra lateral** es una "ficha de comanda": fondo `--rule` (tinta), wordmark del restaurante en vertical (`writing-mode: vertical-rl`), dos perforaciones decorativas. Invierte su tono respecto al fondo en ambos turnos para contrastar siempre. La **topbar** aloja la navegación de rutas + estado de sesión + `Cerrar Sesión`.
2. **Navegación de rutas de nivel superior:** `Inventario`, `Bodega`, `Recetas`, `Reportes`, `Ajustes`. Ruta activa marcada con borde inferior de 3px en `--color-primary`. Reportes y Ajustes solo `ADMIN` (redirige a Inventario si falta rol). El contenido de cada ruta se renderiza **inline** en el `<main>`, nunca como `<Modal>` flotante (US-024); `Ajustes` tiene sub-rutas deep-linkables (`/ajustes/configuracion`, `/personal`, `/roles`, `/movimientos`). Los `<Modal>` quedan para acciones transitorias; las pantallas de autenticación usan `<AuthScreen>` (pantalla completa sobre el fondo FEFO, no `<Modal>` con scrim). *(TK-095-FE: `Estaciones`→`Bodega`; sub-ruta `/ajustes/catalogo` retirada por duplicar `/bodega`+`/recetas`.)*
3. **Botón de acción circular (`ActionButton`):** Objetivo táctil **72px**, `border-radius: 9999px` — única excepción deliberada a las esquinas rectas del sistema, para separar visualmente "acción" de "dato/estado". Dos capas de color independientes: la capa **acción** (rojo `Extraer` / azul `Agregar` / mostaza `Receta`) y, por separado, la capa **estado/urgencia** de los chips. De noche ambas capas pasan de relleno sólido a contorno de tiza.
4. **Chip de urgencia de 4 niveles (`UrgencyChip`):** Escala completa `Vencido` (crítico, <0h) · `Hoy` (crítico) · `Mañana` (atención) · `2 Días` · `4 Días` (vigente). Siempre **marca cuadrada + texto**, nunca solo color (WCAG 1.4.1). Reemplaza el `StatusBadge` tri-color heredado. `Vencido` usa el mismo tratamiento visual que `Hoy` (nivel `critical`), solo cambia la etiqueta (TK-087-FE).
5. **Botón de fila con prioridad (`RowButton`):** Variante `--urgent` (fondo `--color-danger`) visualmente distinta de la variante normal y de la `--ghost` (contorno), para que la fila crítica de la tabla FEFO se distinga de un vistazo.
6. **Panel Estado de 3 cubetas + leyenda numérica:** El bloque de métricas del tablero pasa de 2 tarjetas a 3 cubetas de severidad (`Vigentes` / `Vencimiento Próximo` / `Críticos Hoy`) alineadas con los 3 segmentos de la `FEFOInventoryHealthBar`, que gana una leyenda numérica explícita (`58% vigente (7)`).

> **Contraste (Guard 29 + decisión abierta #3 del artefacto):** todos los tokens nuevos se auditan a AAA 7:1 en ambos turnos con verificador real de luminancia relativa WCAG en `TK-088-FE` (Skill `SK-21`), no por estimación.

---

## 🧾 v4.2.0 — Sub-Sectores de Bodega y Desglose de Stock (US-016 / US-025)

Detalle técnico en [`docs/02_architecture_design/05_ui_ux_design_system.md`](./docs/02_architecture_design/05_ui_ux_design_system.md) §v4.2.0.

1. **Selector de sub-sector obligatorio (`StorageSectorSelect`):** `<select>` táctil ≥ 48px con `<label>` asociado, usado en el alta de insumo, el reabastecimiento y la extracción (sector de origen). Opciones cargadas de `GET /api/v1/locations` filtradas por `type` (`WAREHOUSE` para bodega, `KITCHEN` para destino de cocina) y `isActive`. Placeholder deshabilitado `— Seleccionar sector —`; el submit se bloquea con `ErrorBanner` inline si queda vacío. Sin literales hardcodeados.
2. **Fila de catálogo expandible con desglose (`InsumoStockBreakdownRow`):** la celda "Stock en Bodega (total)" muestra la suma; un disclosure (`▸`/`▾`, target ≥ 44px, `aria-expanded`) revela una sub-lista `sector — cantidad unidad` por cada `stockByLocation[]`. Sin existencias → texto atenuado "Sin stock en bodega". El desglose no es una tabla anidada: lista de definición con los tokens `--space-*`/`--fs-sm`.
3. **Saldo por sector en extracción:** al elegir el sector de origen, junto al insumo se muestra `Disponible aquí: <n> <u>` (token `--fs-sm`, `--text-secondary`). El saldo insuficiente se comunica con el `422` traducido por `errorMessageMapper` en `ErrorBanner`, nunca con un popup nativo (Guard 38).
4. **Sector con existencias en gestión (`LocationsManagementModal`):** los botones `Power` (desactivar) y `Trash2` (borrar) quedan `aria-disabled` con tooltip "El sector tiene existencias asociadas" cuando `hasStock`; el `409` del backend se traduce igual.

> **Guards:** cero `style={{}}` inline (Guard 29) — todo por clase desde el escalado de tokens; errores vía `ErrorBanner` + `errorMessageMapper` (Guard 38); contraste AAA auditado en ambos turnos.

