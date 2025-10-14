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





Eres un experto en Ingenieria de Prompts, en NodeJS, Express.js y Prisma ORM
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para una historia de usuario denominada "Ver perfil de especialista" y empezaremos con su implementación.
En cuanto el proyecto ya se cuenta con las carpetas y estructura base para empezar a crear archivos de código.
Adicionalmente se cuenta con un product requirement document (PRD), el diagrama de arquitectura y el modelo de datos de la aplicación.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a implementar la historia de usuario y sus serie de tickets 

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso a la documentación descrita en el contexto
- El chatbot tendra que revisar la documentación para ejectuar el prompt resultante
- Omitir Internacionalización, las respuestan se manejaran en Inglés
- usar Yup para la validación de datos
- usar Jest y Supertest para las pruebas unitarias
- Para el manejo de errores utilizar middleware global + clases customizadas

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




# Prompt para ChatGPT 4.1: Implementación de la historia "Ver perfil de especialista" en Backend Buscadoc

> **Rol:** Ingeniero Backend y Arquitecto de Software  
> **Referencia:** PRD, modelo de datos, arquitectura hexagonal, convenciones del repositorio  
> **Convenciones:** camelCase para variables, funciones y clases  
> **Validaciones:** Yup  
> **Pruebas:** Jest y Supertest  
> **Manejo de errores:** Middleware global + clases customizadas  
> **Internacionalización:** Omitida, respuestas en inglés  
> **Swagger:** Actualizar documentación del endpoint

---

## Instrucciones Generales

1. **Consulta la documentación y el código fuente**
   - Antes de implementar, revisa el modelo de datos y el código fuente para ubicar la ruta y controlador correctos.
   - Asegúrate de seguir la arquitectura hexagonal:  
     - Lógica de negocio en servicios de dominio  
     - Controladores gestionan entrada/salida  
     - Adaptadores de entrada (API REST) invocan casos de uso  
     - Adaptadores de salida gestionan persistencia con Prisma

2. **Diseño del endpoint para consultar el perfil de especialista**
   - Implementa el endpoint REST `GET /api/doctors/:id` para consultar el perfil profesional y ubicación general de un especialista.
   - El endpoint debe recibir el identificador del especialista y retornar:
     - Información profesional: nombre, especialidad, biografía, foto, cédula profesional, título
     - Ubicación general: ciudad y estado
     - Oculta datos personales sensibles (correo, teléfono, dirección exacta) si el usuario no está autenticado
   - Valida que el especialista esté activo antes de mostrar el perfil.
   - Actualiza la documentación en Swagger.

3. **Implementación de la lógica de consulta**
   - Consulta las entidades DOCTOR, USER, DOCTOR_SPECIALTY, SPECIALTY, LOCATION, CITY y STATE usando Prisma.
   - Aplica validaciones de entrada con Yup.
   - Si el usuario no está autenticado, excluye los datos sensibles de la respuesta.
   - Maneja errores con middleware global y clases customizadas.

4. **Pruebas unitarias**
   - Implementa pruebas unitarias y de integración para el endpoint usando Jest y Supertest.
   - Prueba los siguientes casos:
     - Acceso con usuario no autenticado (verifica que no se muestran datos sensibles)
     - Acceso a perfil de especialista activo
     - Acceso a perfil de especialista inactivo (no debe mostrarse)

5. **Convenciones y patrones**
   - Mantén la lógica de negocio fuera de los controladores y adáptala en servicios de dominio.
   - Usa camelCase en todo el código.
   - Cumple con la LFPDPPP y buenas prácticas de seguridad.
   - Documenta el endpoint en Swagger.

---

## Ejemplo de estructura base para el endpoint

```js
// ...existing code...
// backend/routes/doctors.js
router.get('/:id', doctorsController.getDoctorProfile);
// ...existing code...

// backend/controllers/doctorsController.js
const getDoctorProfile = async (req, res, next) => {
  // Validación con Yup
  // Consulta de datos con Prisma
  // Ocultación de datos sensibles si no hay autenticación
  // Manejo de errores con clases customizadas
  // Respuesta en inglés
};
// ...existing code...
```

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


TODO: Implementar respuestas de endpoint como: {code, message, payload}

Eres un experto en Ingenieria de Prompts, en NodeJs, en Express y construyendo REST APIs
# Contexto Inicial
Tengo un proyecto el cual se encuentra bajo construcción y del cual ya tenemos los primeros metodos, pero requerimos hacer algunos ajustes.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a cambiar la respuesta de mi API cumpliedo con los siguientes requerimientos

# Requerimientos
1. Las respuestas de las APIs deben tener la siguiente respuesta:
```json
{
   "code": "codigo http de la respuesta: 2xx, 4xx, 5xx, etc",
   "message": "un mensaje referente al resultado de la operación, ejemplo: success",
   "payload": {
      "objeto": "contenido generado al consultar el API, puede ser un objeto o un arreglo de errores en caso de fallo"
   }
}
```
2. Para las respuestas con codigo "2xx" agregar el "message" correspondiente
   * En el payload deben contener el contenido que genera la consulta de un metodo
3. Para las respuestas con codigo "4xx" o "5xx" considerar los siguientes casos:
   * 400: codigos de error genericos o aquellos en donde el los valores enviados no cumplen con el tipo de dato que espera el metodo
   * Considerar los codigos comunes como: 401, 403, 404, 500, 503, etc...
   * el campo "message" debe reflejar un texto de acuerdo al codigo de error generado
   * el campo "paylod" debe contener un objeto "error" que alberga un arreglo con los errores encontrados en la invocación del metodo
4. Implementar estos requisitos en los metodos existentes

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso al codigo fuente para implementar los requerimientos

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis  requerimeintos ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




# Prompt para ChatGPT 4.1: Estandarización de Respuestas en API REST (Node.js + Express)

## Rol
Actúa como un experto en Node.js, Express y arquitectura hexagonal. Tendrás acceso al código fuente del proyecto y deberás seguir las convenciones y patrones definidos en la documentación del sistema.

## Objetivo
Tu tarea es modificar los métodos existentes de la API REST para que todas las respuestas sigan el siguiente formato estándar:

```json
{
   "code": "HTTP status code (2xx, 4xx, 5xx, etc)",
   "message": "A message about the result of the operation, e.g., success",
   "payload": {
      "objeto": "Content generated by the API method, can be an object or an array of errors in case of failure"
   }
}
```

### Requisitos Específicos

1. **Respuestas exitosas (2xx):**
   - El campo `message` debe indicar el resultado (ejemplo: "success", "created", etc.).
   - El campo `payload.objeto` debe contener el resultado de la consulta o acción realizada.

2. **Respuestas de error (4xx, 5xx):**
   - El campo `message` debe reflejar el tipo de error (ejemplo: "Bad Request", "Unauthorized", "Not Found", "Internal Server Error", etc.).
   - El campo `payload` debe contener un objeto `error` con un arreglo de los errores encontrados.
   - Considera los códigos comunes: 400, 401, 403, 404, 500, 503, etc.

3. **Middleware de estandarización:**
   - Implementa un middleware en Express que gestione tanto respuestas exitosas como errores, asegurando que todas las respuestas sigan el formato estándar.
   - El middleware debe integrarse en los adaptadores de entrada (controladores REST), respetando la arquitectura hexagonal.
   - El core de dominio debe permanecer desacoplado de la lógica de respuesta HTTP.

4. **Internacionalización:**
   - Los mensajes deben estar en inglés.

5. **Manejo de errores inesperados:**
   - El middleware debe capturar y formatear errores no previstos para mantener la consistencia en las respuestas.

6. **Formato único:**
   - Todos los endpoints deben responder bajo este formato, sin excepciones.

7. **Estructura del campo `objeto`:**
   - No hay convenciones específicas; coloca el resultado del método en este campo.

8. **No usar paquetes externos para manejo de errores.**

9. **Seguir patrones hexagonales:**
   - Mantén la lógica de negocio fuera de los controladores y adáptala en servicios de dominio.
   - Los controladores solo deben orquestar la llamada a los casos de uso y delegar la respuesta al middleware.

## Ejemplo de implementación

- Sugiere cómo modificar un controlador y cómo integrar el middleware.
- Respeta la arquitectura hexagonal y las convenciones del proyecto.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de los requerimientos
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso dime que archivo se a modificar o agregar, muestrame el codigo a agregar o reemplazar y dime en donde lo debo colocar
- Antes de iniciar muestrame la lista de pasos a ejecutar

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.



Eres un experto en Ingenieria de Prompts, en NodeJS, Express.js, JWT (`jsonwebtoken`) y Prisma ORM
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para las historias de usuario denomidadas "Registro de paciente" y "Registro de médico especialista", empezaremos con su implementación.
En cuanto el proyecto, ya se cuenta con las carpetas y estructura base para empezar a crear archivos de código.
Adicionalmente se cuenta con un product requirement document (PRD), el diagrama de arquitectura y el modelo de datos de la aplicación.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a configurar JWT (`jsonwebtoken`) en el proyecto e implementar las historia de usuario y sus series de tickets

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso a la documentación descrita en el contexto
- El chatbot tendra que revisar la documentación para ejectuar el prompt resultante
- Omitir Internacionalización, las respuestan se manejaran en Inglés
- usar Yup para la validación de datos
- usar Jest y Supertest para las pruebas unitarias
- Para el manejo de errores utilizar middleware global + clases customizadas

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.



# Prompt para ChatGPT 4.1: Implementación de endpoints de registro de paciente y médico especialista + configuración JWT

> **Rol:** Ingeniero Backend y Arquitecto de Software  
> **Referencia:** PRD, modelo de datos, arquitectura hexagonal, convenciones del repositorio  
> **Convenciones:** camelCase para variables, funciones y clases  
> **Validaciones:** Yup  
> **Pruebas:** Jest y Supertest (usar mocks)  
> **Manejo de errores:** Middleware global + clases customizadas  
> **JWT:** Usar jsonwebtoken, configuración en servicio y variables en `.env`  
> **Swagger:** Documentar ambos endpoints y el esquema de autenticación

---

## Instrucciones Generales

1. **Consulta la documentación y el código fuente**
   - Revisa el modelo de datos y el código fuente para ubicar la ruta y controlador correctos.
   - Sigue la arquitectura hexagonal:  
     - Lógica de negocio en servicios de dominio  
     - Controladores gestionan entrada/salida  
     - Adaptadores de entrada (API REST) invocan casos de uso  
     - Adaptadores de salida gestionan persistencia con Prisma

2. **Configuración de JWT**
   - Crea un servicio de dominio para la gestión de JWT
   - Usa la librería `jsonwebtoken`.
   - Configura el secreto y expiración en el archivo `.env`:
     ```
     JWT_SECRET=your_secret_key
     JWT_EXPIRES_IN=1d
     ```
   - El servicio debe incluir funciones para generar y validar tokens.
   - Documenta el esquema de autenticación en el README.

3. **Implementación del servicio de registro compartido**
   - Crea un servicio de dominio (por ejemplo, `backend/services/registerService.js`) que gestione el registro tanto de pacientes como de médicos especialistas.
   - El servicio debe:
     - Validar los datos de entrada con Yup.
     - Verificar unicidad de email y, para médicos, de `license_number`.
     - Validar la fortaleza de la contraseña.
     - Hashear la contraseña con bcryptjs.
     - Crear los registros en las tablas de acuerdo al modelo de datos
     - Retornar una respuesta estándar de éxito o error.
     - No generar JWT en el registro, solo crear el usuario.

4. **Endpoints REST**
   - Implementa los endpoints:
     - `POST /api/auth/register/patient`
     - `POST /api/auth/register/doctor`
   - Los controladores deben delegar la lógica al servicio de registro.
   - Los mensajes de error deben estar en inglés y seguir el formato estándar de la API.

5. **Validaciones y manejo de errores**
   - Usa Yup para validaciones de datos.
   - Devuelve mensajes claros y específicos (ejemplo: "Email already exists", "Password too weak", "License number required").
   - Implementa manejo de errores con middleware global y clases customizadas.

6. **Documentación Swagger**
   - Documenta ambos endpoints en Swagger:
     - Descripción de funcionalidad.
     - Campos requeridos y ejemplos de petición/respuesta.
     - Estructura de datos retornados.
     - Posibles errores y mensajes de validación.
     - Esquema de autenticación JWT.

7. **Pruebas unitarias**
   - Implementa pruebas unitarias y de integración para ambos endpoints usando Jest y Supertest.
   - Usa mocks para dependencias externas.
   - Casos a cubrir:
     - Registro exitoso con datos válidos.
     - Error por email duplicado.
     - Error por license_number faltante o duplicado (médico).
     - Error por contraseña débil.
     - Error por campos faltantes o inválidos.
     - Validación de almacenamiento seguro de la contraseña (hash).
     - Validación de JWT (generación y verificación).

---

## Ejemplo de estructura base para el servicio y endpoints

```js
// filepath: backend/services/registerService.js
const bcrypt = require('bcryptjs');
const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const registerPatient = async (data) => {
  // Validación con Yup
  // Verificar email único
  // Validar contraseña
  // Hashear contraseña
  // Crear USER y PATIENT
  // Retornar respuesta estándar
};

const registerDoctor = async (data) => {
  // Validación con Yup
  // Verificar email y license_number únicos
  // Validar contraseña
  // Hashear contraseña
  // Crear USER y DOCTOR
  // Retornar respuesta estándar
};

module.exports = { registerPatient, registerDoctor };
```

```js
// filepath: backend/services/jwtService.js
const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
```

---

## Referencias

- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Diagrama de arquitectura](docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md)
- [Diagrama de casos de uso](docs/planificacion_y_documentacion/diagramas/diagrama_casos_de_uso.md)

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de los requerimientos
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso dime que archivo se a modificar o agregar, muestrame el codigo a agregar o reemplazar y dime en donde lo debo colocar
- Muestrame la lista de pasos a ejecutar antes de realizar la implementación

Antes de comenzar con la implementación revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.



Eres un experto en Ingenieria de Prompts, en NodeJS, Express.js, JWT (`jsonwebtoken`) y Prisma ORM
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para las historias de usuario denomidadas "Login de paciente" y "Login de médico especialista", empezaremos con su implementación.
En cuanto al proyecto, ya se cuenta con las carpetas y estructura base para empezar a crear archivos de código, así mismo ya se tiene la parte del registro de pacientes y medicos implementada.
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y el modelo de datos de la aplicación.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a implementar las historia de usuario y sus series de tickets para el inicio de sesión de pacientes y medicos

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso a la documentación descrita en el contexto
- El chatbot tendra que revisar la documentación para ejectuar el prompt resultante
- Omitir Internacionalización, las respuestan se manejaran en Inglés
- usar Yup para la validación de datos
- usar Jest y Supertest para las pruebas unitarias
- Para el manejo de errores utilizar middleware global + clases customizadas

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




# Prompt para ChatGPT 4.1: Implementación de endpoints de login para paciente y médico especialista

> **Rol:** Ingeniero Backend y Arquitecto de Software  
> **Referencia:** PRD, modelo de datos, arquitectura hexagonal, convenciones del repositorio  
> **Convenciones:** camelCase para variables, funciones y clases  
> **Validaciones:** Yup  
> **Pruebas:** Jest y Supertest (usar mocks)  
> **Manejo de errores:** Middleware global + clases customizadas  
> **JWT:** Usar jsonwebtoken, incluir id, tipo de usuario y email  
> **Swagger:** Documentar ambos endpoints y ejemplos de respuesta  
> **Internacionalización:** Respuestas en inglés

---

## Instrucciones Generales

1. **Consulta la documentación y el código fuente**
   - Revisa el modelo de datos y el código fuente para ubicar la ruta y controlador correctos, siguiendo la arquitectura hexagonal.
   - Los controladores solo orquestan la llamada a los casos de uso y manejan la respuesta estándar.
   - La lógica de negocio debe estar en servicios de dominio.

2. **Implementación de endpoints REST**
   - Implementa los endpoints:
     - `POST /api/auth/login/patient`
     - `POST /api/auth/login/doctor`
   - Ambos deben recibir los campos: email y contraseña.
   - Valida los datos de entrada con Yup.
   - Verifica que el email exista y la contraseña coincida usando bcryptjs.
   - Si la autenticación es exitosa, genera y devuelve un JWT válido con los campos: id, tipo de usuario y email.
   - El endpoint responde siguiendo el formato estándar de la API (consultar PRD).
   - Los errores de autenticación y validación se devuelven en inglés y en el formato estándar.

3. **Validaciones y manejo de errores**
   - Usa Yup para validaciones de datos.
   - Devuelve mensajes claros y específicos (ejemplo: "Invalid credentials", "User not found").
   - Implementa manejo de errores con middleware global y clases customizadas.

4. **Documentación Swagger**
   - Documenta ambos endpoints en Swagger:
     - Descripción de funcionalidad.
     - Campos requeridos y ejemplos de petición/respuesta.
     - Estructura de los datos retornados (JWT, id, email, tipo de usuario).
     - Posibles errores y mensajes de validación.

5. **Pruebas unitarias**
   - Implementa pruebas unitarias y de integración para ambos endpoints usando Jest y Supertest.
   - Usa mocks para dependencias externas.
   - Casos a cubrir:
     - Login exitoso con credenciales válidas.
     - Error por usuario no encontrado.
     - Error por contraseña incorrecta.
     - Error por campos faltantes o inválidos.
     - Validación de generación y formato del JWT.

---

## Ejemplo de estructura base para el servicio y endpoints

```js
// backend/services/authService.js
const bcrypt = require('bcryptjs');
const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const jwtService = require('./jwtService');
const prisma = new PrismaClient();

const loginUser = async (data, userType) => {
  // Validación con Yup
  // Buscar usuario por email y tipo
  // Verificar contraseña con bcryptjs
  // Si es válido, generar JWT con id, email y tipo de usuario
  // Retornar respuesta estándar
};

module.exports = { loginUser };
```

```js
// backend/services/jwtService.js
const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

module.exports = { generateToken };
```

---

## Referencias

- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Diagrama de arquitectura](docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md)
- [Diagrama de casos de uso](docs/planificacion_y_documentacion/diagramas/diagrama_casos_de_uso.md)

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de los requerimientos
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso dime que archivo se a modificar o agregar, muestrame el codigo a agregar o reemplazar y dime en donde lo debo colocar
- Muestrame la lista de pasos a ejecutar antes de realizar la implementación

Antes de comenzar con la implementación revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.





Eres un experto en Ingenieria de Prompts, en NodeJS, Express.js, JWT (`jsonwebtoken`) y Prisma ORM
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para la historia de usuario denomidada "Buscar especialistas y ver perfiles", empezaremos con su implementación.
En cuanto al proyecto, ya se cuenta con las carpetas y estructura base para empezar a crear archivos de código.
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y el modelo de datos de la aplicación.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a implementar las historia de usuario y sus series de tickets para el inicio de sesión de pacientes y medicos

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso a la documentación descrita en el contexto
- El chatbot tendra que revisar la documentación para ejectuar el prompt resultante
- Omitir Internacionalización, las respuestan se manejaran en Inglés
- usar Yup para la validación de datos
- usar Jest y Supertest para las pruebas unitarias
- Para el manejo de errores utilizar middleware global + clases customizadas

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




# Prompt para ChatGPT 4.1: Implementación de endpoints de búsqueda y perfil de especialistas para pacientes autenticados

> **Rol:** Ingeniero Backend y Arquitecto de Software  
> **Referencia:** PRD, modelo de datos, arquitectura hexagonal, convenciones del repositorio  
> **Convenciones:** camelCase para variables, funciones y clases  
> **Validaciones:** Yup  
> **Pruebas:** Jest y Supertest (usar mocks)  
> **Manejo de errores:** Middleware global + clases customizadas  
> **JWT:** Usar jsonwebtoken, autenticación obligatoria para endpoints de paciente  
> **Swagger:** Documentar ambos endpoints y ejemplos de respuesta  
> **Internacionalización:** Respuestas en inglés  
> **Seguridad:** Cumplir LFPDPPP, mostrar información sensible solo a pacientes autenticados

---

## Instrucciones Generales

1. **Consulta la documentación y el código fuente**
   - Revisa el modelo de datos, PRD y código fuente para ubicar la ruta, controlador y servicio correctos, siguiendo arquitectura hexagonal.
   - Los controladores solo orquestan la llamada a los casos de uso y manejan la respuesta estándar.
   - La lógica de negocio debe estar en servicios de dominio.

2. **Diseño e implementación de endpoints REST**
   - Implementa los endpoints:
     - `GET /api/patient/doctors/search`
       - Parámetros de consulta: `specialty_id`, `city_id`, `state_id`, valoración mínima, disponibilidad.
       - Requiere autenticación de paciente.
       - Retorna información detallada de especialistas activos para comparación.
     - `GET /api/patient/doctors/:id`
       - Requiere autenticación de paciente.
       - Retorna perfil completo del especialista: nombre, especialidad, biografía, foto, cédula profesional, título, ciudad, estado, dirección profesional, valoración promedio, comentarios de pacientes, disponibilidad.
       - Solo muestra información sensible si el usuario está autenticado como paciente.
   - Consulta las entidades DOCTOR, DOCTOR_SPECIALTY, SPECIALTY, LOCATION, CITY, STATE, RATING y USER usando Prisma.
   - Optimiza la consulta para responder en menos de 2 segundos.
   - Valida que el especialista esté activo antes de mostrar el perfil.

3. **Validaciones y controles de acceso**
   - Usa Yup para validaciones de datos de entrada.
   - Implementa middleware de autenticación y control de acceso para verificar el rol de paciente.
   - Oculta información sensible para usuarios no autenticados o con roles distintos.
   - Registra intentos de acceso no autorizado para auditoría.
   - Cumple con la LFPDPPP y buenas prácticas de seguridad.

4. **Documentación Swagger**
   - Documenta ambos endpoints en Swagger:
     - Descripción de funcionalidad y requisitos de autenticación.
     - Parámetros de consulta y ruta.
     - Ejemplo de petición y respuesta.
     - Estructura de los datos retornados (incluyendo información adicional para pacientes).
     - Campos sensibles y controles de acceso.
     - Posibles errores y mensajes de validación.

5. **Pruebas unitarias**
   - Implementa pruebas unitarias y de integración para ambos endpoints usando Jest y Supertest.
   - Usa mocks para dependencias externas.
   - Casos a cubrir:
     - Búsqueda exitosa con filtros avanzados y usuario autenticado.
     - Consulta exitosa de perfil completo con usuario autenticado.
     - Ocultamiento de información sensible para usuarios no autenticados.
     - Manejo de especialistas inactivos y errores por ID inexistente o formato incorrecto.
     - Validación de paginación y tiempos de respuesta.

---

## Ejemplo de estructura base para el servicio y endpoints

```js
// backend/services/patientDoctorsService.js
const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const searchDoctors = async (filters) => {
  // Validación con Yup
  // Consulta avanzada con Prisma usando filtros
  // Retornar especialistas activos y datos relevantes
};

const getDoctorProfile = async (doctorId, patientId) => {
  // Validación con Yup
  // Consulta de perfil completo con Prisma
  // Verificar especialista activo
  // Mostrar información sensible solo si el usuario es paciente autenticado
  // Retornar datos completos o restringidos según rol
};

module.exports = { searchDoctors, getDoctorProfile };
```

```js
// backend/controllers/patientDoctorsController.js
const patientDoctorsService = require('../services/patientDoctorsService');

const searchDoctors = async (req, res, next) => {
  // Extraer filtros de req.query
  // Llamar a patientDoctorsService.searchDoctors
  // Manejar respuesta estándar y errores
};

const getDoctorProfile = async (req, res, next) => {
  // Extraer doctorId de req.params y patientId de req.user
  // Llamar a patientDoctorsService.getDoctorProfile
  // Manejar respuesta estándar y errores
};

module.exports = { searchDoctors, getDoctorProfile };
```

---

## Referencias

- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Diagrama de arquitectura](docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md)
- [Diagrama de casos de uso](docs/planificacion_y_documentacion/diagramas/diagrama_casos_de_uso.md)
- [Product Backlog](docs/product_backlog.md)

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de los requerimientos
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso dime que archivo se a modificar o agregar, muestrame el codigo a agregar o reemplazar y dime en donde lo debo colocar
- Muestrame la lista de pasos a ejecutar antes de realizar la implementación

Antes de comenzar con la implementación revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.





Eres un experto en Ingenieria de Prompts, en NodeJS, Express.js, JWT (`jsonwebtoken`) y Prisma ORM
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para la historia de usuario denomidada "Agendar cita con especialista", empezaremos con su implementación.
En cuanto al proyecto, ya se cuenta con las carpetas y estructura base para empezar a crear archivos de código.
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y el modelo de datos de la aplicación.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a implementar la historia de usuario y su serie de tickets para agendar cita con especilistas

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso a la documentación descrita en el contexto
- El chatbot tendra que revisar la documentación para ejectuar el prompt resultante
- Omitir Internacionalización, las respuestan se manejaran en Inglés
- usar Yup para la validación de datos
- usar Jest y Supertest para las pruebas unitarias
- Para el manejo de errores utilizar middleware global + clases customizadas

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.



# Prompt para ChatGPT 4.1: Implementación de endpoint para agendar cita con especialista

> **Rol:** Ingeniero Backend y Arquitecto de Software  
> **Referencia:** PRD, modelo de datos, arquitectura hexagonal, convenciones del repositorio  
> **Validaciones:** Yup  
> **Pruebas:** Jest y Supertest (usar mocks)  
> **Manejo de errores:** Middleware global + clases customizadas  
> **JWT:** Usar jsonwebtoken, autenticación obligatoria para agendar citas  
> **Swagger:** Documentar el endpoint y ejemplos de respuesta  
> **Internacionalización:** Respuestas en inglés  
> **Notificaciones:** Agregar comentarios en el código para indicar dónde implementar el envío de notificaciones en tickets futuros

---

## Instrucciones Generales

1. **Consulta la documentación y el código fuente**
   - Revisa el modelo de datos, PRD y código fuente para ubicar la ruta, controlador y servicio correctos, siguiendo arquitectura hexagonal.
   - Los controladores solo orquestan la llamada a los casos de uso y manejan la respuesta estándar.
   - La lógica de negocio debe estar en servicios de dominio.

2. **Diseño e implementación del endpoint REST**
   - Implementa el endpoint:
     - `POST /api/appointments`
       - Parámetros de entrada: `doctor_id`, `appointment_date`, `reason` (opcional). El `patient_id` se obtiene del token JWT.
       - Requiere autenticación de paciente.
       - Valida que el especialista y paciente estén activos.
       - Valida que la fecha/hora solicitada esté disponible en la agenda del especialista.
       - Evita conflictos de horario y citas duplicadas para especialista y paciente.
       - Registra la cita en la entidad APPOINTMENT con estado "pending".
       - Retorna confirmación de la cita agendada en formato estándar (consultar PRD).
       - Agrega comentario en el código donde se implementarán notificaciones (email/SMS) en tickets futuros.

3. **Validaciones y controles de acceso**
   - Usa Yup para validaciones de datos de entrada.
   - Implementa middleware de autenticación y control de acceso para verificar el rol de paciente.
   - Devuelve mensajes claros y específicos en inglés (ejemplo: "Time slot not available", "Doctor not found", "Patient not found").
   - Implementa manejo de errores con middleware global y clases customizadas.

4. **Documentación Swagger**
   - Documenta el endpoint en Swagger:
     - Descripción de funcionalidad y requisitos de autenticación.
     - Parámetros de entrada y ruta.
     - Ejemplo de petición y respuesta.
     - Validaciones de disponibilidad y conflictos de horario.
     - Posibles errores y mensajes de validación.

5. **Pruebas unitarias**
   - Implementa pruebas unitarias y de integración para el endpoint usando Jest y Supertest.
   - Usa mocks para dependencias externas.
   - Casos a cubrir:
     - Agendamiento exitoso con horarios disponibles y usuario autenticado.
     - Manejo de conflictos de horario y disponibilidad.
     - Validación de parámetros obligatorios y opcionales.
     - Manejo de errores por especialista/paciente inactivo o IDs inexistentes.

---

## Ejemplo de estructura base para el servicio y endpoint

```js
// filepath: src/domain/appointmentService.js
const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const appointmentSchema = yup.object().shape({
  doctorId: yup.number().required(),
  appointmentDate: yup.date().required(),
  reason: yup.string().optional(),
});

const createAppointment = async ({ doctorId, patientId, appointmentDate, reason }) => {
  // Validar datos con Yup
  // Verificar que doctor y paciente estén activos
  // Consultar agenda del especialista para disponibilidad
  // Verificar que no existan conflictos de horario para doctor y paciente
  // Registrar cita en la entidad APPOINTMENT con estado "pending"
  // // TODO: Implementar notificación por email/SMS en tickets futuros
  // Retornar confirmación de la cita
};

module.exports = { createAppointment };
```

```js
// filepath: src/adapters/controllers/appointmentController.js
const appointmentService = require('../../domain/appointmentService');

const createAppointment = async (req, res, next) => {
  try {
    const patientId = req.user.id; // obtenido del JWT
    const { doctorId, appointmentDate, reason } = req.body;
    const result = await appointmentService.createAppointment({ doctorId, patientId, appointmentDate, reason });
    res.status(201).json(result);
  } catch (error) {
    next(error); // Manejo global de errores
  }
};

module.exports = { createAppointment };
```

---

## Referencias

- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de los requerimientos
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso dime que archivo se a modificar o agregar, muestrame el codigo a agregar o reemplazar y dime en donde lo debo colocar
- Muestrame la lista de pasos a ejecutar antes de realizar la implementación

Antes de comenzar con la implementación revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.



Eres un experto en Ingenieria de Prompts, en NodeJS, Express.js, JWT (`jsonwebtoken`) y Prisma ORM
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para la historia de usuario denomidada "Gestionar agenda y disponibilidad", empezaremos con su implementación.
En cuanto al proyecto, ya se cuenta con las carpetas y estructura base para empezar a crear archivos de código.
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y el modelo de datos de la aplicación.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a implementar la historia de usuario y su serie de tickets para gestionar la agenda de los especialistas

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso a la documentación descrita en el contexto
- El chatbot tendra que revisar la documentación para ejectuar el prompt resultante
- Omitir Internacionalización, las respuestan se manejaran en Inglés
- usar Yup para la validación de datos
- usar Jest y Supertest para las pruebas unitarias
- Para el manejo de errores utilizar middleware global + clases customizadas

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.






# Prompt para ChatGPT 4.1: Implementación de endpoints para gestión de agenda y disponibilidad del médico especialista

> **Rol:** Ingeniero Backend y Arquitecto de Software  
> **Referencia:** PRD, modelo de datos, arquitectura hexagonal, convenciones del repositorio  
> **Validaciones:** Yup  
> **Pruebas:** Jest y Supertest (usar mocks)  
> **Manejo de errores:** Middleware global + clases customizadas  
> **JWT:** Usar jsonwebtoken, autenticación obligatoria para endpoints de médico  
> **Swagger:** Documentar todos los endpoints y ejemplos de respuesta  
> **Internacionalización:** Respuestas en inglés  
> **Notificaciones:** Agregar comentarios en el código donde se debe implementar el envío de notificaciones en tickets futuros

---

## Instrucciones Generales

1. **Consulta la documentación y el código fuente**
   - Revisa el modelo de datos, PRD y código fuente para ubicar la ruta, controlador y servicio correctos, siguiendo arquitectura hexagonal.
   - Los controladores solo orquestan la llamada a los casos de uso y manejan la respuesta estándar.
   - La lógica de negocio debe estar en servicios de dominio.

2. **Diseño e implementación de endpoints REST**
   - Implementa los endpoints:
     - `GET /api/doctor/availability`
       - Retorna los rangos de fechas y horas disponibles del médico.
       - Formato: días de la semana y rangos de horas (`start_time`, `end_time`).
     - `POST /api/doctor/availability`
       - Permite definir o modificar disponibilidad.
       - Recibe días de la semana y rangos de horas.
       - Permite bloquear fechas específicas por motivos personales.
     - `GET /api/doctor/appointments`
       - Retorna el listado de citas agendadas, incluyendo información relevante del paciente y estado de la cita.
       - Permite filtrar por fecha y estado (consultar PRD).
     - `PATCH /api/doctor/appointments/:id`
       - Permite confirmar o rechazar cita.
       - Cambia el estado de la cita a "confirmed" o "rejected".
       - Actualiza la disponibilidad si la cita es rechazada.
       - // TODO: Implementar notificación al paciente en tickets futuros.
   - Todos los endpoints requieren autenticación y rol de médico especialista.
   - Cumple con la LFPDPPP y buenas prácticas de seguridad.

3. **Validaciones y controles de acceso**
   - Usa Yup para validaciones de datos de entrada.
   - Implementa middleware de autenticación y control de acceso para verificar el rol de médico.
   - Devuelve mensajes claros y específicos en inglés.
   - Implementa manejo de errores con middleware global y clases customizadas.

4. **Documentación Swagger**
   - Documenta todos los endpoints en Swagger:
     - Descripción de funcionalidad y requisitos de autenticación.
     - Parámetros de entrada y ruta.
     - Ejemplo de petición y respuesta.
     - Estructura de los datos retornados (disponibilidad, citas, estado de cita).
     - Campos sensibles y controles de acceso.
     - Posibles errores y mensajes de validación.

5. **Pruebas unitarias**
   - Implementa pruebas unitarias y de integración para todos los endpoints usando Jest y Supertest.
   - Usa mocks para dependencias externas.
   - Casos a cubrir:
     - Definición y modificación exitosa de disponibilidad.
     - Consulta de citas y disponibilidad con usuario autenticado.
     - Confirmación y rechazo de citas.
     - Validación de permisos y control de acceso.
     - Manejo de errores por fechas bloqueadas, citas inexistentes o estados inválidos.

---

## Ejemplo de estructura base para el servicio y endpoints

```js
// filepath: src/domain/doctorAvailabilityService.js
const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const availabilitySchema = yup.object().shape({
  daysOfWeek: yup.array().of(yup.string().required()).required(),
  ranges: yup.array().of(
    yup.object().shape({
      startTime: yup.date().required(),
      endTime: yup.date().required(),
      blocked: yup.boolean().default(false),
    })
  ).required(),
});

const setAvailability = async ({ doctorId, daysOfWeek, ranges }) => {
  // Validar datos con Yup
  // Registrar o modificar disponibilidad en la base de datos
  // Bloquear fechas específicas si 'blocked' es true
  // Retornar disponibilidad actualizada
};

const getAvailability = async (doctorId) => {
  // Consultar disponibilidad actual del médico
  // Retornar días de la semana y rangos de horas
};

module.exports = { setAvailability, getAvailability };
```

```js
// filepath: src/domain/doctorAppointmentService.js
const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAppointments = async ({ doctorId, date, status }) => {
  // Consultar citas agendadas filtrando por fecha y estado
  // Retornar información relevante del paciente y estado de la cita
};

const updateAppointmentStatus = async ({ appointmentId, doctorId, status }) => {
  // Validar estado ("confirmed" o "rejected")
  // Actualizar estado en la base de datos
  // Si es "rejected", actualizar disponibilidad
  // // TODO: Notificar al paciente sobre el cambio de estado
  // Retornar cita actualizada
};

module.exports = { getAppointments, updateAppointmentStatus };
```

```js
// filepath: src/adapters/in/doctorRoutes.js
const doctorAvailabilityService = require('../../domain/doctorAvailabilityService');
const doctorAppointmentService = require('../../domain/doctorAppointmentService');

const getAvailability = async (req, res, next) => {
  try {
    const doctorId = req.user.id; // obtenido del JWT
    const result = await doctorAvailabilityService.getAvailability(doctorId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const setAvailability = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const { daysOfWeek, ranges } = req.body;
    const result = await doctorAvailabilityService.setAvailability({ doctorId, daysOfWeek, ranges });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const { date, status } = req.query;
    const result = await doctorAppointmentService.getAppointments({ doctorId, date, status });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const appointmentId = req.params.id;
    const { status } = req.body;
    const result = await doctorAppointmentService.updateAppointmentStatus({ appointmentId, doctorId, status });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAvailability, setAvailability, getAppointments, updateAppointmentStatus };
```

---

## Referencias

- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de los requerimientos
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso dime que archivo se a modificar o agregar, muestrame el codigo a agregar o reemplazar y dime en donde lo debo colocar
- Muestrame la lista de pasos a ejecutar antes de realizar la implementación

Antes de comenzar con la implementación revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.



Eres un experto en Ingenieria de Prompts, en NodeJS, Express.js, JWT (`jsonwebtoken`) y Prisma ORM
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para la historia de usuario denomidada "Ver listado de próximas citas", empezaremos con su implementación.
En cuanto al proyecto, ya se cuenta con las carpetas y estructura base para empezar a crear archivos de código.
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y el modelo de datos de la aplicación.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a implementar la historia de usuario y su serie de tickets para ver el listado de proximas citas.

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso a la documentación descrita en el contexto
- El chatbot tendra que revisar la documentación para ejectuar el prompt resultante
- Omitir Internacionalización, las respuestan se manejaran en Inglés
- usar Yup para la validación de datos
- usar Jest y Supertest para las pruebas unitarias
- Para el manejo de errores utilizar middleware global + clases customizadas

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.





# Prompt para ChatGPT 4.1: Implementación de endpoint para ver listado de próximas citas del médico especialista

> **Rol:** Ingeniero Backend y Arquitecto de Software  
> **Referencia:** PRD, modelo de datos, arquitectura hexagonal, convenciones del repositorio  
> **Validaciones:** Yup  
> **Pruebas:** Jest y Supertest (usar mocks)  
> **Manejo de errores:** Middleware global + clases customizadas  
> **JWT:** Usar jsonwebtoken, autenticación obligatoria para endpoints de médico  
> **Swagger:** Documentar el endpoint y ejemplos de respuesta  
> **Internacionalización:** Respuestas en inglés  
> **Privacidad:** Cumplir LFPDPPP, mostrar información relevante del paciente solo a médicos autenticados

---

## Instrucciones Generales

1. **Consulta la documentación y el código fuente**
   - Revisa el modelo de datos, PRD y código fuente para ubicar el adaptador de entrada, aplicación y dominio correctos, siguiendo arquitectura hexagonal.
   - Los adaptadores de entrada solo orquestan la llamada a los casos de uso y manejan la respuesta estándar.
   - La lógica de negocio debe estar en servicios de dominio y casos de uso en la capa de aplicación.

2. **Diseño e implementación del endpoint REST**
   - Implementa el endpoint:
     - `GET /api/doctor/upcoming-appointments`
       - Requiere autenticación de médico especialista.
       - Retorna el listado de citas futuras (estado: pending/confirmed) ordenadas por fecha.
       - Incluye información relevante del paciente (id, nombre, teléfono, motivo de consulta) y detalles de la cita (fecha, hora, estado).
       - Permite filtrar por fecha y estado.
       - Cumple con la LFPDPPP mostrando solo información relevante y permitida.
   - Consulta las entidades APPOINTMENT, PATIENT, DOCTOR usando Prisma.
   - Optimiza la consulta para responder en menos de 2 segundos.

3. **Validaciones y controles de acceso**
   - Usa Yup para validaciones de datos de entrada (filtros de fecha y estado).
   - Implementa middleware de autenticación y control de acceso para verificar el rol de médico.
   - Devuelve mensajes claros y específicos en inglés.
   - Implementa manejo de errores con middleware global y clases customizadas.

4. **Documentación Swagger**
   - Documenta el endpoint en Swagger:
     - Descripción de funcionalidad y requisitos de autenticación.
     - Parámetros de consulta y ruta.
     - Ejemplo de petición y respuesta.
     - Estructura de los datos retornados (información relevante del paciente y cita).
     - Campos sensibles y controles de acceso conforme a la LFPDPPP.
     - Posibles errores y mensajes de validación.

5. **Pruebas unitarias**
   - Implementa pruebas unitarias y de integración para el endpoint usando Jest y Supertest.
   - Usa mocks para dependencias externas.
   - Casos a cubrir:
     - Consulta exitosa de próximas citas con usuario autenticado.
     - Filtrado por fecha y estado.
     - Validación de permisos y control de acceso.
     - Manejo de errores por citas inexistentes, estados inválidos o datos sensibles.

---

## Ejemplo de estructura base para el adaptador y servicio

```js
// filepath: src/application/getDoctorUpcomingAppointments.js
const yup = require('yup');
// Aqui consulta el archivo de dominio correspondiente para obtener los Appointments

const filterSchema = yup.object().shape({
  date: yup.date().optional(),
  status: yup.string().oneOf(['pending', 'confirmed']).optional(),
});

const doctorUpcomingAppointmentsUseCase = async ({ doctorId, date, status }) => {
  await filterSchema.validate({ date, status });
  // Lógica de consulta en appointmentRepository
  return await appointmentRepository.getUpcomingAppointments({ doctorId, date, status });
};

module.exports = doctorUpcomingAppointmentsUseCase;
```

```js
// filepath: src/adapters/in/doctorRoutes.js
const doctorUpcomingAppointmentsUseCase = require('../../application/getDoctorUpcomingAppointments');

const getUpcomingAppointments = async (req, res, next) => {
  try {
    const doctorId = req.user.id; // obtenido del JWT
    const { date, status } = req.query;
    const result = await doctorUpcomingAppointmentsUseCase({ doctorId, date, status });
    res.status(200).json(result);
  } catch (error) {
    next(error); // Manejo global de errores
  }
};

module.exports = { getUpcomingAppointments };
```

---

## Referencias

- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de los requerimientos
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso dime que archivo se a modificar o agregar, muestrame el codigo a agregar o reemplazar y dime en donde lo debo colocar
- Muestrame la lista de pasos a ejecutar antes de realizar la implementación

Antes de comenzar con la implementación revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.







Eres un experto en Ingeniero Backend
# Contexto inicial
Tenemos una serie de endopoints implementados que estan bien documentados y listos para usar, pero requerimos realizar algunas modificaciones.

# Instrucciones Generales
Aplicar los siguientes requerimientos para mejorar el contenido de las respuestas de los endpoints y la escritura de logs cumpliendo con los siguientes requerimientos

# Requerimientos funcionales
1. Agregar logs en los archivos:
  * Cuando es consumido cada uno de los metodos para tener una trazabilidad
  * Cuando tenemos errores 4xx y 5xx en el proyecto
2. Modificar el payload de las respuestas con codigo 5xx para evitar que impriman rutas o código del proyecto y digan un mensaje generico relacionado al error

# Requerimientos tecnicos
1. Para la impresión de Logs usar el paquere "Pino", el cual ya se encuentra instalado


# Mejores Practicas
1. Seguir las convenciones establecidas en el Product Requeriment Document (PRD)


# Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso de la lista menciona el archivo que se va a crear o modificar e incluye el código que se va agregar

Antes de realizar la tarea revisa mis requisitos ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.




Eres un experto en Ingenieria de Prompts, en DevSecOps y en Docker
# Contexto Inicial
Tenemos un proyeto de backend listo para su despliegue en la nube

# Intrucciones generales
Tu tarea es generar un prompt para el modelo (ChatGPT 4.1) que me ayude empaquetar en un contenedor de docker cumpliendo con los siguientes requerimientos

# Requerimientos
1. El contenedor debe contemplar las dependecias del proyecto
2. Contempla la ejecución del proyecto
3. El modelo deberá consultar el README del proyecto para asegurar una construccion exitosa del contenedor

# Mejores practicas
- Incluye el rol en el que debe actuar el modelo
- Consulta el archivo [[ARCHIVO]] para construir el prompt

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis requerimientos ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




# Prompt para empaquetar el backend Buscadoc en un contenedor Docker

## Rol del modelo
Actúa como un **DevSecOps experto en Docker y arquitectura hexagonal**. Tu objetivo es generar los archivos y comandos necesarios para empaquetar el backend Buscadoc en un contenedor Docker, siguiendo las mejores prácticas de seguridad, monitoreo y despliegue.

## Instrucciones

1. **Consulta el archivo `README.md` del backend** para identificar dependencias, scripts de ejecución, variables de entorno y puertos expuestos.
2. **Genera un `Dockerfile`** que:
   - Use la versión de Node.js especificada (`node:22`).
   - Instale todas las dependencias del proyecto.
   - Copie el código fuente siguiendo la estructura hexagonal.
   - Exponga el puerto `3010`.
   - Ejecute el servidor en modo producción (`npm start`) y documente cómo ejecutar en modo desarrollo (`npm run dev`).
   - Incluya instrucciones para copiar el archivo `.env` y destacar la importancia de no versionarlo.
   - Implemente un `HEALTHCHECK` para verificar que el backend responde correctamente.
   - Configure logs y monitoreo dentro del contenedor, e incluya instrucciones para migrar logs a contenedores externos.
   - Siga recomendaciones básicas de seguridad (no ejecutar como root, minimizar capas, excluir archivos sensibles).
3. **Genera un archivo `docker-compose.yml`** que:
   - Permita levantar el backend junto con el contenedor de PostgreSQL (según lo documentado).
   - Configure la red y los volúmenes necesarios para persistencia y comunicación entre servicios.
4. **Documenta en formato Markdown**:
   - Explica cada paso del proceso de construcción y despliegue.
   - Detalla cómo configurar variables de entorno y credenciales sensibles usando archivos `.env`.
   - Incluye instrucciones para ejecutar pruebas (`npm test`) dentro del contenedor.
   - Explica cómo acceder a la documentación Swagger y endpoints principales.
   - Incluye recomendaciones para migrar logs y monitoreo a contenedores externos en producción.
   - Resalta las mejores prácticas de seguridad y cumplimiento con la LFPDPPP.

## Ejemplo de estructura esperada en el archivo Markdown resultante

```markdown
# Despliegue del backend Buscadoc con Docker

## 1. Construcción del contenedor

### Dockerfile
...explicación y código...

### docker-compose.yml
...explicación y código...

## 2. Variables de entorno y seguridad

...instrucciones para `.env` y recomendaciones...

## 3. Ejecución y pruebas

...comandos para producción, desarrollo y pruebas...

## 4. Monitoreo y logs

...configuración básica y recomendaciones para migración...

## 5. Acceso a la API y documentación

...endpoints y Swagger...

## 6. Buenas prácticas y cumplimiento

...seguridad, exclusión de archivos sensibles, LFPDPPP...
```

## Consideraciones adicionales

- Mantén la lógica de negocio fuera del Dockerfile y scripts de arranque.
- Consulta los diagramas y documentación en la carpeta `docs/` para asegurar el cumplimiento de la arquitectura hexagonal.
- Documenta todo en español y sigue las convenciones del proyecto.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de las tareas
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- Antes de iniciar muestrame la lista de pasos a ejecutar

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.