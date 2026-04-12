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

Soy un apasionado de los árboles y quiero desarrollar un proyecto web para almacenar las fotografías que les tomo junto con la ubicación en la que están. El sistema permitirá almacenar datos y fotografías de árboles, posicionar en un mapa (mediante API de terceros) su ubicación y compartir la información de forma pública. También contará con un módulo de notificaciones de novedades y una interacción con ChatGPT: tanto para identificar el árbol a partir de las fotografías como para interactuar en modo chat. La tecnología a usar debe ser Microservicios con Spring Boot en la parte back y Vue. El proyecto va a seguir todas las buenas prácticas de la ingeniería de software. En este momento estoy abordando la fase inicial para definir las características del producto y planificar adecuadamente. Te voy a pedir que me proporciones una descripción breve que permita entender y poner en valor el proyecto; antes de generarla confírmame si has entendido el objetivo y el contexto; pregúntame cualquier aclaración que necesites para elaborar dicha descripción y mejorar mi idea.

1.- el público objetivo será el aficionado general 
2.- un enfoque predominante de catalogación personal pero abierto a una comunidad colaborativa 
3.- la identificación con IA es una importante ayuda orientativa, aunque no una funcionalidad central 
4.- quiero que el proyecto se perciba como  memoria/localización de árboles singulares añadiendo la componente de disfrute como hobby 
5.- El sistema público permitirá consulta sin registrarse 
6.- El nombre pensado es "My Tree Library"


**Prompt 2:**

Actúa como un Product Manager con experiencia en aplicaciones web colaborativas y defíneme las las características y funcionalidades específicas que debe tener el producto para satisfacer las necesidades identificadas. Se conciso, céntrate en los puntos más importantes a incluir en un MVP. Pregúntame cualquier duda antes de empezar.

1.- quiero contemplar 3 roles: administrador, colaborador (con posibilidad de añadir y editar) y público (sin necesidad de identificación). Los dos primeros deben estar dados de alta en el sistema. 
2.- La publicación por parte del colaborador será directa en el sistema; el administrador tiene potestad para que las fotografías subidas por los colaboradores dejen de estar accesibles al publico general e incluso borrarlas. El usuario público puede apuntarse para recibir notificaciones sin necesidad de estar logado,

**Prompt 3:**

Actúa como un analista de negocio experto y define el modelo de casos de uso del sistema. El modelo debe ajustarse a la descripción del sistema dada en @readme.md y a estas indicaciones:
---
Usuarios: 
Debe haber 3 tipos de usuario: Administrador, Colaborador y Público. 
---
Casos de uso:
Deben modelarse estos casos: 
- Usuario público: puede consultar y registrarse para recibir notificaciones - 
- Colaborador: además de los casos de uso públicos, puede dar del alta árboles o modificar los que ha registrado él; como punto de extensión está la consulta a la IA para identificar un árbol; puede consultar a la IA vía chat. 
- Administrador: puede realizar las tareas de los usuarios anteriores y Gestionar las tablas de catálogo; puede modificar las solicitudes de notificación dejándolas inactivas o borrándolas. 
- Además el sistema debe mandar notificaciones por mail a los usuarios registrados cuando se produzca una alta/modificación
---
Restricciones
Para los casos de uso de Colaborador y Administrador se requiere estar autenticado
Emplea las buenas practicas de modelado de casos de uso y genera un archivo en planUML y una tabla resumen para incluir en formato md.
Si tienes alguna duda, pregúntame antes de seguir con el proceso.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Tengo que diseñar una arquitectura de microservcicos para implementar el sistema descrito en los puntos 1 y 2 del documento @readme.md Las tecnologías base a emplear son Spring Boot en su última versión para el back end y Vue 3 para el front. La autenticación se hará mediante JWT empleadno keycloak para la generación del token. El sistema empleará kafka para las comunicaciones asincronas (en el alta se publica un evento que consumirá el microservicio de notificaciones) El modelo de datos se debe implementar en PostgreSQL (para la parte transaccional pura) y Mongopara. El almacenamiento de los ficheros imagen mediante APSI compatible con S3, para el desarrollo se usará MinIO. Para la cache se empleará Redis. El sistema debe cumplir con altos estándares de calidad y seguir loa patrones y buenas practicas del desaarrollo de software. Actua como un experto arquitecto de sofware y define la arquitectura del sistema; antes de proceder consultame cualquier duda que tengas.

**Prompt 2:**

Actúa como un arquitecto de datos con gran experiencia y define el modelo conceptual del sistema a partir de los casos de uso de y de la definición del sistema de los documentos . Al ser el modelo conceptual no hagas distinción sobre que entidad irá después en cada tipo de almacenamiento (PostgreSQL, Mongo, ...); quiero un modelo general del sistema completo.
---
Ten además en cuenta:
---
Entidades principales
- Arbol
- Especie (relación N:1 con arbol; un arbol tiene una especia; una especie puede estar en N arboles)
- Características/Observaciones (relación 1:N con arbol; un árbol tiene N características/Observaciones) podrá contener información no estructurada  
- Usuario de notificación
- Notificaciones (relacionada con usuario y arbol)
- Fotografías (relación 1:N con arbol; un árbol tiene N fotografías)
---
Requisitos
- se debe guardar auditoria de las altas/modificaciones del catálogo 
- el árbol debe estar bien identificado con especie; nombre científico y nombre común 
- se deben guardar las coordenadas de la ubicación del árbol 
- las imágenes subidas pueden tener 3 categorías: PUBLIC, PRIVATE y RESTRICTED; en el caso de PRIVATE solo la pueden ver el administrador y el usuario que la creó, las RESTRICTED también las pueden ver los colaboradores pero no el usuario sin logar 
- las notificaciones se mandan a usuarios que previamente se han registrado proporcionando su mail
- debe haber unas tablas de catálogo como ESPECIE, PROVINCIA solo la pueden ver el administrador y e

Si tienes alguna duda consultamela antes de continuar con el proceso

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

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

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

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
