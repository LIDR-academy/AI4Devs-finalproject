---
document: technical_ticket
id: TK-088-FE
related_story: US-023
points: 3
type: frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-023.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
  - DESIGN.md
---

# 🎟️ TK-088-FE: Auditoría de Contraste AAA 7:1 del Sistema FEFO (Ambos Turnos)

> **Navegación del Framework SDD:**
> [📖 Índice de Tickets](../../indice_tickets.md) | [Anterior: TK-087-FE](./TK-087-FE.md)

---

## 📝 Descripción
Cierra la **decisión abierta #3** del artefacto de diseño Sistema FEFO ("contraste por validar con herramienta dedicada") y verifica que los componentes nuevos de `TK-086-FE`/`TK-087-FE` y el shell de `TK-085-FE` cumplen el objetivo AAA **7:1** para texto principal y **4.5:1** para texto secundario, en turno **Día** y turno **Noche**, con un verificador real de luminancia relativa WCAG — no por estimación. Es el último ticket de `US-023` porque audita el estado final del sistema.

Motivación histórica: la nota de contraste de `05_ui_ux_design_system.md` §v4.0.0 documenta que la revisión adversarial de `TK-084-FE` encontró un fallo AA real de ~4.19:1 (`--color-success` como texto de día) que las estimaciones previas habían dado por bueno. Este ticket institucionaliza esa verificación para el sistema completo.

---

## 🔀 Alcance de Modificación

* **Ejecutar `SK-21` (Auditoría Accesibilidad UI/a11y)** sobre las rutas del shell (`/`, `/estaciones`, `/recetas`, `/reportes`, `/ajustes`) en ambos turnos, con la URL de dev server leída de `docs/00_stack_manifest.md` §5 (`http://localhost:5173`).
* **Matriz de verificación de tokens** (calculada con fórmula de luminancia relativa WCAG contra el **fondo real de cada uso**, no un fondo asumido — misma lección de `TK-084-FE`):
  * `--text-primary` sobre `--bg-root` y `--bg-card` — objetivo ≥7:1, ambos turnos.
  * `--text-secondary` sobre `--bg-root` y `--bg-card` — objetivo ≥4.5:1.
  * `--color-*-text` de `UrgencyChip` sobre el tinte real del chip compuesto sobre su contenedor real.
  * `--color-*-on` sobre el relleno sólido de `ActionButton` y `RowButton--urgent`.
  * Wordmark de la barra lateral (`--bg-root` sobre `--rule`) — objetivo ≥7:1.
  * Nav activa (`--color-primary` como borde, uso no textual ≥3:1) y label de nav (`--text-primary` sobre `--bg-root`).
  * Leyenda numérica de la health bar (`--font-family-mono`, `--text-secondary`) sobre su fondo.
* **Corrección de tokens que fallen:** ajustar el valor en `docs/02_architecture_design/05_ui_ux_design_system.md` §v4.1.0 (y su espejo en `DESIGN.md` + `apps/frontend/src/index.css`), documentando el ratio antes/después en la nota de contraste — como ya se hizo para `--color-success-text`/`--color-info-text` en v4.0.0.
* **Evidencia:** informe en `docs/04_governance_and_quality/` (tabla de ratios por par color/fondo/turno, con PASS/FAIL AAA y AA) — patrón de los informes ya existentes de esa carpeta.

**Fuera de alcance:** cambios de layout o de comportamiento; solo ajustes de valor de token y documentación de evidencia.

---

## ✅ Criterios de Aceptación & DoD

1. **Cobertura:** todas las combinaciones de la matriz verificadas en Día y Noche con verificador real (no estimación), contra el fondo real de cada uso.
2. **Umbral:** texto principal ≥7:1 (AAA) y texto secundario ≥4.5:1 (AA) en ambos turnos; cualquier par por debajo se corrige o se documenta como excepción justificada aprobada por el humano.
3. **Trazabilidad:** cada token ajustado registra ratio antes/después en la nota de contraste de `05_ui_ux_design_system.md`; `DESIGN.md` e `index.css` quedan sincronizados (mismos hex).
4. **Evidencia archivada:** informe de ratios en `docs/04_governance_and_quality/`.
5. **Sin regresión visual:** `npx -y @google/design.md lint DESIGN.md` limpio; `pnpm --filter frontend test -- --run` y `run build` verdes.
6. **`SK-21`** ejecutada y su salida adjunta al informe.
