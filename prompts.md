> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**
Tuve una reunión con el cliente (La consultoría BGA) para el desarrollo de un aplicación web y posiblemente una parte móvil,  me puedes ayudar a desarrollar las ideas que se vieron en la reunion, te comparto una transcripción de lo que se vio en la junta, recuerda que eres un experto con mas de 20 años desarrollando aplicaciones web y como tal eres experto creando nuevo productos.

Esta es la transcripción

Propósito de la reunión
Discutir los requisitos y características de una nueva herramienta de gestión de proyectos que combine aspectos operativos y administrativos de proyectos de consultoría.

Puntos clave
La herramienta debe integrar cronogramas de proyectos, tareas de consultores (TODOs), informes semanales, KPIs y seguimiento financiero
Las características clave incluyen: cronogramas de proyectos personalizables, gestión de tareas de consultores (TODOs), paneles de KPIs, generación de informes semanales y almacenamiento de archivos
Las funciones administrativas deben manejar el seguimiento de viáticos y gastos para los consultores
El sistema debe permitir un fácil archivado de proyectos y exportación de datos al finalizar el proyecto
Temas
Cronograma del proyecto (Cronograma)
Componente central de la herramienta, representando la "columna vertebral" de cada proyecto
Incluye etapas definidas: definición/análisis, diseño/desarrollo, capacitación, implementación, seguimiento, documentación, quick wins
Permite la personalización según las necesidades del cliente manteniendo la estructura central
Calcula el progreso contra el plan, crucial para reuniones semanales internas y con el cliente
Debe generar indicadores que muestren el progreso planificado vs. real
Gestión de tareas de consultores (TODOs)
Derivado del cronograma del proyecto pero más detallado
Actúa como agenda del consultor, incluyendo tareas específicas del proyecto y administrativas
Debe vincularse al cronograma principal del proyecto
Necesita incluir recordatorios y capacidades de programación (por ejemplo, "Reunión a las 4 PM para validación X")
Informes semanales
Consolida información de cronogramas, KPIs y datos financieros
Incluye evaluaciones de consultores (puntuaciones semanales basadas en criterios definidos)
Muestra el progreso de cada área del proyecto contra el cronograma
Muestra objetivos cuantitativos y beneficios logrados/proyectados
Incluye información financiera (facturación, pagos, montos pendientes)
Destaca comentarios clave y posibles amenazas del proyecto
Panel de KPIs
Rastrea indicadores operativos que respaldan los beneficios financieros
Debe incluir línea base, objetivo y rendimiento actual para cada KPI
Debe permitir el seguimiento semanal para mostrar tendencias
Necesita indicadores visuales (por ejemplo, rojo/verde) para una evaluación rápida del rendimiento
Los KPIs son típicamente proporcionados por la empresa cliente, no generados por el consultor
Almacenamiento y archivado de archivos
Funcionalidad similar a Google Drive para almacenar archivos relacionados con el proyecto
Debe incluir presentaciones de progreso semanal (RAZ), documentación del proyecto y archivos administrativos
Capacidad de archivar todos los archivos del proyecto (incluyendo cronogramas, informes, KPIs) al finalizar el proyecto
Funciones administrativas
Gestión de viáticos: Seguimiento de asignaciones semanales (actualmente 1500 pesos) para consultores
Seguimiento de gastos: Registrar y categorizar los gastos de los consultores (por ejemplo, transporte, comidas)
Debe prevenir errores comunes de usuario en la entrada de datos y cálculos
Próximos pasos
Diseñar una interfaz fácil de usar que integre todos los componentes discutidos
Desarrollar una estructura de base de datos robusta para soportar datos de proyectos y almacenamiento de archivos
Crear un sistema seguro para manejar información financiera y sensible del proyecto
Implementar salvaguardas contra errores de usuario en la entrada de datos, especialmente para cálculos financieros
Diseñar un sistema intuitivo de archivado para proyectos completados

**Prompt 2:**
Los próximos pasos son: 
1 .- prepara una propuesta de diagrama de módulos, o un primer modelo de base de datos para que podamos aterrizarlo más rápido en formato markdown con posibilidad de descargar el archivo
2.- haz un mockup visual rápido de cómo se podría ver el sistema
**Prompt 3:**
Tengo mas información a considerar para el desarrollo te la comparto, te comparto la transcripción de lo visto


Propósito de la reunión
Discutir y aclarar el proceso de reporte de gastos y reembolso para consultores en VGA, enfocándose en los viáticos y gastos específicos de proyectos.

Puntos clave
Los viáticos (1,500 pesos) y los gastos específicos de proyectos se reportan por separado pero en el mismo formulario
Los informes de gastos semanales son cruciales para el control presupuestario y los procesos de reembolso
El sistema de aprobación de gastos varía según el nivel del consultor, con los gerentes de proyecto y directores de operaciones auto-aprobando
VGA utiliza un sistema detallado de control presupuestario específico por proyecto, que alimenta una visión financiera global de toda la empresa
Temas
Estructura de viáticos y gastos de proyecto
Asignación de viáticos: 1,500 pesos para cubrir gastos básicos del consultor cuando trabaja fuera de casa
Sección separada para gastos específicos del proyecto (ej. transporte, alojamiento, material de oficina, teléfono, restaurantes)
Los gastos del proyecto se registran en el sistema de control presupuestario, incluso si son pagados directamente por VGA (ej. cuenta de Uber)
VGA cubre el 50% de los gastos de servicio del consultor (internet, electricidad, limpieza) cuando trabaja de forma remota
Proceso de reporte semanal de gastos
Los consultores presentan informes de gastos semanales antes del domingo
Los informes tienen doble propósito: comunicar gastos para control presupuestario e iniciar el proceso de reembolso
Los gerentes de proyecto deben aprobar los informes de gastos de los consultores
El personal administrativo verifica la presentación y aprobación de los informes antes de procesar los pagos
Los consultores corren el riesgo de perder el reembolso si los informes no se presentan o aprueban a tiempo
Sistema de control presupuestario
Sistema basado en Excel que rastrea datos financieros específicos del proyecto
Incluye montos facturados (con/sin IVA), pagos cobrados, nómina, comisiones y viáticos
Información detallada a nivel de consultor para informes específicos del proyecto
Los datos agregados alimentan una visión financiera global de la empresa (SCP)
Categorías de gastos y flexibilidad
Categorías de gastos estándar en todos los proyectos (ej. hoteles, servicios, visas, material de oficina, movilidad, teléfono)
El sistema permite categorías de gastos específicas del proyecto cuando es necesario (ej. taxis de caballos en Francia)
Enfoque en el seguimiento de gastos pagados por VGA vs. gastos pagados por el consultor, independientemente del modo específico de transporte
Jerarquía de aprobación
Los consultores regulares requieren la aprobación del gerente de proyecto para los gastos
Los gerentes de proyecto y el Director General de Operaciones auto-aprueban sus gastos
El personal administrativo puede cuestionar los gastos si es necesario
Próximos pasos
Miguel estudiará el sistema actual y preparará una propuesta modular para mejorarlo
Miguel enviará la propuesta a Joaquín el lunes por la mañana
Programar una reunión de seguimiento para discutir la propuesta en detalle
Considerar incluir a Luis Gagiola en futuras discusiones sobre el sistema de reporte de gastos
---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
prepara una propuesta de diagrama de módulos, o un primer modelo de base de datos para que podamos aterrizarlo más rápido en formato markdown con posibilidad de descargar el archivo
**Prompt 2:**
Puedes crear algun diagrama o diseño en el documento para ejemplicar la conexion entre los modulos y en cada seccion incluir el detalle en los costos para dar un porque del monto indicado
**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
Es necesario generar una versión con más detallada de cada sección para presentarlo al cliente, puede ser un docx o markdown, no escatimes en las secciones y en los detalles
**Prompt 2:**
puedes generar el MVP (producto minimo viable) con mucho detalle de cada modulo y un orden, TODOs, y un diagrama de secuencia que se debe de seguir para lograr el objetivo
**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
Es necesario generar una versión con más detallada de cada sección para presentarlo al cliente, puede ser un docx o markdown, no escatimes en las secciones y en los detalles
**Prompt 2:**
Título - Propuesta económica para BGA Business
Propósito - Visualizar de forma detallada los pasos a seguir para el desarrollo de la aplicación
Imagen sugerida (puedo dejar espacio)
Puntos clave (bullets)? Puedes utilizar

No hay preferencias con la presentacion, recuerda tu eres el experto
**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
En base al proyecto, dame la infraestructura y despliegue para el proyecto de backend y frontend tomando en cuenta que tanto el backend y frontend estaran publicados en un IIS. Si consideras otra opcion mas viable, analiza el proyecto y lo que se esta planeado realizar para dar ideas viables, existe la opcion de hacer un CI/CD o usar pipeline de devops
**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**
En base al backend que se esta desarrollando para el proyecto de BGA, cuales deberías de ser las especificaciones a considerar desde normas, seguridad, también en base al patrón de diseño seleccionado (repository) cuales son las especificaciones que se deben de considerar.
**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**
prepara una propuesta de diagrama de módulos, o un primer modelo de base de datos para que podamos aterrizarlo más rápido en formato markdown con posibilidad de descargar el archivo
**Prompt 2:**
Antes de que realices el roadmap, tengo las siguientes interrogantes para el proyecto.
1. Cuales seria todos los catálogos que se van a necesitar crear para que el usuario realice correctamente la funcionalidad de todo el proyecto
2. En que momento damos de alta el proyecto?
3. Tenemos diferentes tipos de perfiles que se les mostrarían diferentes áreas o accesos del sistema?
**Prompt 3:**
Puedes crear un diagrama en mermaid donde este todas las entidades con las relaciones entre ellas puedes incluir las datos que conforman las entidades, si me puedes mostrar un ejemplo antes del entregable final estaría muy bien. Si tienes también alguna duda o alguna sugerencia házmela saber.
---

### 4. Especificación de la API

**Prompt 1:**
En base al backend que se esta desarrollando para el proyecto de BGA, cuales deberías de ser las especificaciones a considerar desde normas, seguridad, también en base al patrón de diseño seleccionado (repository) cuales son las especificaciones que se deben de considerar.
**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
