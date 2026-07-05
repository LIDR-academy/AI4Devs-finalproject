# 📝 Documento de Requisitos de Producto (PRD): RestoStock

## 📌 Índice
1. [Descripción General del Producto](#-1-descripción-general-del-producto)
   - 1.1. [Problemática de Negocio](#11-problemática-de-negocio)
   - 1.2. [Propuesta de Solución (MVP)](#12-propuesta-de-solución-mvp)
   - 1.3. [Objetivos de Negocio y KPIs](#13-objetivos-de-negocio-y-kpis-métricas-de-éxito)
2. [Definición de Usuarios (User Personas)](#-2-definición-de-usuarios-user-personas)
3. [Flujo End-to-End Prioritario](#-3-flujo-end-to-end-prioritario)
   - 3.1. [Happy Path: Secuencia de Pasos](#31-happy-path-secuencia-de-pasos)
   - 3.2. [Flujos Alternativos y Manejo de Errores (Edge Cases)](#32-flujos-alternativos-y-manejo-de-errores-edge-cases)
4. [Límites del Sistema y "Non-Goals" (Fuera de Alcance)](#-4-límites-del-sistema-y-non-goals-fuera-de-alcance)
5. [Backlog de Historias de Usuario (INVEST)](#-5-backlog-de-historias-de-usuario-invest)
   - [[ID-US-01]: Registro de Extracción del Depósito Principal](#id-us-01-registro-de-extracción-del-depósito-principal)
   - [[ID-US-02]: Registro de Uso Parcial y Creación de Remanente](#id-us-02-registro-de-uso-parcial-y-creación-de-remanente)
   - [[ID-US-03]: Consulta de Stock Abierto y Ubicación de Remanentes](#id-us-03-consulta-de-stock-abierto-y-ubicación-de-remanentes)
   - [[ID-US-04]: Registro de Descarte de Remanente por Merma](#id-us-04-registro-de-descarte-de-remanente-por-merma)
6. [Estrategia de Calidad y Verificación (QA/Testing)](#-6-estrategia-de-calidad-y-verificación-qatesting)
7. [Roadmap Post-MVP (Fase 2)](#-7-roadmap-post-mvp-fase-2)


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
*   **Descuento rápido por recetas:** Consumo ágil en cocina descontando de forma automática del remanente más antiguo activo según las porciones requeridas por los platos elaborados.
*   **Cierre de turno y conciliación rápida:** Flujo guiado de fin de jornada para auditar discrepancias físicas y automatizar el descarte masivo de remanentes vencidos (>48h TRR).



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
*   **Almacenamiento Temporal:** Los registros de extracción, consumos parciales y descartes realizados por los operarios se encolarán de manera local en el navegador, firmados con el PIN del operario y la marca de tiempo exacta de la transacción física.
*   **Sincronización:** Una vez restablecida la red, la cola de transacciones se enviará al servidor de forma secuencial respetando el orden cronológico.

#### 3.2.3. Políticas de Vencimiento o Caducidad Dinámica
*   **Fecha de Caducidad Acelerada:** Al abrir un producto, el sistema calcula de forma obligatoria la fecha límite de consumo del remanente: `Fecha Vencimiento Remanente = Min(Fecha Vencimiento del Lote Cerrado, Fecha de Apertura + Vida Útil Abierto)`.
*   **Caducidad Dinámica:** Si un ingrediente abierto alcanza su fecha de vencimiento acelerada sin haber sido consumido al 100%, el remanente se bloqueará para su uso y se marcará visualmente en rojo como "Caducado", requiriendo un flujo obligatorio de descarte.

---

## 🛑 4. Límites del Sistema y "Non-Goals" (Fuera de Alcance)

*   **Descuento automático de inventario por receta (BOM):** No se calcularán deducciones automáticas de ingredientes basándose en el software de facturación o comandas. Todos los consumos y aperturas se declaran explícitamente en la terminal.
*   **Gestión de Compras y Proveedores:** Quedan fuera de alcance las alertas automáticas de reabastecimiento, generación de órdenes de compra y el módulo de cuentas por pagar a proveedores.
*   **Multisede:** La base de datos y la arquitectura del backend operan estrictamente para una sucursal física única.
*   **Integración de Hardware Físico:** No se integrarán balanzas digitales ni lectores de códigos de barra. El ingreso de pesos y la selección de productos se realizan mediante la interfaz de pantalla táctil del dispositivo.

---

## 📋 5. Backlog de Historias de Usuario (INVEST)

> [!NOTE]
> Para acceder al backlog de historias de usuario totalmente refinado y detallado bajo el estándar INVEST y BDD Gherkin (incluyendo las nuevas características de notificaciones y alertas táctiles críticas), consulte: [Índice de Historias de Usuario (Backlog)](user_stories/indice_user_stories.md).


### [ID-US-01]: Registro de Extracción del Depósito Principal
*   **Historia:** Como Operario Autorizado, quiero registrar la extracción de un insumo sellado del depósito principal hacia la cocina, para que el sistema actualice el stock general y mantenga la trazabilidad del traslado.
*   **Complejidad:** M
*   **Evaluación INVEST:**
    *   **I**ndependiente: No depende de que existan remanentes o descartes creados.
    *   **N**egociable: Se puede acordar la UI de búsqueda del insumo (búsqueda rápida vs. categorías).
    *   **V**aliosa: Permite tener control sobre la salida física de mercancía costosa del depósito.
    *   **E**stimable: La lógica de inventario e inserción de movimientos está bien documentada.
    *   **S**mall: Se centra únicamente en la resta de stock cerrado y la creación del registro transaccional.
    *   **T**esteable: Se puede validar mediante la comprobación del stock del depósito antes y después de la operación.
*   **Criterios de Aceptación (BDD - Sintaxis Gherkin):**
    *   **Escenario:** Registro exitoso de extracción con PIN válido
        *   **Given** que el operario autorizado con PIN "1234" se encuentra en la pantalla de extracciones
        *   **And** el stock de "Queso Parmesano (Horma de 5kg)" en el Depósito Principal es igual a "10"
        *   **When** el operario selecciona "Queso Parmesano (Horma de 5kg)"
        *   **And** introduce la cantidad "2"
        *   **And** confirma la transacción ingresando su PIN "1234"
        *   **Then** el sistema registra un nuevo `Movimiento` tipo "Extracción" asociado al operario
        *   **And** el stock del insumo en el Depósito Principal se actualiza a "8".
    *   **Escenario:** Bloqueo de extracción por stock insuficiente
        *   **Given** que el operario autorizado se encuentra en la pantalla de extracciones
        *   **And** el stock de "Leche Entera (Caja de 10L)" en el Depósito Principal es igual a "1"
        *   **When** el operario intenta extraer la cantidad "3" y confirma con su PIN
        *   **Then** el sistema muestra un mensaje de alerta "Stock Insuficiente en Depósito Principal"
        *   **And** la transacción se cancela sin modificar el stock de la base de datos.

### [ID-US-02]: Registro de Uso Parcial y Creación de Remanente
*   **Historia:** Como Operario Autorizado, quiero registrar el consumo parcial en gramos o mililitros de un insumo recién abierto, para que el sistema calcule automáticamente la cantidad remanente, le asigne una ubicación física y determine su fecha de vencimiento acelerada.
*   **Complejidad:** L
*   **Evaluación INVEST:**
    *   **I**ndependiente: Requiere que exista una extracción previa para poder abrir la unidad.
    *   **N**egociable: Los campos obligatorios del resguardo pueden limitarse o expandirse según necesidades físicas.
    *   **V**aliosa: Evita la duplicidad de aperturas y automatiza el cálculo de stock real en cocina.
    *   **E**stimable: La fórmula matemática y lógica de vencimiento está definida.
    *   **S**mall: Delimitada al consumo y la inicialización del objeto `Remanente`.
    *   **T**esteable: Es verificable al auditar la creación del remanente y su fecha de vencimiento calculada.
*   **Criterios de Aceptación (BDD - Sintaxis Gherkin):**
    *   **Escenario:** Apertura de insumo, registro de consumo y cálculo de vencimiento acelerado
        *   **Given** que el insumo "Queso Parmesano" tiene una unidad de compra "Horma", unidad de consumo "gramo", factor de conversión "5000" y vida útil abierto de "3" días
        *   **And** el operario autorizado ingresa su PIN válido para abrir una nueva Horma
        *   **When** registra un uso parcial de "400" gramos
        *   **And** selecciona la ubicación de resguardo "Heladera A"
        *   **Then** el sistema descuenta la unidad entera y crea un registro de `Remanente` con cantidad "4600" gramos
        *   **And** la ubicación del remanente se establece en "Heladera A"
        *   **And** la fecha de vencimiento del remanente se fija en exactamente la fecha actual más 3 días.
    *   **Escenario:** Intento de registrar consumo parcial superior al límite del insumo
        *   **Given** que el insumo "Crema de Leche" tiene un factor de conversión de "1000" mililitros
        *   **When** el operario autorizado intenta registrar un consumo parcial de "1200" mililitros de un empaque nuevo
        *   **Then** el sistema arroja un error "La cantidad de consumo excede la capacidad máxima del insumo (1000 ml)"
        *   **And** no se crea ningún registro de remanente en el sistema.

### [ID-US-03]: Consulta de Stock Abierto y Ubicación de Remanentes
*   **Historia:** Como Personal de Cocina, quiero buscar y visualizar los remanentes abiertos y sus ubicaciones en una pantalla ágil, para localizarlos rápidamente y priorizar su consumo antes de abrir productos sellados.
*   **Complejidad:** S
*   **Evaluación INVEST:**
    *   **I**ndependiente: Es un flujo de lectura; no altera datos.
    *   **N**egociable: Se puede acordar el diseño visual (ej. tarjetas con código de colores).
    *   **V**aliosa: Minimiza el desperdicio alimentario y agiliza los tiempos de preparación en cocina.
    *   **E**stimable: Se reduce a consultas de lectura en base de datos.
    *   **S**mall: Consiste en una interfaz de búsqueda y visualización filtrada.
    *   **T**esteable: Se puede verificar que los productos mostrados correspondan a los remanentes cargados y ordenados por FEFO.
*   **Criterios de Aceptación (BDD - Sintaxis Gherkin):**
    *   **Escenario:** Visualización ordenada de remanentes por FEFO (First Expired, First Out)
        *   **Given** que existen tres remanentes activos en el sistema:
            | Insumo | Cantidad | Ubicación | Vencimiento Remanente |
            | Salsa Tomate | 500 ml | Alacena B | En 2 días |
            | Crema Leche | 200 ml | Heladera A | En 12 horas |
            | Jamón Serrano| 1000 g | Heladera B | En 5 días |
        *   **When** el personal de cocina abre el panel de consulta de remanentes
        *   **Then** la lista muestra los tres elementos en el siguiente orden de prioridad:
            1. Crema de Leche (Alerta Amarilla)
            2. Salsa de Tomate (Vigente)
            3. Jamón Serrano (Vigente)
    *   **Escenario:** Búsqueda interactiva de insumos abiertos
        *   **Given** que el usuario está en el panel de consulta de remanentes
        *   **When** escribe "Tomate" en la barra de búsqueda
        *   **Then** el sistema filtra instantáneamente la lista y muestra únicamente el remanente de "Salsa Tomate" con su ubicación "Alacena B".

### [ID-US-04]: Registro de Descarte de Remanente por Merma
*   **Historia:** Como Operario Autorizado, quiero descartar un remanente vencido o deteriorado indicando el motivo de forma obligatoria, para asegurar que el stock físico de la cocina coincida con el sistema y auditar el costo de la pérdida.
*   **Complejidad:** S
*   **Evaluación INVEST:**
    *   **I**ndependiente: No requiere flujos de extracción o consumo concurrentes.
    *   **N**egociable: Se pueden acordar la lista de motivos estandarizados.
    *   **V**aliosa: Proporciona datos de control de costos para auditorías mensuales.
    *   **E**stimable: Modificación simple de estado del remanente e inserción de movimiento.
    *   **S**mall: Flujo de actualización a cero y guardado del log de merma.
    *   **T**esteable: Se valida que el stock del remanente sea cero y que se registre la merma en el historial.
*   **Criterios de Aceptación (BDD - Sintaxis Gherkin):**
    *   **Escenario:** Descarte exitoso de remanente con PIN y motivo obligatorio
        *   **Given** un remanente activo de "Crema de Leche" de "200 ml" en "Heladera A"
        *   **And** un operario autorizado con PIN "5678"
        *   **When** selecciona el remanente y hace clic en "Descartar"
        *   **And** selecciona el motivo "Vencimiento"
        *   **And** confirma ingresando su PIN "5678"
        *   **Then** el sistema actualiza la cantidad del remanente de Crema de Leche a "0" (inactivo)
        *   **And** registra un `Movimiento` tipo "Descarte" con el motivo "Vencimiento" firmado por el operario.
    *   **Escenario:** Rechazo de descarte por falta de motivo
        *   **Given** un remanente activo en el sistema
        *   **When** el operario intenta confirmar el descarte sin seleccionar ningún motivo
        *   **Then** el sistema muestra un mensaje de error "Debe seleccionar un motivo de descarte"
        *   **And** el remanente permanece activo y sin modificaciones en la base de datos.

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

