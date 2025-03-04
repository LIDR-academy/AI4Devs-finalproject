## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Paola Morales Castellanos

### **0.2. Nombre del proyecto:**

**GuardianPaws**

### **0.3. Descripción breve del proyecto:**

**GuardianPaws** es mucho más que una plataforma: es una red de esperanza y acción para animales de compañía. Conectamos dueños responsables, rescatistas, voluntarios y refugios en una comunidad unida por el mismo propósito: brindar protección, amor y segundas oportunidades.

Desde reportar animales perdidos hasta gestionar adopciones y ofrecer hogares de paso, **GuardianPaws** hace que ayudar sea más fácil y efectivo. Además, facilitamos el intercambio, venta y donación de productos esenciales para su bienestar.

En esta primera fase (MVP), potenciamos el rescate con herramientas clave: un **chat en vivo** para coordinar acciones en tiempo real, **búsqueda inteligente con IA** para encontrar animales perdidos más rápido y una **red de apoyo sólida** para quienes luchan cada día por su bienestar.

### **0.4. URL del proyecto:**

**TODO**
> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio
**TODO**
> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

GuardianPaws tiene como objetivo principal **facilitar la reunificación de animales de compañía perdidas con sus dueños y fortalecer la comunidad de rescate animal**, permitiendo la interacción en tiempo real entre rescatistas, dueños y voluntarios.

### **1.2. Características y funcionalidades principales:**

- **Reporte y Búsqueda de Animales de Compañía Perdidas**: Permite a los usuarios reportar una mascota perdida, subiendo una imagen y proporcionando detalles clave.
- **Comunidad y Red de Apoyo**: Los usuarios pueden registrarse como hogares de paso o voluntarios y ofrecer su ayuda.
- **Chat en Vivo**: Mensajería en tiempo real entre usuarios mediante WebSockets.

### **1.3. Diseño y experiencia de usuario:**
**TODO**
> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**

**TODO**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

![Diagrama de Arquitectura](./diagram_architecture.png)

La arquitectura de **GuardianPaws** sigue un modelo monolítico con un backend centralizado y un frontend desacoplado. Se ha elegido esta arquitectura por su simplicidad, rapidez de implementación y facilidad de mantenimiento en la fase de MVP.

### **2.2. Descripción de componentes principales:**

- **Frontend (Next.js en Vercel)**: Proporciona la interfaz de usuario para reportes, adopciones, red de apoyo y chat en vivo.
- **Backend (NestJS en Railway)**: Procesa la lógica del negocio, conexiones a la base de datos, autenticación y WebSockets.
- **Base de Datos (PostgreSQL en AWS RDS Free Tier)**: Almacena la información de reportes, adopciones, usuarios y hogares de paso.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

La estructura del código sigue un enfoque modular, optimizado para escalar en futuras versiones.

### **2.4. Infraestructura y despliegue**

El MVP se despliega usando plataformas serverless y cloud para minimizar costos y tiempos de implementación.
- **Frontend (Next.js) en Vercel** → Hosting optimizado y gratuito en Free Tier.
- **Backend (NestJS) en Railway** → Plataforma gratuita para despliegue rápido.
- **Base de datos (PostgreSQL en AWS RDS Free Tier)** → Persiste datos sin costo inicial.
- **Almacenamiento de imágenes en AWS S3**.
- **Mensajería en tiempo real con WebSockets (Railway + Redis Free Tier)**.

### **2.5. Seguridad**

Para garantizar la seguridad en GuardianPaws, se implementan medidas como protección contra inyección SQL y XSS, CORS y restricciones de origen, almacenamiento seguro en AWS S3, y mensajería encriptada en WebSockets.

### **2.6. Tests**

**TODO**
> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

![Diagrama de Arquitectura](./diagram_model.png)

### **3.2. Descripción de entidades principales:**

- **USUARIO**: Representa a una persona registrada en la plataforma, que puede reportar mascotas perdidas, adoptar, enviar mensajes en el chat y solicitar hogares temporales.
- **MASCOTA**: Entidad que representa una mascota registrada en la plataforma, ya sea adoptada, en adopción o perdida.
- **REPORTE_PERDIDA**: Registro de una mascota extraviada, con detalles sobre el evento y su ubicación.
- **HISTORIAL_REPORTE**: Registra los cambios de estado en un reporte de pérdida.
- **ADOPCION**: Entidad que almacena los registros de adopción de mascotas.
- **IMAGENES**: Almacena imágenes de mascotas y reportes en AWS S3.
- **NOTIFICACION**: Gestiona las notificaciones enviadas a los usuarios.
- **HOGAR_TEMPORAL**: Entidad que representa un hogar dispuesto a albergar temporalmente a una mascota.
- **SOLICITUD_HOGAR_TEMPORAL**: Registra solicitudes de hogares temporales para mascotas.
- **MATCH_RECONOCIMIENTO**: Registra coincidencias detectadas por AWS Rekognition para encontrar mascotas perdidas.
- **CHAT**: Entidad que maneja las conversaciones entre usuarios.
- **MENSAJE**: Registra los mensajes enviados en un chat.

---

## 4. Especificación de la API

```yaml
openapi: 3.0.3
info:
  title: GuardianPaws API
  description: API para reportar mascotas perdidas, gestionar adopciones y enviar mensajes en el chat.
  version: 1.0.0

paths:
  /reportes-perdida:
    post:
      summary: Reportar una mascota perdida
      description: Permite a un usuario reportar la pérdida de su mascota, almacenando detalles y ubicación.
      operationId: reportarMascotaPerdida
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                usuario_id:
                  type: string
                  format: uuid
                  description: ID del usuario que reporta la mascota perdida.
                mascota_id:
                  type: string
                  format: uuid
                  description: ID de la mascota perdida.
                ubicacion:
                  type: string
                  description: Última ubicación conocida de la mascota.
                descripcion:
                  type: string
                  description: Información adicional sobre la pérdida.
      responses:
        '201':
          description: Reporte creado exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                    description: ID del reporte generado.
                  mensaje:
                    type: string
                    example: "Reporte creado exitosamente."
        '400':
          description: Error en la solicitud

  /adopciones:
    post:
      summary: Registrar una adopción
      description: Permite a un usuario adoptar una mascota y registrar la adopción en el sistema.
      operationId: registrarAdopcion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                usuario_id:
                  type: string
                  format: uuid
                  description: ID del usuario que adopta.
                mascota_id:
                  type: string
                  format: uuid
                  description: ID de la mascota adoptada.
      responses:
        '201':
          description: Adopción registrada exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    format: uuid
                    description: ID de la adopción creada.
                  mensaje:
                    type: string
                    example: "Adopción registrada exitosamente."
        '400':
          description: Error en la solicitud

  /chats/{chat_id}/mensajes:
    get:
      summary: Obtener mensajes de un chat
      description: Devuelve la lista de mensajes de un chat específico.
      operationId: obtenerMensajesChat
      parameters:
        - name: chat_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
          description: ID del chat.
      responses:
        '200':
          description: Lista de mensajes del chat
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: string
                      format: uuid
                      description: ID del mensaje.
                    usuario_id:
                      type: string
                      format: uuid
                      description: ID del usuario que envió el mensaje.
                    contenido:
                      type: string
                      description: Contenido del mensaje.
                    fecha_envio:
                      type: string
                      format: date-time
                      description: Fecha y hora del mensaje.
        '404':
          description: Chat no encontrado
```

---

## 5. Historias de Usuario

**HU001 - Reportar una mascota perdida**

> Como usuario, quiero reportar la pérdida de mi mascota ingresando detalles e imágenes, para aumentar las probabilidades de encontrarla.

**Descripción:**
Esta funcionalidad permite a los usuarios reportar mascotas perdidas proporcionando información clave como nombre, ubicación y descripción, junto con una imagen de la mascota. Los reportes serán visibles en la plataforma.

**Criterios de Aceptación:**

- **Dado que** un usuario accede a la plataforma, **cuando** selecciona la opción de reportar una mascota perdida e ingresa la información requerida, **entonces** el sistema debe almacenar y mostrar el reporte en la lista de mascotas perdidas.
- **Dado que** un usuario olvida llenar un campo obligatorio, **cuando** intente enviar el reporte, **entonces** el sistema debe mostrar un mensaje de error.
- **Dado que** un usuario sube una imagen, **cuando** se completa el proceso, **entonces** la imagen debe almacenarse correctamente en la nube (AWS S3 o equivalente).

**HU008 - Subida de imágenes de mascotas**

> Como usuario, quiero subir imágenes de mi mascota al reportarla o darla en adopción, para que otros puedan reconocerla fácilmente.

**Descripción:**
Permite a los usuarios adjuntar imágenes en los reportes de pérdida o publicaciones de adopción, mejorando la identificación de las mascotas en la plataforma.

**Criterios de Aceptación:**

- **Dado que** un usuario está creando un reporte, **cuando** selecciona una imagen y la sube, **entonces** esta debe almacenarse correctamente en la nube y mostrarse en la interfaz de usuario.
- **Dado que** un usuario sube una imagen con un formato incorrecto, **cuando** intente enviarla, **entonces** el sistema debe mostrar un mensaje de error indicando los formatos aceptados.
- **Dado que** un usuario no adjunta ninguna imagen, **cuando** complete el reporte, **entonces** el sistema debe permitir el envío, pero mostrando una advertencia recomendando subir una imagen.

**HU007 - Notificación de coincidencias en búsqueda**

> Como usuario, quiero recibir una notificación cuando una mascota con características similares a la mía sea reportada, para aumentar las probabilidades de encontrarla.

**Descripción:**
El sistema notificará a los usuarios cuando haya coincidencias entre una mascota reportada como perdida y otra recientemente encontrada. La notificación podrá enviarse por correo electrónico o mostrarse en la plataforma.

**Criterios de Aceptación:**

- **Dado que** un usuario ha reportado una mascota como perdida, **cuando** otro usuario cree un nuevo reporte con características similares, **entonces** el primer usuario debe recibir una notificación.
- **Dado que** un usuario ha recibido una notificación, **cuando** acceda al sistema, **entonces** podrá ver el detalle de la coincidencia en una sección de notificaciones.
- **Dado que** el sistema detecta una coincidencia, **cuando** se envía la notificación, **entonces** debe registrarse un historial de notificaciones enviadas.

---

## 6. Tickets de Trabajo

### **Frontend:**

**Título:** Implementar formulario de reporte de mascota perdida

**Descripción:** Diseñar e implementar la UI para que los usuarios puedan reportar mascotas perdidas de manera intuitiva y eficiente. Debe incluir campos obligatorios y validaciones en tiempo real.

**Criterios de Aceptación:**

- El formulario permite ingresar todos los datos requeridos: nombre de la mascota, descripción, ubicación, imagen.
- Validaciones en tiempo real para verificar campos obligatorios y formato de datos.
- Diseño responsivo y compatible con dispositivos móviles.
- Confirmación visual después de enviar un reporte exitosamente.

**Prioridad:** Alta

**Estimación:** 5 puntos de historia

**Asignado a:** Equipo de Frontend

**Etiquetas:** UI, Frontend, Sprint 1

**Comentarios:** Asegurar que la UI sea intuitiva y accesible en dispositivos móviles.

**Enlaces:** Referencia de UI en Figma

**Historial de Cambios:** Creación inicial del ticket

---

### **Backend y Base de Datos:**

**Título:** Implementar API y base de datos para reportar mascotas perdidas

**Descripción:** Crear endpoint en el backend para que los usuarios puedan reportar mascotas perdidas, almacenando la información en la base de datos y devolviendo una confirmación. Se debe diseñar y crear la estructura de la base de datos para almacenar estos reportes de forma eficiente.

**Criterios de Aceptación:**

- Endpoint POST `/reportes-perdida` que reciba y valide los datos.
- Almacenar la información en la base de datos con una estructura optimizada.
- Retornar un ID único del reporte creado.
- Manejo de errores adecuado en caso de datos inválidos o fallos en la base de datos.
- Crear tabla `reportes_perdida` con los siguientes campos:
    - `id` (UUID, clave primaria)
    - `usuario_id` (UUID, clave foránea a `usuarios`)
    - `mascota_id` (UUID, clave foránea a `mascotas`)
    - `descripcion` (TEXT, información sobre la mascota perdida)
    - `ubicacion` (STRING, ubicación de la pérdida)
    - `fecha_reporte` (DATETIME, fecha y hora del reporte)
- Crear índices para optimizar consultas de búsqueda.

**Prioridad:** Alta

**Estimación:** 8 puntos de historia

**Asignado a:** Equipo de Backend y DBA

**Etiquetas:** API, Backend, Database, Sprint 1

**Comentarios:** Debe implementarse validación de datos antes de insertar en la base de datos. Asegurar que la estructura sea escalable para futuras funcionalidades como seguimiento de reportes.

**Enlaces:** Documentación de API y Esquema de base de datos en Diagrama ERD

**Historial de Cambios:** Creación inicial del ticket

---

### **Despliegue:**

**Título:** Configurar entorno de producción para reportes de mascotas

**Descripción:** Configurar la infraestructura necesaria para que los reportes de mascotas se almacenen y sean accesibles desde producción.

**Criterios de Aceptación:**

- Configuración de base de datos en AWS RDS.
- Configuración de servidor backend en Railway.
- Configuración de almacenamiento de imágenes en AWS S3.
- Validación de conexión entre los diferentes servicios.

**Prioridad:** Alta

**Estimación:** 5 puntos de historia

**Asignado a:** Equipo de DevOps

**Etiquetas:** Infraestructura, Deploy, Sprint 1

**Comentarios:** Asegurar seguridad en conexiones entre servicios y accesos a la base de datos.

**Enlaces:** Documentación de Infraestructura

**Historial de Cambios:** Creación inicial del ticket

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**
    Add comprehensive project documentation for GuardianPaws MVP, readme, diagramas

**Pull Request 2**

**Pull Request 3**

