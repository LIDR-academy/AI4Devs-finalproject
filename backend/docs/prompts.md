# Backend

Eres un experto en Ingenieria de Prompts, en Express.js, Prisma y PostgreSQL
# Contexto Inicial
Vamos a iniciar con la implementación de un proyeto el cual ya tiene definido un product requirement document y una lista de tickets para implementar una serie de historias de usuario para un MVP.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (CHatGPT 4.1) que implemente los tickets cumpla con los siguientes tickets:

# Tickets
```markdown
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

## 3. Instalar las dependencias necesarias en backend (Node.js, Express.js, Prisma, Auth.js, etc.)

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

## 4. Generar la migración de la base de datos para su ejecución (usando Prisma)

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
```

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendra acceso al product requirement document (PRD) y la documentación del modelo de datos

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis requerimientos ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.








# Guía de Implementación Inicial Backend Buscadoc

> **Rol del chatbot:** Ingeniero Backend y Arquitecto de Software  
> **Referencia:** Product Requirement Document y modelo de datos actualizado  
> **Arquitectura:** Hexagonal (puertos y adaptadores)  
> **Stack:** Node.js, Express.js, Prisma, PostgreSQL, Auth.js, Nodemailer, Firebase Storage  
> **Internacionalización:** Preparado para multilenguaje  
> **Seguridad:** Cumplimiento LFPDPPP, manejo seguro de credenciales

---

## 1. Crear carpeta backend e inicializar proyecto con npm

### Pasos

1. Crear la carpeta `backend` en la raíz del proyecto:
   ```sh
   mkdir backend
   cd backend
   ```

2. Inicializar el proyecto Node.js:
   ```sh
   npm init -y
   ```

3. Validar que el archivo `package.json` se haya generado correctamente:
   ```sh
   ls
   # Debe aparecer package.json
   ```

4. Probar instalación vacía:
   ```sh
   npm install
   # No debe mostrar errores
   ```

### Validación
- La carpeta `backend` existe y contiene `package.json`.
- El comando `npm install` no genera errores.

---

## 2. Montar la base de datos PostgreSQL según lo definido en el PRD

### Pasos

1. Crear una instancia de PostgreSQL local o en la nube.
2. Definir nombre de base de datos, usuario y contraseña siguiendo las convenciones del modelo de datos (consultar `docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md`).
   - Ejemplo:
     - Base de datos: `buscadoc_db`
     - Usuario: `buscadoc_user`
     - Contraseña: `password_segura`

3. Crear la base de datos y usuario:
   ```sh
   psql -U postgres
   CREATE DATABASE buscadoc_db;
   CREATE USER buscadoc_user WITH ENCRYPTED PASSWORD 'password_segura';
   GRANT ALL PRIVILEGES ON DATABASE buscadoc_db TO buscadoc_user;
   ```

4. Probar conexión:
   ```sh
   psql -U buscadoc_user -d buscadoc_db
   ```

### Validación
- Conexión exitosa desde psql o herramienta de administración.
- Usuario tiene permisos de acceso.

---

## 3. Instalar las dependencias necesarias en backend

### Paquetes y versiones recomendadas

```sh
npm install express@4.18.2 prisma@5.10.1 @prisma/client@5.10.1 pg@8.11.3 auth.js@0.3.0 dotenv@16.4.5 cors@2.8.5 nodemailer@6.9.8
```

> Consulta el PRD para dependencias adicionales.  
> Documenta cualquier paquete extra instalado.

### Validación

- Ejecuta:
  ```sh
  npm ls
  ```
  Verifica que todas las dependencias aparecen sin conflictos.

- Prueba importación básica en un archivo de prueba:
  ```js
  // backend/test-import.js
  const express = require('express');
  const { PrismaClient } = require('@prisma/client');
  const dotenv = require('dotenv');
  const cors = require('cors');
  const nodemailer = require('nodemailer');
  const Auth = require('auth.js');
  const { Client } = require('pg');
  ```

---

## 4. Generar la migración de la base de datos para su ejecución (usando Prisma)

### Pasos

1. Inicializar Prisma en el proyecto:
   ```sh
   npx prisma init
   ```

2. Editar `backend/prisma/schema.prisma` según el modelo de datos (`docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md`).  
   Incluye entidades: `USER`, `DOCTOR`, `PATIENT`, `SPECIALTY`, `DOCTOR_SPECIALTY`, `APPOINTMENT`, `RATING`, `NOTIFICATION`, `LOCATION`, `CITY`, `STATE`.

3. Configura la cadena de conexión en `.env` (ver siguiente ticket).

4. Generar migración inicial:
   ```sh
   npx prisma migrate dev --name init
   ```

### Validación

- Todas las tablas y relaciones se crean correctamente en PostgreSQL.
- Claves primarias, foráneas y restricciones implementadas.
- Prueba inserción y consulta básica:
  ```sh
  npx prisma studio
  # Inserta y consulta datos en cada entidad
  ```

---

## 5. Configurar el entorno de desarrollo para backend (variables de entorno, archivo .env)

### Pasos

1. Crear archivo `.env` en `backend` con placeholders:
   ```
   # backend/.env
   DATABASE_URL="postgresql://buscadoc_user:password_segura@localhost:5432/buscadoc_db"
   AUTH_SECRET="tu_secreto_auth"
   PORT=3000

   # SMTP (placeholder)
   SMTP_HOST=""
   SMTP_PORT=""
   SMTP_USER=""
   SMTP_PASS=""

   # FIREBASE (placeholder)
   FIREBASE_API_KEY=""
   FIREBASE_PROJECT_ID=""
   ```

2. Configurar uso de dotenv en el proyecto:
   ```js
   // backend/index.js
   require('dotenv').config();
   ```

3. Agregar `.env` al `.gitignore`:
   ```
   # backend/.gitignore
   .env
   ```

4. Documentar variables requeridas en `README.md`.

### Validación

- El backend lee las variables de entorno correctamente.
- Conexión a la base de datos y autenticación funcionan usando las variables configuradas.

---

## Recomendaciones de Internacionalización y Seguridad

- Prepara el backend para multilenguaje desde el inicio (estructura de mensajes y errores).
- Cumple con la LFPDPPP: no expongas datos personales, maneja credenciales en `.env`.
- Consulta los diagramas y documentación en la carpeta `docs/` para dudas sobre estructura y relaciones.

---

## Comandos útiles para validación

```sh
# Verificar estructura de carpetas y archivos
tree backend

# Verificar conexión a la base de datos
npx prisma db pull

# Verificar migraciones
npx prisma migrate status

# Probar servidor Express básico
node backend/index.js
```

---

## Referencias

- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Diagrama de arquitectura](docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md)
- [Diagrama de casos de uso](docs/planificacion_y_documentacion/diagramas/diagrama_casos_de_uso.md)

---

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de las tareas
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- Antes de iniciar muestrame la lista de pasos a ejecutar

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




Eres un experto en Ingenieria de Prompts, en NodeJS, Express.js y Prisma ORM
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para una historia de usuario denominada "Buscar especialistas por especialidad y ubicación" y empezaremos con su implementación.
En cuanto el proyecto ya se cuenta con las carpetas y estructura base para empezar a crear archivos de código.
Adicionalmente se cuenta con un product requirement document (PRD), el diagrama de arquitectura y el modelo de datos de la aplicación.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a implementar la historia de usuario y sus serie de tickets cumpliendo con las siguientes instrucciones

# Instrucciones
1. Antes de empezar con la implementación de cada ticket crear un punto de inicio de la aplicación
    - Llamar al archivo de inicio `server.js`
    - Generar en este archivo la estructura base para levantar un servidor web de acuerdo a la documentación
2. Una vez que se tenga un punto de despliegue del servidor iniciar con la implementación del primer ticket de acuerdo a la arquitectura documentada

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso a la documentación descrita en el contexto
- El chatbot tendra que revisar la documentación para ejectuar el prompt resultante

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.





# Prompt para ChatGPT 4.1: Implementación de la historia "Buscar especialistas por especialidad y ubicación" en Backend Buscadoc

> **Rol:** Ingeniero Backend y Arquitecto de Software  
> **Referencia:** PRD, modelo de datos, arquitectura hexagonal, convenciones del repositorio  
> **Ubicación del archivo de inicio:** `backend/server.js`

---

## Instrucciones Generales

1. **Punto de inicio de la aplicación**
   - Crea el archivo `backend/server.js` con la estructura base para levantar el servidor Express.
   - Configura internacionalización básica para mensajes de error y respuestas.
   - Integra Swagger para documentación de la API.
   - Aplica manejo de errores siguiendo una de las tres alternativas sugeridas (ver abajo).
   - Usa camelCase para nombres de variables y funciones, salvo que el PRD indique otra convención.
   - Consulta el PRD para detalles de autenticación, validaciones y pruebas. Si no existe información, usa Auth.js para autenticación, Yup para validaciones, Jest y Supertest para pruebas.

2. **Implementación de tickets de la historia "Buscar especialistas por especialidad y ubicación"**
   - Implementa cada ticket siguiendo la arquitectura hexagonal:
     - Mantén la lógica de negocio en servicios de dominio.
     - Los controladores solo gestionan la entrada/salida y delegan la lógica.
     - Los adaptadores de entrada (API REST) invocan casos de uso.
     - Los adaptadores de salida gestionan la persistencia con Prisma.
   - Documenta el endpoint en Swagger y README.
   - Prepara los endpoints para multilenguaje.
   - Aplica validaciones de entrada usando Yup (o lo que indique el PRD).
   - Implementa paginación y optimización de tiempos de respuesta (<2 segundos).
   - Agrega pruebas unitarias y de integración con Jest y Supertest (o lo que indique el PRD).

3. **Manejo de errores: Alternativas sugeridas**
   - **Opción 1:** Middleware global de manejo de errores en Express, con clases customizadas para errores de dominio.
   - **Opción 2:** Utilizar la librería `http-errors` para generar y manejar errores estándar.
   - **Opción 3:** Crear un módulo utilitario para internacionalizar mensajes de error y estructurarlos por tipo (validación, negocio, sistema).

---

## Ejemplo de estructura base para `server.js`

```js
// filepath: backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json'); // Asume que el archivo existe
const i18n = require('./utils/i18n'); // Utilidad para internacionalización de mensajes
const errorHandler = require('./middlewares/errorHandler'); // Middleware global sugerido

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Internacionalización básica
app.use(i18n);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas principales (ejemplo)
app.use('/api/doctors', require('./routes/doctors'));

// Manejo global de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Buscadoc backend running on port ${PORT}`);
});
```

---

## Consideraciones clave

- El chatbot debe consultar la documentación en el contexto para detalles de modelo de datos, arquitectura y casos de uso.
- Los endpoints REST deben seguir la estructura `/api/{recurso}` y ser compatibles con JWT/OAuth2 (según PRD).
- Los mensajes y errores deben estar preparados para internacionalización.
- El core de dominio debe estar desacoplado de frameworks y tecnologías.
- Cumplir con la LFPDPPP y buenas prácticas de seguridad.
- Documentar endpoints en Swagger y README.

---

## Referencias

- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Diagrama de arquitectura](docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md)
- [Diagrama de casos de uso](docs/planificacion_y_documentacion/diagramas/diagrama_casos_de_uso.md)

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de las tareas y tickets
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- Antes de iniciar muestrame la lista de pasos a ejecutar

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




Eres un experto en Ingenieria de Prompts, en Prisma ORM y PostgreSQL
# Contexto Inicial
Hemos realizado la implementación inicial de un proyecto con algunos metodos y requerimos tener datos de prueba para comprobar su correcto funcionamiento

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que ayude a implementar un archivo para generar datos de prueba cumpliendo con los siguientes requerimientos

# Requerimientos
1. Crear un archivo `seed.js` que se pueda ejecutar solo con las dependecias actuales
2. Al ejecutar el archivo este insertará datos de prueba en la base de datos
3. Los datos que va generar son los siguientes:
    * Debe generar al menos datos de 3 pacientes y 3 medicos
    * Todas las tablas deben de tener datos en relación a los pacientes y medicos existentes

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- el chatbot tendrá acceso al modelo de datos, al schema de prisma y al conjunto de librerias disponibles del proyecto

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis requerimientos ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




# Prompt para ChatGPT 4.1: Generación de archivo seed.js para datos de prueba

## Rol del chatbot
Actúa como **ingeniero de datos** experto en Prisma ORM, PostgreSQL y siguiendo las convenciones y patrones definidos en la documentación del proyecto.

## Objetivo
Genera un archivo `seed.js` que inserte datos de prueba en la base de datos del proyecto usando Prisma ORM y PostgreSQL. El archivo debe cumplir con las siguientes especificaciones:

### Requerimientos específicos

1. **Archivo ejecutable:**  
   El archivo debe llamarse `seed.js` y debe poder ejecutarse con las dependencias actuales del proyecto.

2. **Datos a insertar:**  
   - Al menos **3 pacientes** y **3 médicos** con datos inventados y aleatorios.
   - Todas las tablas relacionadas (especialidades, citas, valoraciones, direcciones, etc.) deben tener datos en relación a los pacientes y médicos generados.
   - Los datos deben respetar las relaciones y claves foráneas del modelo de datos definido en el schema de Prisma.
   - No es necesario limpiar la base de datos antes de insertar los datos.

3. **Buenas prácticas:**  
   - Mantén la lógica de negocio fuera del archivo seed, limitándolo a la generación e inserción de datos.
   - Utiliza datos inventados y aleatorios, evitando información personal real.

4. **Consideraciones técnicas:**  
   - Consultar el schema de Prisma y el modelo de datos para obtener información sobre las entidades, campos obligatorios y relaciones.
   - No es necesario usar librerías externas para la generación de datos aleatorios, el chatbot puede generarlos directamente en el código.

5. **Formato de salida:**  
   - El resultado debe ser un archivo con extensión `.js`.

## Recursos disponibles
- Revisar el schema de Prisma, modelo de datos y documentación del proyecto adjuntos en el contexto.

## Ejemplo de estructura esperada

```js
// seed.js
// ...importaciones y configuración de Prisma...
// ...función principal para insertar datos de prueba...
// ...creación de pacientes, médicos y entidades relacionadas...
// ...relaciones entre entidades...
// ...ejecución y cierre de la conexión...
```

## Instrucciones para el chatbot

1. Consulta el schema de Prisma y el modelo de datos para identificar las entidades y relaciones.
2. Genera el archivo `seed.js` siguiendo los requerimientos y buenas prácticas indicadas.
3. Asegúrate de que los datos sean coherentes y respeten las claves foráneas.
4. Presenta el resultado en formato Markdown, listo para copiar y ejecutar.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de las tareas y tickets
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- Antes de iniciar muestrame la lista de pasos a ejecutar

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.