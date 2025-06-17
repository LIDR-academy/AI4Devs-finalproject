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

> ### Diseño de solución TaskDistributor
>
> #### Contexto inicial
>
> Como **product manager** tu misión es diseñar y documentar un sistema de software siguiendo las fases de investigación y análisis, casos de uso, modelado de datos, y diseño de alto nivel.
>
> #### Definición del sistema
>
> El sistema a desarrollar es **TaskDistributor**.
>
> El objetivo y la especificación del proyecto está en el fichero @20250506-TaskDistributor-Funcional-v1.1.md 
>
> #### Entrega a realizar
>
> Tu **misión** es diseñar la primera versión del sistema, entregando los siguientes artefactos:
> - Descripción breve del software, valor añadido y ventajas competitivas. Explicación de las funciones principales. Añadir un diagrama Lean Canvas para entender el modelo de negocio.
> - Descripción de los casos de uso principales, con el diagrama asociado a cada uno (elige el diagrama que mejor se adapte a esto).
> - Modelo de datos que cubra entidades, atributos (nombre y tipo) y relaciones (elige el diagrama que mejor se adapte a esto).
> - Diseño del sistema a alto nivel, tanto explicado como diagrama adjunto (elige el diagrama que mejor se adapte).
>
> #### Premisas
>
> - Lo necesito todo en un único fichero, con formato de salida markdown.
> - Los **diagramas deben ser entregados como código**, para que puedan modificarse fácilmente en el futuro.
> - La información de los proyectos con los que trabajará el sistema saldrá de Redmine, a la que accederemos a través del API definido en @redmine-api-spec.yaml 
> - El sistema guardará la información necesaria para su gestión en una base de datos interna que es la que se solicita modelar.
> - Los datos que tiene una tarea de redmine los puedes obtener de @20250506-TaskDistributor-TareaRedmine-Campos.png 

**Prompt 2:**

**Prompt 3:**

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

**Prompt 2:**

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

## 3. Modelo de Datos

**Prompt 1:**

> ### Diseño del modelo de datos para TaskDistributor
>
> Ahora, como experto en modelado de bases de datos, vamos a diseñar el modelo de datos de TaskDistributor.
> Hay que tener en cuenta que no queremos duplicar la información que ya existe en la base de datos de redmine, solo queremos referencias a las tareas y completar estas con la información que no guarda redmine, como la priorización de las tareas, el factor de carga y la estimación de sprints.
> Además de esto, todo lo que consideres necesario.
> Define en base al contexto que ya tienes del proyecto, a la documentación @20250506-TaskDistributor-Funcional-v1.1.md  al prd @prd.md , a las historias de usuario @historiasUsuarioYBacklog.md  y a los tickets de trabajo disponibles en @ticketsTrabajo 

**Prompt 2:**

> ### Simplificación del modelo de datos para el MVP
>
> @modeloDatos.md Para simplificar, nos vamos a centrar únicamente en las tablas necesarias para el MVP. Para ello, elimina las tablas relacionadas con las alertas y la tabla de filtros personalizados.

**Prompt 3:**

> ### Implementación de la base de datos con PostgreSQL y Supabase
>
> Vamos a empezar con la implementación del proyecto.
> Ten en cuenta todo el contexto del proyecto.
> Vamos a centrarnos en la base de datos primero en base al modelo ya definido en la documentación@modeloDatos.md.
> Eres un experto en base de datos con experiencia en postgresql y en la plataforma supabase, que es la que vamos a utilizar.
> Vamos a utilizar el ORM Prisma.
> Sugiere la creación de índices para obtener el mejor rendimiento.
> Indícame los pasos a seguir para levantar la base de datos utilizando Prisma.
> La base de datos debe estar normalizada y cumplir todos los estándares de la industría.
> Antes de hacer nada, hazme todas las preguntas y sugerencias que consideres necesarias.
>
> Te respondo a las preguntas:
> 1.- Si, utilizaré el sistema de autenticación de supabase.
> 2.- No. No vamos a utilizar RLS.
> 3.- El volumen será pequeño, no lo tengas en cuenta de momento.
> 4.- La sincronización con Redmine se realizará de forma manual.
> 5.- Empezamos desde cero. No hay datos iniciales.
> En relación al particionamiento, me gustaría aprender a utilizarlo, con lo que hazlo para la tabla HistorialEstimation, tal como estás sugiriendo.
>
> Crea ya los primeros ficheros necesarios.

---

### 4. Especificación de la API

**Prompt 1:**

> ### Configuración inicial del backend con Express y Prisma
>
> Eres un experto en desarrollo backend, especializado en el framework express.
> Vamos a crear la estructura inicial del proyecto backend y a meterla en la carpeta backend disponible.
> El backend se conectará a una base de datos postgresql utilizando el orm prisma.
> El backend será documentado utilizando swagger.
> El backend tendrá seguridad por jwt.
> El backend utilizará buenas prácticas de desarrollo y de seguridad.
> Además añade cualquier característica que consideres necesaria.
> Utiliza todo el contexto del proyecto para tener conocimiento de lo que vamos a crear.
> No crees ningún endpoint todavía, solo la estructura inicial. Vamos a ir paso a paso.

**Prompt 2:**

> ### Creación de servicio para interactuar con Redmine
>
> Ahora vamos a crear un servicio genérico en el backend para interactuar con redmine.
> Sigue la especificación del api de redmine @redmine-api-spec.yaml 
> Crea todos los métodos que creas necesarios para interactuar con las tareas de acuerdo a la especificación del proyecto@prd.md .
> Crea los endpoints necesarios para probar el servicio completo.

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

> ### Plantilla de una historia de usuario 
>
> Una estructura clásica de User Story podría ser:
>
> #### Título de la Historia de Usuario: 
>
> **Como** [rol del usuario],  
> **quiero** [acción que desea realizar el usuario],  
> **para que** [beneficio que espera obtener el usuario].
>
> #### Criterios de Aceptación:
>
> - [Detalle específico de funcionalidad]
> - [Detalle específico de funcionalidad]
> - [Detalle específico de funcionalidad]
>
> #### Notas Adicionales:
>
> - [Cualquier consideración adicional]
>
> #### Historias de Usuario Relacionadas:
>
> - [Relaciones con otras historias de usuario]
>
> #### Tareas
>
> - [Lista de tareas y subtareas para que esta historia pueda ser completada]
>
> ### Estimación
>
> Estima por cada item en el backlog (genera una tabla markdown):
>
> | Item | Impacto en usuario/negocio | Urgencia | Complejidad/Esfuerzo | Riesgos/Dependencias |
> |------|----------------------------|----------|----------------------|----------------------|
> |      |                            |          |                      |                      |
>
> Genera un fichero de rules con esta plantilla.

**Prompt 2:**

> ### Tu misión es preparar la documentación necesaria para empezar a implementar el sistema TaskDistributor
>
> Especificado en el fichero @20250506-TaskDistributor-Funcional-v1.1.md cuyo PRD está definido en @prd.md 
>
> #### Generar las User Stories
> 
> Implementa todas las user stories posibles.  
> Utiliza la plantilla @historias-usuario-plantilla.md 
>
> #### Arma el Backlog de producto con las User Stories
>
> Priorízalas como consideres conveniente acorde a alguna metodología concreta.
>
> Itera todas las veces que consideres necesario para ofrecer el mejor resultado posible.

**Prompt 3:**

> ### Modificación de Historias de Usuario existentes, reorganización y renumeración
>
> La US-03 y la US-04 deben integrarse dentro de las US-01 y la US-02, es decir, no existe una historia de usuario específica para asignar un responsable o para asignar un funcional a una tarea, sino que debe ser uno de los campos a informar en la creación y la edición de la tarea.
>
> Para la historia US-06, además de la estimación en sprints, tendremos que tener en cuenta el factor de carga de trabajo de la tarea. Además, tendremos que crear este campo en Redmine, porque actualmente no existe.
>
> La US-07 y la US-09 deben fusionarse en una única tarea ya que el objetivo de asignar un equipo y planificar fecha están relacionados.
>
> La tarea US-19 no es necesaria.
>
> La tarea US-20 hay que modificarla para indicar que el sistema deberá integrarse con las aplicaciones de la compañía siguiendo el sistema de seguridad disponible.
>
>Ahora vamos a ordenar bien las historias de usuario.
> 
> Hay historias de usuario relacionadas con gestión de tareas, gestión de planificación, gestión de visualización, gestión de kpis y gestión de alertas.
> 
> Ordénalas según la pertenencia a cada uno de los grupos anteriores, para que todas las tareas de cada grupo aparezcan unas detrás de otras y no se mezclen con las del siguiente grupo.
> 
> Después renombra las tareas para que sean correlativas y no nos saletemos ningún número, es decir, US-01, US-02, US-03, ...
> 
> Por último, actualiza el backlog priorizado del final para que sea consecuente con los cambios aplicados anteriormente.
>
> Realiza todos los cambios indicados en el fichero @historiasUsuarioYBacklog.md 

---

### 6. Tickets de Trabajo

**Prompt 1:**

> ### Ejemplo de un Ticket de trabajo bien formulado
>
> Un ticket de trabajo bien estructurado es crucial para la gestión eficiente de proyectos Agile. Debe proporcionar toda la información necesaria de manera clara y accesible para facilitar la ejecución de las tareas y la colaboración entre los miembros del equipo. Aquí te mostramos un ejemplo que puedes usar como referencia, e incluso usar como plantilla en tu asistente IA para estructurar la información de una manera estándar para tus proyectos:
>
> #### Título: Implementación de Autenticación de Dos Factores (2FA)
>
> **Descripción**: Añadir autenticación de dos factores para mejorar la seguridad del login de usuarios. Debe soportar aplicaciones de autenticación como Authenticator y mensajes SMS.
>
> **Criterios de Aceptación**:
> - Los usuarios pueden seleccionar 2FA desde su perfil.
> - Soporte para Google Authenticator y SMS.
> - Los usuarios deben confirmar el dispositivo 2FA durante la configuración.
>
> **Prioridad**: Alta
>
> **Estimación**: 8 puntos de historia
>
> **Asignado a**: Equipo de Backend
>
> **Etiquetas**: Seguridad, Backend, Sprint 10
>
> **Comentarios**: Verificar la compatibilidad con la base de usuarios internacionales para el envío de SMS.
>
> **Enlaces**: Documento de Especificación de Requerimientos de Seguridad
>
> **Historial de Cambios**:
>
> Genera un fichero de rules con esta plantilla de ticket de trabajo.

**Prompt 2:**

> ### Creación de tickets para historias de usuario específicas
>
> @historiasUsuarioYBacklog.md Ahora vamos a crear los tickets de las historias de usuario US-08, US-10 y US-11.
> 
> Para ello utiliza la plantilla definida en @tickets-trabajo-plantilla.md y genera un fichero para cada historia de usuario similar a los existentes en la carpeta @ticketsTrabajo

**Prompt 3:**

> ### Refinamiento y eliminación de tickets duplicados
>
> @ticketsTrabajo-US-08.md El ticket US-08-03 es similar al ticket Ticket US-03-01 disponible en @ticketsTrabajo-US-03.md.
> 
> Nos vamos a quedar con el de la historia US-03, ya que es más específico y está relacionado con la planificación.

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
