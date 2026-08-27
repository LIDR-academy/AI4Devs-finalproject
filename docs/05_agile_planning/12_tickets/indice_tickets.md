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
| **TK-056** | `auth` | **Medio** | **Media** | 2 SP | Depende de `TK-049`. Listado de operarios (cierre de deuda). | 🟢 P2 - Media |
| **TK-057** | `catalog` | **Alto** | **Media** | 5 SP | Depende de `TK-003`, `TK-008`. Alta de insumos y recetas en el catálogo maestro. | 🟡 P1 - Alta |
| **TK-058** | `shared` | **Medio** | **Baja** | 3 SP | Depende de `TK-057`. Refactor ISP puro, cero cambio de comportamiento. | 🟢 P2 - Media |
| **TK-059** | `shared` | **Alto** | **Alta** | 2 SP | Depende de `TK-057`, `TK-058`. Fix de conectividad frontend↔backend en Docker (nginx sin proxy `/api`). | 🟡 P1 - Alta |
| **TK-060** | `stock` | **Muy Alto** | **Alta** | 3 SP | Depende de `TK-057`, `TK-058`. Sin reabastecimiento, un insumo agotado queda inutilizable de forma permanente. | 🔴 P0 - Bloqueante |
| **TK-061** | `shared` | **Alto** | **Alta** | 2 SP | Depende de `TK-057`. Conecta el selector de recetas de cocina al catálogo real (deuda de `US-012`). | 🟡 P1 - Alta |
| **TK-062** | `shared` | **Medio** | **Baja** | 5 SP | Sin dependencias. Migración de Prisma 5→7 (driver adapters) — decisión de negocio del humano, no un hallazgo de auditoría. | 🟢 P2 - Media |
| **TK-063** | `shared` | **Medio** | **Media** | 3 SP | Sin dependencias. Script `ci_local.sh` — reproduce los 3 jobs de `ci.yml` localmente, motivado por 4 rondas de fallos de CI en el PR de Entrega 2. | 🟢 P2 - Media |
| **TK-064** | `shared` | **Alto** | **Media** | 5 SP | Depende de `TK-063`. Guards 30/31/32 (SecDevOps) en `.agents/` — cierra el gap de gobernanza que permitió los 5 fallos reales de CI. | 🟡 P1 - Alta |
| **TK-067** | `shared` | **Medio** | **Media** | 3 SP | Sin dependencias funcionales. Migración visual de las pantallas táctiles de cocina al Design System v2.0.0 ("Señal Industrial"), aprobado por el humano tras comparar 3 direcciones. | 🟢 P2 - Media |
| **TK-068** | `shared` | **Bajo** | **Baja** | 3 SP | Depende de `TK-067`. Extiende la paleta v2.0.0 al backoffice (Catálogo, Reportes, panel de acciones), a pedido explícito del humano; cierra además literales hex hardcodeados preexistentes (Guard 29). | 🟢 P2 - Media |
| **TK-069** | `recipes` | **Medio** | **Media** | 5 SP | Depende de `TK-057`. Extrae el módulo `recipes` de `catalog` (recetas ya eran 100% de ese módulo) y mueve `/api/v1/catalog/recipes` → `/api/v1/recipes`, a pedido explícito del humano tras un análisis de organización de módulos. | 🟡 P1 - Alta |
| **TK-069-FE** | `recipes` | **Medio** | **Media** | 3 SP | Depende de `TK-069`. Contraparte frontend: mueve `CreateRecipeForm`/`catalog.service.ts` a `features/recipes/`; cierra duplicación de endpoints de insumos, código muerto y un bug real de resincronización de `insumoId` encontrado en la verificación en vivo. | 🟡 P1 - Alta |
| **TK-070-FE** | `recipes` | **Medio** | **Media** | 3 SP | Depende de `TK-069-FE`. Restructura "Alta de Receta" a "Recetario" (lista + buscador + alta en modal), simétrico a Inventario de Bodega, a pedido explícito del humano tras comparar capturas de ambas pestañas. | 🟡 P1 - Alta |
| **TK-071** | `shared` | **Bajo** | **Baja** | 2 SP | Depende de `TK-070-FE`. Reemplaza emoji suel| **TK-072** | `stock` | **Muy Alto** | **Alta** | 5 SP | Depende de `TK-003`, `TK-050`. Trazabilidad completa en extracciones de bodega (responsable, motivo, propósito y descarte directo). | 🔴 P0 - Crítica |
| **TK-072-FE** | `stock` | **Muy Alto** | **Alta** | 3 SP | Depende de `TK-072`, `TK-007-F`. Interfaz táctil para extracciones con motivo y responsable. | 🔴 P0 - Crítica |
| **TK-073** | `security` | **Alto** | **Alta** | 5 SP | Depende de `TK-002`. Dynamic RBAC: Modelos `Role`, `Permission`, `RolePermission`, endpoints y middleware `authorizePermissions`. | 🟡 P1 - Alta |
| **TK-073-FE** | `security` | **Alto** | **Alta** | 3 SP | Depende de `TK-073`. Interfaz táctil de administración de roles, matriz de permisos y autoredirección por perfiles. | 🟡 P1 - Alta |
| **TK-074** | `stock` | **Medio** | **Media** | 3 SP | Depende de `TK-003`. CRUD de sectores físicos de almacenamiento (`StorageLocation`). | 🟢 P2 - Media |
| **TK-074-FE** | `stock` | **Medio** | **Media** | 3 SP | Depende de `TK-074`. Modal de administración de sectores y desplegables dinámicos en extracciones. | 🟢 P2 - Media |
| **TK-075** | `settings` | **Medio** | **Media** | 3 SP | Depende de `TK-001`. API de Configuración General del Restaurante (`SystemSettings`). | 🟢 P2 - Media |
| **TK-075-FE** | `settings` | **Medio** | **Media** | 3 SP | Depende de `TK-075`. Modal de Configuración General y branding dinámico en header. | 🟢 P2 - Media |

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
| **TK-056** | [US-010](../11_user_stories/auth/US-010.md) | Listado de Operarios (Cierre de Deuda de TK-049) | `auth` | 2 | Should Have | [auth/backend/TK-056.md](auth/backend/TK-056.md) |
| **TK-057** | [US-012](../11_user_stories/catalog/US-012.md) | Gestión de Catálogo Maestro (Alta de Insumos y Recetas) | `stock`/`catalog` | 5 | Should Have | [catalog/backend/TK-057.md](catalog/backend/TK-057.md) |
| **TK-058** | N/A (Técnico) | Modularización del Repositorio de Stock (ISP) | `shared` | 3 | Should Have | [shared/backend/TK-058.md](shared/backend/TK-058.md) |
| **TK-060** | [US-013](../11_user_stories/stock/US-013.md) | Reabastecimiento de Bodega (Backend) | `stock` | 3 | Must Have | [stock/backend/TK-060.md](stock/backend/TK-060.md) |
| **TK-069** | [US-012](../11_user_stories/catalog/US-012.md) | Extracción del Módulo `recipes` (independiente de `catalog`) | `recipes` | 5 | Should Have | [recipes/backend/TK-069.md](recipes/backend/TK-069.md) |
| **TK-072** | [US-014](../11_user_stories/stock/US-014.md) | Trazabilidad Completa en Extracciones de Bodega (Backend) | `stock` | 5 | Must Have | [stock/backend/TK-072.md](stock/backend/TK-072.md) |
| **TK-073** | [US-015](../11_user_stories/security/US-015.md) | Backend Dynamic RBAC Models, Seed & Middleware | `security` | 5 | Should Have | [security/backend/TK-073.md](security/backend/TK-073.md) |
| **TK-074** | [US-016](../11_user_stories/stock/US-016.md) | Backend Storage Locations API | `stock` | 3 | Should Have | [stock/backend/TK-074.md](stock/backend/TK-074.md) |
| **TK-075** | [US-017](../11_user_stories/settings/US-017.md) | Backend System Settings API | `settings` | 3 | Should Have | [settings/backend/TK-075.md](settings/backend/TK-075.md) |

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
| **TK-050-FE** | [US-011](../11_user_stories/stock/US-011.md) | Panel de Auditoría de Movimientos de Stock | `stock` | 3 | Should Have | [stock/frontend/TK-050-FE.md](stock/frontend/TK-050-FE.md) |
| **TK-057-FE** | [US-012](../11_user_stories/catalog/US-012.md) | Panel de Gestión de Catálogo | `catalog` | 3 | Should Have | [catalog/frontend/TK-057-FE.md](catalog/frontend/TK-057-FE.md) |
| **TK-060-FE** | [US-013](../11_user_stories/stock/US-013.md) | Reabastecimiento de Bodega (Frontend) | `stock` | 2 | Must Have | [stock/frontend/TK-060-FE.md](stock/frontend/TK-060-FE.md) |
| **TK-069-FE** | [US-012](../11_user_stories/catalog/US-012.md) | Extracción del Feature `recipes` (independiente de `catalog`) | `recipes` | 3 | Should Have | [recipes/frontend/TK-069-FE.md](recipes/frontend/TK-069-FE.md) |
| **TK-070-FE** | [US-012](../11_user_stories/catalog/US-012.md) | Recetario: lista, búsqueda y alta en modal | `recipes` | 3 | Should Have | [recipes/frontend/TK-070-FE.md](recipes/frontend/TK-070-FE.md) |
| **TK-071** | N/A (Técnico) | Reemplaza emoji sueltos por íconos lucide-react en Catálogo/Recetario | `shared` | 2 | Should Have | [shared/frontend/TK-071.md](shared/frontend/TK-071.md) |
| **TK-067** | N/A (Técnico) | Migración Visual al Design System v2.0.0 ("Señal Industrial") | `shared` | 3 | Should Have | [shared/frontend/TK-067.md](shared/frontend/TK-067.md) |
| **TK-068** | N/A (Técnico) | Migración Visual del Backoffice al Design System v2.0.0 | `shared` | 3 | Should Have | [shared/frontend/TK-068.md](shared/frontend/TK-068.md) |
| **TK-072-FE** | [US-014](../11_user_stories/stock/US-014.md) | Interfaz Táctil para Extracciones con Responsable y Motivo | `stock` | 3 | Must Have | [stock/frontend/TK-072-FE.md](stock/frontend/TK-072-FE.md) |
| **TK-073-FE** | [US-015](../11_user_stories/security/US-015.md) | Frontend Dynamic RBAC UI & Autoredirection | `security` | 3 | Should Have | [security/frontend/TK-073-FE.md](security/frontend/TK-073-FE.md) |
| **TK-074-FE** | [US-016](../11_user_stories/stock/US-016.md) | Frontend Storage Locations UI | `stock` | 3 | Should Have | [stock/frontend/TK-074-FE.md](stock/frontend/TK-074-FE.md) |
| **TK-075-FE** | [US-017](../11_user_stories/settings/US-017.md) | Frontend System Settings & Branding UI | `settings` | 3 | Should Have | [settings/frontend/TK-075-FE.md](settings/frontend/TK-075-FE.md) |
---

## 🗂️ 3. Resumen de Fichas Técnicas de Tickets por Módulo

### 🛠️ Shared / Transversal
*   **[TK-001: Configuración del Core del Backend y Base de Datos](shared/backend/TK-001.md)**
*   **[TK-001-FE: Configuración del Workspace Frontend y Design System Base](shared/frontend/TK-001-FE.md)**

### 🔐 Autenticación y Seguridad (`security/` / `auth/`)
*   **[TK-002: Autenticación por PIN](auth/backend/TK-002.md)** (Backend)
*   **[TK-007-B: Pantalla de Login por PIN](auth/frontend/TK-007-B.md)** (Frontend)
*   **[TK-073: Backend Dynamic RBAC](security/backend/TK-073.md)** (Backend)
*   **[TK-073-FE: Frontend Dynamic RBAC UI](security/frontend/TK-073-FE.md)** (Frontend)

### 📦 Bodega y Stock (`stock/`)
*   **[TK-003: Extracciones de Bodega](stock/backend/TK-003.md)** (Backend)
*   **[TK-007-F: Pantalla de Extracciones](stock/frontend/TK-007-F.md)** (Frontend)
*   **[TK-074: Storage Locations API](stock/backend/TK-074.md)** (Backend)
*   **[TK-074-FE: Storage Locations UI](stock/frontend/TK-074-FE.md)** (Frontend)

### ⚙️ Configuración (`settings/`)
*   **[TK-075: System Settings API](settings/backend/TK-075.md)** (Backend)
*   **[TK-075-FE: System Settings UI](settings/frontend/TK-075-FE.md)** (Frontend)

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
*   **[TK-007-E: Dashboard de Mermas](reports/frontend/TK-007-E.md)** (Frontend)uración del Workspace Frontend y Design System Base](shared/frontend/TK-001-FE.md)**

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
*   **[TK-058: Modularización del Repositorio de Stock (ISP)](shared/backend/TK-058.md)** (Backend) — split de `IStockRepository` en `IInsumoRepository`/`IRemanenteRepository`, motivado por `TK-057`.
*   **[TK-059: Fix de Conectividad Frontend↔Backend en Despliegue Dockerizado](shared/backend/TK-059.md)** (Backend) — nginx del frontend no reenviaba `/api` al backend; detectado por auditoría de código muerto (`knip`).
*   **[TK-061: Conectar el Selector de Recetas de Cocina al Catálogo Real](shared/frontend/TK-061.md)** (Frontend) — `RecipeSelectorModal.tsx` usaba una lista hardcodeada en vez de `GET /api/v1/catalog/recipes`; cierra la deuda ya documentada en `US-012`.
*   **[TK-062: Migración de Prisma 5 a Prisma 7 (Driver Adapters)](shared/backend/TK-062.md)** (Backend) — upgrade de dependencia mayor a pedido explícito del humano; `datasource.url` en `schema.prisma` deja de estar soportado, se mueve a `prisma.config.ts` + adapter.
*   **[TK-063: Script Orquestador `ci_local.sh`](shared/backend/TK-063.md)** (Backend) — reproduce los 3 jobs de `ci.yml` localmente antes del push; auto-descarga `tofu`/`oasdiff`/`gitleaks` si faltan.
*   **[TK-064: Guards 30/31/32 (SecDevOps)](shared/backend/TK-064.md)** (Backend) — cierra el gap de gobernanza SecDevOps en `.agents/` (verificación de pins de terceros, codegen antes de build, re-verificación de seguridad post-upgrade mayor).
*   **[TK-067: Migración Visual al Design System v2.0.0](shared/frontend/TK-067.md)** (Frontend) — propaga la paleta "Señal Industrial" (`docs/02_architecture_design/05_ui_ux_design_system.md` v2.0.0) a `index.css` y a los componentes de cocina; cero cambio de comportamiento, backoffice de Catálogo fuera de alcance.
*   **[TK-068: Migración Visual del Backoffice al Design System v2.0.0](shared/frontend/TK-068.md)** (Frontend) — extiende `TK-067` al backoffice (Catálogo, Reportes, panel de acciones de `App.tsx`) a pedido explícito del humano; cierra de paso literales hex hardcodeados preexistentes de `TK-057-FE`/`TK-060-FE` (Guard 29).
*   **[TK-071: Reemplaza emoji sueltos por íconos lucide-react](shared/frontend/TK-071.md)** (Frontend) — corrige la iconografía de Catálogo/Recetario (`Package`, `Search`, `Truck`, `ChefHat`) a pedido explícito del humano; misma deuda pendiente en pantallas de cocina, fuera de alcance.

### 🔐 Autenticación (`auth/`) — Post-MVP
*   **[TK-049: Gestión Mínima de Personal](auth/backend/TK-049.md)** (Backend)
*   **[TK-049-FE: Panel de Gestión de Personal](auth/frontend/TK-049-FE.md)** (Frontend)
*   **[TK-056: Listado de Operarios](auth/backend/TK-056.md)** (Backend) — cierra la deuda de `TK-049`.

### 📦 Bodega y Stock (`stock/`) — Post-MVP
*   **[TK-050: Trazabilidad de Movimientos de Stock](stock/backend/TK-050.md)** (Backend)
*   **[TK-050-FE: Panel de Auditoría de Movimientos](stock/frontend/TK-050-FE.md)** (Frontend)
*   **[TK-060: Reabastecimiento de Bodega](stock/backend/TK-060.md)** (Backend) — sin esto, un insumo agotado en bodega quedaba inutilizable para siempre.
*   **[TK-060-FE: Panel de Reabastecimiento](stock/frontend/TK-060-FE.md)** (Frontend)

### 📖 Catálogo (`catalog/`) — Post-MVP
*   **[TK-057: Gestión de Catálogo Maestro (Alta de Insumos y Recetas)](catalog/backend/TK-057.md)** (Backend) — cierra además la deuda de `TK-008` (`POST /api/catalog/recipes` nunca implementado). **Superseded parcialmente por `TK-069`** (las recetas se movieron a su propio módulo).
*   **[TK-057-FE: Panel de Gestión de Catálogo](catalog/frontend/TK-057-FE.md)** (Frontend) — **superseded parcialmente por `TK-069-FE`**.

### 🍝 Recetas (`recipes/`) — Post-MVP
*   **[TK-069: Extracción del Módulo `recipes`](recipes/backend/TK-069.md)** (Backend) — mueve `Recipe`/`RecipeIngredient` y el endpoint de `catalog` a un módulo propio (`/api/v1/catalog/recipes` → `/api/v1/recipes`), a pedido explícito del humano tras un análisis de organización de módulos.
*   **[TK-069-FE: Extracción del Feature `recipes`](recipes/frontend/TK-069-FE.md)** (Frontend) — mueve `CreateRecipeForm`/`catalog.service.ts` a `features/recipes/`; cierra duplicación de endpoints de insumos, código muerto (`CatalogService.createInsumo`) y un bug real de resincronización de `insumoId` encontrado en la verificación en vivo.
*   **[TK-070-FE: Recetario (lista + búsqueda + alta en modal)](recipes/frontend/TK-070-FE.md)** (Frontend) — restructura la pestaña de recetas para que sea simétrica a Inventario de Bodega; `CreateRecipeForm.tsx` no se modifica, solo se envuelve en un modal nuevo.

`TK-056` cerró la deuda residual de listado de operarios; `TK-057`/`TK-057-FE` cierran la deuda de alta de catálogo (insumos y recetas) y la de `TK-008` — `TK-049`/`TK-049-FE`/`TK-050`/`TK-050-FE`/`TK-057`/`TK-057-FE` quedan sin pendientes conocidos. `TK-059` cierra el fix de conectividad Docker frontend↔backend; `TK-060`/`TK-060-FE` cierran el reabastecimiento de bodega (`US-013`); `TK-061` cierra la deuda de `US-012` sobre `RecipeSelectorModal.tsx`; `TK-069`/`TK-069-FE` extraen las recetas de `catalog` a un módulo `recipes` independiente; `TK-070-FE` le da al Recetario la misma estructura que Inventario de Bodega.
