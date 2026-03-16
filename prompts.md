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
Quisiera crear un "Sistema de reservas de turnos para peluquería o consultorio" y necesito que me brindes una descripción general del producto y también me describas las características y funcionalidades principales

**Prompt 2:**
en base a la información que tienes del proyecto ZenTurno puedes sugerirme información de "Diseño y experiencia de usuario" para el proyecto

**Prompt 3:**
puedes generar la guía de "Instrucciones de instalación"
Hay que documentar de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

Actua como si fueras arquitecto de software. Necesito que hagamos plan del proyecto basado en los apartados de @readme.md y vamos actualizando fichero. Ahora vamos a generar siguiente punto que es 2.1 Diagrama de arquitectura

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
Ahora quiero que analices bien y trabajes sobre el punto 2.2: Descripción de los componentes principales.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
Quiero que actúes como un analista experto en gestión de proyectos. Tu tarea es desarrollar el contenido del apartado **2.3: Descripción de alto nivel del proyecto y estructura de ficheros** dentro de @readme.md 

Para ello:

1. **Identifica y describe los componentes clave** que forman parte del proyecto.
2. Para cada componente, indica:

   * Su **nombre o denominación funcional**.
   * Una **descripción clara y técnica** de su propósito.
   * Su **función principal** dentro del sistema.
   * Cómo **interactúa o se integra** con otros componentes.
3. Utiliza un enfoque estructurado, profesional y orientado a entregables.
4. Si es útil, organiza la información en formato de lista o tabla para facilitar la comprensión.

No generes un resumen ni una introducción general: **concéntrate en desarrollar directamente el contenido del punto 2.3** con alto nivel de detalle y precisión técnica.

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
Desarrolla el apartado 2.4 del @readme.md , describiendo con precisión técnica los componentes principales, su función e interacciones.

### **2.5. Seguridad**

**Prompt 1:**
Actúa como arquitecto de software. Necesito que completes la documentación, punto 2.5 Seguridad en @/readme.md.

### **2.6. Tests**

**Prompt 1:**
Ahora necesito que completes punto 2.6. Tests en @/readme.md 

---

### 3. Modelo de Datos

**Prompt 1:**
Actúa como arquitecto de software. Necesito que completes la documentación técnica de un sistema incluyendo los siguientes apartados de @/readme.md 

3.1. Diagrama del modelo de datos: genera un diagrama en texto (puede ser en formato Mermaid o pseudocódigo UML) que describa las entidades principales, sus atributos más relevantes, claves primarias y foráneas, así como las relaciones entre ellas (uno a uno, uno a muchos, muchos a muchos).

3.2. Descripción de entidades principales: para cada entidad en el modelo de datos, proporciona una descripción clara de su propósito, sus atributos clave y su relación con otras entidades dentro del sistema.

La redacción debe ser técnica, coherente, y adecuada para ser incluida en @/readme.md

---

### 4. Especificación de la API

**Prompt 1:**

Actúa como arquitecto de software. Completa la sección de documentación técnica en @/readme.md : `4. Especificación de la API`

A partir de la descripción de ZenTurno —una plataforma de gestión de citas para peluquerías y consultorios— documenta los **3 endpoints principales** del backend RESTful en **formato OpenAPI (YAML o JSON)**. Incluye:

* Método HTTP (`GET`, `POST`, etc.)
* Ruta del endpoint
* Descripción breve orientada al uso en ZenTurno (ej: creación de cita, consulta de agenda, gestión de servicios)
* Parámetros requeridos (query o body)
* Códigos de respuesta relevantes (`200`, `400`, `404`, `500`, etc.)
* Ejemplo de solicitud y de respuesta en formato JSON

Los endpoints deben reflejar funcionalidades clave del sistema, como:

1. Crear una nueva cita
2. Consultar disponibilidad de un profesional
3. Cancelar una cita existente

Redacta el contenido de forma técnica, clara y lista para ser incluida en la documentación oficial de backend de ZenTurno.

---

### 5. Historias de Usuario

**Prompt 1:**

Actúa como Product Manager con experiencia en metodologías ágiles. Completa la siguiente sección de documentación en @/readme.md  para el proyecto **ZenTurno**, una plataforma para la gestión de citas en peluquerías y consultorios: `5. Historias de Usuario`

 Documenta **3 historias de usuario principales** que hayan guiado el desarrollo del sistema. Sigue el formato estándar:

 **Como \[tipo de usuario], quiero \[acción o necesidad], para \[beneficio o resultado].**

 Ten en cuenta las buenas prácticas de redacción de historias de usuario: deben ser claras, centradas en el usuario final, y enfocadas en el valor entregado. Las historias deben reflejar funcionalidades clave de ZenTurno como:

 * Reservar una cita online
 * Cancelar o reprogramar una cita
 * Gestionar servicios y profesionales desde el panel de administración

Completa la sección así:

 **Historia de Usuario 1**

 **Historia de Usuario 2**

 **Historia de Usuario 3**

---

### 6. Tickets de Trabajo

**Prompt 1:**


Actúa como líder técnico en un equipo de desarrollo ágil. Completa la sección de documentación de @/readme.md: `6. Tickets de Trabajo`

Documenta **3 tickets de trabajo principales** del desarrollo de la plataforma **ZenTurno**, cada uno enfocado en una capa distinta del sistema:

- **Ticket 1:** Backend  
- **Ticket 2:** Frontend  
- **Ticket 3:** Base de Datos

Para cada ticket, incluye toda la información necesaria para que un desarrollador pueda ejecutarlo de principio a fin. La redacción debe seguir buenas prácticas de gestión técnica de tareas.

La estructura de cada ticket debe ser:

- **Título del ticket**  
- **Descripción del objetivo de la tarea**  
- **Contexto del sistema o funcionalidad involucrada (si aplica)**  
- **Requerimientos técnicos específicos (endpoints, componentes, migraciones, etc.)**  
- **Criterios de aceptación**  
- **Notas adicionales (dependencias, riesgos, o referencias)**

Ejemplos de tickets que puedes desarrollar:
- Backend: Implementar endpoint para crear cita  
- Frontend: Formulario de reserva de turno para clientes  
- Base de Datos: Crear tabla y relaciones para historial de citas

Completa la sección así:

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

### 7. Pull Requests

**Prompt 1:**

Actúa como líder técnico y encargado de la revisión de código en un equipo de desarrollo ágil. Completa la sección de documentación en @/readme.md: `7. Pull Requests`

Documenta **3 Pull Requests (PRs)** representativos del desarrollo de ZenTurno. Para cada PR, incluye la siguiente información detallada para facilitar la revisión y trazabilidad:

- **Título del Pull Request**  
- **Descripción breve del cambio realizado**  
- **Objetivo o motivación del PR**  
- **Archivos o módulos principales afectados**  
- **Resumen de pruebas realizadas**  
- **Comentarios o decisiones relevantes durante la revisión**  
- **Estado final del PR (aprobado, pendiente, rechazado, etc.)**

Ejemplos de PRs a documentar pueden incluir la implementación de nuevas funcionalidades, corrección de bugs críticos o mejoras en la arquitectura.

Completa la sección así:

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

