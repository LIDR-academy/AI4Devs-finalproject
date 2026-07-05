# 📖 Índice de Tickets de Trabajo (Sprint Backlog)

Este documento centraliza el backlog técnico y funcional del Producto Mínimo Viable (MVP) para **RestoStock**. Permite realizar un seguimiento claro de la trazabilidad desde las historias de usuario hasta el desarrollo físico en la base de código.

---

## 📊 1. Matriz de Trazabilidad del Backlog

| ID Ticket | ID US Relacionada | Título del Ticket | Módulo / Slice Afectado | Estimación (SP) | Prioridad MoSCoW |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[RESTO-TK-001](TK-001.md)** | N/A (Técnico) | Configuración del Core del Backend y Base de Datos | `shared` | 3 | Must Have |
| **[RESTO-TK-002](TK-002.md)** | [US-001](../user_stories/US-001.md) | Implementación de Autenticación de Operarios por PIN | `auth` | 3 | Must Have |
| **[RESTO-TK-003](TK-003.md)** | [US-002](../user_stories/US-002.md) | Implementación del Slice de Registro de Extracciones de Bodega | `stock` | 5 | Must Have |
| **[RESTO-TK-004](TK-004.md)** | [US-003](../user_stories/US-003.md) | Implementación del Slice de Consulta de Remanentes Activos en Cocina (FEFO) | `kitchen` | 3 | Must Have |
| **[RESTO-TK-005](TK-005.md)** | [US-004](../user_stories/US-004.md) | Implementación del Slice de Consumo Parcial de Remanentes | `kitchen` | 3 | Must Have |
| **[RESTO-TK-006](TK-006.md)** | [US-005](../user_stories/US-005.md) | Implementación del Slice de Descarte y Mermas de Cocina | `kitchen` | 3 | Must Have |
| **[RESTO-TK-007](TK-007.md)** | [US-006](../user_stories/US-006.md) | Implementación de Pantalla de Notificaciones y Alertas Dinámicas en Frontend | `kitchen` | 3 | Should Have |
| **[RESTO-TK-008](TK-008.md)** | [US-007](../user_stories/US-007.md) | Implementación de Recetas y Descuento FEFO en Cascadas | `catalog`/`kitchen` | 5 | Should Have |
| **[RESTO-TK-009](TK-009.md)** | [US-008](../user_stories/US-008.md) | Implementación de Cierre de Turno y Conciliación en Cocina | `kitchen` | 5 | Should Have |

*SP = Story Points (Puntos de Historia basados en escala Fibonacci).*


---

## 🗂️ 2. Resumen de Fichas Técnicas de Tickets

*   **[RESTO-TK-001: Configuración del Core del Backend y Base de Datos](TK-001.md)**: Inicialización del monorepo, configuración de Prisma ORM, conexión segura cifrada a base de datos y middlewares globales de validación Zod y manejo de excepciones.
*   **[RESTO-TK-002: Implementación de Autenticación de Operarios por PIN](TK-002.md)**: Flujo completo de login rápido a la terminal táctil a través de la API `POST /api/auth/pin` haciendo uso de hashing `bcrypt`.
*   **[RESTO-TK-003: Implementación del Slice de Registro de Extracciones de Bodega](TK-003.md)**: Lógica transaccional de débito de stock cerrado de bodega y registro de un remanente activo con expiración acelerada.
*   **[RESTO-TK-004: Implementación del Slice de Consulta de Remanentes Activos en Cocina (FEFO)](TK-004.md)**: Endpoint `GET /api/kitchen/remanentes` que lista insumos abiertos ordenados por proximidad de vencimiento haciendo uso de índices de base de datos.
*   **[RESTO-TK-005: Implementación del Slice de Consumo Parcial de Remanentes](TK-005.md)**: Registro de consumos aplicados a preparaciones que debita existencias y actualiza el estado de activo a agotado (`CONSUMED`) de forma atómica.
*   **[RESTO-TK-006: Implementación del Slice de Descarte y Mermas de Cocina](TK-006.md)**: Flujo de descarte total por expiración u otros motivos, actualizando las cantidades a cero y guardando logs de auditoría.
*   **[RESTO-TK-007: Implementación de Pantalla de Notificaciones y Alertas Dinámicas en Frontend](TK-007.md)**: Pantalla táctil en la terminal de cocina que calcula y muestra notificaciones semafóricas (FEFO, stock bajo en línea y avisos de estado offline de red).
*   **[RESTO-TK-008: Implementación de Recetas y Descuento FEFO en Cascadas](TK-008.md)**: Lógica transaccional para definir recetas y procesar el consumo rápido de stock en cascada FEFO sobre remanentes activos.
*   **[RESTO-TK-009: Implementación de Cierre de Turno y Conciliación en Cocina](TK-009.md)**: Flujo de fin de turno con auto-descarte de insumos caducados (>48h TRR) y registro de auditoría de diferencias físicas.

