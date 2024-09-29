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

**Prompt 1:** ¿Cómo estás? Bueno, mira, imagínate que quiero crear un proyecto en el que conecten diferentes proveedores para organizar eventos. ¿Cuál es la idea de todo esto? Y es que la forma en que el rol organizador va a desarrollar un evento, llámese un cumpleaños, un planning, un wedding, lleva trabajo. Y, sobre todo, conectar con los mejores proveedores también lleva trabajo. Entonces, queremos, quiero desarrollar una plataforma que permita conectar esos proveedores, ese rol proveedor con ese rol organizador, con ese rol cliente. Pero no funcionando como un marketplace, no solamente funcionando como marketplace, sino que también pueda funcionar que la pregunta que se le haga a los proveedores sea tan detallada, mostrando su servicio, para que la IA ya se saque. El conocer de los proveedores es como si hiciéramos agentes proveedores, porque el organizador va a estar hablando con la empresa, entre comillas, o, perdón, va a estar hablando con el proveedor con inteligencia artificial, pero son agentes creados de proveedores.

**Prompt 2:** Funcionalidades que quisieras implementar para que los agentes proveedores esperando que la interfaz gráfica cuando se va a sumar un proveedor, es que podamos hacerle las preguntas y entrevistas correctas para determinar la calidad de servicio y los productos o servicios que ellos ofrecen. A su vez, que tengan una capacidad de llevar un inventario correcto, de tal manera que una vez que ellos dispongan su talento, su servicio, sus productos, el sistema tenga la capacidad de tomar el inventario de ahí. Y eso sería una plataforma para manejar sus inventarios y sus servicios.

**Prompt 3:** Sí, y ahora vamos a pensar un poco cuál sería el nombre ideal para este proyecto. Bueno, al final de cuentas, de todo este ejercicio que estamos haciendo, una vez que ya conozcamos los proveedores y que también el rol organizador se encargue de escribir el requerimiento para que con el uso de la Inteligencia Artificial también podamos separar, para poder mandar el request también a los proveedores. Entonces, ahí también implementamos Inteligencia Artificial para interpretar el requerimiento del evento. Ahora, después de que ya tenemos el rol proveedor, el rol organizador, más adelante podemos construir un agente organizador en el que se haya aprendido la forma como los organizadores organizan los eventos y en un futuro automatizar toda la cadena de creación del evento. De principio a fin, hacerle seguimiento, escoger los proveedores adecuados de acuerdo a la locación, a la disponibilidad, a todo lo esencial para que se cumpla. Y los proveedores tienen que buscar las maneras de garantizar que el servicio que ofrezcan es de mucha calidad.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**


**Prompt 1:**
¿Podrías describir la arquitectura general de OrganIA? Piensa en los componentes principales, como el frontend, backend, base de datos, servicios externos, y si se sigue algún patrón específico (por ejemplo, arquitectura de microservicios, monolítica, etc.). ¿Cómo se relacionan entre sí estos componentes?

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
¿Qué tecnologías específicas estás usando en cada componente? (Por ejemplo: frontend con Vue.js, backend con Node.js, base de datos en Firestore, etc.). Describe brevemente el propósito de cada uno de estos componentes.


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
"¿Cuáles son las mejores prácticas de seguridad que se deben implementar en OrganIA para garantizar la protección de los datos de los usuarios y los proveedores?"

**Prompt 2:**
"¿Qué mecanismos de autenticación y autorización podrías recomendar para los servicios de OrganIA, considerando que se maneja información sensible de los proveedores y clientes?"

**Prompt 3:**
"¿Podrías describir algunas de las vulnerabilidades comunes que podrían afectar a OrganIA y cómo se pueden mitigar usando herramientas de seguridad o configuraciones específicas?"

### **2.6. Tests**

**Prompt 1:**
"¿Qué tipos de pruebas recomendarías para asegurar la calidad del software de OrganIA, incluyendo pruebas unitarias, de integración y de aceptación?"

**Prompt 2:**
"¿Podrías proporcionar una lista de las principales herramientas de testing que se podrían usar en OrganIA, y cómo se pueden integrar en el pipeline de CI/CD?"

**Prompt 3:**
"¿Cómo deberíamos realizar pruebas automatizadas para la funcionalidad de los agentes de IA en OrganIA, asegurándonos de que se comportan correctamente en distintas situaciones?"


---

### 3. Modelo de Datos

**Prompt 1:**
"¿Podrías describir las principales entidades que forman parte del modelo de datos de OrganIA? Piensa en las entidades más importantes, como proveedores, organizadores, eventos, etc."

**Prompt 2:**
"Describe cada entidad, incluyendo sus atributos y sus relaciones con otras entidades. Por ejemplo: un Evento tiene atributos como fecha, ubicación, tipo de evento, y se relaciona con Proveedores (uno a muchos) y con un Organizador (uno a uno)."

**Prompt 3:**
"¿Podrías proporcionar un diagrama del modelo de datos para OrganIA utilizando mermaid u otra herramienta de diagramación? Asegúrate de incluir las claves primarias y foráneas."


---

### 4. Especificación de la API

**Prompt 1:**
"¿Podrías describir tres endpoints principales de la API de OrganIA? Por ejemplo, podríamos definir un endpoint para la creación de eventos, otro para listar proveedores disponibles y uno más para realizar solicitudes de servicio."

**Prompt 2:**
"Si tienes algún ejemplo de cómo se vería una petición (JSON) a alguno de estos endpoints, sería útil incluirlo para mayor claridad."

**Prompt 3:**
"¿Podrías proporcionar una especificación OpenAPI para los endpoints más importantes de OrganIA, incluyendo ejemplos de peticiones y respuestas?"


---

### 5. Historias de Usuario

**Prompt 1:**
"Documentar 3 Historias de Usuario principales que aborden aspectos fundamentales de OrganIA. Cada historia debería expresar quién es el usuario, qué quiere lograr, y para qué propósito. Por ejemplo: 'Como organizador, quiero poder buscar proveedores disponibles para una fecha específica, de modo que pueda planificar el evento con tiempo.'"

**Prompt 2:**
"¿Podrías detallar cómo cada historia de usuario puede ser evaluada como cumplida? Especifica criterios de aceptación para cada historia."

**Prompt 3:**
"¿Qué mejoras propondrías a las historias de usuario actuales de OrganIA para hacerlas más completas o detalladas?"


---

### 6. Tickets de Trabajo

**Prompt 1:**
"Documentar 3 Tickets de Trabajo Principales. Debemos incluir al menos uno para cada área (backend, frontend, y base de datos). Cada ticket debería tener una descripción clara de lo que se necesita hacer, las tareas específicas a realizar, y cualquier detalle adicional importante para garantizar el desarrollo efectivo."

**Prompt 2:**
"¿Podrías definir un ticket de trabajo detallado para implementar la integración con un proveedor de pagos, como Stripe, en OrganIA?"

**Prompt 3:**
"¿Cuáles son los criterios de aceptación y pruebas que deberían acompañar cada ticket de trabajo de OrganIA para asegurar su calidad?"


---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
