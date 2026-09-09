# 📊 Informe de Auditoría de Código VSDD - Ticket TK-086-FE

* **ID Auditoría:** AUDIT-DEV-004
* **Fecha de Auditoría:** 2026-09-02
* **Reviewer:** Subagente Independiente (Reviewer Adversarial)
* **Ticket Evaluado:** TK-086-FE — Componentes de la Lámina "Aplicación" (Botón Circular, Chip 4 Niveles, Botón de Fila)
* **User Story:** US-023 · Matriz REQ-025
* **Naturaleza del diff:** Frontend-only, working tree sin commitear (10 archivos nuevos, 5 modificados).

---

## 📋 Resumen por Fases

| Fase | Resultado | Nota |
| :--- | :--- | :--- |
| Fase 0 (Descubrimiento de Reglas / Cascada Spec-antes-que-Código) | **PASÓ** | TK + US + fila de matriz presentes y previas al código. |
| Fase 1 (Mutation Testing ≥ 70%) | **N/A** | No hay código de dominio ni casos de uso. `urgency.ts` es un helper de presentación puro; cubierto por tests unitarios directos (3 aserciones de valor exacto). |
| Fase 2 (Arquitectura Hexagonal / SOLID / Métricas) | **PASÓ** | `check_ticket_code_quality.sh`, `check_dead_code.sh`, `check_ticket_duplication.sh` → verde. Duplicación repo-wide 3.22 % es deuda preexistente ajena al ticket (informativa). |
| Fase 3 (Anti-Drift Arquitectónico / Build) | **PASÓ (con 1 observación de documentación)** | `pnpm --filter @restostock/frontend run build` limpio. `DESIGN.md` v4.1.0 y `05_ui_ux_design_system.md` §v4.1.0 ya reflejan los 3 componentes y la excepción `9999px`. Ver D-1. |
| Fase 4 (Seguridad / Entornos / Sanitización) | **N/A / PASÓ** | Sin backend, env, deps ni payloads externos. Guard 1 (sin `any`) ✅ vía `tsc --noEmit`. Guard 5 (dead code) ✅. `lint` → 0 errores. |
| Fase 5 (UI / WCAG 2.1 / Ergonomía Táctil) | **PASÓ (con observaciones menores)** | Separación de capas correcta, canal redundante presente y aseverado, escala completa, excepción de forma confinada, objetivos táctiles ≥48px. Ver D-2, D-3, D-4. |

**Comandos ejecutados y resultado:**

```
bash docs/04_governance_and_quality/scripts/check_ticket_code_quality.sh   → ✨ limpio (11 archivos del ticket)
bash docs/04_governance_and_quality/scripts/check_dead_code.sh             → ✨ sin código muerto nuevo (9 hallazgos preexistentes informativos)
bash docs/04_governance_and_quality/scripts/check_ticket_duplication.sh    → ✨ 0 clones nuevos (HEAD 21 == working tree 21)
bash docs/04_governance_and_quality/scripts/check_inline_styles.sh         → ✨ 0 estilos inline nuevos
pnpm --filter @restostock/frontend run lint                               → 0 errores, 16 warnings preexistentes en archivos no tocados
pnpm --filter @restostock/frontend run build                              → ✓ built in 4.83s, sin errores tsc/vite
pnpm --filter @restostock/frontend test -- --run                          → 26 test files, 133 passed
pnpm run duplication (repo-wide, informativo)                             → 3.22 % > 3.0 % (deuda preexistente: index.css tokens día/noche + typescript backend)
```

---

## 🔬 Verificación de Criterios de Aceptación

### AC #1 — Separación de capas (acción vs. urgencia) → **CUMPLE**
* `ActionButton.tsx`: prop `action: 'extract' | 'add' | 'recipe'` (tipada, sin `any`). `ActionButton.module.css:34-36` mapea **solo** a `--color-danger` / `--color-primary` / `--color-warning` (capa acción). No hay ninguna clase de nivel de urgencia (`critical`/`warning`/`safe`) en el componente.
* `UrgencyChip.tsx`: prop `level: UrgencyLevel` (`'critical' | 'warning' | 'safe'`). `UrgencyChip.module.css:23-37` mapea `critical→--color-danger`, `warning→--color-warning`, `safe→--color-success`. No existe una prop ni clase de "acción" en el chip.
* El solapamiento de tokens (`--color-danger` lo usan tanto `circle--extract` como `chip--critical`) es semánticamente correcto: son el mismo token cromático del sistema (rojo = destructivo/crítico), no una fuga de capa. `05_ui_ux_design_system.md` §v4.1.0.2 lo documenta explícitamente ("capa acción … capa estado/urgencia vive solo en los chips y la health bar").
* Tests: `ActionButton.test.tsx:15-22` aseveran `circle--extract/recipe/add`; `UrgencyChip.test.tsx:17-22` aseveran `chip--critical/warning`.

### AC #2 — Canal redundante WCAG 1.4.1 → **CUMPLE**
* `UrgencyChip.tsx:18-20`: renderiza **siempre** `<span aria-hidden="true" className={styles.mark} />` + nodo de texto `{label}`. La marca cuadrada (`.mark`, 9px, `background-color: currentColor`) es decorativa (`aria-hidden`), el texto es la señal real para lector de pantalla y para daltónicos.
* Test `UrgencyChip.test.tsx:7-15`: itera las 4 etiquetas (`Hoy`, `Mañana`, `2 Días`, `4 Días`) y asevera para cada una `getByText(label)` **y** `container.querySelector('span[aria-hidden="true"]') !== null`. Correcto.

### AC #3 — Escala completa sin cortar → **CUMPLE** (con 1 borde menor, D-3)
* `urgency.ts:8-12` — `urgencyFromHours`:
  * `h < 24` → `{critical, 'Hoy'}`
  * `h < 48` → `{warning, 'Mañana'}`
  * resto → `{safe, '${Math.ceil(h/24)} Días'}`
* Consistente con `RemanenteListItem` (`isCritical = item.hoursRemaining < 24`, mismo umbral). No corta la escala: cualquier `hoursRemaining ≥ 48` produce una etiqueta `N Días` real.
* Bordes exactos: `24h → 'Mañana'` (no `< 24`), `48h → '2 Días'` (`Math.ceil(2) = 2`). Sin off-by-one problemático; el test `UrgencyChip.test.tsx:24-29` fija `urgencyFromHours(48) === '2 Días'`, congelando el contrato.
* Ver D-3 para el caso `hoursRemaining` negativo (remanente ya vencido).

### AC #4 — Excepción de forma documentada (`border-radius` ≠ 0 solo en ActionButton) → **CUMPLE**
* `grep -rn "border-radius" apps/frontend/src/shared/components/*.module.css`:
  * `ActionButton.module.css:14` → `border-radius: 9999px` (con comentario que referencia `05_ui_ux_design_system.md §v4.1.0`).
  * `RowButton.module.css` → **ninguna** `border-radius` (hereda `0` del reset global).
  * `UrgencyChip.module.css` → **ninguna** `border-radius` (hereda `0`).
* `DESIGN.md:100-105` registra el token `action-button-circular … rounded: "9999px"` como excepción deliberada.

### AC #5 — Turno Noche vía CSS, sin JS → **CUMPLE para ActionButton y UrgencyChip; ver D-1 para RowButton**
* `ActionButton.module.css:39-53` y `UrgencyChip.module.css:40-51`: overrides bajo `:global(:root[data-theme='dark'])`. Especificidad del selector nocturno = `(0,0,3,0)` (`:root` pseudo-clase + `[data-theme='dark']` atributo + `.circle--extract` clase) vs. regla diurna `(0,0,1,0)` (`.circle--extract`). **El selector nocturno gana con holgura** — no depende del orden de declaración. Verificado por razonamiento de especificidad CSS.
* Cambio real: relleno sólido → `background-color: transparent` + `color`/`border-color` en el token de color ("tiza"). Sin JavaScript; el `data-theme` ya lo gestiona el interruptor global de US-022.
* **RowButton no tiene overrides nocturnos** (ver D-1) — pero esto coincide con `DESIGN.md:161` y `05_ui_ux_design_system.md §v4.1.0.4`, que definen `RowButton--urgent` como `--color-danger` **sólido** sin excepción nocturna. Los tokens `--rule` / `--color-danger` sí conmutan de valor día/noche, manteniendo legibilidad.

### AC #6 — Guard 29 (sin inline styles, escala de tokens, ubicación de clases) → **CUMPLE**
* `grep "style={"` en los 6 archivos nuevos/modificados → **0 ocurrencias**. `check_inline_styles.sh` → verde.
* Todas las medidas salen de la escala declarada: `--space-1/2/4`, `--fs-xs/sm`, `--fw-semibold/bold`, `--font-family-body/mono` (todos definidos en `index.css:37-49`).
* Ubicación de clases: cada `.circle*`, `.chip*`, `.row-btn*` la usa **un solo componente** → correctamente colocada en su `*.module.css`. `flex-wrap`, `flex-gap-*`, `btn-touch`, `text-*-color` (compartidas 2+) ya viven en `index.css`. No se introdujo ninguna clase compartida nueva.
* `RowButton.tsx:15-19` reenvía `className` (y `...rest`): la fila de consumo principal compone `btn-touch row-btn row-btn--{variant} <styles.remanente-qty-btn> <styles.remanente-qty-btn--wide>` sin perder ninguna clase. Verificado en `ActiveRemanentesList.tsx:104-112`.

### AC #7 — Cero regresión → **CUMPLE**
* `133/133` tests verdes (26 archivos). Los ajustes en `App.test.tsx:26-33` y `FrontendMVP.test.tsx:22,28` solo cambian aserciones de **clase/label** (`btn-primary` → `circle--extract`, `Extraer Insumo de Bodega` → `Extraer de Bodega`), permitido por el DoD ("ajustes de tests que dependían de una clase/color ahora reemplazado"). Ninguna aserción de comportamiento se debilitó — de hecho `App.test.tsx` **añade** `toHaveAttribute('type','button')`.
* Los errores de consola en la corrida de tests (`Failed to parse URL from /api/v1/settings`) son ruido preexistente del fallback offline en jsdom, no fallos.

### AC #8 — Verificación (lint / build / duplication / code-quality) → **CUMPLE**
* Ver tabla de comandos. `lint` 0 errores; `build` limpio; gates de calidad y duplicación acotados al diff en verde.

---

## 🚨 Defectos Detectados

### D-1 — [MENOR / Documentación] Inconsistencia entre AC #5 del ticket y la SSoT de diseño respecto a RowButton nocturno
* **Archivo:** `docs/05_agile_planning/12_tickets/shared/frontend/TK-086-FE.md:53` (AC #5) vs. `apps/frontend/src/shared/components/RowButton.module.css` (sin overrides `:root[data-theme='dark']`).
* **Descripción:** AC #5 dice literalmente *"los 3 componentes cambian a contorno de tiza al alternar el interruptor"*. `RowButton` **no** conmuta a contorno de noche: `row-btn--urgent` (`RowButton.module.css:17-21`) permanece como relleno sólido `--color-danger`, y `row-btn--default` (`:11-15`) como relleno sólido `--rule`. Solo `row-btn--ghost` es contorno (y lo es también de día).
* **Sin embargo:** tanto `DESIGN.md:161` como `docs/02_architecture_design/05_ui_ux_design_system.md §v4.1.0.4` describen `RowButton--urgent` como *"`--color-danger` sólido"* sin ninguna cláusula de turno noche — a diferencia de `ActionButton` (§2, "relleno sólido → contorno de 3px") y `UrgencyChip` (§3, "De noche: contorno"). **El código sigue fielmente la SSoT de diseño aprobada; es el texto del AC #5 el que generaliza de más.**
* **Clasificación:** No es drift de código (FASE 3 exige que el código coincida con el documento de diseño `status: approved`, y coincide). Es una imprecisión redaccional del propio ticket.
* **Recomendación (no bloqueante):** Reformular AC #5 a *"los componentes con capa de color de acción/estado (`ActionButton`, `UrgencyChip`) cambian a contorno de tiza; `RowButton--urgent` conserva el relleno sólido `--color-danger` por decisión de diseño (`DESIGN.md` §v4.1.0.4)"*, o —si el humano realmente quiere RowButton en tiza de noche— abrir un ticket de ajuste que enmiende primero `DESIGN.md` y `05_ui_ux_design_system.md`. **Decisión de alcance para el humano — no la resuelvo en ninguna dirección (Antipatrón C).**

### D-2 — [OBSERVACIÓN / Regresión de prominencia] La señal crítica pierde intensidad léxica ("ALERTA CRÍTICA" → "Hoy")
* **Archivo:** `apps/frontend/src/features/kitchen/components/ActiveRemanentesList.tsx:37-56` (antes: badge `<AlertTriangle/> ALERTA CRÍTICA`; ahora: `<UrgencyChip level="critical" label="Hoy" />`).
* **Descripción:** El texto pasa de una frase de alarma explícita a la etiqueta neutra "Hoy". Mitigantes presentes y verificados:
  * El borde izquierdo `--color-danger` de la tarjeta se conserva (`RemanenteListItem` sigue aplicando `styles['remanente-card--critical']` cuando `hoursRemaining < 24` — `ActiveRemanentesList.tsx:136,140`).
  * El botón "Usar" pasa a `RowButton variant="urgent"` (relleno rojo sólido) cuando la fila es crítica — señal **nueva** que antes no existía.
  * El chip crítico lleva marca + borde + tinte rojo.
* **Veredicto:** La prominencia global de la fila crítica **no disminuye** (gana el botón rojo); solo cambia el registro del texto. Alineado con la escala de 4 niveles que pide US-023. Aceptable — se registra como observación, no como defecto bloqueante.

### D-3 — [MENOR] `urgencyFromHours` etiqueta un remanente ya vencido como "Hoy" en vez de "Vencido"
* **Archivo:** `apps/frontend/src/shared/components/urgency.ts:9`.
* **Descripción:** Con `hoursRemaining` negativo (lote ya expirado), `h < 24` es verdadero → `{critical, 'Hoy'}`. La UI mostraría "Hoy" y "Vence en: -5 hrs" (`ActiveRemanentesList.tsx:46` renderiza `{item.hoursRemaining} hrs` sin clamp). Un lote vencido debería, idealmente, decir "Vencido".
* **Impacto:** Bajo. El nivel `critical` sigue siendo correcto (máxima urgencia), el color y el botón urgente disparan igual. Solo la etiqueta y el contador de horas son subóptimos para el caso borde de un remanente que sobrevivió pasada su fecha.
* **Fuera de alcance estricto:** Ni el ticket ni `05_ui_ux_design_system.md` §v4.1.0.3 (tabla de umbrales: "vence hoy / mañana / 2 días / 3+ días") contemplan el estado "vencido". No bloquea. Candidato a nota en el backlog de US-023 o a resolver en `TK-087-FE` junto al panel de cubetas.

### D-4 — [OBSERVACIÓN] Sin test de apertura del modal "Preparar Receta" con el nuevo ActionButton
* **Archivo:** `apps/frontend/src/tests/FrontendMVP.test.tsx` (cubre solo `Extraer de Bodega` → `WarehouseExtractionModal`).
* **Descripción:** El cableado de `action="recipe"` → `onClick={onPrepareRecipe}` → `modals.setIsRecipeOpen(true)` → `<RecipeSelectorModal isOpen={...}>` (`InventarioRoute.tsx:65-70,183,192`) es idéntico en estructura al de extracción (que sí está testeado y pasa), pero no hay una aserción directa de que el botón "Preparar Receta" abra su modal.
* **No es regresión:** el diff de `FrontendMVP.test.tsx` no eliminó ninguna cobertura de receta — esa cobertura nunca existió en ese archivo. `ActionButton.test.tsx` sí cubre que `action="recipe"` dispara `onClick`.
* **Recomendación (no bloqueante):** Añadir un `it(...)` espejo del de extracción para el botón de receta. Gap de cobertura preexistente, no introducido por este ticket.

---

## 🧾 Notas de verificación adicionales

* **Guard 5 / dead code confirmado limpio:** `.fefo-alert-badge` eliminado de `ActiveRemanentesList.module.css` **y** su único consumidor; `import { AlertTriangle }` retirado de `ActiveRemanentesList.tsx` (ya no se usa allí) pero **conservado en `InventarioRoute.tsx:47`** donde sigue vivo (`MetricCard` de lotes críticos). `PlusCircle` retirado de `InventarioRoute.tsx` y sin referencias en todo `src/`. `ActionCard` reemplazado por `ActionButtonCard`, sin referencias colgantes. No existe ningún componente `StatusBadge` en el repo (la herencia real era el badge inline `.fefo-alert-badge`, ya borrado). `grep` confirmatorio ejecutado.
* **`react-refresh/only-export-components`:** `lint` con 0 errores. `urgency.ts` (helper + type `UrgencyLevel`) está fuera de `UrgencyChip.tsx`; `UrgencyChip.tsx` solo exporta el componente. `ActionButton.tsx` y `RowButton.tsx` exportan únicamente su componente (los tipos `ActionKind`/`RowButtonVariant` son locales, no exportados).
* **Objetivos táctiles ≥48px:**
  * `ActionButton` `.circle` = `72×72px` fijo ✓.
  * `RowButton` compone `.btn-touch` (`min-height:48px; min-width:48px`, `index.css:141-145`). `.row-btn` (`RowButton.module.css:4-9`) solo añade `border`/`font`/`padding`, no fija `height` ni reduce `min-height` → los 48px se mantienen ✓. Con `styles['remanente-qty-btn']` (`height:48px`) el botón principal queda exactamente en 48px ✓.
  * Botones hermanos `-0.25`/`-0.5` (`.remanente-qty-btn`: `height:48px`) ✓. Botón descarte `.icon-badge-sm` = `48×48px` ✓.
* **`check_ticket_duplication.sh` (nuevo de TK-085-FE C-1) — comportamiento sano verificado:** archivó `HEAD` con `git archive`, corrió jscpd sobre ambos árboles, comparó firmas de pares de archivos. Salida: `Clones en HEAD: 21 · en working tree: 21` → 0 clones nuevos. El gate distingue correctamente la deuda preexistente (los 2 clones de `index.css` entre el bloque `@media (prefers-color-scheme: dark)` y el bloque `:root[data-theme="dark"]`, herencia de TK-081-FE) de cualquier clon que introdujera este ticket. Los 3 nuevos `*.module.css` no generaron ningún par duplicado.
* **`InventarioRoute` — modales:** el flujo de extracción está cubierto por `FrontendMVP.test.tsx` y pasa; el de receta comparte estructura idéntica (ver D-4).

---

## 🔁 Candidatos a Regla Permanente (Filtro de Sistemicidad, FASE 6.1)

**Ninguno.**

Análisis del filtro *"¿este defecto podría repetirse en otro archivo/ticket si no queda codificado?"*:

* **D-1** (AC del ticket generaliza de más frente a la SSoT de diseño): es un error redaccional puntual de un ticket, no un patrón. Además, la FASE 3 del propio workflow de auditoría **ya** obliga a contrastar código contra el documento de diseño `status: approved` — el mecanismo para detectarlo existe y funcionó aquí. No requiere Guard nueva.
* **D-2 / D-3 / D-4**: observaciones de UX / cobertura acotadas a este dominio (escala FEFO), sin proyección sistémica. La ausencia de estado "Vencido" es una decisión de producto pendiente, no un antipatrón de código.

No se propone ninguna Guard nueva ni modificación de `AGENTS.md` / `docs/04_governance_and_quality/rules/` / workflow.

---

## ⚖️ VEREDICTO FINAL

**APROBADO PARA COMMIT**

Los 8 criterios de aceptación se cumplen. Todos los gates deterministas acotados al diff (`check_ticket_code_quality.sh`, `check_dead_code.sh`, `check_ticket_duplication.sh`, `check_inline_styles.sh`) y la verificación estándar (`lint` 0 errores, `build` limpio, `133/133` tests) pasan. La separación de capas acción/estado (AC #1), el canal redundante WCAG 1.4.1 con test que lo asevera (AC #2), la escala completa de 4 niveles (AC #3), el confinamiento de la excepción `border-radius: 9999px` a `ActionButton` (AC #4), el turno noche solo-CSS con especificidad de selector suficiente (AC #5, para los componentes que la SSoT de diseño obliga), Guard 29 (AC #6) y cero regresión de comportamiento (AC #7) están verificados.

Los 4 hallazgos son **no bloqueantes**:
* **D-1** es una imprecisión del texto del AC #5 del ticket frente a `DESIGN.md` / `05_ui_ux_design_system.md` (el código sigue fielmente la SSoT de diseño). Se eleva al humano como decisión de alcance / corrección de redacción — no se resuelve en código en ninguna dirección (Antipatrón C).
* **D-2, D-3, D-4** son observaciones menores de UX y cobertura de tests, sin proyección sistémica, candidatas a backlog de US-023 / `TK-087-FE`.
