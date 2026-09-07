---
document: user_story
id: US-037
version: 1.0.0
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/catalog/US-012.md
  - docs/audits/AUDIT-DEV-012-ai-config-leakage-and-crud-coverage.md
---

# 📝 US-037: Edición y Baja de una Receta del Recetario

> **Navegación:** [⬅️ US-036 (catalog/US-036_edicion_insumo.md)](US-036_edicion_insumo.md) | [📖 Índice de Historias](../indice_user_stories.md)

---

## 🗣️ Narrativa

**Como** Administrador del restaurante (Rol: ADMIN),
**Cuando** una receta del recetario tiene un error (nombre, categoría, descripción o composición de ingredientes) o quedó obsoleta,
**Quiero** poder corregirla o retirarla del recetario desde la API,
**Para** que el catálogo refleje las recetas reales vigentes y no acumule ruido o datos incorrectos que alimentan las sugerencias de rescate (`US-035`), la disponibilidad (`US-007`) y las preparaciones (`US-027`).

## 📌 Justificación (Gap Analysis)

`US-012` §[N]egociable dejó fuera "la edición/baja de recetas". `AUDIT-DEV-012` (C-2) la reactiva: hoy no hay `PUT` ni `DELETE` para `Recipe` — una receta mal cargada es permanente.

## 🗣️ Decisiones de Negocio Consultadas con el Humano (Guard 28, 2026-09-07)

* **Pregunta:** ¿Cómo se maneja el borrado y la edición de recetas?
* **Respuesta:** **Soft-delete** (`Recipe.isActive`). `RecipePreparation.recipe` es `onDelete: Restrict` — un borrado físico no es posible. `PUT` edita libremente **si la receta no aparece en ninguna `RecipePreparation` con estado `CLOSED`**; si aparece, solo se permiten `name` / `category` / `description`, **no** los ingredientes — editar la composición cambiaría retroactivamente el "consumo teórico vs. real" de los reportes de preparaciones ya cerradas (`US-029`).

---

## 🥒 Criterios de Aceptación (BDD Gherkin)

### Escenario 1: Edición completa de una receta sin preparaciones cerradas
- **Given** una receta `"Salsa Base"` que nunca se ha preparado
- **When** un ADMIN invoca `PUT /api/v1/recipes/{id}` con nuevo nombre, categoría, descripción y lista de ingredientes
- **Then** el sistema responde `200 OK` con la receta actualizada, validando que cada `insumoId` de la nueva lista existe (mismo criterio que el alta, `US-012`).

### Escenario 2: Edición de metadatos de una receta con preparaciones cerradas
- **Given** una receta que ya tiene al menos una `RecipePreparation` `CLOSED`
- **When** un ADMIN envía solo `name` / `category` / `description`
- **Then** el sistema responde `200 OK`.

### Escenario 3: Intento de editar ingredientes de una receta con preparaciones cerradas
- **Given** la misma receta del Escenario 2
- **When** el ADMIN incluye `ingredients` en el `PUT`
- **Then** el sistema responde `409 Conflict` y no aplica ningún cambio — la composición está congelada por trazabilidad.

### Escenario 4: Baja (soft-delete)
- **Given** una receta activa
- **When** un ADMIN invoca `DELETE /api/v1/recipes/{id}`
- **Then** el sistema responde `204 No Content`, marca `isActive = false`
- **And** la receta deja de aparecer en `GET /api/v1/recipes`, en el ranking de recetas de rescate (`US-035` modo CATALOG) y en la disponibilidad por receta (`US-007`)
- **And** las `RecipePreparation` históricas que la referencian se conservan intactas.

### Escenario 5: Control de acceso e inexistencia
- **Given** un `KITCHEN_STAFF`, o un `{id}` inexistente / ya dado de baja
- **Then** `403 Forbidden` (rol) / `404 Not Found` (id).

---

## 🔒 NFRs

* **Integridad referencial:** ningún `PUT` persiste una receta con un `insumoId` inexistente (mismo NFR que `US-012`).
* **Trazabilidad:** el soft-delete nunca rompe una `RecipePreparation` existente (`onDelete: Restrict` sigue vigente; solo cambia `isActive`).
* **Cambio de esquema:** `Recipe.isActive Boolean @default(true)` — migración aditiva con default.

---

## 🔗 Referencias

* Historia base: [`US-012`](US-012.md) · Auditoría: [`AUDIT-DEV-012`](../../../audits/AUDIT-DEV-012-ai-config-leakage-and-crud-coverage.md) C-2
* Tickets: [`TK-131`](../../12_tickets/recipes/backend/TK-131.md) · [`TK-131-FE`](../../12_tickets/recipes/frontend/TK-131-FE.md)
* Relacionadas: [`US-035`](../reports/US-035_recetas_aprovechamiento_ia.md), [`US-007`](../kitchen/US-007.md), [`US-027`](../kitchen/US-027.md), [`US-029`](../reports/US-029.md)
