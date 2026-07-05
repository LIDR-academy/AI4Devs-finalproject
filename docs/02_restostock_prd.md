# 📝 Documento de Requisitos de Producto (PRD): RestoStock

## 📌 Índice
1. [Descripción General del Producto](#1-descripción-general-del-producto)
   - 1.1. [Problemática de Negocio](#11-problemática-de-negocio)
   - 1.2. [Propuesta de Solución (MVP)](#12-propuesta-de-solución-mvp)
   - 1.3. [Objetivos de Negocio y KPIs](#13-objetivos-de-negocio-y-kpis-métricas-de-éxito)
2. [Definición de Usuarios (User Personas)](#2-definición-de-usuarios-user-personas)
3. [Flujo End-to-End Prioritario](#3-flujo-end-to-end-prioritario)
   - 3.1. [Happy Path: Secuencia de Pasos](#31-happy-path-secuencia-de-pasos)
   - 3.2. [Flujos Alternativos y Manejo de Errores (Edge Cases)](#32-flujos-alternativos-y-manejo-de-errores-edge-cases)
4. [Límites del Sistema y "Non-Goals" (Fuera de Alcance)](#4-límites-del-sistema-y-non-goals-fuera-de-alcance)
5. [Backlog de Historias de Usuario (INVEST)](#5-backlog-de-historias-de-usuario-invest)
    - [US-001: Autenticación por PIN del Personal de Cocina](#us-001-autenticación-por-pin-del-personal-de-cocina)
    - [US-002: Registro de Extracciones de Bodega](#us-002-registro-de-extracciones-de-bodega)
    - [US-003: Consulta Táctil de Remanentes Activos en Orden FEFO](#us-003-consulta-táctil-de-remanentes-activos-en-orden-fefo)
    - [US-004: Registro de Consumo Parcial de Remanentes](#us-004-registro-de-consumo-parcial-de-remanentes)
    - [US-005: Registro de Descartes y Mermas](#us-005-registro-de-descartes-y-mermas)
    - [US-006: Consulta de Alertas y Notificaciones Críticas en Cocina](#us-006-consulta-de-alertas-y-notificaciones-críticas-en-cocina)
    - [US-007: Consumo Rápido de Stock por Recetas](#us-007-consumo-rápido-de-stock-por-recetas)
    - [US-008: Cierre de Turno y Conciliación de Cocina](#us-008-cierre-de-turno-y-conciliación-de-cocina)
6. [Estrategia de Calidad y Verificación (QA/Testing)](#6-estrategia-de-calidad-y-verificación-qatesting)
7. [Roadmap Post-MVP (Fase 2)](#7-roadmap-post-mvp-fase-2)


---

## 🎯 1. Descripción General del Producto

### 1.1. Problemática de Negocio
En la gestión operativa diaria de los restaurantes se produce un flujo descontrolado de insumos en el depósito principal. La falta de registro de quién extrae la mercancía y para qué área de la cocina se destina genera mermas misteriosas y pérdidas de inventario que afectan directamente el margen de ganancia. 

Adicionalmente, el desperdicio se multiplica una vez que los insumos ingresan a la cocina. Cuando una unidad de compra (ej. una horma de queso de 5 kg o una caja de salsa) se abre, el remanente sobrante suele almacenarse en heladeras o alacenas sin ningún tipo de registro físico ni de caducidad dinámica. Esto produce tres graves ineficiencias:
1. Cocineros que abren un lote nuevo sellado porque desconocen que ya hay un empaque abierto (duplicidad de aperturas).
2. Tiempo desperdiciado por el personal buscando ingredientes abiertos en diferentes áreas de frío/secos.
3. Insumos que caducan prematuramente al no ser rotados de forma prioritaria tras ser abiertos.

### 1.2. Propuesta de Solución (MVP)
**RestoStock** es una aplicación web de control de inventario y trazabilidad diseñada específicamente para cocinas. El MVP permite a los encargados y personal autorizado registrar de manera ultra rápida cada extracción del depósito principal, reportar el uso parcial de un insumo y rastrear la ubicación física exacta de su remanente dentro de los almacenes secundarios de la cocina (ej. heladeras, congeladores, estanterías). 

El sistema optimiza la rotación de inventarios forzando una lógica FEFO (First Expired, First Out) y alertando al personal sobre los insumos abiertos para asegurar su consumo prioritario. Esto se complementa con:
*   **Feed táctil de notificaciones críticas:** Tarjetas de alertas sobre vencimientos FEFO inminentes, rotura de stock de seguridad de línea y estado de red offline.
*   **Consumo rápido por recetas (manual):** Registro manual de uso de insumos mediante plantillas de recetas guardadas en la terminal, descontando de forma secuencial en orden FEFO sin integrarse con sistemas de comandas externos o facturación (BOM).
*   **Cierre de turno y conciliación física:** Flujo de fin de jornada para que el operario declare el inventario real en cocina y el sistema genere de manera guiada los registros de merma y discrepancias.



### 1.3. Objetivos de Negocio y KPIs (Métricas de Éxito)
*   **Reducción de Merma Desconocida:** Disminuir en un **30%** la diferencia financiera entre el inventario teórico del sistema y las auditorías físicas semanales en un periodo de 90 días.
*   **Tasa de Rotación de Remanentes (TRR):** Lograr que el tiempo promedio desde que se abre un insumo y se registra su remanente hasta que se marca como "totalmente consumido" sea **menor a 48 horas**.
*   **Reducción de Duplicidad de Aperturas:** Bajar a cero la incidencia de apertura de nuevos insumos sellados cuando ya existe un remanente activo del mismo ingrediente en la cocina.

---

## 👥 2. Definición de Usuarios (User Personas)

### 2.1. Chef de Cocina / Encargado de Almacén (Rol: Administrador)
*   **Contexto operativo:** Trabajo mixto entre oficina y almacén. Utiliza computadoras de escritorio y dispositivos móviles fuera del horario pico de servicio.
*   **Necesidades específicas:** Control de costos y auditoría de inventarios. Necesita parametrizar el catálogo maestro de insumos (factores de conversión, vidas útiles), configurar ubicaciones físicas y auditar los reportes financieros de mermas y descartes.
*   **Identificación y Permisos:** Autenticación robusta tradicional (correo electrónico y contraseña). Posee permisos totales de lectura, escritura y configuración en el sistema (Backoffice).

### 2.2. Cocinero / Barman (Rol: Personal de Línea)
*   **Contexto operativo:** Entorno de alta velocidad, estrés físico, ruido y temperatura. Manipula alimentos y trabaja con las manos ocupadas o sucias. Interactúa con pantallas táctiles (tablets) fijas en la cocina.
*   **Necesidades específicas:** Consulta ultrarrápida y visual del stock de insumos abiertos. Requiere saber inmediatamente si hay un ingrediente abierto (y en qué heladera exacta está) antes de ir a buscar uno nuevo al almacén principal.
*   **Identificación y Permisos:** Acceso de consulta libre en las terminales de cocina (sin autenticación individual para lectura). No tiene permisos de escritura directa en el inventario a menos que cuente con credenciales de operario autorizado.

### 2.3. Operarios Autorizados (Rol: Operario de Inventario)
*   **Contexto operativo:** Cocineros experimentados, jefes de partida o personal de cocina con la responsabilidad del control de stock en su turno.
*   **Necesidades específicas:** Registrar las extracciones y consumos en medio del servicio sin interrumpir el ritmo de la cocina.
*   **Identificación y Permisos:** Autenticación rápida en las pantallas táctiles mediante **selección de perfil (nombre y foto) + PIN numérico de 4 dígitos**. Tienen permisos para crear registros de movimiento, uso parcial de insumos y descartes por merma. No pueden modificar el catálogo maestro, precios, configuraciones ni ver reportes financieros consolidados.

---

## 🧭 3. Flujo End-to-End Prioritario

### 3.1. Happy Path: Secuencia de Pasos
1.  **Extracción del Depósito:** Un *Operario Autorizado* accede a la terminal, selecciona su perfil, ingresa su PIN de 4 dígitos y registra el traslado de una unidad de compra sellada (ej. 1 Horma de Queso Parmesano) desde el Almacén Principal hacia el sector de Cocina. El stock del depósito principal decrece en 1 unidad.
2.  **Registro de Uso Parcial:** Tras utilizar el ingrediente para el servicio, el cocinero pesa la porción consumida (ej. 400 gramos). El *Operario Autorizado* ingresa su PIN en la tablet de la cocina y registra el consumo indicando el insumo y la cantidad exacta en la unidad de consumo directo.
3.  **Cálculo Automático de Remanente:** El sistema detecta la apertura del insumo, multiplica la unidad de compra extraída por el factor de conversión parametrizado (ej. 1 Horma = 5000g), resta el consumo registrado y genera de inmediato un registro de `Remanente` por la diferencia (ej. 4600g).
4.  **Resguardo Físico:** El *Operario Autorizado* selecciona la sububicación de destino (ej. "Heladera A - Línea de Fríos") en la pantalla y confirma el guardado.
5.  **Rotación Prioritaria:** El sistema actualiza en tiempo real el catálogo de insumos abiertos de la cocina. El remanente recién guardado se destaca visualmente en la pantalla de consultas de cocina para que el resto del personal lo use antes de abrir cualquier lote nuevo sellado del depósito.

### 3.2. Flujos Alternativos y Manejo de Errores (Edge Cases)

#### 3.2.1. Validaciones de Entrada de Datos
*   **Saldos Lógicos Negativos:** El sistema debe impedir registros de consumo parcial superiores a la capacidad máxima del insumo (ej. registrar un uso de 6000g de una horma de 5000g). Ante esto, la interfaz debe arrojar un error semántico y bloquear la confirmación.
*   **Campos Requeridos y Tipos:** Todas las entradas numéricas (cantidades y PINs) deben pasar validaciones estrictas de tipo (enteros positivos o decimales en rangos coherentes). No se permiten descripciones vacías en los descartes.

#### 3.2.2. Fallas de Conectividad o Red (Resiliencia Transaccional)
*   **Cola de Movimientos Offline (IndexedDB / LocalStorage):** Si la terminal de cocina pierde conexión a internet, la aplicación entrará en modo offline mostrando una alerta visual.
*   **Almacenamiento Temporal:** Los registros de extracción, consumos parciales y descartes se encolarán de manera local en el navegador, firmados utilizando un token de firma offline emitido previamente por el servidor o una prueba criptográfica no-reversible vinculada a la transacción. El PIN del operario nunca se almacena en el cliente de manera persistente ni legible.
*   **Sincronización:** Una vez restablecida la red, la cola de transacciones se enviará al servidor de forma secuencial respetando el orden cronológico.

#### 3.2.3. Políticas de Vencimiento o Caducidad Dinámica
*   **Fecha de Caducidad Acelerada:** Al abrir un producto, el sistema calcula de forma obligatoria la fecha límite de consumo del remanente: `Fecha Vencimiento Remanente = Min(Fecha Vencimiento del Lote Cerrado, Fecha de Apertura + Vida Útil Abierto)`.
*   **Caducidad Dinámica:** Si un ingrediente abierto alcanza su fecha de vencimiento acelerada sin haber sido consumido al 100%, el remanente se bloqueará para su uso y se marcará visualmente en rojo como "Caducado", requiriendo un flujo obligatorio de descarte.

---

## 🛑 4. Límites del Sistema y "Non-Goals" (Fuera de Alcance)

*   **Descuento automático de inventario por receta (BOM):** No se calcularán deducciones automáticas de ingredientes basándose en el software de facturación o comandas. Todos los consumos y aperturas se declaran explícitamente en la terminal.
*   **Gestión de Compras y Proveedores:** Quedan fuera de alcance las alertas automáticas de reabastecimiento, generación de órdenes de compra y el módulo de cuentas por pagar a proveedores.
*   **Multisede:** La base de datos y la arquitectura del backend operan estrictamente para una sucursal física única.
*   **Integración de Hardware Físico:** No se integra## 📋 5. Backlog de Historias de Usuario (INVEST)

> [!NOTE]
> Para consultar las especificaciones detalladas, los escenarios BDD Gherkin completos y las restricciones de UI/UX de cada una de estas historias, refiérase al [Índice de Historias de Usuario (Backlog)](user_stories/indice_user_stories.md).

A continuación se resume el backlog del MVP de RestoStock, estructurado bajo el estándar INVEST:

### US-001: Autenticación por PIN del Personal de Cocina
*   **Historia:** Como operario de cocina (Staff), quiero autenticarme en la terminal táctil ingresando mi PIN personal de 4 dígitos, para registrar mis movimientos de insumos y consumos de forma rápida y segura sin interrumpir el ritmo del servicio.
*   **Complejidad:** S
*   **Evaluación INVEST:**
    *   **I**ndependiente: No requiere la existencia de insumos ni mermas en bodega para validar e iniciar sesión en el cliente.
    *   **N**egociable: Los detalles de visualización del PIN Pad o la duración de la sesión se pueden ajustar.
    *   **V**aliosa: Protege la trazabilidad, asociando cada consumo y desperdicio al empleado responsable.
    *   **E**stimable: La complejidad de implementar hashing con bcrypt y tokens JWT está bien acotada.
    *   **S**mall: Se puede realizar dentro de un sprint de 1 o 2 semanas.
    *   **T**esteable: Verificable mediante pruebas unitarias y de integración sobre la API REST.
*   **Detalle completo:** [US-001.md](user_stories/US-001.md)

### US-002: Registro de Extracciones de Bodega
*   **Historia:** Como operario de cocina (Staff), quiero registrar la extracción física de un insumo desde la bodega principal, para transferir la materia prima al inventario activo de cocina e iniciar su ciclo de vida y control de expiración dinámica.
*   **Complejidad:** M
*   **Evaluación INVEST:**
    *   **I**ndependiente: No depende de que existan remanentes o descartes creados.
    *   **N**egociable: Se puede acordar la UI de búsqueda del insumo (búsqueda rápida vs. categorías).
    *   **V**aliosa: Permite tener control sobre la salida física de mercancía costosa del depósito.
    *   **E**stimable: La lógica de inventario e inserción de movimientos está documentada.
    *   **S**mall: Centrado únicamente en la resta de stock cerrado y creación del registro transaccional.
    *   **T**esteable: Se valida mediante la comprobación del stock del depósito antes y después de la operación.
*   **Detalle completo:** [US-002.md](user_stories/US-002.md)

### US-003: Consulta Táctil de Remanentes Activos en Orden FEFO
*   **Historia:** Como operario de cocina (Staff), quiero visualizar en la terminal táctil la lista de insumos abiertos y activos de forma ordenada por fecha de vencimiento acelerado, para priorizar el uso de los ingredientes más próximos a expirar (FEFO) y minimizar el desperdicio.
*   **Complejidad:** S
*   **Evaluación INVEST:**
    *   **I**ndependiente: Es un flujo de lectura; no altera datos.
    *   **N**egociable: Se puede acordar el diseño visual (ej. colores semafóricos de las alertas).
    *   **V**aliosa: Minimiza el desperdicio alimentario y agiliza los tiempos de preparación en cocina.
    *   **E**stimable: Se reduce a consultas de lectura en base de datos.
    *   **S**mall: Consiste en una interfaz de búsqueda y visualización filtrada.
    *   **T**esteable: Verificable al auditar la lista de remanentes cargados y ordenados por FEFO.
*   **Detalle completo:** [US-003.md](user_stories/US-003.md)

### US-004: Registro de Consumo Parcial de Remanentes
*   **Historia:** Como operario de cocina (Staff), quiero registrar consumos parciales aplicados a preparaciones durante el turno, para mantener el inventario de la línea al día y registrar cuándo un ingrediente abierto se ha agotado por completo.
*   **Complejidad:** L
*   **Evaluación INVEST:**
    *   **I**ndependiente: Requiere que exista una extracción previa para poder abrir la unidad de compra.
    *   **N**egociable: Los campos obligatorios del resguardo pueden limitarse o expandirse según necesidades físicas.
    *   **V**aliosa: Evita la duplicidad de aperturas y automatiza el cálculo de stock real en cocina.
    *   **E**stimable: La fórmula matemática y lógica de vencimiento acelerado está definida.
    *   **S**mall: Delimitada al consumo y la inicialización del objeto `Remanente`.
    *   **T**esteable: Es verificable al auditar la creación del remanente y su fecha de vencimiento calculada.
*   **Detalle completo:** [US-004.md](user_stories/US-004.md)

### US-005: Registro de Descartes y Mermas
*   **Historia:** Como operario de cocina (Staff), quiero descartar un remanente vencido o deteriorado indicando el motivo de forma obligatoria, para asegurar que el stock físico de la cocina coincida con el sistema y auditar el costo de la pérdida.
*   **Complejidad:** S
*   **Evaluación INVEST:**
    *   **I**ndependiente: No requiere flujos de extracción o consumo concurrentes.
    *   **N**egociable: Se pueden acordar los motivos estandarizados.
    *   **V**aliosa: Proporciona datos de control de costos para auditorías semanales.
    *   **E**stimable: Modificación simple de estado del remanente e inserción de movimiento.
    *   **S**mall: Flujo de actualización a cero y guardado del log de merma.
    *   **T**esteable: Se valida que el stock del remanente sea cero y que se registre la merma en el historial.
*   **Detalle completo:** [US-005.md](user_stories/US-005.md)

### US-006: Consulta de Alertas y Notificaciones Críticas en Cocina
*   **Historia:** Como operario de cocina (Staff), quiero visualizar alertas instantáneas en la pantalla sobre vencimientos inminentes, falta de insumos de cocina o desconexión offline, para tomar medidas preventivas sin demorar el servicio.
*   **Complejidad:** M
*   **Evaluación INVEST:**
    *   **I**ndependiente: Se acopla a las alertas generadas por caducidad o estado de red.
    *   **N**egociable: El diseño visual de la barra de alertas o del feed es altamente negociable.
    *   **V**aliosa: Llama la atención sobre pérdidas inminentes de red y stock crítico de forma proactiva.
    *   **E**stimable: La persistencia de alertas y el chequeo periódico están bien definidos.
    *   **S**mall: Centrado en la lectura del feed y estado de la conexión.
    *   **T**esteable: Se simula pérdida de conexión o insumo vencido para verificar el disparo de la notificación.
*   **Detalle completo:** [US-006.md](user_stories/US-006.md)

### US-007: Consumo Rápido de Stock por Recetas
*   **Historia:** Como operario de cocina (Staff), quiero declarar la preparación de un plato indicando sus porciones producidas, para que el sistema descuente automáticamente el stock teórico en cascada (FEFO) según la receta de insumos.
*   **Complejidad:** L
*   **Evaluación INVEST:**
    *   **I**ndependiente: Depende de las recetas maestros y de la existencia de remanentes abiertos en cocina.
    *   **N**egociable: El redondeo de mermas o tolerancias de ingredientes por porción es ajustable.
    *   **V**aliosa: Reduce el tiempo del operario al no tener que declarar gramo por gramo cada ingrediente.
    *   **E**stimable: La lógica de cascada FEFO sobre el array de remanentes activos está modelada.
    *   **S**mall: Encapsulado en el caso de uso de consumo transaccional.
    *   **T**esteable: Se valida que tras registrar una porción, el remanente más antiguo disminuya según la receta.
*   **Detalle completo:** [US-007.md](user_stories/US-007.md)

### US-008: Cierre de Turno y Conciliación de Cocina
*   **Historia:** Como operario de cocina (Staff), quiero realizar un flujo guiado de cierre para registrar el inventario físico real y auto-descartar de forma masiva los remanentes vencidos, para iniciar el siguiente turno con información limpia y precisa.
*   **Complejidad:** M
*   **Evaluación INVEST:**
    *   **I**ndependiente: Se ejecuta al final de la jornada sobre el estado consolidado de la cocina.
    *   **N**egociable: La tolerancia aceptable para variaciones de stock es parametrizable.
    *   **V**aliosa: Corrige discrepancias acumuladas durante el día y automatiza descartes masivos.
    *   **E**stimable: Se trata de un flujo de lectura secuencial, actualización masiva y logeo.
    *   **S**mall: Se limita al proceso del cierre físico y guardado del reporte de conciliación.
    *   **T**esteable: Se valida que al cerrar el turno, los remanentes vencidos se inactiven y se generen los movimientos de desajuste.
*   **Detalle completo:** [US-008.md](user_stories/US-008.md)


---

## 🛡️ 6. Estrategia de Calidad y Verificación (QA/Testing)

Para garantizar un ciclo de desarrollo robusto y prevenir regresiones en la implementación de RestoStock, se establece la política innegociable de **Test-First (TDD con IA)**.

### 6.1. Reglas de TDD y Prevención de "Test Theater"
1.  **Separación de Ciclos:** Queda estrictamente **prohibido** que una IA genere de manera simultánea el código de producción y los tests correspondientes.
2.  **Definición del Oráculo:** Las firmas de los métodos, las estructuras de datos y el comportamiento de los tests (el "qué") deben definirse antes de escribir el código de producción.
3.  **Ciclo Rojo-Verde-Refactor:** El desarrollo de cualquier módulo se ejecutará en tres pasos estrictos:
    *   **Rojo:** Escribir el test que valide la regla de negocio y ejecutarlo para comprobar que falla.
    *   **Verde:** Implementar el código mínimo necesario para lograr que el test pase.
    *   **Refactor:** Limpiar y optimizar el código manteniendo los tests en verde.

### 6.2. Clasificación de Pruebas Mínimas Requeridas

#### 6.2.1. Pruebas Unitarias (Domain Rules)
Lógica inmutable del negocio aislada de infraestructura (sin red ni base de datos):
*   Fórmula del factor de conversión de unidades de compra a unidades de consumo.
*   Cálculo de la fecha de caducidad acelerada del remanente (`Min(Lote, Apertura + Vida Útil)`).
*   Validadores de longitud, formato y hashing del PIN del operario.

#### 6.2.2. Pruebas de Integración (API y Transacciones)
Validación del flujo de datos y persistencia:
*   Registro de movimiento de extracción con transacción en base de datos (descuento del depósito y logging).
*   Registros de consumo parcial concurrentes (bloqueos de concurrencia optimista sobre el remanente).
*   Endpoint de autenticación por PIN (`POST /api/auth/pin`) validando respuestas REST 200 OK y 401 Unauthorized.

#### 6.2.3. Pruebas End-to-End (E2E)
Validación de la interfaz y experiencia del usuario:
*   Simulación completa de flujo Happy Path: Login de administrador -> Crear insumo -> Iniciar sesión de terminal de cocina -> Seleccionar operario -> Ingresar PIN -> Extraer insumo -> Registrar uso parcial -> Verificar visualización prioritaria del remanente en la heladera -> Descartar remanente caducado.

---

## 🚀 7. Roadmap Post-MVP (Fase 2)

Las siguientes funcionalidades quedan definidas fuera del alcance del MVP de la Fase 1, agendadas para desarrollo en fases posteriores basadas en la madurez y uso de la aplicación:

### 7.1. Sincronización Inteligente de Conflictos (Background Sync Advanced)
Implementación de un protocolo robusto de reconciliación en segundo plano ante modificaciones concurrentes multi-tablet en modo offline (ej. dos tablets modifican el mismo remanente offline y vuelven online simultáneamente). Se implementará mediante algoritmo LWW (Last-Write-Wins) asistido por timestamps locales de IndexedDB.

### 7.2. Trazabilidad por Lote y Escaneo de Código de Barras
Permitir el escaneo de códigos de barra (UPC/EAN) utilizando la cámara del dispositivo móvil o tablet de cocina al momento de extraer los insumos de bodega, capturando el número de lote físico del fabricante y su fecha original de caducidad industrial.

### 7.3. Reposición Inteligente Predictiva
Algoritmo en el servidor API que analiza las tasas medias de consumo histórico de remanentes por ingrediente para proponer recomendaciones automáticas de volumen a extraer de bodega central antes de cada inicio de turno o rush operativo.

