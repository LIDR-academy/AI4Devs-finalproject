# 📖 Índice de Historias de Usuario (MVP RestoStock)

Este documento contiene las especificaciones detalladas de las historias de usuario que conforman el alcance funcional del Producto Mínimo Viable (MVP) para el sistema **RestoStock**, organizadas en subcarpetas según su **Epic/Módulo**. Cada historia está estructurada bajo el estándar **INVEST** y cuenta con criterios de aceptación explícitos en formato **BDD Gherkin (Given-When-Then)**.

---

## 🗂️ Listado de Historias de Usuario por Módulo

### 🔐 Autenticación y Seguridad (`/security/`)
*   **[US-001: Autenticación por PIN del Personal de Cocina](auth/US-001.md)**
    *   *Descripción:* Permite el acceso rápido e individualizado de los cocineros y operarios mediante teclado táctil y PIN de 4 dígitos para garantizar la trazabilidad operacional.
*   **[US-010: Gestión Mínima de Personal (Alta y Bloqueo de Operarios)](auth/US-010.md)**
    *   *Descripción:* Permite a un Administrador dar de alta operarios y bloquear/reactivar cuentas existentes vía API, sin depender de un redeploy de código. ✅ Backend (`TK-049`) y Frontend (`TK-049-FE`) implementados.
*   **[US-015: Gestión de Permisos y Roles Dinámicos (Dynamic RBAC)](security/US-015.md)**
    *   *Descripción:* Permite al Administrador crear roles dinámicos, configurar su matriz de permisos y autoredirigir a la pantalla de cocina o bodega al iniciar sesión.
*   **[US-018: Recuperación de Acceso y Reseteo de PIN del Administrador por Email](auth/US-018.md)**
    *   *Descripción:* Permite al Administrador restablecer su PIN mediante un correo verificado y token temporal de 15 minutos en caso de olvido o bloqueo de cuenta.


### 📦 Bodega y Stock (`/stock/`)
*   **[US-002: Registro de Extracciones de Bodega](stock/US-002.md)**
    *   *Descripción:* Permite registrar la salida física de insumos enteros desde el almacén central y su correspondiente ingreso a la cocina con el cálculo de su vida útil acelerada.
*   **[US-011: Trazabilidad y Auditoría de Movimientos de Stock](stock/US-011.md)**
    *   *Descripción:* Permite a un Administrador consultar el historial completo de movimientos de stock filtrado por insumo y rango de fechas. ✅ Backend (`TK-050`) y Frontend (`TK-050-FE`) implementados.
*   **[US-013: Reabastecimiento de Bodega](stock/US-013.md)**
    *   *Descripción:* Permite a un Administrador sumar stock a un insumo existente cuando llega una entrega nueva del proveedor. ✅ Backend (`TK-060`) y Frontend (`TK-060-FE`) implementados.
*   **[US-014: Trazabilidad Completa en Extracciones](stock/US-014.md)**
    *   *Descripción:* Permite especificar el propósito (`KITCHEN_STOCK`, `RECIPE`, `DIRECT_DISCARD`), motivo y responsable en las extracciones de bodega. ✅ Backend (`TK-072`) y Frontend (`TK-072-FE`) implementados.
*   **[US-016: Definición de Sectores de Almacenamiento](stock/US-016.md)**
    *   *Descripción:* Permite configurar y administrar los sectores físicos reales del restaurante (cámaras frías, bodegas secas, mesas de preparación).
*   **[US-021: Advertencia de Apertura Duplicada al Extraer Insumo](stock/US-021.md)**
    *   *Descripción:* Advierte de forma no bloqueante al operario si ya existe un remanente activo del mismo insumo en cualquier ubicación de cocina, para reducir aperturas duplicadas (KPI #3 del PRD). ✅ Backend (`TK-080`) y Frontend (`TK-080-FE`) implementados.

### ⚙️ Configuración (`/settings/`)
*   **[US-017: Configuración General del Restaurante y Parámetros FEFO](settings/US-017.md)**
    *   *Descripción:* Permite configurar el nombre del restaurante, moneda, umbrales de alerta crítica y parámetros operativos.

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
*   **[US-019: Costeo de Insumos y Valorización Monetaria de Mermas](reports/US-019.md)**
    *   *Descripción:* Registra el costo unitario de cada insumo y valoriza en `$` el reporte de mermas, cerrando el gap del KPI #1 del PRD (hoy solo medible en cantidades físicas). ✅ Backend (`TK-078`) y Frontend (`TK-078-FE`) implementados.
*   **[US-020: Indicador TRR Real en el Dashboard de Reportes](reports/US-020.md)**
    *   *Descripción:* Calcula y muestra el tiempo real promedio de rotación de remanentes, el único indicador que valida en la práctica el KPI #2 del PRD (TRR < 72h). ✅ Backend (`TK-079`) y Frontend (`TK-079-FE`) implementados.
