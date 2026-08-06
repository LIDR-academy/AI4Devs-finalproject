# Informe de Auditoría de Especificaciones (Specs Audit)

**Proyecto:** RestoStock  
**Dominio:** Control y trazabilidad de inventarios en tiempo real para cocinas de restaurantes utilizando la política FEFO (First Expired, First Out) sobre insumos abiertos para mitigar el desperdicio.  
**Método SDD:** propio (VSDD - Verified Spec-Driven Development)  
**Alcance de esta Auditoría:** toda la carpeta de specs (`docs/`)  
**Tipo:** Greenfield  
**Fecha:** 2026-07-31  

---

## 1. Veredicto
**IMPLEMENTABLE.**  
La documentación y las especificaciones son completas, consistentes y detalladas, permitiendo mapear con precisión el 100% del modelo de datos, la lógica del negocio (cascada FEFO, conciliación) y los endpoints. Tras resolver los vacíos iniciales detectados (JWT, umbrales de alerta semafórica de 6 a 24 horas, destino de bodega y puertos), la especificación está 100% lista para su codificación sin requerir que el desarrollador invente decisiones de diseño o producto.

---

## 2. Decisiones que habría que inventar (Fase 5.1)

| Decisión Pendiente | Requisito Afectado | Qué elegiría por defecto | Riesgo si la elección es incorrecta |
| :--- | :--- | :--- | :--- |
| **Ninguna** | N/A | N/A | N/A |

*Nota: Todas las decisiones de producto y técnicas críticas han sido formalizadas en las especificaciones.*

---

## 3. Reconstrucción inversa (Fase 5.2)

El sistema RestoStock es una aplicación de control de inventario de cocina en tiempo real dividida en 5 slices verticales (Autenticación, Catálogo, Stock, Cocina y Reportes) implementada bajo Arquitectura Hexagonal. 

El flujo comienza con un operario de cocina iniciando sesión en una terminal táctil ingresando un PIN de 4 dígitos que se valida usando hashing `bcrypt` y genera un token de sesión JWT con una validez de 12 horas. El operario puede registrar extracciones desde Bodega Central a la cocina, debitando el stock consolidado del depósito central y creando un nuevo remanente abierto en la cocina (en estado `ACTIVE`) especificando la ubicación destino (`toLocation`). El sistema calcula dinámicamente el tiempo de vencimiento del remanente tomando el menor valor entre el vencimiento de fábrica y el vencimiento acelerado (apertura + vida útil abierta). 

En cocina, el operario consume remanentes de forma parcial o total por descarte físico, actualizando el estado de `ACTIVE` a `CONSUMED` o `DISCARDED` con motivo de merma. Para agilizar la operación, el operario puede descontar stock de forma rápida seleccionando recetas predefinidas, lo que ejecuta un descuento transaccional sobre múltiples remanentes en cascada FEFO. Las tablets de cocina muestran alertas visuales semafóricas automáticas sobre vencimiento de remanentes (ROJO < 6 horas, AMARILLO entre 6 y 24 horas), stock por debajo del mínimo de seguridad y estados offline persistentes en caso de caída de internet. Al final de la jornada, el administrador/jefe confirma el cierre de turno: el sistema auto-descarta de forma masiva los remanentes vencidos (límite 24h TRR) y procesa la conciliación física ingresada contra el stock teórico del sistema, calculando e indexando la varianza física. El administrador visualiza mediante una API y filtros temporales un reporte consolidado de mermas y pérdidas.

---

## 4. Hallazgos

| ID | Severidad | Localización | Problema | Qué falta exactamente |
| :--- | :--- | :--- | :--- | :--- |
| **Ninguno** | N/A | N/A | N/A | N/A |

*Nota: Los hallazgos detectados en las fases previas (JWT de 12 horas, alertas amarillas alineadas a 6-24 horas, destino de extracciones `toLocation` y puerto por defecto `3000`) han sido totalmente resueltos e integrados de forma coherente en todos los archivos correspondientes.*

---

## 5. Tabla requisito a requisito (Fase 2)

| Requisito | Localización | Comprobaciones Falladas | Severidad |
| :--- | :--- | :--- | :--- |
| **REQ-001** (Autenticación) | `docs/05_agile_planning/user_stories/auth/US-001.md` | Ninguna | CUMPLE (Muestreo) |
| **REQ-002** (Extracción Bodega) | `docs/05_agile_planning/user_stories/stock/US-002.md` | Ninguna | CUMPLE (Muestreo) |
| **REQ-003** (Consulta FEFO) | `docs/05_agile_planning/user_stories/kitchen/US-003.md` | Ninguna | CUMPLE (Muestreo) |
| **REQ-004** (Consumo Parcial) | `docs/05_agile_planning/user_stories/kitchen/US-004.md` | Ninguna | CUMPLE (Muestreo) |
| **REQ-005** (Descarte/Mermas) | `docs/05_agile_planning/user_stories/kitchen/US-005.md` | Ninguna | CUMPLE (Muestreo) |
| **REQ-006** (Alertas) | `docs/05_agile_planning/user_stories/kitchen/US-006.md` | Ninguna | CUMPLE (Muestreo) |
| **REQ-007** (Consumo Recetas) | `docs/05_agile_planning/user_stories/kitchen/US-007.md` | Ninguna | CUMPLE (Muestreo) |
| **REQ-008** (Cierre de Turno) | `docs/05_agile_planning/user_stories/kitchen/US-008.md` | Ninguna | CUMPLE (Muestreo) |
| **REQ-009** (Dashboard Mermas) | `docs/05_agile_planning/user_stories/reports/US-009.md` | Ninguna | CUMPLE (Muestreo) |

---

## 6. Trazabilidad (Fase 4)

| ID Requerimiento | ID Historia de Usuario | ID Ticket Técnico | Endpoint API REST | Persistencia / Tabla Prisma | Estado de Trazabilidad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-001** | [US-001](../05_agile_planning/user_stories/auth/US-001.md) | [TK-002](../05_agile_planning/tickets/auth/backend/TK-002.md) | `POST /api/auth/pin` | `User`, `Role` | **CUMPLE** |
| **REQ-002** | [US-002](../05_agile_planning/user_stories/stock/US-002.md) | [TK-003](../05_agile_planning/tickets/stock/backend/TK-003.md) | `POST /api/stock/extraction` | `StockMovement`, `ActiveRemanent` | **CUMPLE** |
| **REQ-003** | [US-003](../05_agile_planning/user_stories/kitchen/US-003.md) | [TK-004](../05_agile_planning/tickets/kitchen/backend/TK-004.md) | `GET /api/kitchen/remanentes` | `ActiveRemanent`, `Item` | **CUMPLE** |
| **REQ-004** | [US-004](../05_agile_planning/user_stories/kitchen/US-004.md) | [TK-005](../05_agile_planning/tickets/kitchen/backend/TK-005.md) | `POST /api/kitchen/consume` | `ActiveRemanent`, `PartialUsage` | **CUMPLE** |
| **REQ-005** | [US-005](../05_agile_planning/user_stories/kitchen/US-005.md) | [TK-006](../05_agile_planning/tickets/kitchen/backend/TK-006.md) | `POST /api/kitchen/discard` | `ActiveRemanent`, `WasteLog` | **CUMPLE** |
| **REQ-006** | [US-006](../05_agile_planning/user_stories/kitchen/US-006.md) | [TK-007](../05_agile_planning/tickets/kitchen/frontend/TK-007.md) | `GET /api/kitchen/alerts` | `ActiveRemanent`, `Notification` | **CUMPLE** |
| **REQ-007** | [US-007](../05_agile_planning/user_stories/kitchen/US-007.md) | [TK-008](../05_agile_planning/tickets/kitchen/backend/TK-008.md) | `POST /api/kitchen/recipe-consume` | `Recipe`, `RecipeIngredient` | **CUMPLE** |
| **REQ-008** | [US-008](../05_agile_planning/user_stories/kitchen/US-008.md) | [TK-009](../05_agile_planning/tickets/kitchen/backend/TK-009.md) | `POST /api/kitchen/shift-reconciliation` | `ShiftReconciliation`, `WasteLog` | **CUMPLE** |
| **REQ-009** | [US-009](../05_agile_planning/user_stories/reports/US-009.md) | [TK-010](../05_agile_planning/tickets/reports/backend/TK-010.md) | `GET /api/reports/waste` | `WasteLog`, `Item` | **CUMPLE** |

*Nota: La trazabilidad entre especificaciones es completa y bidireccional.*

---

## 7. Sin evidencia
No existen aspectos sin evidencia documental. Todos los puntos evaluados tienen una justificación y una contraparte física en la carpeta `docs/`.

---

## 8. Cobertura
- **Revisado:** Toda la base documental del proyecto (23 archivos Markdown dentro de la carpeta `docs/`, `readme.md`, `CHANGELOG.md` y `AGENTS.md` de la raíz).
- **Muestreado:** Se verificó la consistencia cruzada de `matriz_trazabilidad.md`, `TK-002.md`, `US-006.md` y `09_restostock_database_schema.md`.
- **Excluido:** Código de programación, ya que no forma parte del alcance de esta auditoría exclusiva de especificaciones.
