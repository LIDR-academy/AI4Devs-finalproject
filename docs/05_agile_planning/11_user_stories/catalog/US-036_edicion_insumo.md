---
document: user_story
id: US-036
version: 1.0.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/05_agile_planning/11_user_stories/catalog/US-012.md
  - docs/audits/AUDIT-DEV-012-ai-config-leakage-and-crud-coverage.md
---

# 📝 US-036: Edición de un Insumo del Catálogo Maestro

> **Navegación:** [⬅️ US-012 (catalog/US-012.md)](US-012.md) | [📖 Índice de Historias](../indice_user_stories.md) | [Índice de Tickets ➡️](../../12_tickets/indice_tickets.md)

---

## 🗣️ Narrativa

**Como** Administrador del restaurante (Rol: ADMIN),
**Cuando** un insumo del catálogo tiene un dato mal cargado — nombre mal escrito, sin costo unitario, o con un código de barras equivocado —,
**Quiero** poder corregir esos campos desde la API,
**Para** que el inventario, la valorización de mermas (`US-019`) y las recetas de rescate (`US-035`, que muestran "valor no disponible" mientras el insumo no tenga `unitCost`) operen con datos correctos, sin recrear el insumo ni tocar la base de datos a mano.

## 📌 Justificación (Gap Analysis)

`US-012` §[N]egociable dejó explícitamente fuera "la edición/baja de insumos". `AUDIT-DEV-012` (C-1) la reactivó: hoy `unitCost` **solo** se fija al crear el insumo y `PATCH /:id/restock` únicamente suma cantidad — un insumo creado sin costo es irreparable, y `TK-128` acaba de hacer que ese costo sea visible y necesario en la pantalla de rescate.

## 🗣️ Decisiones de Negocio Consultadas con el Humano (Guard 28, 2026-09-07)

* **Pregunta:** ¿Qué campos de un insumo ya creado se pueden editar?
* **Respuesta:** `name`, `unitCost` (fijar o limpiar) y `barcode` (fijar o limpiar). **`unitOfMeasure` NO** — cambiarla con stock o remanentes existentes reinterpreta en silencio todas las cantidades físicas (10 KG pasa a leerse como 10 L). El cambio de `unitCost` afecta **solo** valorizaciones futuras; el histórico (`StockMovement`, reportes de merma ya calculados) conserva su snapshot.
* **Sin cambios de esquema:** `Insumo` ya tiene `name`, `unitCost`, `barcode` en `schema.prisma` — esta historia es Application + Infrastructure.

---

## 🥒 Criterios de Aceptación (BDD Gherkin)

### Escenario 1: Edición exitosa (Happy Path)
- **Given** un insumo `"Harina 00"` sin `unitCost`
- **When** un ADMIN invoca `PUT /api/v1/stock/insumos/{id}` con `{ "name": "Harina 000", "unitCost": "820.00" }`
- **Then** el sistema responde `200 OK` con el insumo actualizado
- **And** `GET /api/v1/stock/insumos` refleja el nuevo nombre y costo
- **And** las líneas de stock y la unidad de medida quedan intactas.

### Escenario 2: `unitOfMeasure` es inmutable
- **Given** un insumo con `unitOfMeasure: "KG"`
- **When** un ADMIN envía `unitOfMeasure: "L"` en el `PUT`
- **Then** el sistema responde `400 Bad Request` (`ValidationError`) — el campo no es editable.

### Escenario 3: Colisión de nombre o código de barras
- **Given** dos insumos `"Sal Fina"` y `"Sal Gruesa"`
- **When** un ADMIN intenta renombrar `"Sal Gruesa"` a `"Sal Fina"` (o asignarle un `barcode` que ya usa otro insumo)
- **Then** el sistema responde `409 Conflict` y no aplica ningún cambio.

### Escenario 4: Control de acceso e insumo inexistente
- **Given** un usuario `KITCHEN_STAFF`, o un `{id}` que no existe
- **Then** `403 Forbidden` (rol) / `404 Not Found` (id).

### Escenario 5: Limpiar un campo opcional
- **Given** un insumo con `barcode` y `unitCost` registrados
- **When** un ADMIN envía `{ "barcode": null }`
- **Then** el `barcode` queda sin asignar y el `unitCost` se conserva (solo se toca lo enviado).

---

## 🔒 NFRs

* **Edición parcial:** solo se modifican los campos presentes en el body; los ausentes se conservan.
* **Integridad:** `name` no vacío; `unitCost` con la escala de `Decimal(12,2)`; `barcode` ≤ 64 chars y único.
* **Autoría:** solo ADMIN (mismo criterio que el alta, `US-012`).

---

## 🔗 Referencias

* Historia base: [`US-012`](US-012.md) · Auditoría: [`AUDIT-DEV-012`](../../../audits/AUDIT-DEV-012-ai-config-leakage-and-crud-coverage.md) C-1
* Tickets: [`TK-130`](../../12_tickets/stock/backend/TK-130.md) (Backend) · [`TK-130-FE`](../../12_tickets/stock/frontend/TK-130-FE.md) (Frontend)
* Relacionadas: [`US-019`](../reports/US-019.md) (valorización), [`US-035`](../reports/US-035_recetas_aprovechamiento_ia.md) (rescate), [`US-032`](../stock/US-032.md) (barcode)
