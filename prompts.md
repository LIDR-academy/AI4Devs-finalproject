# Prompts destacados utilizados en el proyecto

Los cambios en este proyecto se realizan **mediante pull requests**. Este archivo se rellena con los **prompts destacados** (máximo 3 por sección): aquellos que mejor justifican el uso de asistentes de código en cada fase del ciclo de vida. La entrega actual corresponde a **Pull Request 1 (primera entrega)**.

En cada sección se indica el **prompt real** (texto utilizado) y, aparte, un resumen de **qué se hizo** con ese prompt.

---

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

**Prompt 1 (real):**
*Solicitud de explicación de qué es SDD, sus etapas y las tareas asociadas, con la intención de aplicar el enfoque a un proyecto basado en entrevistas.*

**Qué se hizo:** Alineamiento metodológico inicial; definición de enfoque incremental y guiado por el problema; confirmación de abordar el proyecto etapa por etapa.

---

**Prompt 2 (real):**
*Aclaración de que las plataformas a reemplazar son Whaticket, Znuny (OTRS) y SIHR; confirmación de que la intención es reemplazar completamente las tres. Aclaración de que el sistema no es exclusivo de DII sino que debe servir también a Soporte TI y Área de Procesos, y que será utilizado solo por usuarios internos.*

**Qué se hizo:** Cierre del alcance técnico y organizacional; definición del proyecto como reemplazo total; identificación de actores y áreas.

---

**Prompt 3 (real):**
*«dame el documento final...»* (al cierre de la Etapa 2).
Y previamente: *Solicitud de generar en formato Markdown la salida completa de la Etapa 1 (Descubrimiento).*

**Qué se hizo:** Generación del documento consolidado de cierre de la Etapa 1 y del documento final de la Etapa 2 (especificación funcional).

---

## 2. Arquitectura del sistema

**Prompt 1 (real):**
*Define los boundaries funcionales de un sistema de gestion de casos interno. Cada boundary debe incluir: responsabilidad principal, que incluye, que excluye, invariantes (reglas que nunca se rompen). No definas: tecnologia, microservicios, despliegue. El resultado debe servir como base para arquitectura IA-first.*

**Qué se hizo:** Definición de boundaries (Case Management, Lifecycle Engine, Assignment, SLA & Metrics, Time Tracking, Evidence & Audit, Configuration, Communication & Notifications) con responsabilidades e invariantes.

---

**Prompt 2 (real):**
*Define un conjunto de principios IA-first para una arquitectura funcional, pensada para ser interpretada por agentes de IA sin contexto externo. Los principios deben: evitar ambiguedades, forzar responsabilidades explicitas, diferenciar lo configurable de lo invariante.*

**Qué se hizo:** Documento de principios IA-First para la arquitectura (responsabilidades explícitas, comunicación por eventos, configurabilidad declarada, invariantes protegidos, trazabilidad obligatoria).

---

**Prompt 3 (real):**
*Define una arquitectura backend usando Laravel bajo un enfoque de monolito modular orientado a eventos. Requisitos: Los modulos deben estar desacoplados logicamente; la comunicacion entre modulos debe realizarse mediante eventos; las integraciones externas (correo, WhatsApp, IA) no deben afectar la disponibilidad del core; no utilices microservicios. Entrega: descripcion de modulos, responsabilidades, dependencias.*

**Qué se hizo:** Diseño de arquitectura backend (monolito modular, eventos); descripción de módulos y dependencias; diagrama lógico de componentes y flujo de eventos.

---

## 3. Modelo de datos

**Prompt 1 (real):**
*Disena un modelo de datos relacional en MySQL para un sistema de mesa de servicios. Requisitos: tercera forma normal; tablas y campos en espanol; comentarios en tablas y campos; auditoria completa. Incluye entidades para: casos, contactos, mensajes, evidencia, ciclos de vida, SLA, encuestas.*

**Qué se hizo:** Modelo relacional (resumen) con entidades principales; base para migraciones y diseño de tablas.

---

**Prompt 2 (real):**
*Define reglas de validacion para identificadores de contacto. Requisitos: RUT chileno validado por modulo 11; almacenado con formato xx.xxx.xxx-x; NIT almacenado como texto numerico sin formato; validacion por pais (CL, CO, US).*

**Qué se hizo:** Reglas de validación RUT/NIT por país; formato de almacenamiento; uso en modelo Contacto y en endpoints.

---

**Prompt 3 (real):**
*«nos interesan algunos datos obvios...»*

**Qué se hizo:** Incorporación de atributos mínimos del Caso, tipos de incidencia y SLA en el modelo conceptual de la Etapa 2.

---

## 4. Especificación de la API

**Prompt 1 (real):**
*Disena una API REST para la gestion de casos. Incluye endpoints para: crear casos, consultar casos, cambiar estado, asignar area y responsable, registrar mensajes, adjuntar evidencia. Respeta reglas: caso cerrado no se reabre; reasignacion no cambia estado.*

**Qué se hizo:** Diseño de API REST para casos (crear, consultar, transiciones, asignaciones, mensajes); reglas de negocio reflejadas en el contrato.

---

**Prompt 2 (real):**
*Disena endpoints para soportar un tablero Kanban configurable. Requisitos: columnas configurables por area; drag and drop solicita transicion; validacion por motor de ciclo de vida.*

**Qué se hizo:** Endpoints de Kanban (tableros por área, tarjetas, mover); integración con motor de transiciones.

---

**Prompt 3 (real):**
*Define un catalogo canonico de eventos para el sistema. Para cada evento incluye: nombre unico, descripcion funcional, datos minimos, componente productor, componentes consumidores. Considera eventos relacionados con: creacion de casos, cambios de estado, asignaciones, primera accion, SLA, cierre automatico.*

**Qué se hizo:** Catálogo de eventos (CasoCreado, EstadoCambiado, AreaAsignada, ResponsableAsignado, MensajeRegistrado, TiempoImputado, SLAProximoAVencer, SLAIncumplido, CasoCerrado, ConfiguracionActualizada, etc.) con productores y consumidores.

---

## 5. Historias de usuario

**Prompt 1 (real):**
*«Continuemos con la etapa 6. Para este paso ya me deberias crear casos de uso, historias de usuario y tickets de trabajo (donde cada ticket no fuera de mas de 4 horas de trabajo cada uno). Me gustaria que priorizaras con algun criterio segun lo mas importante que ir realizando. Me tienes que decir en que momento comenzar a usar cursor con speckit y que le tengo que ir subiendo o como irle pasando los tickets de trabajo.»*

**Qué se hizo:** Inicio de la Etapa 6; generación de casos de uso, HUs y tickets (≤4 h); criterio de priorización; indicaciones para usar Cursor/spec-kit.

---

**Prompt 2 (real):**
*«Quiero que me vayas creando 1 a 1 lo siguiente 1 solo archivo MD con caso de uso, historias de usuarios asociadas, los tickets de trabajo por cada historia de usuario. Quiero ir solo de a 1 para irlas guardando y dejar todo bien estructurado en mi carpeta antes de empezar con cursor.»*

**Qué se hizo:** Estructura de entregas: un archivo MD por caso de uso con CU, HUs y tickets; generación secuencial 1 a 1.

---

**Prompt 3 (real):**
*«siguiente»*

**Qué se hizo:** Avance al siguiente paquete/caso de uso manteniendo el mismo formato; se reutilizó en cada entrega.

---

## 6. Tickets de trabajo

**Prompt 1 (real):**
*«Cosas a considerar Yo creare manualmente los proyectos en angular/laravel a nivel base (es decir solo instalacion basica para partir) y el repositorio en gitlab.»*

**Qué se hizo:** Restricciones de setup asumidas en los tickets: proyectos base y repo creados por el usuario; los tickets no incluyen instalación inicial.

---

**Prompt 2 (real):**
*Define como la arquitectura funcional (Etapa 4) se transforma en: historias de usuario, casos de uso, tickets de implementacion. Indica: en que momento del proceso ocurre, que informacion se reutiliza, buenas practicas IA-first.*

**Qué se hizo:** Criterios para derivar HUs, casos de uso y tickets desde la arquitectura; trazabilidad Etapa 4 → Etapa 6.

---

**Prompt 3 (real):**
*«Estas trabajando en un sistema de Mesa de Servicios interna. Contexto general: Backend Laravel (PHP), Base de datos MySQL (modelo relacional 3FN), Frontend Angular, Arquitectura monolito modular orientado a eventos. Usuarios solicitantes NO acceden a la plataforma. Ingreso de casos por correo (Office365 via Microsoft Graph). WhatsApp fuera del MVP. Ciclos de vida configurables. No se permiten saltos ni retrocesos de estado. Un caso cerrado nunca se reabre. 1 caso activo por contacto. IA solo sugiere (umbral 0.85). Siempre respeta las reglas de dominio.»*

**Qué se hizo:** Uso de este contexto como prompt base al generar o refinar tickets para Cursor/spec-kit, para que el código respete el dominio.

---

## 7. Pull requests

**Instrucción recibida:** Trabajar **mediante pull requests** para los cambios. Rellenar el archivo `prompts.md` con los prompts destacados. La entrega actual es **Pull Request 1 (primera entrega)**.

**Prompt 1 (real):**
*«generame igual un archivo .md consolidando todos los prompts que te pedi en esta etapa 6»*

**Qué se hizo:** Solicitud de un documento .md con todos los prompts de la etapa 6.

---

**Prompt 2 (real):**
*«no me entendiste, quiero que me hagas un archivo .md con todos los prompts que te pedi para que me generaras la salida de la etapa 6 (no los prompts que metere a cursor ni relacionado con el desarrollo mismo)»*

**Qué se hizo:** Aclaración del alcance del consolidado: solo los prompts que generaron la salida documental de la Etapa 6, no los prompts de desarrollo/Cursor.

---

**Prompt 3 (real):**
*«¿despues de la etapa 6 viene una etapa 7»*

**Qué se hizo:** Validación metodológica del ciclo SDD; definición de siguientes pasos (roadmap); coherente con trabajar por entregas y PRs.

---

*El conjunto completo de prompts por etapa está en la carpeta `documentacion-sdd/` (etapas 1 a 6). Los cambios en este documento y en el proyecto se realizan mediante pull requests.*
