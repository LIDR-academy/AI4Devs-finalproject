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

**Prompt 2:**

**Prompt 3:**

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Como analista experto y basándote en el punto 1.2 del fichero readme.md del proyecto quiero que diseñes la arquitectura del proyecto. Debe representar los componentes principales y las tecnologías utilizadas en la aplicación. Si usas un patrón definido explícalo, justifica la arquitectura elegida destacando los beneficios y deficiencias que implica. El resultado de todo ello tiene que ser un arhivo arquitectura.md dentro de una carpeta documentos.

**Prompt 2:**
Como analista experto revisa los archivos creados y comparalos con el punto 1.2 de readme.md. Parece que falta que los socios puedan crear o proponer rutas

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
Como experto en base de datos y diagramas mermaid necesito que me crees el modelo de datos de la aplicación. Para ello, y basándote en el archivo arquitectura.md dentro de documentos, deberás crear un archivo modeloDatos.md dentro de documentos con: 
- Diagrama del modelo con el máximo detalle (PKs, FKs...) usando mermaid
- Descripción de las entidades principales con el máximo detalle
Pregunta si necesitas información de algo.

**Prompt 2:**
Como experto en base de datos revisa incongruencias entre campos foráneos no existentes en tablas u otras incongruencias

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**
Como programador en backend y APIs, y basándote en el archivo arquitectura.md dentro de documentos, necesito que realices la especificición de la API describiendo los endpoints principales en formato OpenAPI de la aplicación con algún ejemplo de petición y respuesta. El resultado documentalo en apis.md dentro de documentos.
Si necesitas más información pregunta.

**Prompt 2:**
Como experto en Apis ajusta el archivo apis.md para que los usuarios puedan proponer rutas

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**
Como dueño del producto, y basándote en los archivos arquitectura.md, modeloDatos.md y apis.md de documentos, necesito que documentes 3 de las historias principales para el proyecto. Es necesario que tengas en cuenta las buenas prácticas de producto al respecto. El resultado incorpóralo en historiasUsuario.md dentro de documentos. Si tienes alguna duda pregunta.

**Prompt 2:**
Como dueño del producto quiero que revises las historias de usuario en historiasUsuario.md y basándote en arquitectura.md y el punto 1.2 de readme.md, quiero que crees las necesarias actualizando las existentes si así lo consideras usando siempre las buenas prácticas. Si tienes dudas pregunta.

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**
Como dueño del producto, y básandote en la documentación contenida en documentos, quiero que documentes 3 de los tickets de trabajo principales del desarrollo de la historia de usuario HU-01. Uno del backend, uno del frontend y uno de la base de datos. Incluye todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. El resultado documentalo en tickets.md dentro de documentos.
Si tienes alguna duda pregunta

**Prompt 2:**
Como dueño del producto quiero que revises y actualices los tickets en tickets.md y que crees los distintos tickets que salgan de las historias de usuario de historiasUsuario.md. Ordénalos por prioridad de ejecución dentro de la propia historia y siempre cumpliendo las buenas prácticas. Si tienes dudas pregunta.

**Prompt 3:**
Quiero que realices las siguientes tareas siempre asegurándote que todo queda en la carpeta correspondiente indicado en arquitectura.md y obviando lo que esté ya hecho:
1. Como experto en BBDD quiero que basándonte en el archivo modeloDatos.md y arquitectura.md realices exclusivamente el ticket con id TD-01 de tikects.md, asegurándote que cumples con el alcance, los requisitos y tareas así como todos los criterios de aceptación. Si tienes preguntas hazmelas saber. Una vez que acabes me lo dices.
2. Como experto en APIs y backend y basándote en el archivo apis.md y arquitectura.md realizarás exclusivamente el ticket con id TB-01 de tickets.md, asegurándote del cumplimiento del alcance, los requisitos y tareas así como de todos los criterios de aceptación. Si tienes preguntas hazmelas saber. Una vez que acabes me lo dices.
3. Como experto en frontEnd basándote en el archivo arquitectura.md y apis.md realizarás exclusivamente el ticket con id TF-01 de tickets.md, asegurándote del cumplimiento del alcance, los requisitos y tareas así como de todos los criterios de aceptación. Si tienes preguntas hazmelas saber.

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
