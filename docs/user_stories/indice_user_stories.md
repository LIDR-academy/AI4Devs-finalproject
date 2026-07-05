# 📖 Índice de Historias de Usuario (MVP RestoStock)

Este directorio contiene las especificaciones detalladas de las historias de usuario que conforman el alcance funcional del Producto Mínimo Viable (MVP) para el sistema **RestoStock**. Cada historia está estructurada bajo el estándar **INVEST** y cuenta con criterios de aceptación explícitos en formato **BDD Gherkin (Given-When-Then)**.

---

## 🗂️ Listado de Historias de Usuario

*   **[US-001: Autenticación por PIN del Personal de Cocina](US-001.md)**
    *   *Descripción:* Permite el acceso rápido e individualizado de los cocineros y operarios mediante teclado táctil y PIN de 4 dígitos para garantizar la trazabilidad operacional.
*   **[US-002: Registro de Extracciones de Bodega](US-002.md)**
    *   *Descripción:* Permite registrar la salida física de insumos enteros desde el almacén central y su correspondiente ingreso a la cocina con el cálculo de su vida útil acelerada.
*   **[US-003: Consulta Táctil de Remanentes Activos en Orden FEFO](US-003.md)**
    *   *Descripción:* Provee una pantalla en cocina para listar todos los ingredientes abiertos ordenados cronológicamente por su fecha de vencimiento acelerado, previniendo el desperdicio.
*   **[US-004: Registro de Consumo Parcial de Remanentes](US-004.md)**
    *   *Descripción:* Permite registrar consumos parciales aplicados a preparaciones durante el turno para mantener el inventario de la línea al día.
*   **[US-005: Registro de Descartes y Mermas](US-005.md)**
    *   *Descripción:* Permite el egreso total del sistema de insumos abiertos inservibles (vencidos, contaminados o dañados) documentando detalladamente la causa de la pérdida.
*   **[US-006: Consulta de Alertas y Notificaciones Críticas en Cocina](US-006.md)**
    *   *Descripción:* Provee un panel táctil interactivo en cocina con alertas semafóricas para vencimientos FEFO inminentes, rotura de stock en línea y pérdidas de conexión (offline).
*   **[US-007: Consumo Rápido de Stock por Recetas](US-007.md)**
    *   *Descripción:* Permite el registro de consumo en lote de múltiples ingredientes a partir de una receta maestra, aplicando descuento en cascada FEFO sobre los remanentes.
*   **[US-008: Cierre de Turno y Conciliación de Cocina](US-008.md)**
    *   *Descripción:* Provee un flujo guiado de fin de jornada para reportar conteo físico real, auto-descartar insumos vencidos de forma masiva y registrar variaciones de stock.


