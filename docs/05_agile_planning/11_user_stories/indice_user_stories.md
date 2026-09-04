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
    *   *Descripción:* Permite configurar y administrar los sectores físicos reales del restaurante (cámaras frías, bodegas secas, mesas de preparación). 🚧 CRUD y pantalla de gestión existentes; pendiente cablear desplegables dinámicos y `requireRole('ADMIN')` (`TK-074` / `TK-074-FE`).
*   **[US-025: Depósito de Insumos en Sub-Sector de Bodega y Stock Multi-Sector](stock/US-025.md)**
    *   *Descripción:* Al dar de alta o reabastecer un insumo se indica el sub-sector físico de bodega donde queda depositado; el stock se rastrea por par `(insumo, sub-sector)` y la extracción exige elegir el sector de origen validando su saldo. 📋 Spec aprobada — pendiente `TK-096` / `TK-096-FE`.
*   **[US-021: Advertencia de Apertura Duplicada al Extraer Insumo](stock/US-021.md)**
    *   *Descripción:* Advierte de forma no bloqueante al operario si ya existe un remanente activo del mismo insumo en cualquier ubicación de cocina, para reducir aperturas duplicadas (KPI #3 del PRD). ✅ Backend (`TK-080`) y Frontend (`TK-080-FE`) implementados.
*   **[US-026: Áreas de Cocina como Ubicaciones de Catálogo y Destino Dinámico en Extracción](stock/US-026.md)**
    *   *Descripción:* Las áreas de cocina (heladera, mesa de prep, línea) pasan a ser filas de `StorageLocation` (`type = KITCHEN`); el destino de cocina en la extracción se elige del catálogo y `Remanente.location` pasa a FK. Prerrequisito de ADR-003, cierra deuda de `TK-074-FE`. 📝 Draft.

### ⚙️ Configuración (`/settings/`)
*   **[US-017: Configuración General del Restaurante y Parámetros FEFO](settings/US-017.md)** ✅
    *   *Descripción:* Permite configurar el nombre del restaurante, moneda, umbrales de alerta crítica y parámetros operativos. `TK-110` cerró el hueco donde el umbral de alerta crítica no tenía efecto real.

### 📖 Catálogo (`/catalog/`)
*   **[US-012: Gestión de Catálogo Maestro (Alta de Insumos y Recetas)](catalog/US-012.md)**
    *   *Descripción:* Permite a un Administrador dar de alta insumos y recetas en el catálogo maestro vía API, sin depender del script de seed. ✅ Backend (`TK-057`) y Frontend (`TK-057-FE`) implementados.

### 🍳 Cocina (`/kitchen/`)
*   **[US-003: Consulta Táctil de Remanentes Activos en Orden FEFO](kitchen/US-003.md)**
    *   *Descripción:* Provee una pantalla en cocina para listar todos los ingredientes abiertos ordenados cronológicamente por su fecha de vencimiento acelerado, previniendo el desperdicio.
*   **[US-004: Registro de Consumo Parcial de Remanentes](kitchen/US-004.md)** (v1.1.0)
    *   *Descripción:* Permite registrar consumos parciales aplicados a preparaciones durante el turno para mantener el inventario de la línea al día. Desde `ADR-004`, exige un motivo estructurado (catálogo `US-030`) + texto libre opcional.
*   **[US-005: Registro de Descartes y Mermas](kitchen/US-005.md)**
    *   *Descripción:* Permite el egreso total del sistema de insumos abiertos inservibles (vencidos, contaminados o dañados) documentando detalladamente la causa de la pérdida.
*   **[US-006: Consulta de Alertas y Notificaciones Críticas en Cocina](kitchen/US-006.md)**
    *   *Descripción:* Provee un panel táctil interactivo en cocina con alertas semafóricas para vencimientos FEFO inminentes, rotura de stock en línea y pérdidas de conexión (offline).
*   **[US-007: Consumo Rápido de Stock por Recetas](kitchen/US-007.md)** (v1.1.0) ✅
    *   *Descripción:* Permite el registro de consumo en lote de múltiples ingredientes a partir de una receta maestra, aplicando descuento en cascada FEFO sobre los remanentes. Desde v1.1.0: vista previa de disponibilidad por ingrediente antes de confirmar (`TK-111`/`TK-111-FE`).
*   **[US-008: Cierre de Turno y Conciliación de Cocina](kitchen/US-008.md)** (v1.1.0)
    *   *Descripción:* Provee un flujo guiado de fin de jornada para reportar conteo físico real, auto-descartar insumos vencidos de forma masiva y registrar variaciones de stock. Desde `ADR-004`, la varianza negativa exige motivo por línea; se corrige el bug de superávit no sincronizado.
*   **[US-027: Apertura Automática de Preparación de Receta al Extraer](kitchen/US-027.md)** ✅
    *   *Descripción:* Extraer de bodega con `purpose = RECIPE` (con `recipeId` ahora obligatorio) abre una `RecipePreparation` que agrupa los remanentes de esa tanda. 📝 Draft (ADR-003).
*   **[US-028: Cierre de Preparación de Receta — Sobrante con Ubicación y Merma con Motivo](kitchen/US-028.md)** ✅
    *   *Descripción:* Al cerrar una preparación, el operario declara porciones reales y, por ingrediente, cuánto sobró y **en qué área lo guardó** y cuánto se descartó y por qué; el consumo se calcula por cuadre. El sobrante intacto puede volver a bodega. 📝 Draft (ADR-003).
*   **[US-030: Catálogo de Motivos de Consumo (Administrable)](kitchen/US-030.md)** ✅
    *   *Descripción:* El Administrador mantiene un catálogo de motivos (crear, editar, activar/desactivar) que el equipo de cocina elige al consumir un remanente o al declarar una varianza negativa de conciliación de turno. Backend (`TK-107`) + panel de administración en `/ajustes/motivos` (`TK-107-FE`, ADR-004).

### 📊 Reportes (`/reports/`)
*   **[US-009: Dashboard y Reporte de Mermas Visibles](reports/US-009.md)**
    *   *Descripción:* Permite visualizar de forma agrupada los desperdicios físicos y mermas por ingrediente y motivo en un periodo de tiempo.
*   **[US-019: Costeo de Insumos y Valorización Monetaria de Mermas](reports/US-019.md)**
    *   *Descripción:* Registra el costo unitario de cada insumo y valoriza en `$` el reporte de mermas, cerrando el gap del KPI #1 del PRD (hoy solo medible en cantidades físicas). ✅ Backend (`TK-078`) y Frontend (`TK-078-FE`) implementados.
*   **[US-020: Indicador TRR Real en el Dashboard de Reportes](reports/US-020.md)**
    *   *Descripción:* Calcula y muestra el tiempo real promedio de rotación de remanentes, el único indicador que valida en la práctica el KPI #2 del PRD (TRR < 72h). ✅ Backend (`TK-079`) y Frontend (`TK-079-FE`) implementados.
*   **[US-029: Reporte de Mermas de Preparación y Auditoría del Consumo Ad-hoc de Recetas](reports/US-029.md)** ✅
    *   *Descripción:* Reporte de merma generada al preparar recetas (por receta / ingrediente / motivo) + consumo real vs teórico; de paso, el consumo ad-hoc de receta legacy pasa a registrar `CONSUMPTION_RECIPE`. 📝 Draft — diferible (ADR-003).

### 🛠️ Shared / Transversal (`/shared/`)
*   **[US-022: Sistema de Diseño FEFO — Turno Día/Noche](shared/US-022.md)**
    *   *Descripción:* Reemplaza el tema oscuro único "Señal Industrial" por un sistema de dos turnos (Día/Noche) con interruptor persistido por dispositivo, aplicado a toda la aplicación. ✅ Frontend (`TK-081-FE`, `TK-082-FE`, `TK-083-FE`, `TK-084-FE`) implementado.
*   **[US-023: Navegación por Rutas y Shell de Aplicación FEFO](shared/US-023.md)**
    *   *Descripción:* Cierra la lámina "Aplicación" del Sistema FEFO: adopta `react-router-dom@7.18.3` (shell de rutas Inventario/Estaciones/Recetas/Reportes/Ajustes con acceso por rol y barra lateral tipo comanda) y los componentes de la propuesta (botón de acción circular, chip de urgencia de 4 niveles, panel Estado de 3 cubetas). ✅ Frontend (`TK-085-FE`…`TK-088-FE`) implementado; auditoría de contraste AAA en `AUDIT-A11Y-001`.
*   **[US-024: Contenido de Ruta Inline y Consistente](shared/US-024.md)**
    *   *Descripción:* Corrige la inconsistencia de `US-023`: Reportes se muestra inline (no como `<Modal>` flotante) y Ajustes pasa a 5 sub-rutas deep-linkables (`/ajustes/configuracion`, `/personal`, `/roles`, `/movimientos`, `/catalogo`). ✅ Frontend implementado (`TK-089-FE`, `TK-090-FE`); verificado en el stack Docker real.
