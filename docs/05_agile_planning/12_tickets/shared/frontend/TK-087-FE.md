---
document: technical_ticket
id: TK-087-FE
related_story: US-023
points: 3
type: frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-023.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
  - DESIGN.md
---

# 🎟️ TK-087-FE: Panel "Estado" de 3 Cubetas + Leyenda Numérica + Grid Acciones\|Estado

> **Navegación del Framework SDD:**
> [📖 Índice de Tickets](../../indice_tickets.md) | [Anterior: TK-086-FE](./TK-086-FE.md) | [Siguiente: TK-088-FE](./TK-088-FE.md)

---

## 📝 Descripción
Reestructura el bloque de resumen del tablero FEFO según la lámina "Aplicación" (`05_ui_ux_design_system.md` §v4.1.0): de 2 tarjetas de métrica a **3 cubetas de severidad** alineadas con los 3 segmentos de la `FEFOInventoryHealthBar`, que gana una **leyenda numérica** explícita. Introduce el grid `Acciones | Estado` de 2 columnas. Hereda componentes de `TK-086-FE` y shell de `TK-085-FE`.

---

## 🔀 Alcance de Modificación (Frontend Architecture)

* **`apps/frontend/src/app/routes/InventarioRoute.tsx` (ó `App.tsx` según `TK-085-FE`):**
  * `SummaryCards` pasa de `[Remanentes Abiertos] [Vencimiento Próximo <24h] [Extraer] [Preparar Receta]` a un grid de 2 paneles:
    * **Acciones** (izquierda): los `ActionButton` de `TK-086-FE`.
    * **Estado** (derecha): 3 cubetas de severidad — `Vigentes` (`--color-success`), `Vencimiento Próximo` (`--color-warning`), `Críticos Hoy` (`--color-danger`) — sobre la `FEFOInventoryHealthBar`.
  * Separador `border-left: 2px dashed var(--rule)` en `md+`; apilado en `sm`.
* **Cálculo de las 3 cubetas:** derivar de `remanentes` en el mismo render que ya calcula `criticalCount` — `vigentes` = `hoursRemaining >= 24` y no crítico según umbral FEFO configurado; `próximo` = franja intermedia; `críticos` = `hoursRemaining < 24` (o el umbral de `SystemSettings` si está disponible). Reutilizar la lógica de segmentación que ya vive en `FEFOInventoryHealthBar` — extraerla a un helper compartido si hoy está duplicada (Guard 5 / anti-duplicación `jscpd`).
* **`apps/frontend/src/features/kitchen/components/FEFOInventoryHealthBar.tsx` + `.module.css`:**
  * Añade una leyenda bajo la barra: `58% vigente (7)` · `25% próximo (3)` · `17% crítico (2)` en `--font-family-mono`, cada entrada con su punto de color de 8px.
  * La barra conserva `role="img"` + `aria-label` descriptivo actualizado con los mismos números.
  * Porcentajes redondeados de forma consistente (suman 100 tras redondeo — resolver el residuo en el segmento mayor).
* **`apps/frontend/src/App.module.css` / `InventarioRoute.module.css`:** clases del grid `Acciones|Estado` y de las 3 cubetas desde la escala de tokens.
* **Tests:** `FEFOInventoryHealthBar` — la leyenda numérica coincide con los segmentos y con el `aria-label`; caso 0 remanentes → estado vacío explícito, nunca `"0%"` engañoso. Las 3 cubetas muestran los conteos correctos para un set de remanentes de prueba.

**Fuera de alcance:** los componentes de `TK-086-FE` (aquí solo se consumen), routing (`TK-085-FE`), auditoría de contraste (`TK-088-FE`).

**Recoger de `AUDIT-DEV-004` (D-3):** si este ticket toca `urgency.ts`/`UrgencyChip` para las 3 cubetas, resolver de paso el caso `hoursRemaining` negativo (remanente ya vencido) → etiqueta "Vencido" en vez de "Hoy", con su token/tratamiento en `05_ui_ux_design_system.md` §v4.1.0.

---

## ✅ Criterios de Aceptación & DoD

1. **3 cubetas alineadas:** los conteos de `Vigentes`/`Próximo`/`Críticos` coinciden exactamente con los 3 segmentos de la health bar y con su leyenda numérica (una sola fuente de verdad para la segmentación).
2. **Leyenda numérica:** visible bajo la barra, en `--font-family-mono`, con porcentaje + conteo absoluto + punto de color por segmento; refleja el `aria-label` de la barra.
3. **Estado vacío:** con 0 remanentes, el panel Estado muestra un mensaje explícito, nunca `0%`/`0h` que se lea como "todo perfecto".
4. **Grid responsivo:** `Acciones|Estado` en 2 columnas en `md+`, apilado en `sm`, sin scroll horizontal del body.
5. **Anti-duplicación:** la lógica de segmentación FEFO existe una sola vez (helper compartido); `pnpm --filter frontend run duplication` bajo el umbral 3%.
6. **Guard 29:** 0 `style={{}}` inline (excepto `--bar-pct` custom property si aplica, patrón sancionado); clases desde tokens.
7. **Cero regresión:** `pnpm --filter frontend test -- --run` verde.
8. **Verificación:** `pnpm --filter frontend run lint`, `run build`, `check_ticket_code_quality.sh`, `check_dead_code.sh`, `check_ticket_duplication.sh` — 0 errores en el diff.

---

## 🧩 Implementación

* **Fuente única de segmentación:** `shared/components/urgency.ts` gana `bucketRemanentes()` (cuenta crítico/atención/vigente con el mismo umbral que `urgencyFromHours`: `<0`→Vencido, `<24`→Hoy, `<48`→Mañana, resto→N Días) y `bucketPercentages()` (siempre suma 100, residuo en el segmento mayor). D-3 de `AUDIT-DEV-004` resuelto aquí: `hoursRemaining < 0` → etiqueta "Vencido" (mismo nivel `critical`).
* **`FEFOInventoryHealthBar`:** consume el helper; barra con `role="img"` + `aria-label` numérico; leyenda numérica (`N% vigente (n) · …`) en `--font-family-mono` con punto de color por segmento; nuevo prop `embedded` (sin tarjeta ni cabecera larga) para montarse dentro del panel Estado.
* **`InventarioRoute`:** las 2 `MetricCard` viejas → panel `Estado` de 3 cubetas (`Vigentes` / `Vencimiento Próximo` / `Críticos Hoy`) + health bar embebida; grid `Acciones | Estado` (2 columnas en `md+`, apilado en `sm`, separador `border-left: 2px dashed`). `InventarioRoute.module.css` nuevo.
