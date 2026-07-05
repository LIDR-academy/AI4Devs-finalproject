## Índice

1. [Descripción general del producto y Arquitectura del Sistema](#1-Descripción-general-del-producto-y-Arquitectura-del-Sistema)
2. [Modelo de datos](#2-modelo-de-datos)
3. [Historias de usuario](#3-historias-de-usuario)
4. [Tickets de trabajo](#4-tickets-de-trabajo)
5. [Pull requests](#5-pull-requests)

---

## 1. Descripción general del producto y Arquitectura del Sistema

**Prompt 1:**
Como ingeniero fullstack con experiencia en revisión de código, quiero que realices un análisis profundo y multifacético del proyecto. El objetivo es que yo, como desarrollador senior, pueda comprender a fondo su arquitectura, lógica de negocio y funcionamiento.

**Prompt 2:**
La CCB quiere modernizar completamente el sistema conservando su funcionalidad y solucionando todas las vulnerabilidades e incidencias reportadas, también se quiere trasladar la lógica de negocio que se encuentra en procedimientos almacenados a la aplicación. Adicionalmente, existen funcionalidades en desuso, como la generación de pdf y el uso de bluemix que deben eliminarse en la nueva versión. Define el stack tecnológico y la arquitectura recomendada, teniendo en cuenta que diariamente se venden cerca de 12.000 certificados y anualmente la cifra puede llegar a 4 millones.

**Prompt 3:**
Actúa como product manager senior. Necesito un PRD para el sistema de certificados electrónicos de la CCB. El PRD debe incluir, entre otros, los principales casos de uso del sistema y su representación en el diagrama más adecuado usando el formato plantUML, requisitos funcionales y no funcionales, criterios de éxito

**Prompt 4:**
Eres un arquitecto de software. Complementa el @PRD_CERTIFICADOS_ELECTRONICOS.md incluyendo la @ARQUITECTURA_PROPUESTA.md, genera e incluye diagramas C4 en formato mermaid

---

### 2. Modelo de Datos

**Prompt 1:**
Como administrador de base de datos, genera el modelo de datos para el sistema de certificados electrónicos haciendo uso del MCP de mssql. Adicionalmente identifica los procedimientos almacenados que hacen parte del sistema y documéntalos en una archivo en formato markdown

---

### 3. Historias de Usuario

**Prompt 1:**
Eres un analista funcional. A partir de los casos de uso definidos en  @PRD_CERTIFICADOS_ELECTRONICOS.md, crea las historias de usuario del sistema de certificados electrónicos utilizando el formato:
 
Como: [rol del usuario],
Quiero: [funcionalidad o característica],
Para: [beneficio o razón].

Crea los criterios de aceptación utilizando esta estructura:
Dado: [contexto o condición inicial],
Cuando: [acción o evento],
Entonces: [resultado esperado].

Los criterios de aceptación deben incluir el happy path, al menos un escenario de error y un edge case que un QA experimentado consideraría.

Las historias de usuario deben cumplir con los criterios INVEST.

---

### 4. Tickets de Trabajo

**Prompt 1:**
Como desarrollador fullstack con amplia experiencia en sistemas empresariales, analiza los documentos @PRD_CERTIFICADOS_ELECTRONICOS.md, @ARQUITECTURA_PROPUESTA_JAVA.md y @docs/HISTORIAS_DE_USUARIO.md y crea los tickets de trabajo para las historias de usuario en un nuevo archivo markdown

**Prompt 2:**
Para el desarrollo se quiere utilizar la metodología TDD, verifica que las tareas técnicas se ajusten a dicha metodología

---

### 5. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
