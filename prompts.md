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

**Prompt 1: 
Necesito que me ayudes a armar y estructurar una idea. A partir de ahora, quiero que seas un asistente especializado en la generación de ideas creativas, ingeniosas e innovadoras, y que además sean sostenibles en el tiempo.

Existe una necesidad en nuestra sociedad actual, donde las personas requieren servicios de todo tipo a diario. En ocasiones, deben realizar búsquedas para encontrar el servicio que necesitan en ese momento. También deben trasladarse físicamente a los locales donde se prestan algunos servicios, enfrentando problemas con la calidad del servicio, además de la dificultad de contratar toda clase de servicios de manera rápida, confiable y segura. Cuando hablo de servicios, me refiero a una amplia gama que incluye peluquerías, spas, estética, masajes, plomería, electricidad, reparaciones del hogar, servicios profesionales especializados, servicios técnicos, entre otros. "No existen límites en cuanto a tipos o rubros específicos."

Problema: Existen personas que tienen un emprendimiento, pero no cuentan con el capital suficiente para arrendar un local, pagar publicidad, etc. La mayoría de estos emprendedores ofrece servicios, pero muy pocas personas los conocen. Quiero conectar a personas con personas.

**Prompt 2:
Busca un nombre que resuma la resolución de dos grandes problemáticas. Del lado de los clientes: tener un servicio de calidad, oportuno, preciso, efectivo, rápido y fácil de contratar, con garantía de seguridad y confianza.
Del lado del proveedor: impulsar a los emprendedores a que vendan más sus servicios y hagan sus negocios más rentables. Esto se traduce en un retorno directo en los impuestos que se recaudan, lo que a su vez permite que el país tenga más recursos para gestionar mejor.
Entonces, impacto en las personas como tú y yo (la mayoría) → acceso a mejores servicios.
Impacto en los emprendedores → aumento de sus ventas.
Impacto en el país → mayor recaudación y mejores soluciones para la comunidad en general.

Este proyecto es transversal e impacta en casi todas las esferas de la sociedad.
Por ello, quiero que me des tres propuestas de nombres para el proyecto, acorde a lo mencionado anteriormente.

También necesito elaborar una misión, visión, declaración como empresa, objetivos, etc.

**Prompt 3:
Definir el modelo de negocio basado en suscripciones, referidos , Publicidad Dirigida(destacado)

**Prompt 4:
Existen ideas de este tipo en el mundo?
Estoy en Latinoamerica, especificamente en Chile. Algun caso para la región o Pais?

**Promt 5:
Dame 5 nombre los mas creativos posibles para este producto de software, en funcion a la declaricón de identidad del proyecto
---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:
Ahora necesito que te convertas en arquitecto de software Senior, con expecializaciones en AWS.
Define una arquitecura en función a los siguentes requerimientos tecnicos:
rapidez, velocidad, alta cantidad de transacciones, y bajo costo

**Prompt 2:
Dame un aproximado de costo de cuanto me puede costar mensualmente toda esta infra en aws

**Prompt 3:
EC2 ? No es mejor utilizar contenedores (ECS) y es mas barato?


### **2.2. Descripción de componentes principales:**

**Prompt 1;
dame tu opion sobre esto;
Y configuran Nginx como proxy inverso, así aprovechan la gran capacidad que Nginx tiene para satisfacer la alta demanda de contenidos, al mismo tiempo que se ahorran recursos del servidor, como CPU o memoria RAM.

En una configuración de Apache con Nginx como proxy inverso, se pueden encontrar algunas ventajas importantes.

Digamos que en Nginx se pone en medio de las peticiones de los usuarios y el servidor Apache.

Cuando una petición llega a Nginx, este la procesa y se la envía Apache. Como en Nginx es muy bueno trabajando con una gran cantidad de peticiones simultáneas, actúa como una protección del servidor Apache para que éste no se sature en momentos de alta demanda.

Además, como Nginx un buen sistema de caché de contenido estático acelera mucho la velocidad de carga de la web.

Todo lo que esté cacheado en Nginx se entregará al usuario de forma inmediata, sin tener que pasar por Apache y esperar a que este responda.

La forma asincrónica con la que trabaja Nginx le ayuda mucho en este tipo de procesos, algo en donde Apache sufre más.

**Prompt 2:
Te cuento que ya decidi como lenguaje de programación python. Ajusta la recomendacion

**Prompt 6:
Dame la mejor recomendacion de Framework para el backend

**Prompt 3:
Ahora necesito definir framework y lenguaje para el frontend. Recuerda todo lo expuesto y los requerimiento tecnicos: rapidez, velocidad, alta cantidad de transacciones, y bajo costo

**Prompt 4:
A nivel de servicios aws donde voy alojar estos componentes de frontend, recuerda que se lo mas economico posible

**Prompt 5:
Quedo pendiente que me dijeras si es mas recomendable usar Apache o uWSGI teniendo a  Nginx como proxy inverso y balanceador de carga

**Prompt 6:
En función a todo lo que he decidido en cuanto a componenetes de arquitectura, framework, servicios aws, lenguajes de programación, etc. Necesito que muestres el detallle y diseño de arquitectura de todos los componentes y artefactos


### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**



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

**Prompt 1:
Necesito que ahora te conviertas en un experto Senior en Bases de datos
Puedes mejorar el modelo de datos planteado?

**Prompt 2:
Antes de profundizar en el modelo, necesito definir el motor de base de datos.

Requerimientos técnicos:

Integridad de los datos
Velocidad y rapidez de respuesta en todas las transacciones
Base de datos muy grande (millones de registros por tabla)
Bajo costo de operación en la nube (open source)
Necesito precisión en cuanto a si lo más conveniente es un modelo relacional o no relacional, en función de todo lo descrito anteriormente.

**Prompt 3:
Ok, me voy con PostgreSQL. Basado en esta decisión, volvamos al modelo de datos. Necesito aclararte que en el backend tendré una arquitectura de microservicios. ¿En qué medida cambia mi modelo y cómo impactará esto en la implementación del mismo?

**Prompt 4:
Como hacer que esta descripción, pueda generar un diagrama
Modelo ER en Diagrama
El diagrama ER se organizaría de tal forma que cada uno de estos esquemas contenga las entidades y relaciones especificadas. Podrías visualizarlo en una herramienta como draw.io, Lucidchart, o dbdiagram.io.

**Prompt 5:
El usuario puede ser cliente y tambien proveedor, con distintos accesos deacuerdo a si es cliente o proveedor, tambien necesito una entidad admin que son los que puegen gestion el backofice
Porque la tabla de usuario tiene este campo role ? No es necesario

**Prompt 6:
Si estoy usando Firebase Authentication como se adapta el modelo

**Prompt 7:
Quiero que user_id sigan siendo auto generado y un campo para almacenar el ID proporcionado por Firebase Authentication

**Prompt 8:
Ahora necesito generar los scripts de base de datos para la creación de estas tablas. Recuerda que estamos utilizando una arquitectura de microservicios. También necesito que el script incorpore los índices más importantes para cada campo en las tablas. Ten en cuenta también los requisitos técnicos mencionados anteriormente

**Prompt 9:
Tengo una duda sobre la arquitectuura de microservicios y la utilización de squemas en vez de bases de datos. cual es la direfencia?


---

### 4. Especificación de la API

**Prompt 1:
Necesito las especificaciones de api en base a todos los casos de uso

**Prompt 2:
Recuerda que estoy en una arquitectura de microservicios

**Prompt 3:
Genara el Swagger en formato yaml

---

### 5. Historias de Usuario

**Prompt 1:
Ahora necsito que te conviertas en Product Manager Senior con especializaciones en scrum ,jira, uml , ingenieria de procesos

**Prompt 2:
Necesito crear las historias de Usuarios, en función a los casos de uso

**Prompt 3:
Define los criterios de aceptación

**Prompt 4:
Necesito importar las H.U a Jira

---

### 6. Tickets de Trabajo

**Prompt 1:
Necesito generar los tickes de trabajo asociado a estas historias de usuarios

**Prompt 2:
Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto.

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
