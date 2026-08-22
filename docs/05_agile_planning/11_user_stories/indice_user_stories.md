# 📖 Índice de Historias de Usuario (MVP RestoStock)

Este documento contiene las especificaciones detalladas de las historias de usuario que conforman el alcance funcional del Producto Mínimo Viable (MVP) para el sistema **RestoStock**, organizadas en subcarpetas según su **Epic/Módulo**. Cada historia está estructurada bajo el estándar **INVEST** y cuenta con criterios de aceptación explícitos en formato **BDD Gherkin (Given-When-Then)**.

---

## 🗂️ Listado de Historias de Usuario por Módulo

### 🔐 Autenticación (`/auth/`)
*   **[US-001: Autenticación por PIN del Personal de Cocina](auth/US-001.md)**
    *   *Descripción:* Permite el acceso rápido e individualizado de los cocineros y operarios mediante teclado táctil y PIN de 4 dígitos para garantizar la trazabilidad operacional.
*   **[US-010: Gestión Mínima de Personal (Alta y Bloqueo de Operarios)](auth/US-010.md)**
    *   *Descripción:* Permite a un Administrador dar de alta operarios y bloquear/reactivar cuentas existentes vía API, sin depender de un redeploy de código. ✅ Backend (`TK-049`) y Frontend (`TK-049-FE`) implementados.

### 📦 Bodega y Stock (`/stock/`)
*   **[US-002: Registro de Extracciones de Bodega](stock/US-002.md)**
    *   *Descripción:* Permite registrar la salida física de insumos enteros desde el almacén central y su correspondiente ingreso a la cocina con el cálculo de su vida útil acelerada.
*   **[US-011: Trazabilidad y Auditoría de Movimientos de Stock](stock/US-011.md)**
    *   *Descripción:* Permite a un Administrador consultar el historial completo de movimientos de stock filtrado por insumo y rango de fechas. ✅ Backend (`TK-050`) y Frontend (`TK-050-FE`) implementados.

### 📖 Catálogo (`/catalog/`)
*   **[US-012: Gestión de Catálogo Maestro (Alta de Insumos y Recetas)](catalog/US-012.md)**
    *   *Descripción:* Permite a un Administrador dar de alta insumos y recetas en el catálogo maestro vía API, sin depender del script de seed. ✅ Backend (`TK-057`) y Frontend (`TK-057-FE`) implementados.

### 🍳 Cocina (`/kitchen/`)
*   **[US-003: Consulta Táctil de Remanentes Activos en Orden FEFO](kitchen/US-003.md)**
    *   *Descripción:* Provee una pantalla en cocina para listar todos los ingredientes abiertos ordenados cronológicamente por su fecha de vencimiento acelerado, previniendo el desperdicio.
*   **[US-004: Registro de Consumo Parcial de Remanentes](kitchen/US-004.md)**
    *   *Descripción:* Permite registrar consumos parciales aplicados a preparaciones durante el turno para mantener el inventario de la línea al día.
*   **[US-005: Registro de Descartes y Mermas](kitchen/US-005.md)**
    *   *Descripción:* Permite el egreso total del sistema de insumos abiertos inservibles (vencidos, contaminados o dañados) documentando detalladamente la causa de la pérdida.
*   **[US-006: Consulta de Alertas y Notificaciones Críticas en Cocina](kitchen/US-006.md)**
    *   *Descripción:* Provee un panel táctil interactivo en cocina con alertas semafóricas para vencimientos FEFO inminentes, rotura de stock en línea y pérdidas de conexión (offline).
*   **[US-007: Consumo Rápido de Stock por Recetas](kitchen/US-007.md)**
    *   *Descripción:* Permite el registro de consumo en lote de múltiples ingredientes a partir de una receta maestra, aplicando descuento en cascada FEFO sobre los remanentes.
*   **[US-008: Cierre de Turno y Conciliación de Cocina](kitchen/US-008.md)**
    *   *Descripción:* Provee un flujo guiado de fin de jornada para reportar conteo físico real, auto-descartar insumos vencidos de forma masiva y registrar variaciones de stock.

### 📊 Reportes (`/reports/`)
*   **[US-009: Dashboard y Reporte de Mermas Visibles](reports/US-009.md)**
    *   *Descripción:* Permite visualizar de forma agrupada los desperdicios físicos y mermas por ingrediente y motivo en un periodo de tiempo.
