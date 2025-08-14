### 1. Crear carpeta backend e inicializar proyecto con npm

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



### 2. Montar la base de datos PostgreSQL según lo definido en el PRD

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



### 3. Generar la migración de la base de datos para su ejecución (usando Prisma)

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



### 4. Instalar las dependencias necesarias en backend (Node.js, Express.js, Prisma, Auth.js, etc.)

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

### 5. Configurar el entorno de desarrollo para backend (variables de entorno, archivo .env)

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

