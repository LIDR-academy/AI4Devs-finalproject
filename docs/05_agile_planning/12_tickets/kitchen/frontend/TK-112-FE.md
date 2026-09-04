---
document: technical_ticket
id: TK-112-FE
related_story: US-026
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/stock/US-026.md
---

# 🎟️ TK-112-FE: Las Pestañas de Filtro por Área de Cocina Dejaron de Coincidir con los Remanentes Reales (Frontend)

> [⬅️ US-026](../../../11_user_stories/stock/US-026.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
**Remediación técnica** (C-DEV-006-4 — no cambia ninguna regla de negocio, corrige la UI para reflejar el modelo de áreas de cocina de `US-026`/`TK-102` ya vigente). Detectado en el análisis de hardcodeos pedido por el humano y **confirmado contra la base real**: `LocationFilterTabs`/`InventarioRoute` filtran y cuentan remanentes comparando `Remanente.location` contra los literales fijos `'KITCHEN_FRIDGE'`/`'KITCHEN_PREP'`/`'KITCHEN_LINE'`. Pero desde que `TK-102-FE` volvió dinámico el destino de la extracción, `Remanente.location` guarda el **nombre real** del área (`"Refrigerador Principal Cocina"`, `"Mesa de Preparación"`, `"Línea de Servicio"`) — nunca el literal. Verificado en la base viva: los 3 remanentes activos actuales tienen exactamente esos nombres, ninguno el literal. Resultado: **las pestañas "Refrigerador"/"Mesa Prep"/"Línea" del tablero FEFO muestran 0 remanentes siempre**, aunque existan — solo "Todos" funciona. Además, si el admin da de alta una cuarta área de cocina (ya posible desde `US-016`), esa área nunca tendría pestaña propia.

*   **US:** `US-026` · **Slice:** `kitchen` UI · **SP:** 3 · **Prioridad:** 🔴 P0 — bug confirmado en vivo, tablero principal
*   **Prerrequisitos:** ninguno (`GET /kitchen/remanentes-activos` ya devuelve `storageLocationId`/`storageLocationName` desde `TK-102`; `fetchActiveKitchenAreas()` ya existe desde `TK-102-FE`)

## 🔀 Alcance (UI)
*   `kitchen.service.ts`: `RemanenteFEFOItem` gana `storageLocationId?: string` (el backend ya lo enviaba; el tipo del frontend lo descartaba en silencio).
*   `LocationFilterTabs.tsx`: deja de tener 3 pestañas fijas — se puebla dinámicamente desde `fetchActiveKitchenAreas()` (mismo servicio que ya usa `StorageSectorSelect`), una pestaña por área de cocina activa + "Todos". `LocationFilter` pasa de unión fija a `string` (id real del área).
*   `InventarioRoute.tsx`: `counts`/`filtered` comparan por `storageLocationId`, no por el literal `location`.
*   Guard 29 / Guard 38.

## ✅ DoD
1. Test de componente: con remanentes reales (`location` = nombre del área, `storageLocationId` seteado), la pestaña de esa área muestra el conteo correcto y filtra correctamente al hacer clic — reproduce el caso confirmado en la base real.
2. Sin regresiones frontend; sin código muerto / estilos inline nuevos.
3. **Commit:** `fix(kitchen): location filter tabs stopped matching real remanente areas (TK-112-FE)`.

## 📌 Notas de implementación
*   **Verificado contra la base real antes de codificar** (no solo por lectura de código): `docker exec restostock_postgres psql ... SELECT location, "storageLocationId" FROM "Remanente" WHERE status='ACTIVE'` confirmó los 3 remanentes con nombres reales, ninguno con el literal.
*   **Etiquetas cortas hardcodeadas retiradas:** `TK-095-FE WS-4 #12` había fijado "Refrigerador"/"Mesa Prep"/"Línea" como etiquetas cortas de esas 3 áreas específicas — al volverse dinámico ya no hay una lista fija que acortar a mano. Se usa el nombre real de la pestaña con `text-overflow: ellipsis` + `title` con el nombre completo, para no romper el layout en tablet con nombres de área largos que un admin pudiera elegir.
*   **Remanentes legados sin `storageLocationId`** (previos a `TK-102`) solo aparecen bajo "Todos", nunca bajo una pestaña de área específica — mismo comportamiento aceptado ya para el resto del modelo multi-sector (`resolveKitchenArea`, `IRemanenteRepository`).
*   DoD #1 cubierto con 3 tests (`LocationFilterTabs.test.tsx`, sobre `InventarioRoute` completo vía `AppShellCtx.Provider`): pestañas con nombres reales (nunca el literal legado), conteo correcto por área, filtrado correcto al hacer clic — con los datos exactos confirmados en la base real.
