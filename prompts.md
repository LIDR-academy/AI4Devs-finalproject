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

Previamente configurado para actuar con el rol de experto en producto de software.

**Prompt 1:**
Quiero crear un nuevo producto de software en el rubro de mensajería instantánea, te compartiré la idea principal y con ello, ayúdame a analizar la factibilidad de realizarla, la necesidad del mercado e identificar los principales diferenciadores contra los competidores directos.
Idea:
* Una aplicación personalizada en la cual pueda enviar un mensaje de texto que puede estar enriquecido con documentos, imágenes y audios.
* El remitente puede configurar condiciones bajo las cuales el destinatario podrá visualizar el contenido, estas podrían ser, condición de fecha y hora, visualización de una sola vez, ingresar contraseña, usar autenticación biométrica, captcha, responder un cuestionario o acertijo, entre varias opciones de condicionantes mas.
* El objetivo de la aplicación es poder compartir de manera privada comunicación e información con la adición de condicionar la visualización, esto con un propósito recreativo y de entretenimiento.

**Prompt 2:**
Quiero comenzar con un par de MVPs siguiendo el principio de fallar pronto para aprender rápido y no gastar mucho tiempo diseñando en grande sin retroalimentación del mercado. Debido a esto ayúdame a listar las funcionalidades mas importantes que debo considerar desarrollar en primer lugar y en segundo lugar las características que puedo ir complementando mas adelante.
Por otro lado ayúdame a entender el costo de mantener una aplicación de este tipo y como podría obtener monetización para al menos mantenerla, se me ocurre tal vez echar mano de la integración de publicidad.

**Prompt 3:**
De acuerdo, quiero comenzar simple e ir agregando complejidad de acuerdo con la respuesta de los usuarios, por este motivo, agreguemos MVPs siendo mas específicos, solamente crea una lista con el top 5 MVPs y 5 mas complementarios. Nos enfocaremos inicialmente en una versión gratuita persiguiendo el feedback del usuario principalmente.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

Previamente configurado para actuar con el rol de experto en arquitectura de software.

**Prompt 1:**
Utilizando el contexto de la "## 1. Descripción general del producto", discutamos ahora que arquitectura será la mas adecuada para soportar el desarrollo de este sistema.
La documentación a generar es lo que viene en la sección "## 2. Arquitectura del Sistema" del readme.md. Por ahora no generes documentación, únicamente comencemos a analizar la mejor opción, incluye 3 opciones y compáralos en una tabla de caracteristicas. (Referencia a readme.md)

**Prompt 2:**
La arquitectura propuesta en la opción 3 me parece también adecuada, ahora puedes listar la documentación técnica mínima necesaria para conformar el punto 2.1

**Prompt 3:**
adelante procede con el siguiente paso propuesto, considera que los diagramas deben ser generados en formato mermaid, vayamos punto por punto.

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
ok ahora genera en formato markdown para incluirlo en el readme.md el texto final para la sección 2.1, representa los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica. Incluye la generación de los dos flujos principales propuestos junto con su respectivo diagrama mermaid.

**Prompt 2:**
ok ahora definamos el tech stack a usar, quiero mantenerlo con tecnología que sea de rápida adopción, mi stack técnico es de desarrollador web en javascript, HTML, CSS, bootstrap, jquery, java, spring framework, Mysql, no tengo problema en crear este sistema con la tecnología que mejor se adapte y que requiera menor coste de infraestructura, ya que todo el proyecto lo pienso generar con agentes de IA. Así que decidamos que usar en cada uno de los componentes

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
tomando en cuenta este stack tecnologico, ahora pasemos al punto 2.3 > Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica, dame el resultado en un archivo markdown

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
ahora procedamos con el punto 2.4 Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato mermaid, y explica el proceso de despliegue que se sigue

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**
ahora procedemos con el paso #2.5 en donde debemos enumerar y describir las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede, aquí utiliza la plantilla adjunta y genera un archivo markdown incluyendo la explicacion de las mejores practicas necesarias a seguir en este proyecto y llenalo con ejemplos y agrega una breve explicacion de cada ejemplo. Las mejores practicas que debemos seguir son DDD, SOLID y DRY design patterns.

**Prompt 2:**
pasemos al punto 2.5 y enumera y describe las prácticas de seguridad principales que se deben implementar en el proyecto

**Prompt 3:**


### **2.6. Tests**

**Prompt 1:**
pasemos al punto 2.6 y definamos una estrategia de testing para poder tener una suite de pruebas y al final requeriré realizar pruebas E2E, proporcioname la salida en formato markdown

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**
Como experto diseñador de bases de datos, pasemos ahora a realizar el apartado 3 de Base de datos, define de acuerdo a los siguientes especificaciones:
1. Con el contexto del sistema genera un diagrama de base de datos en formato mermaid y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas
2. Adicionalmente describe las entidades principales, incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.
3. Sigue las mejores practicas para el tipo de base de datos que se requiere.

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**
ahora regresa a ser arquitecto de software experto y pasemos al apartado 4. Especificación de la API.
Identifica 3 de los endpoints principales del sistema y generame lo siguiente:
1. Describe el endpoint y dame la salida en formato OpenAPI.
2. Agrega un ejemplo de petición y de respuesta para mayor claridad

**Prompt 2:**
Ahora como experto en arquitectura de software, actualiza la seccion 4, reemplazando el contenido con la especificacion de 3 endpoints tomados de la Historias de usuario HU-001, HU-005 y HU-009. Incluye una breve descripcion del endpoint, codigo en formato OpenAPI, ejemplo de request y response.

**Prompt 3:**

---

### 5. Historias de Usuario

Cambio a Sonnet 4.5 - Cursor
**Prompt 1:**
como experto en producto de software revisa el documento @readme.md y dime que es lo que entiendes que se de realizar. Toma en cuenta que a partir del punto #4, unicamente ejemplifico 3 funcionalidades básicas sin embargo no son todas las que se tendrian que hacer.

Las secciones de API e Historias de usuario ya estan completas en documentacion dado a que solo requiere 3 ejemplos, de hecho antes de seguir documentando, lo que requiero que comprendas, es la necesidad de realizar este proyecto, su objetivo y a partir de ahi he comenzado a documentarlo para entonces llegar a realizar la planeacion necesaria. El @readme.md solo contendra los 3 ejemplos requeridos, sin embargo requiero documentar todo el proyecto en archivos separados. Trabaja en comprender el contexto y cuando estes listo comenzaremos a realizar tarea por tarea.


**Prompt 2:**
como experto en producto de software, comencemos por realizar el plan que incluya lo siguiente:
1. Documentación de los casos de uso donde debe generar lo siguiente:
- Identificador secuencial para hacer referencia en la documentación siguiente
- Breve explicación del caso de uso
- Diagrama en formato PlantUML
- Generar documento en formato markdown en archivo con el nombre del identificador y caso de uso y colocarlo en el directorio /documentation/use_cases del proyecto
2. Generación de las historias de usuario
- Identificar secuencialmente las historias de usuario
- Utilizar la plantilla @documentation/templates/userStory.md para documentar las historias de usuario en formato markdown
- Generar documento en formato markdown en archivo con el nombre del identificador y la historia de usuario y colocarlo en el directorio /documentation/user_stories/ (si no existe el directorio, crearlo)
3. Generación de los tickets de trabajo
- Como scrum master debes planear el trabajo a realizar en las historias de usuario, priorizarlas y programarlas, aqui seguire tus indicaciones sobre como documentarlo adecuadamente.

**Prompt 3:**


---

### 6. Tickets de Trabajo

**Prompt 1:**
ahora procede a actualizar el @readme.md en su sección 6, solo toma 3 ejemplos de tickets ya generados, 1 de backend, 1 de frontend y 1 que incluya base de datos. 

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
