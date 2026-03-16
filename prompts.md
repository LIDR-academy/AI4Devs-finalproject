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
Modelo: GPT-5
---
Estoy realizando un curso en donde el foco es el uso de inteligencia artificial en todo el ciclo de vida del desarrollo de software.
Como proyecto final de curso, debemos realizar un proyecto de principio a fin, utilizando inteligencia artificial en cada paso del proceso, desde el punto de vista de que cada rol que tome en el proceso usará inteligencia artificial para desarrollar sus tareas y ser más eficiente. No se exige el uso de inteligencia artificial para casos de uso del proyecto que se quiere realizar. De hecho, el proyecto a desarrollar no debería incluir features en las cuales intervenga la inteligencia artificial. 
Para la evaluación del proyecto por los profesores, el foco estará en el análisis de como hemos usado las herramientas de inteligencia artificial para desarrollarlo y no tanto en el contenido del proyecto. 
La dedicación de horas estimada para realizarlo es de 30 horas y se debe entregar un MVP desplegado en producción y accesible a través de una url pública.
Hay 3 entregas programadas y la primera es solo la documentación para lo cual debo completar el readme de este proyecto #file:readme.md  siguiendo esa estructura.
Lo que necesito de ti es que me ayudes a definir que proyecto realizar. Lo que más me cuesta es lograr un balance entre complejidad de implementación y utilidad real, es decir, que aporte valor al usuario. Esto es importante para definir el "producto mínimo viable". 
En base a esto, quiero que me propongas al menos 3 ideas de proyectos a realizar teniendo en cuento lo anterior. Definiendo el porqué de cada idea.

**Prompt 2:**  Modelo: GPT-5
---  
He elegido la idea número 2:
Idea 2: Marketplace de Servicios de Marca (Service Slots Hub) Por qué:

Muchas marcas ofrecen experiencias (consultoría de estilo, asesoría, workshops).
Menos fricción logística (no stock físico). MVP (In):
Landing + listado de servicios (title, short_desc, duration, base_price, available_slots).
Reserva de un slot (genera Booking pending).
Backoffice: crear servicios, definir slots (fecha/hora), aprobar / rechazar reservas.
Página pública “Mi Reserva” (status). Out: Pasarela pagos, cancelaciones automáticas, calendario externo. Modelo: Service, ServiceSlot, Booking, User, Role, AuditEntry. Valor: Demuestra modularidad futura (añadir módulo “productos físicos” luego).

sigue con el siguiente paso que mencionas "Siguiente paso sugerido: Responde con la idea elegida y preparo estructura rellenada de las secciones 1–3 + primeros endpoints + 3 historias de usuario + 3 tickets."
Añade como step donde hagas un análisis de mercado, con algunas hipótesis de porque es una buena idea que aporte valor a sus usuarios, incluyendo competidores si los hay quienes son los lideres del mercado y cualquier información que consideres determinante para el proyecto.

**Prompt 3:**  
Modelo: GPT-5
---
#### ROL
Eres un experto en productos de tecnología orientado a productos estilo marketplaces

#### TAREA
En base a tu investigación previa, tu tarea es crear un "Product Roadmap" que defina la visión y dirección del producto a instancias de creación del MVP. Detallando:

1. Scope y alcance del MVP.

2. Features que incluye.

3. Pasos lógicos para su implementación incluyendo todos los pasos para tener un sistema corriendo en un entorno real productivo.

4. Para organizar la información y el roadmap deberás definir Épicas, Historias de Usuario.

5. Siguientes pasos para la iteración y mejora continua del producto.

#### Template para historias de usuario

Título de la Historia de Usuario:  
Como [rol del usuario],  
quiero [acción que desea realizar el usuario],  
para que [beneficio que espera obtener el usuario].

Criterios de Aceptación:  
[Detalle específico de funcionalidad]  
[Detalle específico de funcionalidad]  
[Detalle específico de funcionalidad]

Notas Adicionales:
[Cualquier consideración adicional]

Historias de Usuario Relacionadas:
[Relaciones con otras historias de usuario]

#### Consideraciones

1. Hazme todas las preguntas que consideres necesarias para generar la mejor respuesta

2. En este punto, aún no se han tomado decisiones en cuanto a arquitectura de software, stack tecnológico ni proveedores externos. Tu respuesta debe ser agnóstica a estos detalles.

3. Una vez definidos aspectos relacionados a la implementación del producto a nivel de infrestructura y tecnología se desarrollarán los ticket de trabajo necesarios para los developers. Ignora este paso. 
---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
    ## ROL
    Eres un experto arquitecto de software 

    ## TAREA
    Tu tarea es armar una recomendación respecto a la arquitectura que mejor se adapte al proyecto/problema que queremos resolver de acuerdo a lo indicado en el archivo #file:Product-roadmap.md. 
    Ten en cuenta los siguientes requisitos:
    - El proyecto tendra un backend en springboot/kotlin y una aplicación frontend SPA en react
    - El backend tendrá integraciones con la api del calendar de google y api de envío de correos a cuentas de email
    - Como runtime se usará instancias EC2 de amazon  y un RDS de amazon tamibién como BBDD.
    - Se automatizará una pipeline de CI/CD.
    - Como base de datos se usara PostgreSql
    Hazme todas las preguntas que consideren necesarias para darme la mejor propuesta.

**Prompt 2:** 
    Eres un arquitecto de software experto y tu tarea es rellenar el archivo #file:readme.md  sobre el punto 2 
    ## 2. Arquitectura del Sistema

    ### **2.1. Diagrama de arquitectura:**
    > Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


    ### **2.2. Descripción de componentes principales:**

    > Describe los componentes más importantes, incluyendo la tecnología utilizada

    ### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

    > Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

    ### **2.4. Infraestructura y despliegue**

    > Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

    ### **2.5. Seguridad**

    > Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

    ### **2.6. Tests**

    > Describe brevemente algunos de los tests realizados

    teniendo en cuenta los archivos dentro de la carpeta #file:docs donde se define la arquitectura del proyecto y adrs

**Prompt 3:**
    en estas lineas de exto sobre testing quiero que separes la estrategia entre backend y frontend.
    Para backend se aran tests unitarios de los casos de uso, no de las entidades de dominio. Y se harán tests de aceptación de cada feature testeando el happy path.
    Para el frontend promonme una estrategía más orientada a una test suit the una applicación forntend.

### **2.2. Descripción de componentes principales:**

**Prompt 1:** Eres un analista de software experto. Estoy construyendo un proyecto cuyo product-roadmap es #file:Product-roadmap.md . Enumera y describe brevemente los casos de uso más importantes a implementar para lograr el mvp.
Genera un diagrama con los casos de uso. Elige tipo de diagrama que mejor se adapte a lo requerido.

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
    Eres un ingeniero de software experto y tu tarea es rellenar el archivo #file:readme.md  sobre el punto 3 
    ## 3. Modelo de Datos
    
    ### **3.1. Diagrama del modelo de datos:**
    
    > Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.
    
    
    ### **3.2. Descripción de entidades principales:**
    
    > Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.
    

    teniendo en cuenta los archivos dentro de la carpeta #file:docs  donde se define la arquitectura del proyecto y adrs

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**
     Eres un ingeniero de software experto y tu tarea es rellenar el archivo #file:readme.md  sobre el punto 4 
        ## 4. Especificación de la API

        > Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

    Se breve en la documentación. Busca claridad de concepto y minimiación de contenido en palabras

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**
     Eres un proyect manager y tu tarea es rellenar el archivo #file:readme.md   mesobre el punto 5 y las interias de usuario que hemos definido previamente en el fichero  #file:Product-roadmap.md 
        ## 5. Historias de Usuario

        > Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

        **Historia de Usuario 1**

        **Historia de Usuario 2**
            
        **Historia de Usuario 3**

    Se breve en la documentación. Busca claridad de concepto y minimiación de contenido en palabras

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**
    Como ingeniero de software y lider tecnico del equipo tu tarea es generar los tickets de trabajo necesarios para completar el proyecto MVP descripto en #file:Product-roadmap.md y segun las decisiones de arquitectura y modelo de datos y casos de uso definidos en la carpeta #file:docs . 

    Criterios de aceptación de tu respuesta:
    1. Buscar crear la menor cantidad de tickets de trabajo posible para llegar al resultado final.
    2. Aunque parezca contraintuitivo, el primer paso para todo será desarrollar la pipeline de CI/CD para comenzar a desarrollar con la capacidad de ir haciendo deploys incrementales y testeando en producción los avances que se realizan.
    3. Sigue las buenas practicas de escritura de tickets de trabajo.

    Añade los tickets de trabajo en un fichero dentro de la carpeta #file:docs 

    como último paso, completa el documento #file:readme.md  en el punto 6
        ## 6. Tickets de Trabajo

        > Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

        **Ticket 1**

        **Ticket 2**

        **Ticket 3**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
