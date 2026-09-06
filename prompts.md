b> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes. Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

## Índice

0. [Preparación skills](#0-preparación-skills)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Preparación skills

**Prompt 1 (meta-prompt):**

Agent: Chat GPT‑5.5 de OpenAI

### Request:

Quiero que me crees un prompt para Claude en donde le diga que: es un experto en el negocio relacionado con el producto 'Service Desk', al que le iré haciendo preguntas sobre dicho negocio.

### Response:

Actúa como un experto senior en el negocio de Service Desk y en la gestión de servicios de TI (ITSM). Posees un conocimiento profundo de procesos, operaciones, roles, métricas, modelos organizativos, herramientas, mejores prácticas y marcos de referencia utilizados en entornos empresariales.

Tu objetivo es responder a mis preguntas desde una perspectiva de negocio, funcional y operativa, explicando cómo funciona un Service Desk dentro de una organización y cómo aporta valor a usuarios, clientes y áreas de tecnología.

Cuando respondas:

Prioriza la visión de negocio y funcional antes que los detalles técnicos. Explica conceptos de forma clara, estructurada y práctica. Utiliza ejemplos reales o escenarios empresariales cuando sea útil. Diferencia claramente entre procesos, roles, responsabilidades, herramientas y métricas. Si existen varias formas de abordar un tema, describe las alternativas y sus ventajas e inconvenientes. Relaciona tus respuestas con buenas prácticas de ITSM y Service Desk cuando corresponda. Si una pregunta es ambigua, solicita aclaraciones antes de responder. No inventes información; cuando una respuesta dependa del contexto de la organización, indícalo explícitamente.

Asume que estoy analizando, diseñando o mejorando un producto Service Desk, por lo que necesito comprender en profundidad los procesos de negocio, las necesidades de los usuarios, los flujos operativos, los indicadores clave (KPIs), los acuerdos de nivel de servicio (SLAs), la gestión de incidencias, solicitudes, problemas, cambios, conocimiento y cualquier otro proceso relacionado.

A partir de este momento responderás como consultor experto en negocio Service Desk. Espera mis preguntas y responde con el nivel de detalle necesario para comprender el dominio funcional y operativo del producto.

</br>

**Prompt 2:**

Agent: Chat GPT‑5.5 de OpenAI

### Request:

¿Me puedes generar un skill para Claude y que pueda guardarlo y llamarlo desde la consola de VS Code? Debe generarse en un inglés técnico con términos adecuados al negocio de Service Desk.

### Response:

Generado documento SKILL.md que se ha guardado en la ruta: '.claude/skills/service-desk-expert'

Esta versión está escrita con terminología que encontrarás en productos como ServiceNow, Jira Service Management, BMC Helix ITSM o ManageEngine ServiceDesk Plus, y está orientada a que Claude responda como un Product Architect/Business Consultant especializado en Service Desk empresarial.

</br>

**Prompt 3:**

Agent: Claude Code - Sonnet 4.6

### Request:

@.claude/skills/service-desk-expert/ guarda en tu skill que tienes que escribir todo en inglés técnico del sector de Service Desk.

¿cambiarías algo del skill @.claude/skills/service-desk-expert/ si dicho service-desk fuese expresamente para una aplicación que gestiona competiciones de tipo torneo, liga o grupos? Tienes la información exacta del objetivo de la aplicación en el readme.md (sección '0.3. Descripción breve del proyecto')

### Response:

Claude ha mejorad el skill @.claude/skills/service-desk-expert/, varios apartados en los que concreta su Alcance y Contexto concreto dentro de la aplicación de Gestión de Ligas y Torneos.

---

## 1. Descripción general del producto

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

@.claude/skills/service-desk-expert/ Necesito que rellenes para un producto Service Desk y, en el documento 'readme.md' que se encuentra en la raíz del proyecto, los siguientes campos:

- 1. Descripción general del producto/1.1. Objetivo
- 1. Descripción general del producto/1.2. Características y funcionalidades principales

### Response:

Añadido en el readme.md: '1.1. Objetivo' y '1.2. Características y funcionalidades principales'.

</br>

**Prompt 2:**

Agent: Claude Code - Sonnet 4.6

### Request:

Usa el agente **sport-itsm-product-owner** para redactar las secciónes "1. Product" (Qué es el producto en 3 líneas - Sport ITSM: plataforma ITSM que soporta el SCMS) y "4. Specifications & OpenSpec Workflow (Puntero a que las specs viven en openspec/ y a cómo trabajar con changes)" el CLAUDE.md (raíz del repo). Va a contener:

Usa el agente **sport-itsm-architect** para redactar las sección "2. Technology Stack" y "3. Code Conventions, Folder Structure, Commands & Style Rules (Convenciones de código, estructura de carpetas, comandos (build/test/lint), reglas de estilo, qué NO hacer.)" dentro de CLAUDE.md. Distingue entre Backend y Frontend.

Sin requisitos funcionales aquí: es contexto operativo para el agente. (OpenSpec también usa AGENTS.md; puedes mantener CLAUDE.md como el archivo de Claude Code y que apunte a openspec/.)

### Response:

Añadido el CLAUDE.md.

</br>

**Prompt 3:**

Agent: Claude Code - Sonnet 4.6

### Request:

Quiero que creees un PRD con ayuda del agente sport-itsm-product-owner

### Response:

Añadido PRD.

</br>

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

Añade al agente "sport-itsm-architect" el skill feature-docs

### Response:

El skill feature-docs ha sido añadido al agente "sport-itsm-architect"

</br>

**Prompt 2:**

Agent: Claude Code - Sonnet 4.6

### Request:

Usa el agente **sport-itsm-architect** para generar el "Diagrama de arquitectura" de la aplicación, ayudándote del PRD si es necesario. Empieza desde lo más general hacia lo más concreto, distinguiendo entre backend y frontend cuando lo creas necesario.

### Response:

Se ha creado el documento docs/ARCHITECTURE.md

</br>

**Prompt 3:**

Agent: Claude Code - Sonnet 4.6

### Request:

Rellena el apartado "2.1. Diagrama de arquitectura" del readme.md y revisa que se hayan cumplido todos los requisitos.

### Response:

Apartado "2.1. Diagrama de arquitectura" del readme.md rellenado.

</br>

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

Usa el agente **sport-itsm-architect** para generar la "Descripción de componentes principales" de la aplicación, ayudándote del documento PRD.md y el ARCHITECTURE.md si es necesario. Describe los componentes más importantes, incluyendo la tecnología utilizada. Llamalo COMPONENTS.md y, añade la información también en la sección 2.2 del readme.md.

### Response:

Creado documento COMPONENTS.md y rellenado apartado "2.2. Descripción de componentes principales" del readme.md.

</br>

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

Usa el agente **sport-itsm-architect** para generar la "Descripción de alto nivel del proyecto y estructura de ficheros" de la aplicación. Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica. El documento que generes añadelo dentro de la carpeta docs y rellena la sección 2.3 del readme.md.

### Response:

Creado documento PROJECT-STRUCTURE.md y rellenado apartado "2.3. Descripción de alto nivel del proyecto y estructura de ficheros" del readme.md.

</br>

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

Usa el agente **sport-itsm-architect** para generar la "3.1. Diagrama del modelo de datos" de la aplicación. En la carpeta docs genera un documento único para todo el Modelo de Datos, y rellena la sección 3.1 del readme.md.

### Response:

Creado documento DATA-MODEL.md y rellenado apartado "3.1. Diagrama del modelo de datos" del readme.md.

</br>

**Prompt 2:**

Agent: Claude Code - Sonnet 4.6

### Request:

Usa el agente **sport-itsm-architect** para generar la "3.2. Descripción de entidades principales" de la aplicación. Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc. Añade todo al fichero creado anteriormente DATA-MODEL.md, y rellena la sección 3.2 del readme.md.

### Response:

Añdadido a DATA-MODEL.md este nuevo apartado y rellenado "3.2. Descripción de entidades principales" del readme.md.

</br>

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

Utiliza el agente sport-itsm-product-owner. Carga el skill epic-mapper y ejecútalo entero para producir el epic map de Sport IT Service Management.

Devuelve el contenido completo de epic-map.md en inglés, siguiendo el formato de salida del skill.

### Response:

Añdadido epic-map.md

</br>

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
