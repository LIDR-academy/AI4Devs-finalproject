# ♿ Informe de Auditoría de Accesibilidad (SK-21) — TK-088-FE

* **ID Auditoría:** AUDIT-A11Y-001
* **Fecha:** 2026-09-02
* **Ticket:** TK-088-FE (US-023) — cierra la decisión abierta #3 del artefacto de diseño Sistema FEFO
* **Skill:** `SK-21_audit_ui_accessibility` v1.2.0
* **Alcance:** Sistema de Diseño FEFO v4.1.0 completo — shell de rutas (`TK-085-FE`), componentes `ActionButton`/`UrgencyChip`/`RowButton` (`TK-086-FE`), panel Estado + leyenda numérica (`TK-087-FE`).
* **`target_url`:** `http://localhost:5173` (Frontend Dev Server, `docs/00_stack_manifest.md` §5).

---

## FASE 1 — Reglas de UI

Tokens leídos de `apps/frontend/src/index.css` (turno **Día** en `:root`, turno **Noche** en `:root[data-theme="dark"]`). Objetivos de `frontend_rules.md` §2: **7:1 (AAA)** para texto principal en entorno industrial, **4.5:1 (AA)** para texto secundario, **3:1** para elementos gráficos no textuales.

---

## FASE 2 — Matriz de Contraste (calculadora WCAG real, fondo compuesto real)

Método: luminancia relativa WCAG 2.1 sobre sRGB; los chips tintados de día se calculan contra `composite(color-mix(in srgb, <color> 15%, transparent), --bg-card)`, no contra un fondo asumido (lección de `TK-084-FE`). Script reproducible: `docs/04_governance_and_quality/scripts/check_fefo_contrast.mjs` (`node` sobre los hex de `index.css`; re-correr si cambia un token de color).

### Turno DÍA

| Ratio | AA | AAA | Par (uso) | Objetivo |
|---:|:--:|:--:|:---|:--:|
| 15.02 | ✓ | ✓ | `--text-primary` / `--bg-root` (cuerpo, label de nav) | 7 |
| 16.41 | ✓ | ✓ | `--text-primary` / `--bg-card` (tarjetas) | 7 |
| 4.71 | ✓ | ✓ | `--text-secondary` / `--bg-root` | 4.5 |
| 5.14 | ✓ | ✓ | `--text-secondary` / `--bg-card` (leyenda health bar) | 4.5 |
| 5.01 | ✓ | – | `UrgencyChip` crítico (`--color-danger-text` sobre tinte 15%) | 4.5 |
| 5.84 | ✓ | – | `UrgencyChip` atención | 4.5 |
| 5.64 | ✓ | – | `UrgencyChip` vigente | 4.5 |
| 5.54 | ✓ | ✓ | `ActionButton` extract (ícono sobre relleno) | 3 |
| 6.56 | ✓ | ✓ | `ActionButton` add | 3 |
| 5.05 | ✓ | ✓ | `ActionButton` recipe | 3 |
| 5.54 | ✓ | – | `RowButton--urgent` (texto sobre relleno `--color-danger`) | 4.5 |
| 15.02 | ✓ | ✓ | `RowButton--default` (texto `--bg-root` sobre `--rule`) | 4.5 |
| 15.02 | ✓ | ✓ | Wordmark sidebar (`--bg-root` sobre `--rule`) | 7 |
| 5.71 | ✓ | ✓ | Nav activa (borde `--color-primary` sobre `--bg-root`, no textual) | 3 |
| 6.92 | ✓ | – | Indicador "Conectado" (`--color-success-text` sobre `--bg-card`) | 4.5 |
| 6.92 | ✓ | ✓ | Cubeta Vigentes (`--color-success-text` sobre `--bg-card`, texto grande) | 4.5 |
| 7.05 | ✓ | ✓ | Cubeta Vencimiento Próximo (`--color-warning-text`) | 4.5 |
| 6.25 | ✓ | ✓ | Cubeta Críticos Hoy (`--color-danger-text`) | 4.5 |
| 6.56 | ✓ | – | `.btn-primary` sólido (`--color-primary-on` sobre `--color-primary`) | 4.5 |
| 5.54 | ✓ | – | `.btn-danger` sólido (`--color-danger-on` sobre `--color-danger`) | 4.5 |

### Turno NOCHE

| Ratio | AA | AAA | Par (uso) | Objetivo |
|---:|:--:|:--:|:---|:--:|
| 14.85 | ✓ | ✓ | `--text-primary` / `--bg-root` | 7 |
| 13.44 | ✓ | ✓ | `--text-primary` / `--bg-card` | 7 |
| 6.61 | ✓ | ✓ | `--text-secondary` / `--bg-root` | 4.5 |
| 5.99 | ✓ | ✓ | `--text-secondary` / `--bg-card` | 4.5 |
| **5.96** | ✓ | – | `UrgencyChip` crítico — **corregido** (`--color-danger` daba 4.19, bajo AA → `--color-danger-text` `#f0806a`) | 4.5 |
| 8.83 | ✓ | ✓ | `UrgencyChip` atención | 4.5 |
| 6.35 | ✓ | – | `UrgencyChip` vigente | 4.5 |
| 4.19 | ✓ | ✓ | `ActionButton` extract (ícono/contorno sobre `--bg-card`, no textual — 3:1) | 3 |
| 6.14 | ✓ | ✓ | `ActionButton` add | 3 |
| 8.83 | ✓ | ✓ | `ActionButton` recipe | 3 |
| 4.63 | ✓ | – | `RowButton--urgent` (`--color-danger-on` `#171c18` sobre `--color-danger` `#e1573a`) | 4.5 |
| 13.55 | ✓ | ✓ | `RowButton--default` | 4.5 |
| 13.55 | ✓ | ✓ | Wordmark sidebar | 7 |
| 6.79 | ✓ | ✓ | Nav activa (no textual) | 3 |
| 6.35 | ✓ | – | Indicador "Conectado" | 4.5 |
| 6.35 | ✓ | ✓ | Cubeta Vigentes | 4.5 |
| 8.83 | ✓ | ✓ | Cubeta Vencimiento Próximo | 4.5 |
| 5.96 | ✓ | ✓ | Cubeta Críticos Hoy | 4.5 |
| 6.79 | ✓ | – | `.btn-primary` sólido | 4.5 |
| 4.63 | ✓ | – | `.btn-danger` sólido | 4.5 |

### Hallazgos de contraste

| # | Severidad | Par | Antes | Después | Corrección |
|---|:---:|:---|:---:|:---:|:---|
| C-1 | **AA FAIL** | `UrgencyChip` crítico, turno Noche | **4.19:1** | **5.96:1** | `apps/frontend/src/shared/components/UrgencyChip.module.css`: los 3 chips de noche pasan de `--color-<x>` a `--color-<x>-text`. Para warning/success `-text` == base de noche (sin cambio visual); para danger `#e1573a` → `#f0806a`. |

**Sin excepciones pendientes.** Las columnas "AAA –" son variantes `-text` de badge tintado y `-on` sobre relleno sólido — ambas apuntan a **AA (4.5:1)** por decisión de diseño v4.0.0 documentada en `05_ui_ux_design_system.md` (nota de contraste); el objetivo **AAA 7:1 es para `--text-primary`**, que cumple con 13–16:1 en ambos turnos.

### Validación de notificaciones semafóricas (WCAG 1.4.1)

`UrgencyChip` renderiza **siempre** marca cuadrada + texto (`Vencido`/`Hoy`/`Mañana`/`N Días`) — no depende solo del color. Cubetas del panel Estado: número + etiqueta textual. Health bar: `role="img"` + `aria-label` numérico + leyenda textual con conteos. ✅

---

## FASE 3 — Ergonomía Táctil

Barrido con navegador real sobre las 5 rutas del shell (`/`, `/estaciones`, `/recetas`, `/reportes`, `/ajustes`), sesión ADMIN:

| Ruta | Elementos < 44px alto | Resultado |
|---|:---:|:---:|
| Inventario | 0 | ✅ |
| Estaciones | 0 | ✅ |
| Recetas | 0 | ✅ |
| Reportes | 0 | ✅ |
| Ajustes | 0 | ✅ |

`.nav-link` `min-height: 48px`; `.theme-toggle-btn` 48×48; `.btn-touch` 48×48 (logout, acciones de ruta); `ActionButton` círculo 72px; `RowButton` compone `.btn-touch`. Separación ≥8px vía `gap` de las utilidades flex.

---

## FASE 4 — Regresión Visual

**NO EJECUTADA.** El proyecto no tiene infraestructura `e2e/visual-baselines/` todavía; crearla queda fuera del alcance de `TK-088-FE` (solo ajustes de token + evidencia). Verificación visual manual día/noche realizada en las corridas de VQA de `TK-085-FE`/`TK-086-FE`/`TK-087-FE` (capturas adjuntas a los commits de esos tickets).

---

## 📋 FASE 5 — Veredicto

* **Puntaje de contraste:** 40/40 pares cumplen su objetivo tras la corrección C-1 (39/40 antes).
* **Ergonomía táctil:** 100% ≥48px en las 5 rutas.
* **Independencia del color (1.4.1):** cumplida.
* **Regresión visual:** no aplicable (sin baselines).

### ⚖️ VEREDICTO: **APROBADO** — 1 corrección de token aplicada (C-1), 0 excepciones pendientes.
