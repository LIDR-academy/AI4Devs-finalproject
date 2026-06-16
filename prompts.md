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
Actua como un experto en producto digital, con experiencia en plataformas de propiedad horizontal. Estoy diseñando una producto llamando ConectaPH, una plataforma web para conectar residentes, administración y vigilancia en la copropiedad. La aplicación contará con varios modulos, pero vamos a trabajar un MVP de gestión de reservas de zonas comunes.

Necesito que me ayudes a definir:

- ¿Qué funcionalidades básicas debe tener este MVP?
- Ordénalas de mayor a menor prioridad.
- ¿Qué beneficios obtiene la copropiedad al usar ConectaPH?
- ¿Qué alternativas manuales existen actualmente y cuáles son sus problemas?
- ¿Cómo sería el customer journey de un residente que reserva una zona común?
- ¿Cómo sería el customer journey de vigilancia al consultar los invitados autorizados?

Actualiza esta información en el archivo readme.md
**Prompt 2:**
Actúa como un Product Manager senior. Necesito un PRD para ConectaPH. El público objetivo son todos los residentes, personal de vigilancia y administración de un conjunto residencial que quieren reservar o hacer el seguimiento de las reservas y personas autorizadas. Genera un PRD completo incluyendo: problema a resolver, objetivos medibles, user stories principales, requisitos funcionales y no funcionales, y criterios de éxito. Agrega el resultado en una archivo [ConectaPH-PRD.md] en formato markdown
**Prompt 3:**
Eres un analista de software experto. Estoy construyendo un sistema de reservas para una copropiedad. Enumera y describe brevemente los casos de uso más importantes a implementar para lograr una funcionalidad básica. Agregalo en el archivo PRD completo ConectaPH-DZ.md al final.
---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Eres un brillante arquitecto de software. Eres capaz de diseñar, explicar y diagramar los diferentes aspectos de un sistema de software.
Estoy construyendo un sistema de gestión de reservas para una copropiedad. He definido las entidades Residentes, usuarios, Recursos (Zonas comunes), accesos, reservas.
Qué otras entidades del modelo de datos son importantes en un sistema? Dame los campos más importantes de cada una y cómo se relacionan entre entidades.
(Código diagrama mermaid)

**Prompt 2:**
Agrega la arquitectura al final del archivo ConectaPH-PRD.md y actualiza el archivo readme.md en la sección Arquitectura del sistema.
**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
De acuerdo a lo que se ha estructurado del proyecto de aplicación ConectaPH, genera un diagrama de C4.
**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

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
Eres un brillante arquitecto de software. Eres capaz de diseñar, explicar y diagramar los diferentes aspectos de un sistema de software. Estoy construyendo un sistema de gestión de reservas para una copropiedad. He definido las entidades Residentes, usuarios, Recursos (Zonas comunes), accesos, reservas. Qué otras entidades del modelo de datos son importantes en un sistema? Dame los campos más importantes de cada una y cómo se relacionan entre entidades. (Código diagrama mermaid).

**Prompt 2:**
Agrega la arquitectura al final del archivo ConectaPH-PRD.md y actualiza el archivo readme.md en la sección Arquitectura del sistema.

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**
Eres un brillante arquitecto de software. Eres capaz de diseñar, explicar y diagramar los diferentes aspectos de un sistema de software. Estoy construyendo un sistema de gestión de reservas para una copropiedad. He definido las entidades Residentes, usuarios, Recursos (Zonas comunes), accesos, reservas.

Qué otras entidades del modelo de datos son importantes en un sistema? Dame los campos más importantes de cada una y cómo se relacionan entre entidades. (Código diagrama mermaid)

Agrega la arquitectura al final del archivo ConectaPH-PRD.md y actualiza el archivo readme.md en la sección Arquitectura del sistema.

**Prompt 2:**
Arquitectura de microservicios para un sistema de reserva de recursos, dónde todos los MS apuntan a la misma bd. El frontend se comunica a través del API. Todo alojado en contenedores on premise. Incluye los servicios necesarios. La base de datos es relacional en postgres. 

Describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad.

Actualiza en el readme.md en el aparte de Especificación de la API.

**Prompt 3:**
De acuerdo a lo que se ha estructurado del proyecto de aplicación ConectaPH, genera un diagrama de C4.

---

### 5. Historias de Usuario

**Prompt 1:**
Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto. Actualiza En el archivo readme.md en el numeral 5 historias de usuario. 

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**
Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. Actualiza el readme.md
**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
