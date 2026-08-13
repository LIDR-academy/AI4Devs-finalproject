# US-F1 — Menú Hamburguesa Responsive (Nav)

**Fuente:** Fix UX móvil / ventana estrecha · **Prioridad:** Alta  
**Rama de implementación:** `finalproject-RFM` (no crear `feature/*` salvo petición explícita)  
**Estado refinamiento:** Enhanced (local) — sin Jira MCP en este entorno

---

## [original] Historia de Usuario

**Como** administrador o mecánico que usa MecaTrack en un celular o ventana estrecha,  
**quiero** un menú hamburguesa que abra un panel lateral con las mismas opciones de navegación,  
**para** no tener que hacer scroll horizontal ni ver el fondo del menú cortado en la última opción.

## [original] Criterios de Aceptación

- [ ] En pantallas pequeñas, menú hamburguesa + panel con los links del rol.
- [ ] En pantallas medianas/grandes, se mantiene la barra horizontal actual.
- [ ] Sin scroll horizontal causado por la navegación.
- [ ] Cerrar al navegar, Escape, overlay o botón.

---

## [enhanced] Historia de Usuario

**Como** administrador o mecánico autenticado en MecaTrack (Next.js `apps/web`),  
**quiero** que el shell de navegación (`AppHeader` + `RoleNav`) use en viewports **`< md` (768px)** un botón hamburguesa que abre un **drawer lateral derecho o izquierdo** con los mismos destinos por rol, y en **`≥ md`** la tira horizontal actual,  
**para** usar el taller en celular sin scroll-x ni el bug visual del fondo del menú cortado en el último ítem.

**Contexto / gap actual**

- Layouts montan siempre `<AppHeader />` luego `<RoleNav />`:
  - `apps/web/src/app/admin/layout.tsx`
  - `apps/web/src/app/mechanic/layout.tsx`
  - `apps/web/src/app/clients/layout.tsx`
  - `apps/web/src/app/vehicles/layout.tsx`
  - `apps/web/src/app/work-orders/layout.tsx`
- `RoleNav` es `flex gap-1` en una sola fila, sin `flex-wrap` / `overflow` / breakpoints (`RoleNav.tsx`).
- `AppHeader` no tiene control de menú; solo marca, nombre y `LogoutButton`.
- Stack UI: Tailwind 3.4 + `cn`; **sin** Radix/Headless UI en `package.json` — implementar drawer con React state + Tailwind (sin nueva dependencia salvo justificación explícita).
- E2E: Playwright (`npm run test:e2e` en `apps/web`).

**Solución canónica (opción 1 — fijada)**

| Breakpoint | UI |
|------------|-----|
| `< md` | Hamburguesa en header (o fila bajo header); drawer overlay + panel con links en columna; **ocultar** tira horizontal |
| `≥ md` | Tira horizontal actual; **ocultar** hamburguesa y drawer |

**Dirección del drawer (decidir y documentar en el PR; default):** panel desde la **izquierda**, ancho ~`min(20rem, 85vw)`, overlay `bg-slate-900/40`, `z-40` overlay / `z-50` panel.

**Items (no cambiar rutas ni labels de producto):**

| Rol | Links (href → label ES) |
|-----|-------------------------|
| ADMIN | `/admin/dashboard` → Panel; `/admin/users` → Usuarios; `/admin/delivery` → Listos para entrega; `/clients` → Clientes; `/vehicles` → Vehículos; `/work-orders/new` → Nueva OT |
| MECHANIC | `/mechanic/dashboard` → Panel; `/clients` → Clientes; `/vehicles` → Vehículos; `/work-orders/new` → Nueva OT |

Active state: misma regla que hoy (`pathname === href || pathname.startsWith(href + '/')`).

**Alcance / fuera de alcance**

| Incluye | No incluye |
|---------|------------|
| Hamburguesa + drawer `< md` | Bottom tabs nativos |
| Reutilizar arrays `ADMIN_NAV` / `MECHANIC_NAV` (ideal: extraer constante compartida) | Responsive de tablas de entrega/usuarios (otra US-F) |
| Lock de scroll del `body` mientras drawer abierto | PWA |
| A11y mínima (aria-expanded, Escape, focus return) | Rediseño visual de marca / dark mode |
| Playwright smoke viewport móvil (recomendado) | Librería de drawer nueva |

**Dependencias:** US-001 (auth). **No** depende de API nueva.

---

## [enhanced] Criterios de Aceptación

### Contratos de UI (ES)

| Elemento | Texto / atributo |
|----------|------------------|
| Botón abrir | visible ☰ o icono SVG; `aria-label="Abrir menú"` |
| Botón cerrar (en drawer o mismo toggle) | `aria-label="Cerrar menú"` |
| `aria-expanded` | `true` / `false` en el control hamburguesa |
| `aria-controls` | id del panel del drawer (p. ej. `mobile-nav-drawer`) |
| Overlay | clic cierra; `aria-hidden` en contenido principal opcional (nice-to-have) |

Código, comentarios y nombres de componentes: **inglés** (`MobileNavDrawer`, `isOpen`, etc.).

### Comportamiento

- [ ] Viewport 375×667 (o `md - 1px`): **no** scroll horizontal atribuible a `RoleNav` / shell nav.
- [ ] Hamburguesa visible solo autenticado y solo `< md`.
- [ ] Abrir → panel con **todos** los links del rol; overlay visible.
- [ ] Click link → navega + cierra drawer.
- [ ] Cerrar vía: toggle, botón cerrar, click overlay, tecla `Escape`.
- [ ] Al cerrar, foco vuelve al botón hamburguesa.
- [ ] `≥ md`: barra horizontal como hoy; drawer cerrado y no interactuable (no trap).
- [ ] Resize de `< md` abierto a `≥ md`: drawer se cierra (listener resize o CSS + effect).
- [ ] Sin usuario: ni hamburguesa ni `RoleNav` (hoy ya `return null` en RoleNav).

### Visual

- [ ] Fondo del panel continuo (sin “corte” de color en el último ítem).
- [ ] Ítem activo con contraste claro (p. ej. `bg-blue-50 text-blue-700` o borde izquierdo azul).
- [ ] Header usable: logout no desaparece; drawer puede cubrir contenido al abrirse.
- [ ] Padding shell móvil: preferir `px-4 md:px-6` en header/nav/main tocados para reducir overflow de título.

### NFR

- [ ] Sin dependencias npm nuevas (salvo aprobación).
- [ ] Sin llamar APIs nuevas; solo client state.
- [ ] Abrir/cerrar drawer &lt; 100ms percibido (CSS transition corta OK, p. ej. 200ms).
- [ ] No filtrar PII en logs; no hay datos sensibles nuevos.
- [ ] `body` overflow hidden mientras abierto (evitar scroll de fondo en iOS en la medida razonable).

### Archivos a crear / modificar

```
apps/web/src/shared/components/
  RoleNav.tsx                 # MOD: desktop strip hidden md:flex; export nav items or keep internal
  AppHeader.tsx               # MOD: slot hamburguesa + opcional controlled open state
  MobileNavDrawer.tsx         # NEW: overlay + panel + Escape + focus
  nav-items.ts                # NEW optional: ADMIN_NAV / MECHANIC_NAV shared
apps/web/src/shared/components/…spec?  # no Jest unit obligatorio en web hoy; prefer Playwright
apps/web/e2e/…                # NEW or extend: mobile-nav.spec.ts (recomendado)
```

Layouts: **ideal no tocar** si `AppHeader`/`RoleNav` encapsulan el comportamiento. Si el estado abierto vive en un wrapper, crear `AppShellNav.tsx` opcional en shared y usarlo en los 5 layouts (solo si hace falta sincronizar header↔drawer).

**Arquitectura preferida (documentar en PR):**

1. Extraer `ADMIN_NAV` / `MECHANIC_NAV` a `nav-items.ts`.
2. `AppHeader` recibe `onMenuClick` + `menuOpen` **o** contiene el botón y levanta estado vía callback a un padre fino `AuthenticatedShell` — **evitar** duplicar estado en 5 layouts: preferir un único componente cliente `AppChrome` que renderice header+nav+drawer, y que los layouts solo monten `<AppChrome>{children}</AppChrome>`.
3. Si el refactor de layouts es demasiado grande para el fix: hamburguesa **dentro de** `RoleNav` en la zona `md:hidden` (fila propia bajo header) para no tocar layouts — aceptable MVP.

### Pasos de implementación (orden; plan FE detallará)

1. Extraer items de nav compartidos.
2. Implementar `MobileNavDrawer` (open/close/Escape/overlay/focus).
3. Condicionar `RoleNav` desktop vs móvil con Tailwind `md:`.
4. Cablear hamburguesa (header o fila móvil).
5. Ajustar padding `px-4 md:px-6` donde el overflow del título persista.
6. Playwright viewport móvil + desktop smoke.
7. Docs: nota breve en `apps/web` README o readme § frontend si existe sección UX.

### Pruebas

| Tipo | Caso |
|------|------|
| Manual | 375px: sin scroll-x nav; abrir/cerrar; ir a Clientes |
| Manual | 1280px: tabs horizontales; sin hamburguesa |
| Manual | ADMIN vs MECHANIC: sets distintos |
| Manual | Escape + overlay cierran |
| Playwright | `page.setViewportSize({ width: 390, height: 844 })` → getByRole button Abrir menú → link Clientes → URL |

### Definition of Done

- [ ] AC enhanced cumplidos
- [ ] En **`finalproject-RFM`** (sin rama feature salvo petición)
- [ ] UI ES / código EN
- [ ] Playwright recomendado en verde o justificación si se omite

---

## Roles Involved

| Role | Responsibility |
|------|----------------|
| Frontend developer | Drawer + shell responsive |
| QA / product owner | Smoke en celular real / DevTools |
| (No backend) | — |

## Notas de producto

- No es “MecaTrack mobile app completa”. Tablas densas pueden seguir con scroll-x en contenido → candidatas a **US-F2+**.
- Evidencia del bug: captura móvil con nav cortada y scroll horizontal (2026-08-13).
