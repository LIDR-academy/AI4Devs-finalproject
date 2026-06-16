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

**Prompt 1:*tengo en mente un programa para gestión de taller mecánico, web app. donde el usuario será empleado del taller, puede tener rol de administrador o de mecánico. Tendrá que iniciar sesión. El administrador puede crear usuarios o darlos de baja. El administrador y mecánico podrán registrar nuevos clientes, nuevos autos.  Se debe llevar registro de los vehículos, diagnósticos, reparaciones y mantenimientos. Cuando un vehículo ingresa, se le debe crear una lista de tareas, la cual podría incrementar según avancen las revisiones, por ejemplo el vehículo ingresa por un sonido y se registra la tarea de revisión, pero durante la revisión se pueden registrar otras tareas como cambio de partes, ajustes, etc. Al finalizar cada tarea se podrá registrar el costo de esa tarea para el cliente. Cuando se finalicen todas las tareas, el administrador podrá visualizar en un form los vehículos listos para contactar al dueño. Esa vista tendrá las columnas de placa, modelo, propietario y monto por pagar. Si selecciona el vehículo podrá ver las tareas realizadas y el costo por cada una. como experto en desarrollo de software dame un archivo markdown con una breve descripción del software, su valor añadido, explicación de las principales funcionalidades, para que apartir de él, en otra iteracción una IA pueda darme artefactos como PRD, proponer arquitectura, dar modelos de datos e historias de usuarios.*

**Prompt 2:*deseables: Poder marcar en la vista de listos para contactar cuando ya se hizo el contacto para el cliente (con fecha y hora). Que una vez que se haya contactado se envíe un email al cliente con copia al administrador del taller. Otro deseable es que un vehículo que ha se haya registrado en el pasado y que cambie de propietario, se pueda actualizar al nuevo propietario. Modifica profesionalmente el md entregado, para que en la sección de futuras versiones tenga estas funcionalidades.*

**Prompt 3:*Otro deseable, el administrador podrá tener una lista de vehículos próximos a dar mantenimiento, como un recordatorio. De la cual, pueda enviar un correo a toda la lista, o a vehículos seleccionados, invitando al propietario a sacar su cita para la visita. Para aquellos vehiculos que tengan más de 6 meses de no venir al taller. El admistrador podrá marcar los vehículos que desee como "no volver a recordar" para que dejen de aparecer en la lista.*

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:*Actua como arquitecto de software senior, dado el proyecto actual, cual sería la arquitectura adecuada para su implementación?*

**Prompt 2:*actualiza en @readme.md  la sección 2.1, 2.2 y 2.3 según lo que me has mencionado.*

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

**Prompt 1:*basado en las historias de usuario mejoradas. Por favor construye el modelo de datos y su diagrama en codigo de mermaid.*

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:* Se pide a Claude: Basado en el archivo readme.md ahora seria generar las US
¿Cómo querés generar las US?
P: ¿Cómo querés generar las US?
R: Que Claude las genere ahora mismo leyendo tu README*

**Prompt 2:*aplicación de comando /enrich-us + US-.md para todas las US*

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
