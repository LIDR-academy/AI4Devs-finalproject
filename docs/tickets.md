## 1. Crear carpeta backend e inicializar proyecto con npm

**Descripción detallada:**  
- **Propósito:**  
Establecer la estructura base del backend para el sistema Buscadoc, permitiendo la gestión independiente del código y dependencias del servidor.
- **Detalle específico:**  
Crear la carpeta `backend` en el directorio raíz del proyecto y ejecutar la inicialización de npm para generar el archivo `package.json`. No se instalarán dependencias en este ticket.

**Criterios de aceptación:**  
- Se crea la carpeta `backend` en la raíz del proyecto.
- Se ejecuta `npm init` dentro de la carpeta y se genera el archivo `package.json`.
- El comando se ejecuta sin errores y el archivo queda listo para instalar dependencias.
- **Pruebas de validación:**  
  - Verificar que la carpeta existe y contiene el archivo `package.json`.
  - Ejecutar `npm install` (sin paquetes) y confirmar que no hay errores.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
0.5 horas

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Configuración

**Comentarios y Notas:**  
Este ticket es el primer paso para la configuración del backend. No incluye instalación de dependencias ni configuración adicional.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para inicialización de backend.



## 2. Montar la base de datos PostgreSQL según lo definido en el PRD

**Descripción detallada:**  
- **Propósito:**  
Configurar la base de datos principal del sistema Buscadoc, asegurando la estructura y disponibilidad para el desarrollo backend.
- **Detalle específico:**  
Crear una instancia de PostgreSQL local o en la nube. Definir el nombre de la base de datos, usuario y contraseña según las convenciones del proyecto. No incluye aún la migración de tablas, solo la creación y acceso a la base de datos.

**Criterios de aceptación:**  
- Se crea la base de datos PostgreSQL con el nombre y credenciales definidos.
- El servidor de base de datos está accesible desde el entorno de desarrollo backend.
- Se puede conectar a la base de datos usando herramientas como `psql` o Prisma.
- **Pruebas de validación:**  
  - Conexión exitosa desde el backend (o herramienta de administración).
  - Verificación de acceso y permisos de usuario.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Configuración, Base de datos

**Comentarios y Notas:**  
La configuración debe seguir las recomendaciones de seguridad del PRD. Documentar los parámetros de conexión en un archivo seguro.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para montaje de base de datos PostgreSQL.



## 3. Generar la migración de la base de datos para su ejecución (usando Prisma)

**Descripción detallada:**  
- **Propósito:**  
Definir y crear el esquema inicial de la base de datos PostgreSQL para Buscadoc, asegurando que todas las entidades y relaciones del modelo de datos estén correctamente representadas y listas para el desarrollo backend.
- **Detalle específico:**  
Utilizar Prisma para modelar las entidades principales (`USER`, `DOCTOR`, `PATIENT`, `SPECIALTY`, `DOCTOR_SPECIALTY`, `APPOINTMENT`, `RATING`, `NOTIFICATION`, `LOCATION`, `CITY`, `STATE`) y sus relaciones. Generar el archivo `schema.prisma` y ejecutar la migración inicial para crear las tablas en PostgreSQL.

**Criterios de aceptación:**  
- El archivo `schema.prisma` refleja fielmente el modelo de datos definido en la documentación.
- Se ejecuta la migración inicial sin errores y todas las tablas y relaciones se crean correctamente en la base de datos.
- Las claves primarias, foráneas y restricciones están correctamente implementadas.
- **Pruebas de validación:**  
  - Verificar la existencia de todas las tablas y relaciones en PostgreSQL.
  - Probar la inserción y consulta básica de datos en cada entidad.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Configuración, Base de datos

**Comentarios y Notas:**  
Revisar el modelo de datos en `docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md` antes de generar la migración. Documentar cualquier ajuste necesario en el historial de cambios.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para migración inicial de base de datos con Prisma.



## 4. Instalar las dependencias necesarias en backend (Node.js, Express.js, Prisma, Auth.js, etc.)

**Descripción detallada:**  
- **Propósito:**  
Preparar el entorno de desarrollo backend instalando todas las dependencias esenciales para el stack definido en el PRD, permitiendo la implementación de la API REST, autenticación y acceso a la base de datos.
- **Detalle específico:**  
Instalar los siguientes paquetes en la carpeta `backend`:
  - express
  - prisma
  - @prisma/client
  - pg (driver PostgreSQL)
  - auth.js
  - dotenv
  - cors
  - nodemailer (opcional para notificaciones)
  - Otros paquetes necesarios según el PRD

**Criterios de aceptación:**  
- Todos los paquetes principales del stack están instalados correctamente.
- El archivo `package.json` refleja las dependencias instaladas.
- No hay errores tras la instalación.
- **Pruebas de validación:**  
  - Ejecutar `npm ls` y verificar que todas las dependencias aparecen sin conflictos.
  - Probar importación básica de cada paquete en un archivo de prueba.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Configuración

**Comentarios y Notas:**  
Revisar el PRD para confirmar versiones y dependencias adicionales. Documentar cualquier paquete extra instalado.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para instalación de dependencias backend.

## 5. Configurar el entorno de desarrollo para backend (variables de entorno, archivo .env)

**Descripción detallada:**  
- **Propósito:**  
Asegurar que el backend tenga configuraciones seguras y flexibles para conectarse a la base de datos, gestionar autenticación y otros servicios, siguiendo las mejores prácticas y requisitos del PRD.
- **Detalle específico:**  
Crear un archivo `.env` en la carpeta `backend` con las siguientes variables mínimas:
  - `DATABASE_URL` (cadena de conexión PostgreSQL para Prisma)
  - `AUTH_SECRET` (secreto para Auth.js)
  - `PORT` (puerto de la API)
  - Variables adicionales según dependencias (SMTP, Firebase, etc. si aplica)
Configurar el uso de `dotenv` en el proyecto para cargar estas variables.

**Criterios de aceptación:**  
- El archivo `.env` existe y contiene las variables necesarias.
- El backend puede leer las variables de entorno correctamente.
- La conexión a la base de datos y autenticación funcionan usando las variables configuradas.
- **Pruebas de validación:**  
  - Ejecutar el backend y verificar que se conecta a la base de datos usando `DATABASE_URL`.
  - Probar que Auth.js utiliza el secreto configurado.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Configuración

**Comentarios y Notas:**  
No subir el archivo `.env` al repositorio. Documentar las variables requeridas en un archivo `README` o similar.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para configuración de entorno backend.

## 6. Tickets Buscar especialistas por especialidad y ubicación [US-1]

**Historia de usuario relacionada:**  
- **ID:** 1  
- **Título:** Buscar especialistas por especialidad y ubicación  
- **Descripción:** Como visitante, quiero buscar especialistas por especialidad y ubicación (ciudad y estado), para encontrar médicos adecuados a mis necesidades sin necesidad de registrarme.

### 6.1 [Backend] Diseñar el endpoint de búsqueda de especialistas por especialidad y ubicación (ciudad y estado)

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los visitantes buscar especialistas médicos filtrando por especialidad, ciudad y estado, cumpliendo los criterios del Product Backlog y modelo de datos.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `GET /api/doctors/search`) que acepte los siguientes parámetros de consulta:
  - `specialty_id` (ID de la especialidad)
  - `city_id` (ID de la ciudad)
  - `state_id` (ID del estado)
El endpoint debe estar accesible sin autenticación y retornar información básica del especialista y su ubicación general.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- Los parámetros de consulta permiten filtrar por especialidad, ciudad y estado.
- El endpoint está accesible para usuarios no autenticados.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación

**Comentarios y Notas:**  
Asegurarse de que el endpoint cumpla con los criterios de aceptación del Product Backlog y modelo de datos.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint de búsqueda de especialistas.


### 6.2 [Backend] Implementar la lógica de consulta para búsqueda de especialistas por especialidad y ubicación

**Descripción detallada:**  
- **Propósito:**  
Desarrollar la funcionalidad backend que permita consultar la base de datos y retornar especialistas filtrados por especialidad, ciudad y estado, utilizando Prisma y PostgreSQL.
- **Detalle específico:**  
Implementar la lógica en el controlador correspondiente para el endpoint `GET /api/doctors/search`. La consulta debe:
  - Unir las tablas DOCTOR, DOCTOR_SPECIALTY, SPECIALTY, LOCATION, CITY y STATE según el modelo de datos.
  - Permitir filtrar por `specialty_id`, `city_id` y `state_id`.
  - Retornar información básica del especialista (nombre, especialidad, ciudad, estado, foto, biografía).
  - Solo mostrar especialistas activos.
  - Optimizar la consulta para responder en menos de 2 segundos.

**Criterios de aceptación:**  
- La consulta retorna solo especialistas activos que cumplen con los filtros.
- La información básica del especialista y su ubicación general se incluye en la respuesta.
- El endpoint responde en menos de 2 segundos con datos de prueba.
- **Pruebas de validación:**  
  - Probar la consulta con diferentes combinaciones de filtros y verificar los resultados.
  - Medir el tiempo de respuesta con datos simulados.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio

**Comentarios y Notas:**  
Revisar el modelo de datos para asegurar la correcta relación entre entidades. Optimizar la consulta para evitar sobrecarga y asegurar tiempos de respuesta.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para implementación de lógica de consulta de especialistas.


### 6.3 [Backend] Agregar validaciones de entrada para filtros de especialidad, ciudad y estado

**Descripción detallada:**  
- **Propósito:**  
Garantizar que los parámetros recibidos en el endpoint de búsqueda sean válidos y seguros, evitando consultas erróneas o maliciosas.
- **Detalle específico:**  
Implementar validaciones en el controlador del endpoint para:
  - Verificar que `specialty_id`, `city_id` y `state_id` sean enteros positivos.
  - Validar que los IDs existan en la base de datos antes de ejecutar la consulta.
  - Retornar errores claros en caso de parámetros inválidos o inexistentes.

**Criterios de aceptación:**  
- El endpoint rechaza parámetros inválidos y retorna mensajes de error claros.
- Solo se ejecutan consultas con parámetros válidos y existentes.
- Las validaciones no afectan el tiempo de respuesta (<2 segundos).
- **Pruebas de validación:**  
  - Probar el endpoint con parámetros válidos e inválidos y verificar las respuestas.
  - Intentar consultas con IDs inexistentes y validar el manejo de errores.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Validación

**Comentarios y Notas:**  
Utilizar librerías como Joi, Zod o validaciones propias según el stack. Documentar los mensajes de error en la documentación técnica.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para validaciones de entrada en búsqueda de especialistas.

### 6.4 [Backend] Configurar paginación y tiempos de respuesta óptimos en el endpoint de búsqueda de especialistas

**Descripción detallada:**  
- **Propósito:**  
Mejorar la experiencia de usuario y el rendimiento del sistema asegurando que el endpoint de búsqueda devuelva resultados paginados y responda en menos de 2 segundos.
- **Detalle específico:**  
Implementar paginación en el endpoint (`GET /api/doctors/search`) usando parámetros como `page` y `limit`. Optimizar la consulta con Prisma para que el tiempo de respuesta sea menor a 2 segundos, incluso con grandes volúmenes de datos. Retornar metadatos de paginación (total de resultados, página actual, total de páginas).

**Criterios de aceptación:**  
- El endpoint acepta y procesa correctamente los parámetros de paginación.
- La respuesta incluye metadatos de paginación.
- El tiempo de respuesta es menor a 2 segundos con datos simulados.
- **Pruebas de validación:**  
  - Probar el endpoint con diferentes valores de `page` y `limit`.
  - Medir el tiempo de respuesta y validar los metadatos.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Rendimiento

**Comentarios y Notas:**  
Asegurarse de que la paginación sea compatible con los filtros de búsqueda y que los metadatos sean claros para el frontend.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para paginación y optimización de tiempos de respuesta en búsqueda de especialistas.


### 6.5 [Backend] Documentar el endpoint de búsqueda de especialistas por especialidad y ubicación

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint de búsqueda para que otros desarrolladores y el frontend puedan consumirlo correctamente.
- **Detalle específico:**  
Documentar el endpoint `GET /api/doctors/search` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad.
  - Parámetros de consulta (`specialty_id`, `city_id`, `state_id`, `page`, `limit`).
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (nombre, especialidad, ciudad, estado, foto, biografía).
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales del endpoint.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación

**Comentarios y Notas:**  
Actualizar la documentación si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoint de búsqueda de especialistas.

### 6.6 [Backend] Crear pruebas unitarias para el endpoint de búsqueda de especialistas por especialidad y ubicación

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento del endpoint de búsqueda mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para el endpoint `GET /api/doctors/search` que cubran:
  - Búsqueda exitosa con filtros válidos.
  - Respuesta vacía cuando no hay especialistas que cumplan los filtros.
  - Manejo de parámetros inválidos (IDs inexistentes, tipos incorrectos).
  - Validación de paginación y tiempos de respuesta.
Utilizar el framework de pruebas definido en el backend (por ejemplo, Jest o Mocha).

**Criterios de aceptación:**  
- Las pruebas unitarias cubren los casos principales y errores del endpoint.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar el comando de pruebas y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Pruebas Unitarias

**Comentarios y Notas:**  
Actualizar las pruebas si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias del endpoint de búsqueda de especialistas.

## 7. Ver perfil de especialista [US-2]

**Historia de usuario relacionada:**  
- **ID:** 2  
- **Título:** Ver perfil de especialista  
- **Descripción:** Como visitante, quiero ver el perfil de un especialista, para conocer su información profesional y ubicación general antes de decidirme a agendar una cita.

### 7.1 [Backend] Diseñar el endpoint para consultar el perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los visitantes consultar el perfil profesional y ubicación general de un especialista desde los resultados de búsqueda.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `GET /api/doctors/:id`) que reciba el identificador del especialista y retorne:
  - Información profesional (nombre, especialidad, biografía, foto, cédula profesional, título).
  - Ubicación general (ciudad y estado, sin mostrar dirección exacta).
  - Ocultar datos personales sensibles (correo, teléfono, dirección exacta) para visitantes no autenticados.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- El visitante puede acceder al perfil desde los resultados de búsqueda.
- Solo se muestran datos permitidos según el PRD y criterios de aceptación.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.
  - Probar acceso con usuario no autenticado y verificar que no se muestran datos sensibles.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación

**Comentarios y Notas:**  
Asegurarse de cumplir con la LFPDPPP y mostrar únicamente datos permitidos para visitantes.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint de perfil de especialista.


### 7.2 [Backend] Implementar la lógica de consulta del perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Desarrollar la funcionalidad backend que permita consultar y retornar la información profesional y ubicación general de un especialista, ocultando datos personales sensibles para visitantes no autenticados.
- **Detalle específico:**  
Implementar la lógica en el controlador para el endpoint `GET /api/doctors/:id`:
  - Consultar las entidades DOCTOR, USER, DOCTOR_SPECIALTY, SPECIALTY, LOCATION, CITY y STATE.
  - Retornar: nombre, apellidos, especialidad, biografía, foto, cédula profesional, título, ciudad y estado.
  - No incluir: correo, teléfono, dirección exacta, ni datos sensibles.
  - Validar que el especialista esté activo.

**Criterios de aceptación:**  
- El endpoint retorna la información profesional y ubicación general del especialista.
- Los datos personales sensibles no se incluyen en la respuesta para visitantes.
- El especialista debe estar activo para mostrar su perfil.
- **Pruebas de validación:**  
  - Probar el endpoint con un visitante y verificar que solo se muestran los datos permitidos.
  - Probar con un especialista inactivo y validar que no se muestra el perfil.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio

**Comentarios y Notas:**  
Revisar el modelo de datos y criterios de aceptación del Product Backlog y PRD para asegurar el cumplimiento normativo (LFPDPPP).

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para implementación de lógica de consulta de perfil de especialista.

### 7.3 [Backend] Agregar validaciones para ocultar datos personales sensibles a visitantes no autenticados en el perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Cumplir con la LFPDPPP y los criterios del PRD, asegurando que los visitantes solo puedan ver información profesional y ubicación general del especialista, ocultando datos personales sensibles.
- **Detalle específico:**  
Implementar validaciones en el controlador del endpoint `GET /api/doctors/:id` para:
  - Ocultar datos sensibles como correo electrónico, teléfono y dirección exacta.
  - Mostrar únicamente: nombre, apellidos, especialidad, biografía, foto, cédula profesional, título, ciudad y estado.
  - Validar el rol del usuario (visitante/no autenticado) antes de retornar la información.

**Criterios de aceptación:**  
- Los visitantes no autenticados solo ven información profesional y ubicación general.
- Los datos personales sensibles no se incluyen en la respuesta.
- El endpoint cumple con la normativa LFPDPPP.
- **Pruebas de validación:**  
  - Probar el endpoint como visitante y verificar que no se muestran datos sensibles.
  - Revisar la respuesta y asegurar que solo se incluyen los campos permitidos.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Seguridad, Validación

**Comentarios y Notas:**  
Revisar el modelo de datos y criterios legales en el PRD para asegurar el cumplimiento normativo.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para validaciones de privacidad en perfil de especialista.

### 7.4 [Backend] Documentar el endpoint de perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint de perfil de especialista para que otros desarrolladores y el frontend puedan consumirlo correctamente.
- **Detalle específico:**  
Documentar el endpoint `GET /api/doctors/:id` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad.
  - Parámetro de ruta (`id` del especialista).
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (nombre, apellidos, especialidad, biografía, foto, cédula profesional, título, ciudad y estado).
  - Campos ocultos para visitantes (correo, teléfono, dirección exacta).
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales del endpoint.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación

**Comentarios y Notas:**  
Actualizar la documentación si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoint de perfil de especialista.

### 7.5 [Backend] Crear pruebas unitarias para el endpoint de perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento del endpoint de perfil de especialista mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para el endpoint `GET /api/doctors/:id` que cubran:
  - Consulta exitosa de perfil con datos válidos.
  - Ocultamiento de datos personales sensibles para visitantes no autenticados.
  - Manejo de especialistas inactivos (no mostrar perfil).
  - Validación de errores por ID inexistente o formato incorrecto.
Utilizar el framework de pruebas definido en el backend (por ejemplo, Jest o Mocha).

**Criterios de aceptación:**  
- Las pruebas unitarias cubren los casos principales y errores del endpoint.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar el comando de pruebas y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Pruebas Unitarias

**Comentarios y Notas:**  
Actualizar las pruebas si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias del endpoint de perfil de especialista.

## 8. Buscar especialistas y ver perfiles [US-4]

**Historia de usuario relacionada:**  
- **ID:** 4  
- **Título:** Buscar especialistas y ver perfiles  
- **Descripción:** Como paciente, quiero buscar especialistas y ver sus perfiles, para comparar opciones y tomar decisiones informadas.

### 8.1 [Backend] Diseñar el endpoint de búsqueda de especialistas para pacientes (con filtros avanzados y acceso autenticado)

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los pacientes buscar especialistas médicos utilizando filtros avanzados y acceso autenticado.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `GET /api/patient/doctors/search`) que acepte los siguientes parámetros de consulta:
  - `specialty_id` (ID de la especialidad)
  - `city_id` (ID de la ciudad)
  - `state_id` (ID del estado)
  - Filtros adicionales: valoración mínima, disponibilidad, etc.
El endpoint debe requerir autenticación y retornar información detallada del especialista para comparación.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- Los parámetros de consulta permiten filtrar por especialidad, ubicación y otros criterios relevantes.
- El endpoint requiere autenticación de paciente.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.
  - Probar acceso con usuario autenticado y verificar los filtros avanzados.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Asegurarse de que el endpoint cumpla con los criterios de aceptación del Product Backlog y modelo de datos. Considerar dependencias con el catálogo de especialidades y gestión de ciudades/estados.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint de búsqueda de especialistas para pacientes.

### 8.2 [Backend] Implementar la lógica de consulta en el backend para búsqueda y comparación de especialistas (usando Prisma y PostgreSQL)

**Descripción detallada:**  
- **Propósito:**  
Desarrollar la funcionalidad backend que permita a pacientes autenticados buscar y comparar especialistas utilizando filtros avanzados, mostrando información relevante para la toma de decisiones.
- **Detalle específico:**  
Implementar la lógica en el controlador para el endpoint `GET /api/patient/doctors/search`:
  - Consultar las entidades DOCTOR, DOCTOR_SPECIALTY, SPECIALTY, LOCATION, CITY, STATE y RATING.
  - Permitir filtrar por especialidad, ciudad, estado, valoración mínima y disponibilidad.
  - Retornar información detallada del especialista (nombre, especialidad, biografía, foto, ciudad, estado, valoración promedio).
  - Solo mostrar especialistas activos.
  - Optimizar la consulta para responder en menos de 2 segundos.

**Criterios de aceptación:**  
- La consulta retorna especialistas activos que cumplen con los filtros avanzados.
- La información relevante para comparación se incluye en la respuesta.
- El endpoint responde en menos de 2 segundos con datos simulados.
- **Pruebas de validación:**  
  - Probar la consulta con diferentes combinaciones de filtros y verificar los resultados.
  - Medir el tiempo de respuesta y validar los datos retornados.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio

**Comentarios y Notas:**  
Revisar el modelo de datos y criterios de aceptación del Product Backlog y PRD para asegurar la correcta relación entre entidades y cumplimiento de requisitos.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para implementación de lógica de búsqueda y comparación de especialistas para pacientes.

### 8.3 [Backend] Diseñar el endpoint para consultar el perfil completo de especialista (acceso autenticado)

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los pacientes autenticados consultar el perfil completo de un especialista, incluyendo información adicional relevante para la comparación y agendamiento.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `GET /api/patient/doctors/:id`) que reciba el identificador del especialista y retorne:
  - Información profesional (nombre, especialidad, biografía, foto, cédula profesional, título).
  - Ubicación completa (ciudad, estado, dirección profesional).
  - Valoración promedio y comentarios de pacientes.
  - Disponibilidad para agendar cita.
El endpoint debe requerir autenticación de paciente y mostrar información adicional respecto al endpoint público.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- El paciente autenticado puede acceder al perfil completo desde los resultados de búsqueda.
- Se muestran datos adicionales permitidos para pacientes registrados.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.
  - Probar acceso con usuario autenticado y verificar que se muestran los datos completos.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Asegurarse de cumplir con la LFPDPPP y mostrar únicamente datos permitidos para pacientes autenticados.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint de perfil completo de especialista para pacientes.


### 8.4 [Backend] Implementar la lógica de consulta del perfil completo en el backend, mostrando información adicional para pacientes registrados

**Descripción detallada:**  
- **Propósito:**  
Desarrollar la funcionalidad backend que permita a pacientes autenticados consultar el perfil completo de un especialista, mostrando información adicional relevante para la comparación y agendamiento.
- **Detalle específico:**  
Implementar la lógica en el controlador para el endpoint `GET /api/patient/doctors/:id`:
  - Consultar las entidades DOCTOR, USER, DOCTOR_SPECIALTY, SPECIALTY, LOCATION, CITY, STATE y RATING.
  - Retornar: nombre, apellidos, especialidad, biografía, foto, cédula profesional, título, ciudad, estado, dirección profesional, valoración promedio y comentarios de pacientes, disponibilidad para agendar cita.
  - Validar que el especialista esté activo.
  - Mostrar información adicional solo si el usuario está autenticado como paciente.

**Criterios de aceptación:**  
- El endpoint retorna el perfil completo del especialista para pacientes autenticados.
- Se incluyen datos adicionales respecto al endpoint público.
- El especialista debe estar activo para mostrar su perfil.
- **Pruebas de validación:**  
  - Probar el endpoint con un paciente autenticado y verificar que se muestran los datos completos.
  - Probar con un especialista inactivo y validar que no se muestra el perfil.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio, Seguridad

**Comentarios y Notas:**  
Revisar el modelo de datos y criterios de aceptación del Product Backlog y PRD para asegurar el cumplimiento normativo y la correcta relación entre entidades.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para implementación de lógica de consulta de perfil completo de especialista para pacientes.

### 8.5 [Backend] Agregar validaciones y controles de acceso para mostrar información sensible solo a pacientes autenticados

**Descripción detallada:**  
- **Propósito:**  
Garantizar que solo los pacientes autenticados puedan acceder a información sensible y completa del perfil de especialista, cumpliendo con la LFPDPPP y los criterios del PRD.
- **Detalle específico:**  
Implementar validaciones en el controlador del endpoint `GET /api/patient/doctors/:id` para:
  - Verificar que el usuario esté autenticado como paciente antes de mostrar datos sensibles (dirección profesional, teléfono, comentarios de pacientes).
  - Ocultar información sensible para usuarios no autenticados o con roles distintos.
  - Registrar intentos de acceso no autorizado para auditoría.

**Criterios de aceptación:**  
- Solo pacientes autenticados pueden ver información sensible del perfil de especialista.
- Los datos sensibles no se incluyen en la respuesta para usuarios no autorizados.
- El endpoint cumple con la normativa LFPDPPP.
- **Pruebas de validación:**  
  - Probar el endpoint como paciente autenticado y como visitante/no autenticado, verificando los datos retornados.
  - Revisar la respuesta y asegurar que solo se incluyen los campos permitidos según el rol.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Seguridad, Validación

**Comentarios y Notas:**  
Revisar el modelo de datos y criterios legales en el PRD para asegurar el cumplimiento normativo y correcto control de acceso.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para validaciones y controles de acceso en perfil completo de especialista.

### 8.6 [Backend] Documentar los endpoints de búsqueda y perfil de especialista para pacientes (Swagger o README)

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando los endpoints de búsqueda y perfil completo de especialista para pacientes autenticados.
- **Detalle específico:**  
Documentar los endpoints:
  - `GET /api/patient/doctors/search`
  - `GET /api/patient/doctors/:id`
Incluyendo:
  - Descripción de la funcionalidad y requisitos de autenticación.
  - Parámetros de consulta y ruta (especialidad, ubicación, valoración, disponibilidad, id).
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (incluyendo información adicional para pacientes).
  - Campos sensibles y controles de acceso.
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- Se especifica el acceso autenticado y los datos adicionales para pacientes.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales de los endpoints.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Actualizar la documentación si los endpoints cambian en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoints de búsqueda y perfil de especialista para pacientes.

### 8.7 [Backend] Crear pruebas unitarias para los endpoints de búsqueda y perfil de especialista para pacientes

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento de los endpoints de búsqueda y perfil completo de especialista para pacientes mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para los endpoints:
  - `GET /api/patient/doctors/search`
  - `GET /api/patient/doctors/:id`
Las pruebas deben cubrir:
  - Búsqueda exitosa con filtros avanzados y usuario autenticado.
  - Consulta exitosa de perfil completo con usuario autenticado.
  - Ocultamiento de información sensible para usuarios no autenticados.
  - Manejo de especialistas inactivos y errores por ID inexistente o formato incorrecto.
  - Validación de paginación y tiempos de respuesta.
Utilizar el framework de pruebas definido en el backend (por ejemplo, Jest o Mocha).

**Criterios de aceptación:**  
- Las pruebas unitarias cubren los casos principales y errores de ambos endpoints.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar el comando de pruebas y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Pruebas Unitarias

**Comentarios y Notas:**  
Actualizar las pruebas si los endpoints cambian en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias de endpoints de búsqueda y perfil de especialista para pacientes.

## 9. Agendar cita con especialista [US-5]

- **ID:** 5  
- **Título:** Agendar cita con especialista  
- **Descripción:** Como paciente, quiero agendar una cita con un especialista, para reservar una consulta de manera sencilla.

### 9.1 [Backend] Diseñar el endpoint para agendar cita con especialista

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los pacientes agendar una cita con un especialista, seleccionando fecha y hora disponibles.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `POST /api/appointments`) que reciba:
  - `doctor_id` (ID del especialista)
  - `patient_id` (ID del paciente, obtenido del token de autenticación)
  - `appointment_date` (fecha y hora solicitada)
  - `reason` (motivo de la consulta, opcional)
El endpoint debe validar que el paciente esté autenticado y que la fecha/hora estén disponibles en la agenda del especialista.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- Los parámetros permiten seleccionar especialista, fecha y hora.
- El endpoint requiere autenticación de paciente.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.
  - Probar acceso con usuario autenticado y verificar la validación de disponibilidad.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Asegurarse de que el endpoint cumpla con los criterios de aceptación del Product Backlog y modelo de datos. Considerar dependencias con la gestión de agenda y disponibilidad del especialista.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint para agendar cita con especialista.

### 9.2 [Backend] Implementar la lógica de agendamiento de cita con especialista

**Descripción detallada:**  
- **Propósito:**  
Desarrollar la funcionalidad backend que permita a pacientes autenticados agendar una cita con un especialista, validando disponibilidad y evitando conflictos de horario.
- **Detalle específico:**  
Implementar la lógica en el controlador para el endpoint `POST /api/appointments`:
  - Validar autenticación del paciente.
  - Verificar que la fecha y hora solicitadas (`appointment_date`) estén disponibles en la agenda del especialista.
  - Validar que no existan citas duplicadas o conflictos de horario para el especialista y el paciente.
  - Registrar la cita en la entidad APPOINTMENT con estado "pending".
  - Retornar confirmación de la cita agendada.

**Criterios de aceptación:**  
- El paciente autenticado puede agendar una cita solo en horarios disponibles.
- No se permite agendar citas duplicadas o en horarios ocupados.
- La cita se registra correctamente en la base de datos con estado "pending".
- El sistema retorna confirmación de la cita.
- **Pruebas de validación:**  
  - Probar agendamiento con horarios disponibles y ocupados.
  - Verificar que no se permiten duplicados ni conflictos de horario.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio, Seguridad

**Comentarios y Notas:**  
Revisar el modelo de datos (APPOINTMENT, DOCTOR, PATIENT) y dependencias con la gestión de agenda y disponibilidad. Considerar futuras extensiones para cancelación y reprogramación.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para implementación de lógica de agendamiento de cita con especialista.

### 9.3 [Backend] Validar disponibilidad y conflictos de horario al agendar cita

**Historia de usuario relacionada:**  
- **ID:** 5  
- **Título:** Agendar cita con especialista  
- **Descripción:** Como paciente, quiero agendar una cita con un especialista, para reservar una consulta de manera sencilla.

**Descripción detallada:**  
- **Propósito:**  
Asegurar que la fecha y hora seleccionadas por el paciente estén disponibles en la agenda del especialista y que no existan conflictos de horario antes de registrar la cita.
- **Detalle específico:**  
Implementar validaciones en el controlador del endpoint `POST /api/appointments` para:
  - Consultar la agenda del especialista y verificar disponibilidad en la fecha/hora solicitada.
  - Validar que el paciente no tenga otra cita en el mismo horario.
  - Retornar un error claro si la fecha/hora no está disponible o existe conflicto.
  - Permitir agendar solo si no hay conflictos.

**Criterios de aceptación:**  
- El sistema valida disponibilidad y evita conflictos de horario.
- El paciente recibe mensajes claros en caso de conflicto o falta de disponibilidad.
- Solo se permite agendar citas en horarios libres.
- **Pruebas de validación:**  
  - Probar agendamiento en horarios ocupados y libres.
  - Verificar que no se permiten duplicados ni conflictos para paciente y especialista.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Validación, Seguridad

**Comentarios y Notas:**  
Revisar el modelo de datos (APPOINTMENT, DOCTOR, PATIENT) y dependencias con la gestión de agenda y disponibilidad.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para validación de disponibilidad y conflictos de horario al agendar cita.

### 9.4 [Backend] Documentar el endpoint para agendar cita con especialista

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint de agendamiento de citas para que otros desarrolladores y el frontend puedan consumirlo correctamente.
- **Detalle específico:**  
Documentar el endpoint `POST /api/appointments` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad y requisitos de autenticación.
  - Parámetros de entrada (`doctor_id`, `appointment_date`, `reason`).
  - Ejemplo de petición y respuesta.
  - Validaciones de disponibilidad y conflictos de horario.
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- Se especifica el acceso autenticado y las validaciones de disponibilidad.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales del endpoint.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Actualizar la documentación si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoint para agendar cita con especialista.

### 9.5 [Backend] Documentar el endpoint para agendar cita con especialista

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint de agendamiento de citas para que otros desarrolladores y el frontend puedan consumirlo correctamente.
- **Detalle específico:**  
Documentar el endpoint `POST /api/appointments` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad y requisitos de autenticación.
  - Parámetros de entrada (`doctor_id`, `appointment_date`, `reason`).
  - Ejemplo de petición y respuesta.
  - Validaciones de disponibilidad y conflictos de horario.
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- Se especifica el acceso autenticado y las validaciones de disponibilidad.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales del endpoint.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Actualizar la documentación si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoint para agendar cita con especialista.

### 9.6 [Backend] Crear pruebas unitarias para el endpoint de agendar cita con especialista

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento del endpoint de agendamiento de citas mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para el endpoint `POST /api/appointments` que cubran:
  - Agendamiento exitoso con horarios disponibles y usuario autenticado.
  - Manejo de conflictos de horario y disponibilidad.
  - Validación de parámetros obligatorios y opcionales.
  - Manejo de errores por especialista/paciente inactivo o IDs inexistentes.
Utilizar el framework de pruebas definido en el backend (por ejemplo, Jest o Mocha).

**Criterios de aceptación:**  
- Las pruebas unitarias cubren los casos principales y errores del endpoint.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar el comando de pruebas y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Pruebas Unitarias

**Comentarios y Notas:**  
Actualizar las pruebas si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias del endpoint de agendar cita con especialista.

## 10. Gestionar agenda y disponibilidad [US-8]

**Historia de usuario relacionada:**  
- **ID:** 8  
- **Título:** Gestionar agenda y disponibilidad  
- **Descripción:** Como médico especialista, quiero gestionar mi agenda y disponibilidad, para organizar mis consultas y confirmar o rechazar citas.

### 10.1 [Backend] Diseñar el endpoint para gestionar agenda y disponibilidad del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los médicos especialistas gestionar su agenda, definir disponibilidad y administrar citas.
- **Detalle específico:**  
Diseñar los siguientes endpoints REST:
  - `GET /api/doctor/availability` (consultar disponibilidad actual)
  - `POST /api/doctor/availability` (definir o modificar disponibilidad)
  - `GET /api/doctor/appointments` (consultar citas agendadas)
  - `PATCH /api/doctor/appointments/:id` (confirmar o rechazar cita)
Los endpoints deben requerir autenticación de médico y permitir bloquear fechas por motivos personales.

**Criterios de aceptación:**  
- Los endpoints están definidos y documentados en el backend.
- Permiten consultar, definir y modificar disponibilidad.
- Permiten consultar citas y confirmar/rechazar citas.
- Requieren autenticación de médico especialista.
- **Pruebas de validación:**  
  - Revisar la definición de los endpoints y sus parámetros en el código y documentación.
  - Probar acceso con usuario autenticado y verificar las operaciones permitidas.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Asegurarse de que los endpoints cumplan con los criterios de aceptación del Product Backlog y modelo de datos. Considerar dependencias con la gestión de citas y notificaciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint para gestionar agenda y disponibilidad del médico especialista.

### 10.2 [Backend] Implementar la lógica para definir y modificar disponibilidad del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Permitir que el médico especialista defina y modifique sus horarios disponibles para consultas, bloqueando fechas por motivos personales y actualizando la agenda en tiempo real.
- **Detalle específico:**  
Implementar la lógica en el controlador para los endpoints:
  - `POST /api/doctor/availability` (definir/modificar disponibilidad)
  - Validar autenticación y rol de médico especialista.
  - Registrar rangos de fechas y horas disponibles en la base de datos.
  - Permitir bloquear fechas específicas por motivos personales.
  - Actualizar la disponibilidad en tiempo real para reflejar cambios en la agenda.

**Criterios de aceptación:**  
- El médico puede definir y modificar su disponibilidad de manera flexible.
- Las fechas bloqueadas no aparecen como disponibles para agendar citas.
- La disponibilidad se actualiza correctamente en la base de datos.
- **Pruebas de validación:**  
  - Probar la definición y modificación de disponibilidad con diferentes rangos de fechas y horas.
  - Verificar que las fechas bloqueadas no permiten agendar citas.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio, Seguridad

**Comentarios y Notas:**  
Revisar el modelo de datos (DOCTOR, APPOINTMENT) y dependencias con la gestión de citas y notificaciones.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para implementación de lógica de disponibilidad del médico especialista.

### 10.3 [Backend] Implementar la lógica para consultar citas agendadas y disponibilidad actual del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Permitir que el médico especialista consulte su agenda de citas y su disponibilidad actual, facilitando la organización y planificación de sus consultas.
- **Detalle específico:**  
Implementar la lógica en los controladores para los endpoints:
  - `GET /api/doctor/availability`: Retornar los rangos de fechas y horas disponibles del médico.
  - `GET /api/doctor/appointments`: Retornar el listado de citas agendadas, incluyendo información relevante del paciente y estado de la cita.
  - Validar autenticación y rol de médico especialista.
  - Filtrar citas por fecha y estado si se requiere.
  - Asegurar que la información cumpla con la normativa de protección de datos personales.

**Criterios de aceptación:**  
- El médico puede consultar su disponibilidad y el listado de citas agendadas.
- La información de citas incluye datos relevantes del paciente y estado de la cita.
- El sistema permite filtrar citas por fecha y estado.
- Cumple con la normativa LFPDPPP.
- **Pruebas de validación:**  
  - Probar la consulta de disponibilidad y citas con diferentes filtros.
  - Verificar que los datos personales del paciente se muestran solo según permisos.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio, Seguridad

**Comentarios y Notas:**  
Revisar el modelo de datos (APPOINTMENT, PATIENT, DOCTOR) y dependencias con la gestión de agenda y protección de datos.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para lógica de consulta de citas y disponibilidad del médico especialista.

### 10.4 [Backend] Implementar la lógica para confirmar o rechazar citas agendadas por el médico especialista

**Descripción detallada:**  
- **Propósito:**  
Permitir que el médico especialista confirme o rechace citas agendadas, actualizando el estado de la cita y notificando al paciente sobre el cambio.
- **Detalle específico:**  
Implementar la lógica en el controlador para el endpoint `PATCH /api/doctor/appointments/:id`:
  - Validar autenticación y rol de médico especialista.
  - Permitir cambiar el estado de la cita a "confirmed" o "rejected".
  - Registrar la acción en la base de datos y actualizar la disponibilidad si la cita es rechazada.
  - Notificar al paciente sobre la confirmación o rechazo de la cita (puede ser por correo o notificación interna).

**Criterios de aceptación:**  
- El médico puede confirmar o rechazar citas agendadas desde su agenda.
- El estado de la cita se actualiza correctamente en la base de datos.
- El paciente recibe notificación sobre el cambio de estado.
- La disponibilidad se actualiza si la cita es rechazada.
- **Pruebas de validación:**  
  - Probar la confirmación y rechazo de citas con diferentes estados.
  - Verificar que el paciente recibe la notificación correspondiente.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio, Seguridad, Notificaciones

**Comentarios y Notas:**  
Revisar el modelo de datos (APPOINTMENT, NOTIFICATION) y dependencias con la gestión de agenda y notificaciones.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para lógica de confirmación/rechazo de citas por el médico especialista.

### 10.5 [Backend] Documentar los endpoints para gestión de agenda y disponibilidad del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando los endpoints de gestión de agenda y disponibilidad para médicos especialistas.
- **Detalle específico:**  
Documentar los endpoints:
  - `GET /api/doctor/availability`
  - `POST /api/doctor/availability`
  - `GET /api/doctor/appointments`
  - `PATCH /api/doctor/appointments/:id`
Incluyendo:
  - Descripción de la funcionalidad y requisitos de autenticación.
  - Parámetros de consulta, entrada y ruta.
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (disponibilidad, citas, estado de cita).
  - Campos sensibles y controles de acceso.
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- Se especifica el acceso autenticado y las operaciones permitidas para médicos.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales de los endpoints.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Actualizar la documentación si los endpoints cambian en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoints de gestión de agenda y disponibilidad del médico especialista.

### 10.6 [Backend] Crear pruebas unitarias para los endpoints de gestión de agenda y disponibilidad del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento de los endpoints de gestión de agenda y disponibilidad mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para los endpoints:
  - `GET /api/doctor/availability`
  - `POST /api/doctor/availability`
  - `GET /api/doctor/appointments`
  - `PATCH /api/doctor/appointments/:id`
Las pruebas deben cubrir:
  - Definición y modificación exitosa de disponibilidad.
  - Consulta de citas y disponibilidad con usuario autenticado.
  - Confirmación y rechazo de citas.
  - Validación de permisos y control de acceso.
  - Manejo de errores por fechas bloqueadas, citas inexistentes o estados inválidos.
Utilizar el framework de pruebas definido en el backend (por ejemplo, Jest o Mocha).

**Criterios de aceptación:**  
- Las pruebas unitarias cubren los casos principales y errores de los endpoints.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar el comando de pruebas y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Pruebas Unitarias

**Comentarios y Notas:**  
Actualizar las pruebas si los endpoints cambian en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias de endpoints de gestión de agenda y disponibilidad del médico especialista.

## 11. Ver listado de próximas citas [US-9]

**Historia de usuario relacionada:**  
- **ID:** 9  
- **Título:** Ver listado de próximas citas  
- **Descripción:** Como médico especialista, quiero ver el listado de mis próximas citas, para planificar mi día de trabajo.

### 11.1 [Backend] Diseñar el endpoint para ver listado de próximas citas del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los médicos especialistas consultar el listado actualizado de sus próximas citas.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `GET /api/doctor/upcoming-appointments`) que:
  - Requiera autenticación de médico especialista.
  - Retorne el listado de citas futuras (estado: pending/confirmed) ordenadas por fecha.
  - Incluya información relevante del paciente (nombre, teléfono, motivo de consulta) y detalles de la cita (fecha, hora, estado).
  - Permita filtrar por fecha y estado si es necesario.
  - Cumpla con la normativa de protección de datos personales (LFPDPPP).

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- El médico puede consultar el listado de próximas citas con información relevante.
- El acceso requiere autenticación y respeta la privacidad de los datos.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.
  - Probar acceso con usuario autenticado y verificar la información retornada.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Asegurarse de que el endpoint cumpla con los criterios de aceptación del Product Backlog, modelo de datos y normativas de privacidad.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint para ver próximas citas del médico especialista.

### 11.2 [Backend] Implementar la lógica para consultar el listado de próximas citas del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Desarrollar la funcionalidad backend que permita a los médicos especialistas consultar el listado actualizado de sus próximas citas, mostrando información relevante y cumpliendo con la normativa de protección de datos personales.
- **Detalle específico:**  
Implementar la lógica en el controlador para el endpoint `GET /api/doctor/upcoming-appointments`:
  - Validar autenticación y rol de médico especialista.
  - Consultar la entidad APPOINTMENT filtrando por `doctor_id`, estado ("pending", "confirmed") y fecha futura.
  - Incluir información relevante del paciente (nombre, teléfono, motivo de consulta) y detalles de la cita (fecha, hora, estado).
  - Permitir filtrar por fecha y estado si es necesario.
  - Cumplir con la LFPDPPP ocultando datos sensibles según permisos.

**Criterios de aceptación:**  
- El médico puede consultar el listado de próximas citas con información relevante y actualizada.
- El acceso requiere autenticación y respeta la privacidad de los datos personales.
- El sistema permite filtrar citas por fecha y estado.
- **Pruebas de validación:**  
  - Probar la consulta con usuario autenticado y verificar la información retornada.
  - Validar el filtrado por fecha y estado.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio, Seguridad

**Comentarios y Notas:**  
Revisar el modelo de datos (APPOINTMENT, PATIENT, DOCTOR) y dependencias con la gestión de agenda y protección de datos.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para lógica de consulta de próximas citas del médico especialista.

### 11.3 [Backend] Documentar el endpoint para ver próximas citas del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint para consultar próximas citas, permitiendo que el frontend y otros desarrolladores lo consuman correctamente.
- **Detalle específico:**  
Documentar el endpoint `GET /api/doctor/upcoming-appointments` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad y requisitos de autenticación.
  - Parámetros de consulta y posibles filtros (fecha, estado).
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (información relevante del paciente y cita).
  - Campos sensibles y controles de acceso conforme a la LFPDPPP.
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- Se especifica el acceso autenticado y las restricciones de privacidad.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales del endpoint.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Actualizar la documentación si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoint de próximas citas del médico especialista.

### 11.4 [Backend] Crear pruebas unitarias para el endpoint de próximas citas del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento del endpoint de próximas citas mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para el endpoint `GET /api/doctor/upcoming-appointments` que cubran:
  - Consulta exitosa de próximas citas con usuario autenticado.
  - Filtrado por fecha y estado.
  - Validación de permisos y control de acceso.
  - Manejo de errores por citas inexistentes, estados inválidos o datos sensibles.
Utilizar el framework de pruebas definido en el backend (por ejemplo, Jest o Mocha).

**Criterios de aceptación:**  
- Las pruebas unitarias cubren los casos principales y errores del endpoint.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar el comando de pruebas y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Pruebas Unitarias

**Comentarios y Notas:**  
Actualizar las pruebas si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias del endpoint de próximas citas del médico especialista.

### 11.5 [Backend] Ticket de despliegue inicial del sistema Buscadoc

**Descripción detallada:**  
- **Propósito:**  
Preparar y ejecutar el despliegue inicial del sistema Buscadoc, asegurando que el backend esté disponible para pruebas y uso real.
- **Detalle específico:**  
- Configurar el entorno de producción (variables de entorno, base de datos PostgreSQL, almacenamiento de archivos).
- Generar build de backend y frontend.
- Desplegar el backend en el servidor o plataforma seleccionada (Heroku, Vercel, AWS, etc.).
- Verificar la conectividad con la base de datos y el correcto funcionamiento de los endpoints principales.
- Documentar el proceso de despliegue y los pasos para futuras actualizaciones.

**Criterios de aceptación:**  
- El sistema está desplegado y accesible desde el frontend y herramientas de prueba.
- El backend responde correctamente a los endpoints principales.
- La base de datos está conectada y operativa.
- El proceso de despliegue está documentado y reproducible.
- **Pruebas de validación:**  
  - Acceder al sistema desde el frontend y probar los endpoints principales.
  - Verificar logs y monitoreo básico del sistema en producción.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Despliegue, Documentación

**Comentarios y Notas:**  
Asegurarse de que las variables de entorno y credenciales estén protegidas. Documentar cualquier incidencia o ajuste realizado durante el despliegue.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para despliegue inicial del sistema Buscadoc.

## 12. Crear la carpeta frontend e inicializar el proyecto con npm

**Descripción detallada:**  
- **Propósito:**  
Establecer la estructura base del frontend para el sistema Buscadoc, permitiendo la gestión independiente del código y dependencias de la interfaz de usuario.
- **Detalle específico:**  
Crear la carpeta `frontend` en el directorio raíz del proyecto y ejecutar la inicialización de npm para generar el archivo `package.json`. No se instalarán dependencias en este ticket.

**Criterios de aceptación:**  
- Se crea la carpeta `frontend` en la raíz del proyecto.
- Se ejecuta `npm init` dentro de la carpeta y se genera el archivo `package.json`.
- El comando se ejecuta sin errores y el archivo queda listo para instalar dependencias.
- **Pruebas de validación:**  
  - Verificar que la carpeta existe y contiene el archivo `package.json`.
  - Ejecutar `npm install` (sin paquetes) y confirmar que no hay errores.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
0.5 horas

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Frontend, Configuración

**Comentarios y Notas:**  
Este ticket es el primer paso para la configuración del frontend. No incluye instalación de dependencias ni configuración adicional.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para inicialización de frontend.

## 13. Instalar las dependencias necesarias en frontend (React + Tailwind CSS + Headless UI, react-i18next, etc.)

**Descripción detallada:**  
- **Propósito:**  
Preparar el entorno de desarrollo frontend instalando todas las dependencias esenciales para el stack definido en el PRD, permitiendo la implementación de la interfaz de usuario y consumo de la API.
- **Detalle específico:**  
Instalar los siguientes paquetes en la carpeta `frontend`:
  - react
  - tailwindcss
  - headlessui/react
  - react-i18next
  - axios (para consumo de API)
  - next
  - dotenv
  - Otros paquetes necesarios según el PRD

**Criterios de aceptación:**  
- Todos los paquetes principales del stack están instalados correctamente.
- El archivo `package.json` refleja las dependencias instaladas.
- No hay errores tras la instalación.
- **Pruebas de validación:**  
  - Ejecutar `npm ls` y verificar que todas las dependencias aparecen sin conflictos.
  - Probar importación básica de cada paquete en un archivo de prueba.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Frontend, Configuración

**Comentarios y Notas:**  
Revisar el PRD para confirmar versiones y dependencias adicionales. Documentar cualquier paquete extra instalado.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para instalación de dependencias frontend.

## 14. Configurar el entorno de desarrollo para frontend (variables de entorno, archivo .env)

**Descripción detallada:**  
- **Propósito:**  
Asegurar que el frontend tenga configuraciones seguras y flexibles para consumir la API, gestionar internacionalización y otros servicios, siguiendo las mejores prácticas y requisitos del PRD.
- **Detalle específico:**  
Crear un archivo `.env` en la carpeta `frontend` con las siguientes variables mínimas:
  - `APP_API_URL` (URL base de la API backend)
  - `APP_I18N_LOCALE` (idioma por defecto)
  - Variables adicionales según dependencias (Firebase, etc. si aplica)
Configurar el uso de `dotenv` o el sistema de variables de entorno de React en el proyecto para cargar estas variables.

**Criterios de aceptación:**  
- El archivo `.env` existe y contiene las variables necesarias.
- El frontend puede leer las variables de entorno correctamente.
- El consumo de la API y la internacionalización funcionan usando las variables configuradas.
- **Pruebas de validación:**  
  - Ejecutar el frontend y verificar que consume la API usando `APP_API_URL`.
  - Probar el cambio de idioma y otras variables configuradas.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Frontend, Configuración

**Comentarios y Notas:**  
No subir el archivo `.env` al repositorio. Documentar las variables requeridas en un archivo `README` o similar.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para configuración de entorno

## 15. Buscar especialistas por especialidad y ubicación [US-1]

**Historia de usuario relacionada:**  
- **ID:** 1  
- **Título:** Buscar especialistas por especialidad y ubicación  
- **Descripción:** Como visitante, quiero buscar especialistas por especialidad y ubicación (ciudad y estado), para encontrar médicos adecuados a mis necesidades sin necesidad de registrarme.

### 15.1 [Frontend] Maquetar el layout base de la aplicación (header, menú, footer, contenedor principal)

**Descripción detallada:**  
- **Propósito:**  
Diseñar y maquetar el layout base de la aplicación Buscadoc en React, asegurando una estructura visual consistente para todas las vistas principales.
- **Detalle específico:**  
Crear los componentes base:
  - Header con logo y navegación principal.
  - Menú lateral o superior para navegación entre vistas.
  - Footer con información legal y enlaces útiles.
  - Contenedor principal para renderizar las vistas.
Utilizar Tailwind CSS + Headless UI para el diseño responsivo y asegurar compatibilidad con futuras vistas.

**Criterios de aceptación:**  
- El layout base está implementado y disponible en el frontend.
- El diseño es responsivo y cumple con las pautas de UI/UX del PRD.
- El layout permite renderizar correctamente las vistas principales.
- **Pruebas de validación:**  
  - Visualizar el layout en diferentes dispositivos y tamaños de pantalla.
  - Verificar que los componentes base se muestran correctamente.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, UI/UX, Maquetado

**Comentarios y Notas:**  
Utilizar Tailwind CSS + Headless UI para componentes visuales y seguir la guía de estilos del PRD. Este ticket no incluye lógica de consumo de API ni internacionalización.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para maquetado de layout base de la aplicación.

### 15.2 [Frontend] Maquetar la vista de búsqueda de especialistas (formulario de filtros: especialidad, ciudad, estado)

**Descripción detallada:**  
- **Propósito:**  
Diseñar y maquetar la vista principal de búsqueda en React, permitiendo al usuario filtrar especialistas por especialidad, ciudad y estado.
- **Detalle específico:**  
Crear un formulario con los siguientes campos:
  - Input para busqueda por nombre del médico especialista
  - Select de especialidad (con datos del catálogo).
  - Select de estado (con datos del catálogo).
  - Select de ciudad (con datos del catálogo).
  - Rango de valoración minima se encuentra oculto hasta iniciar sesión
  - Select de dispinibilidad se encuentra oculto hasta iniciar sesión
  - Botón para ejecutar la búsqueda.
Maquetar el área de resultados para mostrar la lista de especialistas filtrados. Utilizar Tailwind CSS + Headless UI para el diseño responsivo y asegurar accesibilidad.

**Criterios de aceptación:**  
- La vista de búsqueda está implementada y disponible en el frontend.
- El formulario permite seleccionar filtros y ejecutar la búsqueda.
- El diseño es responsivo y cumple con las pautas de UI/UX del PRD.
- El área de resultados está lista para integrar la lógica de consumo de API.
- **Pruebas de validación:**  
  - Visualizar la vista en diferentes dispositivos y tamaños de pantalla.
  - Verificar que los campos de filtro y el área de resultados se muestran correctamente.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, UI/UX, Maquetado

**Comentarios y Notas:**  
Utilizar Tailwind CSS + Headless UI para componentes visuales y seguir la guía de estilos del PRD. Este ticket no incluye lógica de consumo de API ni internacionalización.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para maquetado de vista de búsqueda de especialistas.

### 15.3 [Frontend] Implementar la lógica de consumo de API para búsqueda de especialistas y mostrar resultados

**Descripción detallada:**  
- **Propósito:**  
Conectar el formulario de búsqueda con el backend, consumir el endpoint de búsqueda y mostrar los resultados en la vista correspondiente.
- **Detalle específico:**  
- Implementar la llamada al endpoint `GET /api/doctors/search` usando Axios.
- Enviar los filtros seleccionados (nombre, especialidad, estado) como parámetros de consulta.
- Renderizar la lista de especialistas en el área de resultados, mostrando nombre, especialidad, ciudad, estado, foto y valoración.
- Manejar estados de carga, error y resultados vacíos.
- Asegurar que la búsqueda responde en menos de 2 segundos.

**Criterios de aceptación:**  
- El formulario ejecuta la búsqueda y muestra los resultados correctamente.
- Los datos se obtienen del backend y se renderizan en la vista.
- Se manejan estados de carga, error y resultados vacíos.
- El tiempo de respuesta es menor a 2 segundos.
- **Pruebas de validación:**  
  - Probar la búsqueda con diferentes filtros y verificar los resultados.
  - Simular errores y estados vacíos.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, Consumo de API, UI/UX

**Comentarios y Notas:**  
Utilizar Axios para las llamadas a la API y seguir la estructura de datos definida en el backend. Validar que los datos mostrados cumplen con los criterios del PRD.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para lógica de consumo de API y renderizado de resultados en búsqueda de especialistas.

## 15.4 [Frontend] Configurar internacionalización (i18n) para la vista de búsqueda

**Descripción detallada:**  
- **Propósito:**  
Permitir que la vista de búsqueda muestre todos los textos y mensajes de acuerdo al idioma seleccionado, facilitando la experiencia de usuario para el público objetivo.
- **Detalle específico:**  
- Instalar y configurar react-i18next en el proyecto frontend.
- Crear archivos de traducción con los textos de la vista de búsqueda (etiquetas, botones, mensajes de error, estados vacíos).
- Integrar la configuración de idioma en el layout base y la vista de búsqueda.
- Asegurar que todos los textos de la vista se gestionan mediante el sistema de internacionalización.

**Criterios de aceptación:**  
- Todos los textos de la vista de búsqueda se muestran con el idioma seleccionado por defecto.
- El sistema permite cambiar el idioma desde la configuración.
- Los textos se gestionan mediante archivos de traducción.
- **Pruebas de validación:**  
  - Visualizar la vista de búsqueda y verificar que todos los textos se encuentran disponibles.
  - Cambiar el idioma (si está habilitado) y verificar la traducción.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Frontend, Internacionalización, UI/UX

**Comentarios y Notas:**  
Utilizar react-i18next y seguir la estructura recomendada en el PRD. Solo configurar español en esta etapa.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para configuración de internacionalización en español en la vista de búsqueda.

## 15.5 [Frontend] Documentar el componente/vista de búsqueda en README o Storybook

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración, mantenimiento y escalabilidad del frontend documentando el componente/vista de búsqueda para que el equipo y futuros desarrolladores comprendan su estructura y funcionamiento.
- **Detalle específico:**  
- Documentar el componente principal de búsqueda en el README del frontend o en Storybook.
- Incluir descripción de props, eventos, estructura visual y ejemplos de uso.
- Documentar la integración con el sistema de internacionalización y consumo de API.
- Agregar capturas de pantalla o ejemplos visuales si es posible.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y estructura del componente.
- Describe la integración con API y i18n.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales y visuales del componente.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Frontend, Documentación, UI/UX

**Comentarios y Notas:**  
Actualizar la documentación si el componente cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para documentación de componente/vista de búsqueda.

## 15.6 [Frontend] Crear pruebas end-to-end con Cypress para la vista de búsqueda de especialistas

**Descripción detallada:**  
- **Propósito:**  
Asegurar que la vista de búsqueda funciona correctamente en el flujo real del usuario, validando la interacción con el formulario, la visualización de resultados y el manejo de errores.
- **Detalle específico:**  
- Implementar pruebas end-to-end con Cypress para:
  - Interacción con el formulario de filtros (especialidad, ciudad, estado).
  - Ejecución de la búsqueda y visualización de resultados.
  - Manejo de estados de carga, error y resultados vacíos.
  - Validar que los textos se muestran en español.
- Automatizar la ejecución de pruebas en el entorno de desarrollo.

**Criterios de aceptación:**  
- Las pruebas cubren los casos principales de uso de la vista de búsqueda.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar las pruebas Cypress y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Pruebas End-to-End  
- Característica del producto: Frontend, Pruebas, UI/UX

**Comentarios y Notas:**  
Actualizar las pruebas si la vista de búsqueda cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para pruebas end-to-end de la vista de búsqueda de especialistas.

## 16. Ver perfil de especialista [US-2]

**Historia de usuario relacionada:**  
- **ID:** 2  
- **Título:** Ver perfil de especialista  
- **Descripción:** Como visitante, quiero ver el perfil de un especialista, para conocer su información profesional y ubicación general antes de decidirme a agendar una cita.

### 16.1 [Frontend] Maquetar la vista de perfil de especialista (información profesional y ubicación general)

**Descripción detallada:**  
- **Propósito:**  
Diseñar y maquetar la vista de perfil de especialista en React, mostrando información profesional y ubicación general (ciudad y estado) según los criterios del PRD.
- **Detalle específico:**  
Crear la vista y componentes para mostrar:
  - Nombre, especialidad, biografía, foto, cédula profesional y título.
  - Ubicación general: ciudad y estado (sin dirección exacta).
  - Botón para regresar a resultados de búsqueda.
Utilizar Tailwind CSS + Headless UI para el diseño responsivo y asegurar accesibilidad.

**Criterios de aceptación:**  
- La vista de perfil está implementada y disponible en el frontend.
- El diseño es responsivo y cumple con las pautas de UI/UX del PRD.
- Solo se muestran datos permitidos para visitantes (sin datos personales sensibles).
- **Pruebas de validación:**  
  - Visualizar la vista en diferentes dispositivos y tamaños de pantalla.
  - Verificar que los datos se muestran correctamente y cumplen con los criterios de privacidad.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, UI/UX, Maquetado

**Comentarios y Notas:**  
Utilizar Tailwind CSS + Headless UI para componentes visuales y seguir la guía de estilos del PRD. Este ticket no incluye lógica de consumo de API ni internacionalización.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para maquetado de vista de perfil de especialista.

### 16.2 [Frontend] Implementar la lógica de consumo de API y renderizado de perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Conectar la vista de perfil de especialista con el backend, consumir el endpoint correspondiente y mostrar la información profesional y ubicación general en el frontend.
- **Detalle específico:**  
- Implementar la llamada al endpoint `GET /api/doctors/:id` usando Axios.
- Renderizar los datos recibidos: nombre, especialidad, biografía, foto, cédula profesional, título, ciudad y estado.
- Asegurar que no se muestran datos personales sensibles (correo, teléfono, dirección exacta).
- Manejar estados de carga, error y datos vacíos.

**Criterios de aceptación:**  
- La vista de perfil consume la API y muestra los datos correctamente.
- Solo se muestran los datos permitidos para visitantes.
- Se manejan estados de carga y error.
- **Pruebas de validación:**  
  - Probar la consulta de perfil con diferentes especialistas y verificar los datos mostrados.
  - Simular errores y estados vacíos.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, Consumo de API, UI/UX

**Comentarios y Notas:**  
Utilizar Axios para las llamadas a la API y seguir la estructura de datos definida en el backend. Validar que los datos mostrados cumplen con los criterios del PRD y la LFPDPPP.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para lógica de consumo de API y renderizado de perfil de especialista.

### 16.3 [Frontend] Configurar internacionalización (i18n) en español para la vista de perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Permitir que la vista de perfil de especialista muestre todos los textos y mensajes en español, facilitando la experiencia de usuario para el público objetivo.
- **Detalle específico:**  
- Configurar react-i18next en el proyecto frontend si no está ya configurado.
- Crear archivos de traducción para español con los textos de la vista de perfil (etiquetas, botones, mensajes de error, estados vacíos).
- Integrar la configuración de idioma en la vista de perfil de especialista.
- Asegurar que todos los textos de la vista se gestionan mediante el sistema de internacionalización.

**Criterios de aceptación:**  
- Todos los textos de la vista de perfil se muestran en español.
- Los textos se gestionan mediante archivos de traducción.
- **Pruebas de validación:**  
  - Visualizar la vista de perfil y verificar que todos los textos están en español.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Frontend, Internacionalización, UI/UX

**Comentarios y Notas:**  
Utilizar react-i18next y seguir la estructura recomendada en el PRD. Solo configurar español en esta etapa.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para configuración de internacionalización en español en la vista de perfil de especialista.

### 16.4 [Frontend] Documentar el componente/vista de perfil de especialista en README o Storybook

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración, mantenimiento y escalabilidad del frontend documentando el componente/vista de perfil de especialista para que el equipo y futuros desarrolladores comprendan su estructura y funcionamiento.
- **Detalle específico:**  
- Documentar el componente principal de perfil en el README del frontend o en Storybook.
- Incluir descripción de props, eventos, estructura visual y ejemplos de uso.
- Documentar la integración con el sistema de internacionalización y consumo de API.
- Agregar capturas de pantalla o ejemplos visuales si es posible.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y estructura del componente.
- Describe la integración con API y i18n.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales y visuales del componente.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Frontend, Documentación, UI/UX

**Comentarios y Notas:**  
Actualizar la documentación si el componente cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para documentación de componente/vista de perfil de especialista.

### 16.5 [Frontend] Crear pruebas end-to-end con Cypress para la vista de perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Asegurar que la vista de perfil de especialista funciona correctamente en el flujo real del usuario, validando la visualización de información profesional y ubicación general, y el manejo de errores.
- **Detalle específico:**  
- Implementar pruebas end-to-end con Cypress para:
  - Visualización de datos profesionales y ubicación general (ciudad y estado).
  - Validar que no se muestran datos personales sensibles.
  - Navegación desde resultados de búsqueda al perfil.
  - Manejo de estados de carga, error y datos vacíos.
  - Validar que los textos se muestran en español.
- Automatizar la ejecución de pruebas en el entorno de desarrollo.

**Criterios de aceptación:**  
- Las pruebas cubren los casos principales de uso de la vista de perfil.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar las pruebas Cypress y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Pruebas End-to-End  
- Característica del producto: Frontend, Pruebas, UI/UX

**Comentarios y Notas:**  
Actualizar las pruebas si la vista de perfil cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para pruebas end-to-end de la vista de perfil de especialista.

## 17. Buscar especialistas y ver perfiles (para pacientes autenticados) [US-4]

**Historia de usuario relacionada:**  
- **ID:** 4  
- **Título:** Buscar especialistas y ver perfiles  
- **Descripción:** Como paciente, quiero buscar especialistas y ver sus perfiles, para comparar opciones y tomar decisiones informadas.

### 17.1 [Frontend] Maquetar la vista de búsqueda avanzada para pacientes (filtros y resultados)

**Descripción detallada:**  
- **Propósito:**  
Diseñar y maquetar la vista de búsqueda avanzada en React para pacientes autenticados, permitiendo filtrar especialistas por especialidad, ubicación, valoración y disponibilidad.
- **Detalle específico:**  
Crear el formulario de búsqueda con los siguientes filtros:
  - Especialidad (select)
  - Ciudad y estado (select)
  - Valoración mínima (slider o select)
  - Disponibilidad (checkbox o select)
Maquetar el área de resultados para mostrar la lista de especialistas con información relevante y acceso al perfil completo. Utilizar Tailwind CSS + Headless UI para el diseño responsivo y asegurar accesibilidad.

**Criterios de aceptación:**  
- La vista de búsqueda avanzada está implementada y disponible solo para pacientes autenticados.
- El formulario permite seleccionar filtros y ejecutar la búsqueda.
- El diseño es responsivo y cumple con las pautas de UI/UX del PRD.
- El área de resultados está lista para integrar la lógica de consumo de API.
- **Pruebas de validación:**  
  - Visualizar la vista en diferentes dispositivos y tamaños de pantalla.
  - Verificar que los filtros y el área de resultados se muestran correctamente.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, UI/UX, Maquetado

**Comentarios y Notas:**  
Utilizar Tailwind CSS + Headless UI para componentes visuales y seguir la guía de estilos del PRD. Este ticket no incluye lógica de consumo de API ni internacionalización.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para maquetado de vista de búsqueda avanzada para pacientes.


### 17.2 [Frontend] Implementar la lógica de consumo de API y renderizado de resultados para pacientes autenticados

**Descripción detallada:**  
- **Propósito:**  
Conectar el formulario de búsqueda avanzada con el backend, consumir el endpoint de búsqueda para pacientes autenticados y mostrar los resultados en la vista correspondiente.
- **Detalle específico:**  
- Implementar la llamada al endpoint `GET /api/patient/doctors/search` usando Axios, enviando los filtros seleccionados (especialidad, ciudad, estado, valoración mínima, disponibilidad).
- Renderizar la lista de especialistas en el área de resultados, mostrando información relevante (nombre, especialidad, ciudad, estado, valoración promedio, disponibilidad).
- Permitir acceso al perfil completo de cada especialista desde los resultados.
- Manejar estados de carga, error y resultados vacíos.
- Validar que el usuario esté autenticado como paciente antes de mostrar los resultados.

**Criterios de aceptación:**  
- El formulario ejecuta la búsqueda y muestra los resultados correctamente solo para pacientes autenticados.
- Los datos se obtienen del backend y se renderizan en la vista.
- Se manejan estados de carga, error y resultados vacíos.
- **Pruebas de validación:**  
  - Probar la búsqueda con diferentes filtros y verificar los resultados.
  - Simular errores y estados vacíos.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, Consumo de API, UI/UX, Seguridad

**Comentarios y Notas:**  
Utilizar Axios para las llamadas a la API y seguir la estructura de datos definida en el backend. Validar autenticación y permisos antes de mostrar resultados.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para lógica de consumo de API y renderizado de resultados en búsqueda avanzada para pacientes.

### 17.3 [Frontend] Maquetar y consumir el perfil completo de especialista para pacientes autenticados

**Descripción detallada:**  
- **Propósito:**  
Diseñar y maquetar la vista de perfil completo de especialista en React para pacientes autenticados, mostrando información adicional relevante para la comparación y agendamiento.
- **Detalle específico:**  
- Componentes para mostrar en la vista con autenticación del paciente:
  - Nombre, especialidad, biografía, foto, cédula profesional, título.
  - Ubicación completa: ciudad, estado, dirección profesional.
  - Valoración promedio y comentarios de pacientes.
  - Disponibilidad para agendar cita.
- Implementar la llamada al endpoint `GET /api/patient/doctors/:id` usando Axios.
- Validar que el usuario esté autenticado como paciente antes de mostrar información sensible.
- Manejar estados de carga, error y datos vacíos.

**Criterios de aceptación:**  
- La vista de perfil completo consume la API y muestra los datos correctamente solo para pacientes autenticados.
- Se muestran datos adicionales respecto al perfil público.
- Se manejan estados de carga y error.
- **Pruebas de validación:**  
  - Probar la consulta de perfil con diferentes especialistas y verificar los datos mostrados.
  - Simular errores y estados vacíos.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, Consumo de API, UI/UX, Seguridad

**Comentarios y Notas:**  
Utilizar Tailwind CSS + Headless UI para componentes visuales y Axios para llamadas a la API. Validar autenticación y permisos antes de mostrar información sensible.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para maquetado y consumo de perfil completo de especialista para pacientes.

### 17.4 [Frontend] Configurar internacionalización (i18n) en español para la vista de búsqueda y perfil de especialistas (pacientes autenticados)

**Descripción detallada:**  
- **Propósito:**  
Permitir que las vistas de búsqueda avanzada y perfil completo de especialistas muestren todos los textos y mensajes en español, facilitando la experiencia de usuario para pacientes autenticados.
- **Detalle específico:**  
- Configurar react-i18next en el proyecto frontend si no está ya configurado.
- Crear archivos de traducción para español con los textos de las vistas de búsqueda avanzada y perfil completo (etiquetas, botones, mensajes de error, estados vacíos).
- Integrar la configuración de idioma en ambas vistas.
- Asegurar que todos los textos se gestionan mediante el sistema de internacionalización.

**Criterios de aceptación:**  
- Todos los textos de las vistas de búsqueda avanzada y perfil completo se muestran en español.
- Los textos se gestionan mediante archivos de traducción.
- **Pruebas de validación:**  
  - Visualizar ambas vistas y verificar que todos los textos están en español.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Frontend, Internacionalización, UI/UX

**Comentarios y Notas:**  
Utilizar react-i18next y seguir la estructura recomendada en el PRD. Solo configurar español en esta etapa.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para configuración de internacionalización en español en búsqueda y perfil de especialistas para pacientes.


### 17.5 [Frontend] Documentar los componentes/vistas de búsqueda avanzada y perfil completo para pacientes autenticados

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración, mantenimiento y escalabilidad del frontend documentando los componentes/vistas de búsqueda avanzada y perfil completo de especialistas para pacientes autenticados.
- **Detalle específico:**  
- Documentar los componentes principales en el README del frontend o en Storybook.
- Incluir descripción de props, eventos, estructura visual y ejemplos de uso.
- Documentar la integración con el sistema de internacionalización y consumo de API.
- Agregar capturas de pantalla o ejemplos visuales si es posible.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y estructura de los componentes.
- Describe la integración con API y i18n.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales y visuales de los componentes.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Frontend, Documentación, UI/UX

**Comentarios y Notas:**  
Actualizar la documentación si los componentes cambian en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para documentación de componentes/vistas de búsqueda avanzada y perfil completo para pacientes.

### 17.6 [Frontend] Crear pruebas end-to-end con Cypress para búsqueda avanzada y perfil completo de especialistas (pacientes autenticados)

**Descripción detallada:**  
- **Propósito:**  
Asegurar que las vistas de búsqueda avanzada y perfil completo de especialistas funcionan correctamente en el flujo real del usuario paciente autenticado, validando la interacción con los filtros, visualización de resultados y manejo de errores.
- **Detalle específico:**  
- Implementar pruebas end-to-end con Cypress para:
  - Interacción con el formulario de filtros avanzados (especialidad, ciudad, estado, valoración, disponibilidad).
  - Ejecución de la búsqueda y visualización de resultados.
  - Acceso al perfil completo de especialista desde los resultados.
  - Validar que solo pacientes autenticados pueden acceder a información sensible.
  - Manejo de estados de carga, error y resultados vacíos.
  - Validar que los textos se muestran en español.
- Automatizar la ejecución de pruebas en el entorno de desarrollo.

**Criterios de aceptación:**  
- Las pruebas cubren los casos principales de uso de búsqueda avanzada y perfil completo.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar las pruebas Cypress y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Pruebas End-to-End  
- Característica del producto: Frontend, Pruebas, UI/UX, Seguridad

**Comentarios y Notas:**  
Actualizar las pruebas si las vistas cambian en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para pruebas end-to-end de búsqueda avanzada y perfil completo para pacientes.

## 18. Agendar cita con especialista [US-5]

**Historia de usuario relacionada:**  
- **ID:** 5  
- **Título:** Agendar cita con especialista  
- **Descripción:** Como paciente, quiero agendar una cita con un especialista, para reservar una consulta de manera sencilla.

### 18.1 [Frontend] Maquetar la vista de agendamiento de cita (selección de fecha, hora y motivo)

**Descripción detallada:**  
- **Propósito:**  
Diseñar y maquetar el modal de agendamiento de cita en React para pacientes autenticados, permitiendo seleccionar fecha, hora y motivo de consulta.
- **Detalle específico:**  
Crear el formulario de agendamiento con los siguientes campos:
  - Calendario para seleccionar fecha disponible.
  - Selector de hora según disponibilidad del especialista.
  - Campo de texto para motivo de consulta (opcional).
  - Botón para confirmar agendamiento.
Maquetar el área de confirmación y retroalimentación visual. Utilizar Tailwind CSS + Headless UI para el diseño responsivo y asegurar accesibilidad.

**Criterios de aceptación:**  
- El modal de agendamiento está implementada y disponible solo para pacientes autenticados.
- El modal se muestra desde la vista del perfil médico al dar clic en "Agendar Cita"
- El modal se muestra despues de cargar la vista si en los query params de la URL se indica como en el siguiente ejemplo: `GET /doctor/{id]?book=1`
- El formulario permite seleccionar fecha, hora y motivo.
- El diseño es responsivo y cumple con las pautas de UI/UX del PRD.
- El área de confirmación está lista para integrar la lógica de consumo de API.
- **Pruebas de validación:**  
  - Visualizar la vista en diferentes dispositivos y tamaños de pantalla.
  - Verificar que los campos y la retroalimentación se muestran correctamente.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, UI/UX, Maquetado

**Comentarios y Notas:**  
Utilizar Tailwind CSS + Headless UI para componentes visuales y seguir la guía de estilos del PRD. Este ticket no incluye lógica de consumo de API ni internacionalización.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para maquetado de vista de agendamiento de cita.

### 18.2 [Frontend] Implementar la lógica de consumo de API y confirmación de cita

**Descripción detallada:**  
- **Propósito:**  
Conectar el formulario de agendamiento con el backend, consumir el endpoint de agendar cita y mostrar la confirmación en el frontend.
- **Detalle específico:** 
- Implementar la llamada al endpoint `GET /api/doctors/availability/{doctorId}`, utilizar su información para mostrar los días y horas disponibles en los que se puede realizar la reserva
- El rango de horas será dividido en intervalos de una hora los cuales se mostrarán en el componente 
- Implementar la llamada al endpoint `POST /api/appointments` usando Axios, enviando los datos seleccionados (doctor_id, fecha, hora, motivo).
- Validar que el usuario esté autenticado como paciente antes de permitir el agendamiento.
- Mostrar retroalimentación visual de éxito o error tras intentar agendar la cita.
- Manejar estados de carga, error y validaciones de disponibilidad.
- Actualizar la vista tras la confirmación de cita.

**Criterios de aceptación:**  
- El formulario ejecuta el agendamiento y muestra la confirmación correctamente solo para pacientes autenticados.
- Los datos se envían al backend y se recibe la respuesta adecuada.
- Se manejan estados de carga, error y validaciones de disponibilidad.
- **Pruebas de validación:**  
  - Probar el agendamiento con diferentes fechas y horas.
  - Simular errores y conflictos de disponibilidad.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, Consumo de API, UI/UX, Seguridad

**Comentarios y Notas:**  
Utilizar Axios para las llamadas a la API y seguir la estructura de datos definida en el backend. Validar autenticación y permisos antes de permitir el agendamiento.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para lógica de consumo de API y confirmación de cita.

### 18.3 [Frontend] Configurar internacionalización (i18n) en español para la vista de agendamiento de cita

**Descripción detallada:**  
- **Propósito:**  
Permitir que el modal de agendamiento de cita muestre todos los textos y mensajes en el idioma seleccionado, facilitando la experiencia de usuario para pacientes autenticados.
- **Detalle específico:**  
- Configurar react-i18next en el proyecto frontend si no está ya configurado.
- Crear archivos de traducción con los textos de la vista de agendamiento (etiquetas, botones, mensajes de error, estados vacíos).
- Integrar la configuración de idioma en la vista de agendamiento.
- Asegurar que todos los textos se gestionan mediante el sistema de internacionalización.

**Criterios de aceptación:**  
- Todos los textos de la vista de agendamiento se muestran en español.
- Los textos se gestionan mediante archivos de traducción.
- **Pruebas de validación:**  
  - Visualizar la vista y verificar que todos los textos están en español.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Frontend, Internacionalización, UI/UX

**Comentarios y Notas:**  
Utilizar react-i18next y seguir la estructura recomendada en el PRD. Solo configurar español en esta etapa.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para configuración de internacionalización en español en la vista de agendamiento de cita.

### 18.4 [Frontend] Documentar el componente/vista de agendamiento de cita en README o Storybook

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración, mantenimiento y escalabilidad del frontend documentando el componente/vista de agendamiento de cita para que el equipo y futuros desarrolladores comprendan su estructura y funcionamiento.
- **Detalle específico:**  
- Documentar el componente principal de agendamiento en el README del frontend o en Storybook.
- Incluir descripción de props, eventos, estructura visual y ejemplos de uso.
- Documentar la integración con el sistema de internacionalización y consumo de API.
- Agregar capturas de pantalla o ejemplos visuales si es posible.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y estructura del componente.
- Describe la integración con API y i18n.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales y visuales del componente.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Frontend, Documentación, UI/UX

**Comentarios y Notas:**  
Actualizar la documentación si el componente cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para documentación de componente/vista de agendamiento de cita.

---

### 18.5 [Frontend] Crear pruebas end-to-end con Cypress para agendamiento de cita

**Descripción detallada:**  
- **Propósito:**  
Asegurar que la vista de agendamiento de cita funciona correctamente en el flujo real del usuario, validando la selección de fecha/hora, envío de datos y confirmación, incluyendo manejo de errores y textos en español.
- **Detalle específico:**  
- Implementar pruebas end-to-end con Cypress para:
  - Interacción con el formulario de agendamiento (selección de fecha, hora y motivo).
  - Ejecución del agendamiento y visualización de la confirmación.
  - Manejo de estados de carga, error y validaciones de disponibilidad.
  - Validar que solo pacientes autenticados pueden agendar citas.
  - Validar que los textos se muestran en español.
- Automatizar la ejecución de pruebas en el entorno de desarrollo.

**Criterios de aceptación:**  
- Las pruebas cubren los casos principales de uso de agendamiento de cita.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar las pruebas Cypress y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Pruebas End-to-End  
- Característica del producto: Frontend, Pruebas, UI/UX, Seguridad

**Comentarios y Notas:**  
Actualizar las pruebas si la vista de agendamiento cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para documentación de componente/vista de agendamiento de cita.

## 19. Gestionar agenda y disponibilidad (para médicos especialistas) [US-8]

**Historia de usuario relacionada:**  
- **ID:** 8  
- **Título:** Gestionar agenda y disponibilidad  
- **Descripción:** Como médico especialista, quiero gestionar mi agenda y disponibilidad, para organizar mis consultas y confirmar o rechazar citas.

### 19.1 [Frontend] Maquetar la vista de gestión de agenda y disponibilidad para médicos

**Descripción detallada:**  
- **Propósito:**  
Diseñar y maquetar la vista de gestión de agenda y disponibilidad en React para médicos especialistas autenticados, permitiendo definir horarios disponibles, bloquear fechas y visualizar citas pendientes.
- **Detalle específico:**  
Crear la vista y componentes para:
  - Seleccionar y modificar horarios disponibles por día.
  - Bloquear fechas por motivos personales.
  - Visualizar citas pendientes y su estado (pendiente, confirmada, rechazada).
  - Botón para confirmar o rechazar citas.
Utilizar Tailwind CSS + Headless UI para el diseño responsivo y asegurar accesibilidad.

**Criterios de aceptación:**  
- La vista de gestión de agenda está implementada y disponible solo para médicos autenticados.
- El formulario permite definir horarios y bloquear fechas.
- El diseño es responsivo y cumple con las pautas de UI/UX del PRD.
- El área de citas pendientes está lista para integrar la lógica de consumo de API.
- **Pruebas de validación:**  
  - Visualizar la vista en diferentes dispositivos y tamaños de pantalla.
  - Verificar que los campos y la retroalimentación se muestran correctamente.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, UI/UX, Maquetado

**Comentarios y Notas:**  
Utilizar Tailwind CSS + Headless UI para componentes visuales y seguir la guía de estilos del PRD. Este ticket no incluye lógica de consumo de API ni internacionalización.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para maquetado de vista de gestión de agenda y disponibilidad

### 19.2 [Frontend] Implementar la lógica de consumo de API y renderizado de agenda/disponibilidad para médicos

**Descripción detallada:**  
- **Propósito:**  
Conectar la vista de gestión de agenda y disponibilidad con el backend, consumir los endpoints correspondientes y mostrar la información en el frontend.
- **Detalle específico:**  
- Implementar llamadas a los endpoints:
  - `GET /api/doctor/availability` para consultar disponibilidad actual.
  - `POST /api/doctor/availability` para definir o modificar disponibilidad.
  - `GET /api/doctor/appointments` para consultar citas agendadas.
  - `PATCH /api/doctor/appointments/:id` para confirmar o rechazar citas.
- Renderizar la información de horarios disponibles, fechas bloqueadas y citas pendientes.
- Permitir modificar disponibilidad y bloquear fechas desde la interfaz.
- Permitir confirmar o rechazar citas desde la vista.
- Manejar estados de carga, error y validaciones.
- Validar que el usuario esté autenticado como médico especialista.

**Criterios de aceptación:**  
- La vista consume la API y muestra la información correctamente solo para médicos autenticados.
- Se permite modificar disponibilidad y gestionar citas desde la interfaz.
- Se manejan estados de carga, error y validaciones.
- **Pruebas de validación:**  
  - Probar la consulta y modificación de disponibilidad.
  - Probar la confirmación y rechazo de citas.
  - Simular errores y estados vacíos.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, Consumo de API, UI/UX, Seguridad

**Comentarios y Notas:**  
Utilizar Axios para las llamadas a la API y seguir la estructura de datos definida en el backend. Validar autenticación y permisos antes de mostrar información.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para lógica de consumo de API y renderizado de agenda/disponibilidad para médicos.

---

### 19.3 [Frontend] Configurar internacionalización (i18n) en español para la vista de gestión de agenda y disponibilidad

**Descripción detallada:**  
- **Propósito:**  
Permitir que la vista de gestión de agenda y disponibilidad muestre todos los textos y mensajes en español, facilitando la experiencia de usuario para médicos especialistas.
- **Detalle específico:**  
- Configurar react-i18next en el proyecto frontend si no está ya configurado.
- Crear archivos de traducción para español con los textos de la vista de gestión de agenda (etiquetas, botones, mensajes de error, estados vacíos).
- Integrar la configuración de idioma en la vista de gestión de agenda y disponibilidad.
- Asegurar que todos los textos se gestionan mediante el sistema de internacionalización.

**Criterios de aceptación:**  
- Todos los textos de la vista de gestión de agenda y disponibilidad se muestran en español.
- Los textos se gestionan mediante archivos de traducción.
- **Pruebas de validación:**  
  - Visualizar la vista y verificar que todos los textos están en español.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Frontend, Internacionalización, UI/UX

**Comentarios y Notas:**  
Utilizar react-i18next y seguir la estructura recomendada en el PRD. Solo configurar español en esta etapa.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para configuración de internacionalización en español en la vista de gestión de agenda y disponibilidad para médicos.

### 19.4 [Frontend] Documentar el componente/vista de gestión de agenda y disponibilidad en README o Storybook

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración, mantenimiento y escalabilidad del frontend documentando el componente/vista de gestión de agenda y disponibilidad para que el equipo y futuros desarrolladores comprendan su estructura y funcionamiento.
- **Detalle específico:**  
- Documentar el componente principal en el README del frontend o en Storybook.
- Incluir descripción de props, eventos, estructura visual y ejemplos de uso.
- Documentar la integración con el sistema de internacionalización y consumo de API.
- Agregar capturas de pantalla o ejemplos visuales si es posible.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y estructura del componente.
- Describe la integración con API y i18n.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales y visuales del componente.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Frontend, Documentación, UI/UX

**Comentarios y Notas:**  
Actualizar la documentación si el componente cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para documentación de componente/vista de gestión de agenda y disponibilidad.

---

### 19.5 [Frontend] Crear pruebas end-to-end con Cypress para gestión de agenda y disponibilidad

**Descripción detallada:**  
- **Propósito:**  
Asegurar que la vista de gestión de agenda y disponibilidad funciona correctamente en el flujo real del usuario médico, validando la interacción con los formularios, visualización de citas y manejo de errores.
- **Detalle específico:**  
- Implementar pruebas end-to-end con Cypress para:
  - Interacción con el formulario de horarios y bloqueo de fechas.
  - Consulta y modificación de disponibilidad.
  - Visualización y gestión de citas pendientes (confirmar/rechazar).
  - Manejo de estados de carga, error y validaciones.
  - Validar que solo médicos autenticados pueden acceder y modificar la agenda.
  - Validar que los textos se muestran en español.
- Automatizar la ejecución de pruebas en el entorno de desarrollo.

**Criterios de aceptación:**  
- Las pruebas cubren los casos principales de uso de gestión de agenda y disponibilidad.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar las pruebas Cypress y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Pruebas End-to-End  
- Característica del producto: Frontend, Pruebas, UI/UX, Seguridad

**Comentarios y Notas:**  
Actualizar las pruebas si la vista de gestión de agenda cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para pruebas end-to-end de gestión de agenda y disponibilidad para médicos.

## 20. Ver listado de próximas citas (para médicos especialistas) [US-9]

**Historia de usuario relacionada:**  
- **ID:** 9  
- **Título:** Ver listado de próximas citas  
- **Descripción:** Como médico especialista, quiero ver el listado de mis próximas citas, para planificar mi día de trabajo.

### 20.1 [Frontend] Maquetar la vista de próximas citas para médicos especialistas

**Descripción detallada:**  
- **Propósito:**  
Diseñar y maquetar la vista de próximas citas en React para médicos especialistas autenticados, mostrando la información relevante de cada cita y paciente.
- **Detalle específico:**  
Crear la vista y componentes para:
  - Listar las próximas citas del médico, ordenadas por fecha y hora.
  - Mostrar información relevante del paciente (nombre, edad, motivo de consulta).
  - Mostrar detalles de la cita (fecha, hora, estado).
  - Permitir filtrar citas por fecha y estado (opcional).
Utilizar Tailwind CSS + Headless UI para el diseño responsivo y asegurar accesibilidad.

**Criterios de aceptación:**  
- La vista de próximas citas está implementada y disponible solo para médicos autenticados.
- El listado muestra información relevante y está listo para integrar la lógica de consumo de API.
- El diseño es responsivo y cumple con las pautas de UI/UX del PRD.
- **Pruebas de validación:**  
  - Visualizar la vista en diferentes dispositivos y tamaños de pantalla.
  - Verificar que los datos y la retroalimentación se muestran correctamente.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, UI/UX, Maquetado

**Comentarios y Notas:**  
Utilizar Tailwind CSS + Headless UI para componentes visuales y seguir la guía de estilos del PRD. Este ticket no incluye lógica de consumo de API ni internacionalización.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para maquetado de vista de próximas citas para médicos especialistas.

### 20.2 [Frontend] Implementar la lógica de consumo de API y renderizado del listado de próximas citas

**Descripción detallada:**  
- **Propósito:**  
Conectar la vista de próximas citas con el backend, consumir el endpoint correspondiente y mostrar la información relevante en el frontend.
- **Detalle específico:**  
- Implementar la llamada al endpoint `GET /api/doctor/upcoming-appointments` usando Axios.
- Renderizar el listado de próximas citas, mostrando información relevante del paciente (nombre, edad, motivo de consulta) y detalles de la cita (fecha, hora, estado).
- Permitir filtrar citas por fecha y estado (si aplica).
- Manejar estados de carga, error y resultados vacíos.
- Validar que el usuario esté autenticado como médico especialista.

**Criterios de aceptación:**  
- La vista consume la API y muestra el listado correctamente solo para médicos autenticados.
- Se muestran los datos relevantes y se permite filtrar por fecha y estado.
- Se manejan estados de carga, error y resultados vacíos.
- **Pruebas de validación:**  
  - Probar la consulta de próximas citas con diferentes filtros.
  - Simular errores y estados vacíos.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, Consumo de API, UI/UX, Seguridad

**Comentarios y Notas:**  
Utilizar Axios para las llamadas a la API y seguir la estructura de datos definida en el backend. Validar autenticación y permisos antes de mostrar información.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para lógica de consumo de API y renderizado de próximas citas.

---

### 20.3 [Frontend] Configurar internacionalización (i18n) en español para la vista de próximas citas

**Descripción detallada:**  
- **Propósito:**  
Permitir que la vista de próximas citas muestre todos los textos y mensajes en español, facilitando la experiencia de usuario para médicos especialistas.
- **Detalle específico:**  
- Configurar react-i18next en el proyecto frontend si no está ya configurado.
- Crear archivos de traducción para español con los textos de la vista de próximas citas (etiquetas, botones, mensajes de error, estados vacíos).
- Integrar la configuración de idioma en la vista de próximas citas.
- Asegurar que todos los textos se gestionan mediante el sistema de internacionalización.

**Criterios de aceptación:**  
- Todos los textos de la vista de próximas citas se muestran en español.
- Los textos se gestionan mediante archivos de traducción.
- **Pruebas de validación:**  
  - Visualizar la vista y verificar que todos los textos están en español.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Frontend, Internacionalización, UI/UX

**Comentarios y Notas:**  
Utilizar react-i18next y seguir la estructura recomendada en el PRD. Solo configurar español en esta etapa.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para configuración de internacionalización en español en la vista de próximas citas.

### 20.4 [Frontend] Documentar el componente/vista de próximas citas en README o Storybook

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración, mantenimiento y escalabilidad del frontend documentando el componente/vista de próximas citas para que el equipo y futuros desarrolladores comprendan su estructura y funcionamiento.
- **Detalle específico:**  
- Documentar el componente principal en el README del frontend o en Storybook.
- Incluir descripción de props, eventos, estructura visual y ejemplos de uso.
- Documentar la integración con el sistema de internacionalización y consumo de API.
- Agregar capturas de pantalla o ejemplos visuales si es posible.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y estructura del componente.
- Describe la integración con API y i18n.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales y visuales del componente.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Frontend, Documentación, UI/UX

**Comentarios y Notas:**  
Actualizar la documentación si el componente cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para documentación de componente/vista de próximas citas.

---

### 20.5 [Frontend] Crear pruebas end-to-end con Cypress para la vista de próximas citas

**Descripción detallada:**  
- **Propósito:**  
Asegurar que la vista de próximas citas funciona correctamente en el flujo real del usuario médico, validando la visualización de citas, filtrado y manejo de errores.
- **Detalle específico:**  
- Implementar pruebas end-to-end con Cypress para:
  - Visualización del listado de próximas citas.
  - Filtrado por fecha y estado (si aplica).
  - Manejo de estados de carga, error y resultados vacíos.
  - Validar que solo médicos autenticados pueden acceder al listado.
  - Validar que los textos se muestran en español.
- Automatizar la ejecución de pruebas en el entorno de desarrollo.

**Criterios de aceptación:**  
- Las pruebas cubren los casos principales de uso de la vista de próximas citas.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar las pruebas Cypress y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Pruebas End-to-End  
- Característica del producto: Frontend, Pruebas, UI/UX, Seguridad

**Comentarios y Notas:**  
Actualizar las pruebas si la vista de próximas citas cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para pruebas end-to-end de la vista de próximas citas.

### 21. [Backend & Frontend] Crear pruebas unitarias básicas para módulos principales

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y mantenibilidad del sistema implementando pruebas unitarias básicas para los módulos principales de backend y frontend.
- **Detalle específico:**  
- Backend:  
  - Implementar pruebas unitarias para los controladores, servicios y repositorios principales (usuarios, citas, agenda, especialidades).
  - Utilizar Jest o Mocha como framework de pruebas.
  - Validar lógica de negocio, manejo de errores y respuestas esperadas.
- Frontend:  
  - Implementar pruebas unitarias para los componentes principales (búsqueda, perfil, agendamiento, agenda, próximas citas).
  - Utilizar Cypress o Jest para React.
  - Validar renderizado, props y eventos principales.
- Automatizar la ejecución de pruebas en el entorno de desarrollo.

**Criterios de aceptación:**  
- Se implementan pruebas unitarias para los módulos principales de backend y frontend.
- Las pruebas cubren al menos el 80% del código crítico.
- Las pruebas se ejecutan automáticamente en cada despliegue.
- Los resultados de las pruebas son accesibles para el desarrollador.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
4 horas

**Etiquetas o Tags:**  
- Tipo: Pruebas Unitarias  
- Característica del producto: Backend, Frontend, Calidad, CI/CD

**Comentarios y Notas:**  
Actualizar las pruebas si los módulos cambian en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias básicas en backend y frontend.

---

### 22. [DevOps] Configurar y documentar el proceso de despliegue inicial del sistema

**Descripción detallada:**  
- **Propósito:**  
Facilitar la puesta en marcha y mantenimiento del sistema documentando y automatizando el proceso de despliegue inicial para backend y frontend.
- **Detalle específico:**  
- Definir los pasos para el despliegue en ambiente local y producción.
- Documentar la configuración de variables de entorno y archivos `.env`.
- Incluir instrucciones para la instalación de dependencias y ejecución de migraciones de base de datos.
- Documentar el proceso de build y despliegue de frontend (React + Tailwind CSS + Headless UI).
- Incluir ejemplos de scripts de despliegue y configuración de servicios (Docker, PM2, Firebase Storage, etc.).
- Documentar el proceso de actualización y rollback.
- Incluir recomendaciones de seguridad y cumplimiento normativo (LFPDPPP).

**Criterios de aceptación:**  
- El proceso de despliegue está documentado y accesible para el equipo.
- El sistema puede desplegarse en ambiente local y producción siguiendo la documentación.
- Las variables de entorno y dependencias están claramente especificadas.
- Se incluyen ejemplos de scripts y comandos de despliegue.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
3 horas

**Etiquetas o Tags:**  
- Tipo: DevOps  
- Característica del producto: Backend, Frontend, Despliegue, Documentación

**Comentarios y Notas:**  
Actualizar la documentación si el proceso de despliegue cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para configuración y documentación del proceso de despliegue inicial.