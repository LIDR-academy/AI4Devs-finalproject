# 📖 Índice de Tickets de Trabajo (Sprint Backlog & Criterios de Priorización)

Este documento centraliza el backlog técnico y funcional del Producto Mínimo Viable (MVP) para **RestoStock**, organizado por **Epic/Módulo**, priorización cualitativa y separado en **Backend** y **Frontend**. Permite realizar un seguimiento claro de la trazabilidad desde las historias de usuario hasta el desarrollo físico en la base de código.

---

## ⚖️ 1. Matriz Multidimensional de Criterios de Priorización

Para determinar la secuencia de desarrollo en el Sprint Backlog y garantizar el máximo retorno de inversión (ROI) minimizando el riesgo técnico, cada ticket se evalúa en 4 dimensiones estratégicas:

1. **Impacto en el Usuario y Valor del Negocio:** Relevancia en la operación diaria de cocina y reducción directa de mermas (*Muy Alto*, *Alto*, *Medio*, *Bajo*).
2. **Urgencia basada en Tendencias y Feedback:** Cumplimiento del método FEFO, higiene alimentaria y ergonomía táctil en pantalla de cocina (*Muy Alta*, *Alta*, *Media*, *Baja*).
3. **Complejidad y Esfuerzo Estimado (Story Points - SP):** Puntos de Historia basados en escala Fibonacci (1, 2, 3, 5, 8).
4. **Riesgos y Dependencias Técnicas:** Identificación de prerrequisitos entre capas Hexagonales y bloqueantes de arquitectura.

### 📊 Evaluación y Ranking del Backlog

| ID Ticket | Módulo | Valor de Negocio | Urgencia de Mercado | Esfuerzo (SP) | Riesgos & Dependencias Críticas | Nivel de Prioridad |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| **TK-001** | `shared` | **Muy Alto** | **Muy Alta** | 3 SP | Ninguno. Habilitador crítico de BD Prisma y Monorepo Core. | 🔴 P0 - Bloqueante |
| **TK-001-FE** | `shared` | **Muy Alto** | **Muy Alta** | 3 SP | Ninguno. Habilitador de UI Táctil 48px y Vite React. | 🔴 P0 - Bloqueante |
| **TK-002** | `auth` | **Muy Alto** | **Alta** | 3 SP | Depende de `TK-001`. Cero trazabilidad sin autenticación PIN. | 🔴 P0 - Crítica |
| **TK-007-B** | `auth` | **Muy Alto** | **Alta** | 3 SP | Depende de `TK-001-FE` y `TK-002`. Pantalla Login PIN. | 🔴 P0 - Crítica |
| **TK-003** | `stock` | **Muy Alto** | **Muy Alta** | 5 SP | Depende de `TK-001`, `TK-002`. Riesgo de precisión decimal. | 🔴 P0 - Crítica |
| **TK-007-F** | `stock` | **Muy Alto** | **Muy Alta** | 3 SP | Depende de `TK-003`. Formulario de extracción de bodega. | 🔴 P0 - Crítica |
| **TK-004** | `kitchen` | **Muy Alto** | **Muy Alta** | 3 SP | Depende de `TK-003`. Algoritmo FEFO de remanentes activos. | 🔴 P0 - Crítica |
| **TK-005** | `kitchen` | **Alto** | **Alta** | 3 SP | Depende de `TK-004`. Consumo parcial de fracciones en turno. | 🟡 P1 - Alta |
| **TK-006** | `kitchen` | **Alto** | **Alta** | 3 SP | Depende de `TK-004`. Registro de mermas y descarte. | 🟡 P1 - Alta |
| **TK-008** | `kitchen` | **Alto** | **Alta** | 5 SP | Depende de `TK-004`. Algoritmo complejo de Recetas FEFO. | 🟡 P1 - Alta |
| **TK-009** | `kitchen` | **Alto** | **Media** | 5 SP | Depende de `TK-004`, `TK-005`. Conciliación de cierre de turno. | 🟡 P1 - Alta |
| **TK-010** | `reports` | **Medio** | **Media** | 3 SP | Depende de `TK-006`. Visualización de mermas y analítica. | 🟢 P2 - Media |
| **TK-048** | `shared` | **Alto** | **Alta** | 5 SP | Depende de `TK-008`, `TK-009`, `TK-010`. Cierre de persistencia parcial en producción. | 🟡 P1 - Alta |
| **TK-049** | `auth` | **Alto** | **Alta** | 3 SP | Depende de `TK-002`. Gestión mínima de personal (alta/bloqueo). | 🟡 P1 - Alta |
| **TK-050** | `stock` | **Medio** | **Media** | 3 SP | Depende de `TK-003`, `TK-005`, `TK-006`. Trazabilidad de movimientos. | 🟢 P2 - Media |
| **TK-051** | `shared` | **Muy Alto** | **Muy Alta** | 5 SP | Depende de `TK-049`. Bootstrap del primer administrador en despliegue nuevo. | 🔴 P0 - Bloqueante |

---

## 📊 2. Trazabilidad del Sprint Backlog (Backend vs. Frontend)

### ⚙️ Tickets de Backend

| ID Ticket | ID US Relacionada | Título del Ticket | Módulo / Slice Afectado | Estimación (SP) | Prioridad MoSCoW | Ruta del Fichero |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TK-001** | N/A (Técnico) | Configuración del Core del Backend y Base de Datos | `shared` | 3 | Must Have | [shared/backend/TK-001.md](shared/backend/TK-001.md) |
| **TK-002** | [US-001](../11_user_stories/auth/US-001.md) | Implementación de Autenticación de Operarios por PIN | `auth` | 3 | Must Have | [auth/backend/TK-002.md](auth/backend/TK-002.md) |
| **TK-003** | [US-002](../11_user_stories/stock/US-002.md) | Implementación del Slice de Registro de Extracciones de Bodega | `stock` | 5 | Must Have | [stock/backend/TK-003.md](stock/backend/TK-003.md) |
| **TK-004** | [US-003](../11_user_stories/kitchen/US-003.md) | Implementación del Slice de Consulta de Remanentes Activos en Cocina (FEFO) | `kitchen` | 3 | Must Have | [kitchen/backend/TK-004.md](kitchen/backend/TK-004.md) |
| **TK-005** | [US-004](../11_user_stories/kitchen/US-004.md) | Implementación del Slice de Consumo Parcial de Remanentes | `kitchen` | 3 | Must Have | [kitchen/backend/TK-005.md](kitchen/backend/TK-005.md) |
| **TK-006** | [US-005](../11_user_stories/kitchen/US-005.md) | Implementación del Slice de Descarte y Mermas de Cocina | `kitchen` | 3 | Must Have | [kitchen/backend/TK-006.md](kitchen/backend/TK-006.md) |
| **TK-008** | [US-007](../11_user_stories/kitchen/US-007.md) | Implementación de Recetas y Descuento FEFO en Cascadas | `catalog`/`kitchen` | 5 | Should Have | [kitchen/backend/TK-008.md](kitchen/backend/TK-008.md) |
| **TK-009** | [US-008](../11_user_stories/kitchen/US-008.md) | Implementación de Cierre de Turno y Conciliación en Cocina | `kitchen` | 5 | Should Have | [kitchen/backend/TK-009.md](kitchen/backend/TK-009.md) |
| **TK-010** | [US-009](../11_user_stories/reports/US-009.md) | Implementación del Módulo de Reportes y Analítica de Mermas | `reports` | 3 | Should Have | [reports/backend/TK-010.md](reports/backend/TK-010.md) |
| **TK-048** | N/A (Técnico) | Cierre de Persistencia Parcial en Producción | `shared` | 5 | Must Have | [shared/backend/TK-048.md](shared/backend/TK-048.md) |
| **TK-049** | [US-010](../11_user_stories/auth/US-010.md) | Gestión Mínima de Personal (Alta y Bloqueo de Operarios) | `auth` | 3 | Must Have | [auth/backend/TK-049.md](auth/backend/TK-049.md) |
| **TK-050** | [US-011](../11_user_stories/stock/US-011.md) | Trazabilidad de Movimientos de Stock | `stock` | 3 | Should Have | [stock/backend/TK-050.md](stock/backend/TK-050.md) |
| **TK-051** | N/A (Técnico) | Bootstrap del Primer Administrador | `shared` | 5 | Must Have | [shared/backend/TK-051.md](shared/backend/TK-051.md) |

### 🖥️ Tickets de Frontend

| ID Ticket | ID US Relacionada | Título del Ticket | Módulo / Slice Afectado | Estimación (SP) | Prioridad MoSCoW | Ruta del Fichero |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TK-001-FE** | N/A (Técnico) | Configuración del Workspace Frontend y Design System Base | `shared` | 3 | Must Have | [shared/frontend/TK-001-FE.md](shared/frontend/TK-001-FE.md) |
| **TK-007** | [US-006](../11_user_stories/kitchen/US-006.md) | Implementación de Pantalla de Notificaciones y Alertas Dinámicas | `kitchen` | 3 | Should Have | [kitchen/frontend/TK-007.md](kitchen/frontend/TK-007.md) |
| **TK-007-B** | [US-001](../11_user_stories/auth/US-001.md) | Pantalla de Login por PIN | `auth` | 3 | Must Have | [auth/frontend/TK-007-B.md](auth/frontend/TK-007-B.md) |
| **TK-007-C** | [US-007](../11_user_stories/kitchen/US-007.md) | Interfaz de Consumo de Recetas | `kitchen` | 3 | Should Have | [kitchen/frontend/TK-007-C.md](kitchen/frontend/TK-007-C.md) |
| **TK-007-D** | [US-008](../11_user_stories/kitchen/US-008.md) | Formulario de Reconciliación de Turno | `kitchen` | 5 | Should Have | [kitchen/frontend/TK-007-D.md](kitchen/frontend/TK-007-D.md) |
| **TK-007-E** | [US-009](../11_user_stories/reports/US-009.md) | Dashboard de Reportes de Desperdicio y Eficiencia FEFO | `reports` | 3 | Should Have | [reports/frontend/TK-007-E.md](reports/frontend/TK-007-E.md) |
| **TK-007-F** | [US-002](../11_user_stories/stock/US-002.md) | Pantalla de Registro de Extracciones de Bodega | `stock` | 3 | Must Have | [stock/frontend/TK-007-F.md](stock/frontend/TK-007-F.md) |
| **TK-049-FE** | [US-010](../11_user_stories/auth/US-010.md) | Panel de Gestión de Personal | `auth` | 3 | Should Have | [auth/frontend/TK-049-FE.md](auth/frontend/TK-049-FE.md) |
| **TK-056** | [US-010](../11_user_stories/auth/US-010.md) | Listado de Operarios (Cierre de Deuda de TK-049) | `auth` | 2 | Should Have | [auth/backend/TK-056.md](auth/backend/TK-056.md) |
| **TK-050-FE** | [US-011](../11_user_stories/stock/US-011.md) | Panel de Auditoría de Movimientos de Stock | `stock` | 3 | Should Have | [stock/frontend/TK-050-FE.md](stock/frontend/TK-050-FE.md) |

---

## 🗂️ 3. Resumen de Fichas Técnicas de Tickets por Módulo

### 🛠️ Shared / Transversal
*   **[TK-001: Configuración del Core del Backend y Base de Datos](shared/backend/TK-001.md)**
*   **[TK-001-FE: Configuración del Workspace Frontend y Design System Base](shared/frontend/TK-001-FE.md)**

### 🔐 Autenticación (`auth/`)
*   **[TK-002: Autenticación por PIN](auth/backend/TK-002.md)** (Backend)
*   **[TK-007-B: Pantalla de Login por PIN](auth/frontend/TK-007-B.md)** (Frontend)

### 📦 Bodega y Stock (`stock/`)
*   **[TK-003: Extracciones de Bodega](stock/backend/TK-003.md)** (Backend)
*   **[TK-007-F: Pantalla de Extracciones](stock/frontend/TK-007-F.md)** (Frontend)

### 🍳 Cocina (`kitchen/`)
*   **[TK-004: Remanentes Activos FEFO](kitchen/backend/TK-004.md)** (Backend)
*   **[TK-005: Consumo Parcial](kitchen/backend/TK-005.md)** (Backend)
*   **[TK-006: Descarte y Mermas](kitchen/backend/TK-006.md)** (Backend)
*   **[TK-008: Recetas y Descuento FEFO](kitchen/backend/TK-008.md)** (Backend)
*   **[TK-009: Cierre y Conciliación](kitchen/backend/TK-009.md)** (Backend)
*   **[TK-007: Alertas y Notificaciones](kitchen/frontend/TK-007.md)** (Frontend)
*   **[TK-007-C: Consumo de Recetas](kitchen/frontend/TK-007-C.md)** (Frontend)
*   **[TK-007-D: Formulario Conciliación](kitchen/frontend/TK-007-D.md)** (Frontend)

### 📊 Reportes (`reports/`)
*   **[TK-010: Módulo de Reportes](reports/backend/TK-010.md)** (Backend)
*   **[TK-007-E: Dashboard de Mermas](reports/frontend/TK-007-E.md)** (Frontend)

### 🛠️ Shared / Transversal (Post-MVP, Cierre de Deuda)
*   **[TK-048: Cierre de Persistencia Parcial en Producción](shared/backend/TK-048.md)** (Backend)
*   **[TK-051: Bootstrap del Primer Administrador](shared/backend/TK-051.md)** (Backend)

### 🔐 Autenticación (`auth/`) — Post-MVP
*   **[TK-049: Gestión Mínima de Personal](auth/backend/TK-049.md)** (Backend)
*   **[TK-049-FE: Panel de Gestión de Personal](auth/frontend/TK-049-FE.md)** (Frontend)
*   **[TK-056: Listado de Operarios](auth/backend/TK-056.md)** (Backend) — cierra la deuda de `TK-049`.

### 📦 Bodega y Stock (`stock/`) — Post-MVP
*   **[TK-050: Trazabilidad de Movimientos de Stock](stock/backend/TK-050.md)** (Backend)
*   **[TK-050-FE: Panel de Auditoría de Movimientos](stock/frontend/TK-050-FE.md)** (Frontend)

`TK-056` cerró la única deuda residual que quedaba (listado de operarios) — `TK-049`/`TK-049-FE`/`TK-050`/`TK-050-FE` quedan sin pendientes conocidos.
