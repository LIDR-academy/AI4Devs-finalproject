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

Stacklio es una aplicación web que combina **gestión de stack**, **portfolio de proyectos** y **red social profesional**. Está pensada para desarrolladores, estudiantes y profesionales técnicos que quieren organizar y mostrar su experiencia tecnológica.  
Inspiración visual: feed tipo Instagram, pero orientado a portfolios y stacks profesionales.

---

### **📦 Stack Personal**
**Objetivo:** Permitir al usuario descubrir y organizar herramientas de su stack tecnológico.  

**Funcionalidades:**
- **Cajas por categoría:** Frontend, Backend, BBDD, IA, etc.
- **Herramientas como iconos circulares** dentro de cada caja.
- **Gestión visual:** drag & drop entre cajas, añadir nuevas herramientas.
- **Detalles de cada herramienta:** nombre, descripción, URL, icono, tags.
- **Favoritos y filtrado:** marcar favoritas y buscar por categorías/tags.

---

### **📁 Portfolio de Proyectos**
**Objetivo:** Visualizar y gestionar los proyectos del usuario, mostrando su progreso y herramientas asociadas.

**Funcionalidades:**
- Perfil con nombre, número de proyectos/completados, descripción, followers/following.
- Cada proyecto incluye herramientas asociadas y estado: en progreso o completado.
- CRUD básico de proyectos: crear, editar, eliminar y visualizar.

---

### **🌐 Red Social y Compartición**
**Objetivo:** Permitir compartir stack y proyectos con otros usuarios y redes sociales.

**Funcionalidades:**
- Perfil público con URL propia.
- Compartir stack y proyectos en redes sociales.
- Funcionalidad futura: muro principal para compartir progresos o actualizaciones.

---

### **🎨 Diseño y Experiencia de Usuario**
- **Feed tipo Instagram:** visualización clara de cajas de herramientas y proyectos.
- **Interacción fluida:** drag & drop, marcado de favoritas, filtros.
- **Navegación clara:** acceso rápido a stack, proyectos y perfil público.
- **Diseño responsive:** compatible con móvil y escritorio.
- **Feedback visual:** confirmaciones, errores y estados de carga visibles.

---

> Este bloque sirve como **contexto inicial** para la generación de prompts y documentación técnica de Stacklio, proporcionando una visión clara de funcionalidades, diseño y flujo de interacción del usuario.


**Prompt 1 – Descripción breve:**  
Redáctame una descripción breve y profesional de Stacklio, una aplicación web que combina gestión de stack, portfolio de proyectos y red social profesional. La descripción debe ser **concisa**, de máximo 2-3 frases, e incluir: qué hace la aplicación, para quién está pensada y el valor principal que aporta. Utiliza un estilo claro y directo, adecuado para un resumen de producto.

**Prompt 2 – Objetivos:**  
Redáctame un párrafo claro y profesional que describa **el propósito del producto, qué valor aporta, qué problema soluciona y para quién está dirigido**. El producto es Stacklio, una aplicación web que combina gestión de stack, portfolio de proyectos y red social profesional.

**Prompt 3 – Funcionalidades:**  
Enumera y describe las características y funcionalidades específicas que tiene Stacklio para satisfacer las necesidades identificadas de los usuarios. Incluye: nombre de la funcionalidad, descripción detallada, tipo de usuario y disponibilidad sin registro. Considera funcionalidades como cajas personalizables para el stack, drag & drop de herramientas, portfolio de proyectos, perfiles públicos y la opción de compartir en redes sociales.

**Prompt 4 – Diseño y experiencia de usuario:**  
Describe la experiencia del usuario en Stacklio desde que aterriza en la aplicación hasta que utiliza todas las funcionalidades principales. Incluye: navegación por el perfil, interacción con las cajas de herramientas (drag & drop, añadir, mover, ver detalles), gestión de portfolio de proyectos, visualización de perfil público y la opción de compartir en redes sociales. Redáctalo de manera que se pueda usar como guía para un videotutorial o mockup de la experiencia de usuario, incluyendo los dos escenarios: usuario no registrado y usuario registrado.

**Prompt 5 – Instrucciones de instalación:**  
Actúa como un especialista en desarrollo web fullstack con experiencia en React, Vite, TailwindCSS, Node.js, Express, PostgreSQL y Prisma. Redáctame instrucciones precisas y detalladas para instalar y poner en marcha Stacklio en un entorno local. Incluye los pasos de instalación del frontend, backend, base de datos, migraciones y seed, así como la configuración de variables de entorno y dependencias necesarias. El resultado debe ser claro, paso a paso y listo para copiar en la documentación técnica en formato Markdown.

**Justificación**: Se utilizaron prompts para definir con claridad el producto, sus objetivos, público objetivo y funcionalidades clave. Esto permite documentar la visión del MVP y asegurar que todos los stakeholders tengan una comprensión común del proyecto. Los prompts ayudaron a generar descripciones profesionales, detalladas y listas para documentación técnica, incluyendo flujo de usuario y diseño UI/UX.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Hazme una serie de preguntas detalladas para entender qué tecnologías, servicios y arquitectura debo usar para mi aplicación web Stacklio, que combina gestión de stack, portfolio de proyectos y red social profesional. Pregunta sobre frontend, backend, base de datos, almacenamiento de imágenes, autenticación, notificaciones, patrones de arquitectura y necesidades para un MVP rápido.

Pienso todas las opciones que me da y escribo el siguiente prompt:

**Prompt 2:**

Redáctame una propuesta de stack tecnológico para el MVP de mi aplicación web Stacklio, que combina gestión de stack, portfolio de proyectos y red social profesional. La propuesta debe incluir:

- Frontend: framework, librerías de estilizado y componentes UI.
- Backend: framework, librerías, y tipo de arquitectura (monolito o microservicios).
- Base de datos: tipo de base de datos y ORM, indicando si se almacenan imágenes o solo URLs.
- Servicios adicionales: notificaciones, email u otros servicios externos.
- Arquitectura general: ventajas y limitaciones de la elección tecnológica.

El listado debe estar estructurado y en formato claro, listo para documentación técnica.

**Prompt 3:**
Crea un diagrama de arquitectura para Stacklio en formato Mermaid. Incluye los siguientes componentes:

- Frontend: React + Vite + TailwindCSS + shadcn
- Backend: Node.js + Express
- Base de datos: PostgreSQL + Prisma
- Autenticación: JWT

Explica brevemente:

1. El flujo de comunicación entre frontend y backend.
2. Qué patrón de arquitectura se sigue (monolito) y por qué se eligió para el MVP.
3. Los beneficios principales de esta arquitectura.
4. Los sacrificios o limitaciones de esta elección.
5. Resalta que las imágenes de las herramientas no se almacenan en la base de datos, solo se guarda la URL de los iconos.

Genera el resultado en Markdown listo para documentación técnica, incluyendo el diagrama Mermaid.

### **2.2. Descripción de componentes principales:**

**Prompt 1: Identificación de componentes** 
Enumera los componentes principales de Stacklio, indicando claramente cuáles son las partes de frontend, backend y base de datos. Considera las funcionalidades clave: gestión de stack, portfolio de proyectos, perfil de usuario y autenticación JWT. Pregunta si existen otros componentes que deban destacarse para un MVP.

**Prompt 2: Tecnologías y responsabilidades**
Para cada componente principal identificado en Stacklio, describe las tecnologías utilizadas, su propósito y responsabilidad dentro del sistema. Explica cómo interactúa con otros componentes y cómo soporta tanto usuarios registrados como no registrados.

**Prompt 3:**
Genera un diagrama en formato Mermaid mostrando los componentes principales de Stacklio: gestión del stack, portfolio de proyectos, perfil de usuario, autenticación JWT, y la base de datos. Incluye relaciones y flujo de datos entre ellos, de manera que se entienda cómo interactúan los usuarios registrados y los no registrados con las funcionalidades del sistema.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
Genera la estructura de ficheros del proyecto Stacklio para el MVP, separando frontend, backend y configuración de la base de datos. Indica las carpetas y archivos principales, incluyendo componentes, páginas, estilos, controladores, rutas y modelos. El listado debe estar organizado de manera jerárquica y listo para Markdown.

**Prompt 2:**
Para cada carpeta y archivo principal en la estructura de Stacklio, describe brevemente su propósito y responsabilidad dentro del proyecto. Incluye cómo se conecta con otros componentes y cómo soporta tanto usuarios registrados como no registrados.

**Prompt 3:**
Explica qué patrón o arquitectura sigue el proyecto Stacklio (por ejemplo, monolito con separación lógica de frontend y backend), y justifica por qué se eligió esta organización para el MVP. Incluye ventajas y limitaciones de este enfoque.

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
Genera un diagrama de infraestructura para Stacklio en formato Mermaid, mostrando los componentes principales: frontend (React + Vite + TailwindCSS + shadcn), backend (Node.js + Express), base de datos (PostgreSQL + Prisma), autenticación JWT y usuarios. Muestra cómo interactúan entre sí y el flujo de datos para usuarios registrados y no registrados.

**Prompt 2:**
Describe el flujo de despliegue del proyecto Stacklio para un MVP, incluyendo cómo se publica el frontend, el backend y la base de datos. Incluye recomendaciones para entornos gratuitos, pasos de configuración y consideraciones de seguridad básicas.

**Prompt 3:**
Explica las ventajas y limitaciones de la infraestructura propuesta para Stacklio, considerando que es un MVP desplegado con servicios gratuitos. Incluye escalabilidad, mantenimiento, facilidad de actualización y posibles mejoras futuras.

### **2.5. Seguridad**

**Prompt 1:**
Actúa como un especialista brillante en seguridad web con experiencia en aplicaciones Node.js y React. Considerando el proyecto Stacklio (React + Vite + TailwindCSS + shadcn en frontend; Node.js + Express + PostgreSQL + Prisma en backend; JWT para autenticación), enumera y describe prácticas básicas de seguridad relacionadas con **autenticación y autorización**, incluyendo ejemplos de implementación sencilla. La salida debe ser en Markdown lista para documentación técnica.

**Prompt 2:**
Actúa como un experto en ciberseguridad con experiencia en aplicaciones web fullstack. Para Stacklio, describe medidas fáciles y básicas para proteger la información de los usuarios y la comunicación entre frontend y backend, incluyendo el manejo de contraseñas, variables de entorno y uso de HTTPS. La salida debe estar en Markdown y con ejemplos si es posible.

**Prompt 3:**
Actúa como un desarrollador frontend senior especializado en React y buenas prácticas de UI/UX con conocimientos de seguridad web. Enumera medidas de seguridad básicas para el frontend de Stacklio: validación de entradas, manejo de tokens JWT en el cliente, prevención de ataques XSS y protección de datos visibles en la UI. La salida debe estar en Markdown lista para documentación técnica.


### **2.6. Tests**

**Prompt 1:**
Actúa como un experto en testing de aplicaciones web fullstack con experiencia en React, Node.js y Express. Considerando que Stacklio es un MVP, describe qué tipos de tests serían más útiles para garantizar la funcionalidad básica del sistema, incluyendo frontend, backend y base de datos, priorizando rapidez y eficiencia.

**Prompt 2:**
Actúa como un especialista en testing de frontend con experiencia en React y TailwindCSS. Para Stacklio, sugiere tests unitarios y de integración simples que verifiquen el correcto funcionamiento de los componentes clave: cajas del stack, portfolio de proyectos y perfil de usuario. Incluye ejemplos breves de librerías recomendadas y alcance de cada test.

**Prompt 3:**
Actúa como un especialista en testing de backend con experiencia en Node.js, Express y PostgreSQL (Prisma). Para Stacklio, describe tests unitarios y de integración recomendados para rutas, controladores y modelos de datos, incluyendo autenticación JWT. Explica qué endpoints y casos críticos deberían probarse en un MVP.


**Justificación**: Los prompts en esta sección sirvieron para identificar los componentes principales (frontend, backend, base de datos), tecnologías utilizadas y relaciones entre ellos. También se generaron diagramas Mermaid de arquitectura y componentes, lo que permite visualizar el flujo de datos y la interacción entre usuarios registrados y no registrados. Esto justifica decisiones técnicas y proporciona un blueprint para el desarrollo del MVP.

---

### 3. Modelo de Datos

**Prompt 1:**
Actúa como un experto en bases de datos y desarrollo backend. Genera un diagrama del modelo de datos de Stacklio en formato Mermaid, incluyendo todas las entidades principales (Usuario, Caja, Herramienta, Proyecto, Favorito) con sus atributos, claves primarias y foráneas, tipos de datos y relaciones entre ellas. Indica cardinalidad y restricciones (unique, not null) cuando sea relevante.

**Prompt 2:**
Actúa como un especialista en bases de datos relacionales con experiencia en documentación técnica. Describe en detalle cada entidad del modelo de datos de Stacklio, incluyendo nombre de atributo, tipo, descripción breve, claves primarias y foráneas, relaciones, restricciones (unique, not null), y si hay relaciones opcionales o obligatorias. Formatea la salida en Markdown lista para documentación técnica.

**Prompt 3:**
Actúa como un especialista brillante en diseño de sistemas y diagramas Mermaid. Genera un diagrama de flujo que muestre la **interacción de usuarios registrados y no registrados** con las funcionalidades principales de Stacklio: gestión de stack, portfolio de proyectos, perfil público y favoritos. Incluye:

- Usuarios no registrados: qué pueden ver y qué acciones no pueden realizar.
- Usuarios registrados: acceso completo a todas las funcionalidades y opciones de compartir.
- Flujo claro entre usuarios y módulos, usando Mermaid flowchart.
- Etiquetas y relaciones claras para que el diagrama sea comprensible en documentación técnica.

Entrega el diagrama listo para Markdown.

**Justificación**: Se usaron prompts para diseñar y documentar el modelo de datos completo, incluyendo entidades, atributos, relaciones, claves primarias/foráneas y restricciones. Los prompts aseguraron que el diagrama y la descripción técnica estuvieran bien estructurados, listos para implementar con Prisma y PostgreSQL. También permiten entender la interacción entre módulos y usuarios en un nivel de detalle relacional.

---

### 4. Especificación de la API

**Prompt 1:** (Endpoints principales)
Actúa como un especialista brillante en desarrollo de backend con experiencia en Node.js y Express. Genera un listado de los **endpoints REST principales** para Stacklio, incluyendo usuarios, herramientas, cajas, proyectos y favoritos. Para cada endpoint indica: método HTTP, ruta, descripción y parámetros importantes, incluyendo JWT cuando sea necesario. Asegúrate de cubrir tanto usuarios registrados como no registrados, y considera funcionalidades clave del MVP.

**Prompt 2:** (Ejemplos de request y response)
Genera **ejemplos de request y response** para los endpoints más importantes de Stacklio. Incluye al menos: login de usuario, creación de herramienta y marcado de favorita. Asegúrate de mostrar cómo se incluye el token JWT en requests que lo requieren y usa datos coherentes con el modelo de datos definido.

**Prompt 3:** (Documentación OpenAPI)
Redacta un **resumen de la especificación OpenAPI** para los 3 endpoints principales de Stacklio: login de usuario, listado de herramientas y creación de proyecto. Incluye método, ruta, parámetros, request body, response body y códigos de estado. Formatea la salida en Markdown lista para documentación técnica.

**Justificación**: Los prompts fueron clave para definir los endpoints REST principales, ejemplos de request/response y un resumen OpenAPI en Markdown. Esto proporciona una documentación coherente y lista para que el frontend consuma la API, incluyendo manejo de JWT, parámetros importantes y validaciones, justificando el uso de asistencia para generar un estándar técnico consistente y verificable.

---

### 5. Historias de Usuario

**Prompt 1: Gestión de Stack**
Actúa como un especialista en UX/Product Management. Redacta una historia de usuario para la funcionalidad de **gestión de stack en Stacklio**, incluyendo título, rol del usuario, acción deseada, beneficio esperado, criterios de aceptación claros y notas adicionales. Enfócate en la experiencia de añadir, organizar y visualizar herramientas en cajas personalizables, incluyendo drag & drop y marcación de favoritas. En formato tabla markdown.

**Prompt 2: Portfolio de Proyectos**
Actúa como un Product Manager. Redacta una historia de usuario para la funcionalidad de **portfolio de proyectos en Stacklio**, incluyendo título, rol, acción, beneficio, criterios de aceptación y notas. Considera la creación, edición, visualización de proyectos y el estado de los mismos. En formato tabla markdown.

**Prompt 3: Perfil público y red social**
Actúa como especialista en UX y redes sociales profesionales. Redacta una historia de usuario para la funcionalidad de **perfil público y compartición de stack/proyectos** en Stacklio, incluyendo título, rol, acción, beneficio, criterios de aceptación y notas. Considera la visibilidad del perfil, URL pública y compartición en redes sociales. En formato tabla markdown.

**Justificación**: Se emplearon prompts para redactar historias de usuario con criterios de aceptación claros y notas adicionales. Esto asegura que el desarrollo esté alineado con las necesidades reales del usuario y prioriza funcionalidades críticas del MVP. La salida en tablas Markdown facilita su uso en planificación de tareas, sprints y documentación ágil.

---

### 6. Tickets de Trabajo

**Prompt 1: Backend**
Actúa como desarrollador backend senior con experiencia en Node.js, Express y PostgreSQL. Crea un ticket de trabajo detallado para implementar la funcionalidad de gestión de herramientas en el stack de Stacklio. Incluye título, descripción, tipo, tareas técnicas, criterios de aceptación y notas adicionales.

**Prompt 2: Frontend**
Actúa como desarrollador frontend senior especializado en React, TailwindCSS y shadcn. Crea un ticket de trabajo detallado para implementar la interfaz de gestión de portfolio de proyectos de Stacklio. Incluye título, descripción, tipo, tareas técnicas, criterios de aceptación y notas adicionales.

**Prompt 3: Base de datos**
Actúa como especialista en bases de datos con experiencia en PostgreSQL y Prisma. Crea un ticket de trabajo detallado para definir y migrar el modelo de datos de Stacklio, incluyendo usuarios, cajas, herramientas, proyectos y favoritos. Incluye título, descripción, tipo, tareas técnicas, criterios de aceptación y notas adicionales.

**Justificación**: Los prompts permitieron generar tickets de trabajo detallados por área (backend, frontend, base de datos), incluyendo tareas técnicas, criterios de aceptación y notas adicionales. Esto ayuda a estructurar el trabajo del equipo, asignar responsabilidades y asegurar que las tareas sean replicables y rastreables desde la planificación hasta la implementación.

---

### 7. Pull Requests

**Prompt 1:**
Actúa como desarrollador backend senior. Documenta una Pull Request para Stacklio que implemente los endpoints REST de gestión de herramientas, incluyendo CRUD y autenticación JWT. Indica título, descripción, autor, fecha, cambios principales, criterios de aceptación y notas adicionales.

**Prompt 2:**
Actúa como desarrollador frontend senior. Documenta una Pull Request para Stacklio que implemente la interfaz React del portfolio de proyectos, incluyendo formularios de creación/edición, listado de proyectos, consumo de API y validaciones. Incluye título, descripción, autor, fecha, cambios principales, criterios de aceptación y notas adicionales.

**Prompt 3:**
Actúa como especialista en bases de datos con experiencia en Prisma y PostgreSQL. Documenta una Pull Request para Stacklio que implemente el modelo de datos completo del MVP, incluyendo User, Box, Tool, Project y Favorite, con migraciones, relaciones y seed. Indica título, descripción, autor, fecha, cambios principales, criterios de aceptación y notas adicionales.

**Justificación**: Se documentaron PRs principales usando prompts, detallando cambios, autoría, criterios de aceptación y notas técnicas. Esto justifica el uso de IA para mantener un historial claro y estructurado de los desarrollos y refactorizaciones durante la construcción del MVP, asegurando trazabilidad y facilitando revisiones de código.

---
### 8. Adicionales - Prompts para el apartado 8. Visión General del Proyecto – MVP Stacklio
**Prompt 1: Checklist Detallado por Áreas**

Actúa como especialista en gestión de proyectos de software para MVPs. Crea un checklist detallado de tareas necesarias para desarrollar el MVP de Stacklio, dividiendo las tareas por áreas: Frontend, Backend, Base de Datos, DevOps/Infraestructura y Testing. 
Cada tarea debe ser específica, práctica y orientada a acción, de manera que un equipo pueda marcarla como completada. Incluye sub-tareas y menciona tecnologías clave (React, Vite, TailwindCSS, shadcn, Node.js, Express, PostgreSQL, Prisma, JWT). 
Devuelve la salida en Markdown con casillas de verificación.

**Prompt 2: Roadmap / Gantt del MVP**
Actúa como especialista en planificación de proyectos de software. Genera un diagrama de Gantt en formato Mermaid para el roadmap del MVP de Stacklio. Incluye todas las tareas principales de Frontend, Backend, Base de Datos, DevOps/Infraestructura y Testing, con fechas estimadas desde hoy hasta el 12 de octubre. 
Asegúrate de abreviar nombres si son demasiado largos y mantener el diagrama legible en Markdown. Devuelve la salida lista para copiar y pegar.

**Prompt 3: Diagrama de Secuencia – Usuario Registrado**
Actúa como especialista en análisis de sistemas. Crea un diagrama de secuencia en Mermaid que muestre la interacción de un usuario registrado con Stacklio. Incluye actores: Usuario Registrado, Frontend, Backend y Base de Datos (PostgreSQL + Prisma). 
Muestra el flujo de login, gestión de stack, proyectos y favoritos, incluyendo la interacción con los endpoints REST y la base de datos. Devuelve la salida en formato Markdown.

**Prompt 4: Diagrama de Secuencia – Usuario No Registrado**
Actúa como especialista en UX y análisis de sistemas. Crea un diagrama de secuencia en Mermaid que muestre la experiencia de un usuario no registrado en Stacklio. Incluye actores: Usuario No Registrado, Frontend, Backend y Base de Datos (PostgreSQL + Prisma). 
Muestra cómo interactúa con la vista de prueba del stack y proyectos, cómo se solicitan datos de prueba, y cómo se le solicita registro cuando intenta acciones que requieren autenticación. Devuelve la salida en Markdown.

**Prompt 5: Diagrama de Arquitectura de Alto Nivel**
Actúa como arquitecto de software para un MVP web. Genera un diagrama de arquitectura de alto nivel en Mermaid para Stacklio. Incluye: Frontend (React + Vite + TailwindCSS + shadcn), Backend (Node.js + Express con JWT Auth), Base de Datos (PostgreSQL + Prisma). 
Muestra las conexiones entre frontend, backend y base de datos, indicando el flujo de datos (REST API, CRUD, autenticación). Devuelve la salida lista en Markdown.

**Justificación**: Los prompts ayudaron a generar un checklist completo por área, diagramas de secuencia para usuarios registrados y no registrados, un diagrama de arquitectura de alto nivel y un roadmap Gantt en Mermaid. Esto permite tener una visión clara del flujo de trabajo, dependencias y tareas a completar para entregar un MVP funcional, asegurando coordinación y planificación efectiva del proyecto.