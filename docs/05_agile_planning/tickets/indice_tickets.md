# 📖 Índice de Tickets de Trabajo (Sprint Backlog)

Este documento centraliza el backlog técnico y funcional del Producto Mínimo Viable (MVP) para **RestoStock**, organizado por **Epic/Módulo** y separado en **Backend** y **Frontend**. Permite realizar un seguimiento claro de la trazabilidad desde las historias de usuario hasta el desarrollo físico en la base de código.

---

## 📊 1. Matriz de Trazabilidad del Sprint Backlog

### ⚙️ Tickets de Backend

| ID Ticket | ID US Relacionada | Título del Ticket | Módulo / Slice Afectado | Estimación (SP) | Prioridad MoSCoW | Ruta del Fichero |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TK-001** | N/A (Técnico) | Configuración del Core del Backend y Base de Datos | `shared` | 3 | Must Have | [shared/backend/TK-001.md](shared/backend/TK-001.md) |
| **TK-002** | [US-001](../user_stories/auth/US-001.md) | Implementación de Autenticación de Operarios por PIN | `auth` | 3 | Must Have | [auth/backend/TK-002.md](auth/backend/TK-002.md) |
| **TK-003** | [US-002](../user_stories/stock/US-002.md) | Implementación del Slice de Registro de Extracciones de Bodega | `stock` | 5 | Must Have | [stock/backend/TK-003.md](stock/backend/TK-003.md) |
| **TK-004** | [US-003](../user_stories/kitchen/US-003.md) | Implementación del Slice de Consulta de Remanentes Activos en Cocina (FEFO) | `kitchen` | 3 | Must Have | [kitchen/backend/TK-004.md](kitchen/backend/TK-004.md) |
| **TK-005** | [US-004](../user_stories/kitchen/US-004.md) | Implementación del Slice de Consumo Parcial de Remanentes | `kitchen` | 3 | Must Have | [kitchen/backend/TK-005.md](kitchen/backend/TK-005.md) |
| **TK-006** | [US-005](../user_stories/kitchen/US-005.md) | Implementación del Slice de Descarte y Mermas de Cocina | `kitchen` | 3 | Must Have | [kitchen/backend/TK-006.md](kitchen/backend/TK-006.md) |
| **TK-008** | [US-007](../user_stories/kitchen/US-007.md) | Implementación de Recetas y Descuento FEFO en Cascadas | `catalog`/`kitchen` | 5 | Should Have | [kitchen/backend/TK-008.md](kitchen/backend/TK-008.md) |
| **TK-009** | [US-008](../user_stories/kitchen/US-008.md) | Implementación de Cierre de Turno y Conciliación en Cocina | `kitchen` | 5 | Should Have | [kitchen/backend/TK-009.md](kitchen/backend/TK-009.md) |
| **TK-010** | [US-009](../user_stories/reports/US-009.md) | Implementación del Módulo de Reportes y Analítica de Mermas | `reports` | 3 | Should Have | [reports/backend/TK-010.md](reports/backend/TK-010.md) |

### 🖥️ Tickets de Frontend

| ID Ticket | ID US Relacionada | Título del Ticket | Módulo / Slice Afectado | Estimación (SP) | Prioridad MoSCoW | Ruta del Fichero |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TK-007** | [US-006](../user_stories/kitchen/US-006.md) | Implementación de Pantalla de Notificaciones y Alertas Dinámicas | `kitchen` | 3 | Should Have | [kitchen/frontend/TK-007.md](kitchen/frontend/TK-007.md) |
| **TK-007-B** | [US-001](../user_stories/auth/US-001.md) | Pantalla de Login por PIN | `auth` | 3 | Must Have | [auth/frontend/TK-007-B.md](auth/frontend/TK-007-B.md) |
| **TK-007-C** | [US-007](../user_stories/kitchen/US-007.md) | Interfaz de Consumo de Recetas | `kitchen` | 3 | Should Have | [kitchen/frontend/TK-007-C.md](kitchen/frontend/TK-007-C.md) |
| **TK-007-D** | [US-008](../user_stories/kitchen/US-008.md) | Formulario de Reconciliación de Turno | `kitchen` | 5 | Should Have | [kitchen/frontend/TK-007-D.md](kitchen/frontend/TK-007-D.md) |
| **TK-007-E** | [US-009](../user_stories/reports/US-009.md) | Dashboard de Reportes de Desperdicio y Eficiencia FEFO | `reports` | 3 | Should Have | [reports/frontend/TK-007-E.md](reports/frontend/TK-007-E.md) |
| **TK-007-F** | [US-002](../user_stories/stock/US-002.md) | Pantalla de Registro de Extracciones de Bodega | `stock` | 3 | Must Have | [stock/frontend/TK-007-F.md](stock/frontend/TK-007-F.md) |

*SP = Story Points (Puntos de Historia basados en escala Fibonacci).*

---

## 🗂️ 2. Resumen de Fichas Técnicas de Tickets por Módulo

### 🛠️ Shared / Transversal
*   **[TK-001: Configuración del Core del Backend y Base de Datos](shared/backend/TK-001.md)**: Inicialización del monorepo, configuración de Prisma ORM, conexión segura cifrada a base de datos y middlewares globales.

### 🔐 Autenticación (`auth/`)
*   **[TK-002: Implementación de Autenticación de Operarios por PIN](auth/backend/TK-002.md)** (Backend)
*   **[TK-007-B: Pantalla de Login por PIN](auth/frontend/TK-007-B.md)** (Frontend)

### 📦 Bodega y Stock (`stock/`)
*   **[TK-003: Implementación del Slice de Registro de Extracciones de Bodega](stock/backend/TK-003.md)** (Backend)
*   **[TK-007-F: Pantalla de Registro de Extracciones](stock/frontend/TK-007-F.md)** (Frontend)

### 🍳 Cocina (`kitchen/`)
*   **[TK-004: Consulta de Remanentes Activos en Cocina (FEFO)](kitchen/backend/TK-004.md)** (Backend)
*   **[TK-005: Consumo Parcial de Remanentes](kitchen/backend/TK-005.md)** (Backend)
*   **[TK-006: Descarte y Mermas de Cocina](kitchen/backend/TK-006.md)** (Backend)
*   **[TK-008: Recetas y Descuento FEFO en Cascadas](kitchen/backend/TK-008.md)** (Backend)
*   **[TK-009: Cierre de Turno y Conciliación en Cocina](kitchen/backend/TK-009.md)** (Backend)
*   **[TK-007: Alertas y Notificaciones](kitchen/frontend/TK-007.md)** (Frontend)
*   **[TK-007-C: Interfaz de Consumo de Recetas](kitchen/frontend/TK-007-C.md)** (Frontend)
*   **[TK-007-D: Formulario de Reconciliación de Turno](kitchen/frontend/TK-007-D.md)** (Frontend)

### 📊 Reportes (`reports/`)
*   **[TK-010: Módulo de Reportes y Analítica de Mermas](reports/backend/TK-010.md)** (Backend)
*   **[TK-007-E: Dashboard de Reportes de Mermas](reports/frontend/TK-007-E.md)** (Frontend)
