# Backend - Buscadoc

Este backend implementa la arquitectura hexagonal (puertos y adaptadores) para desacoplar el core de dominio de frameworks y tecnologías.

**Dependencias:**

- `npm@10.x` - Gestor de paquetes
- `node@v22.x` - Entorno de ejecución de Javascript
- `express@4.18.2` - API REST
- `prisma@5.10.1` y `@prisma/client@5.10.1` - ORM y cliente para PostgreSQL
- `pg@8.11.3` - Driver para PostgreSQL
- `dotenv@16.4.5` - Variables de entorno
- `cors@2.8.5` - Middleware CORS
- `nodemailer@6.9.8` - Envío de correos electrónicos
- `jsonwebtoken@9.0.2` - Autenticación JWT
- `bcryptjs@2.4.3` - Hash de contraseñas
- `swagger-ui-express@5.0.1` - Documentación Swagger para la API
- `pino@9.10.0` - Logger rápido y bajo consumo
- `pino-pretty@13.1.1` - Formateador de logs para desarrollo
- `yup@1.7.0` - Validación de esquemas y datos

**Dependencias de desarrollo:**

- `jest@30.0.5` - Pruebas unitarias
- `supertest@7.1.4` - Pruebas de integración para endpoints REST
- `nodemon@3.1.10` - Reinicio automático del servidor en desarrollo

## Estructura recomendada (hexagonal)

```
__test__          # Archivos de test unitarios del proyecto
docs/             # Documentación importante del proyecto
   swagger.json   # Documentación del API del proyecto
src/
  domain/         # Entidades y servicios de dominio
  application/    # Casos de uso
  adapters/
    in/           # Adaptadores de entrada (API REST, controladores)
    out/          # Adaptadores de salida (persistencia, email, storage)
  config/         # Configuración y utilidades
      logger.js   # Utilidad del proyecto para el manejo de logs
prisma/           # Modelos y migraciones
.env              # Variables de entorno
.gitignore        # Archivos exluidos en el repositorio de Github
nodemon.json      # Configuración de nodemon para ejecución en el entorno de desarrollo
docker-compose    # Orquestador de Docker para levantar base de datos y proyecto backend en contenedores
server.json       # Punto de arranque de la aplicación Backend de Buscadoc
README.md         # Documentación inicial del proyecto (archivo actual)
package.json      # Archivo de paquetes, dependecias y detalles del proyecto de NPM
```

## Autenticación

- Se utiliza JWT (`jsonwebtoken`) y hash de contraseñas con `bcryptjs` para la autenticación inicial.
- La integración con Auth.js y OAuth2 se realizará en tickets futuros.

## Internacionalización

- La integración de dependencias específicas para i18n se realizará en tickets futuros.

## Seguridad

- Las credenciales y datos sensibles se gestionan mediante variables de entorno en `.env` (excluido del control de versiones).
- Cumplimiento con la LFPDPPP y normativas mexicanas de protección de datos personales.

## Instalación

```sh
npm install
```

## Levantar PostgreSQL con Docker

1. Instala Docker Desktop en tu máquina.
2. Abre una terminal en la raíz del proyecto.
3. Ejecuta el siguiente comando para levantar el contenedor:

   ```
   docker-compose up -d
   ```

4. PostgreSQL estará disponible en el puerto `5432` con usuario y contraseña `postgres`.
5. Los datos se guardan en el volumen `pgdata` para persistencia local.
6. Para detener el servicio:

   ```
   docker-compose down
   ```

7. Para eliminar los datos persistentes:

   ```
   docker-compose down -v
   ```

## Configuración de la base de datos

1. Asegúrate de tener el archivo `.env` con la configuración correcta:
   ```
   DATABASE_URL="postgresql://buscadoc_user:contraseña@localhost:5432/buscadoc_db"
   ```

2. Ejecuta la migración inicial para crear las tablas:
   ```sh
   npx prisma migrate dev --name init
   ```

3. Para visualizar la base de datos, usa Prisma Studio:
   ```sh
   npx prisma studio
   ```


## Configuración de permisos en PostgreSQL

Si encuentras errores de permisos al ejecutar migraciones:

1. Accede al contenedor de PostgreSQL:
   ```sh
   docker exec -it postgres_db psql -U postgres
   ```

2. Otorga permisos de creación de bases de datos al usuario:
   ```sql
   ALTER USER buscadoc_user CREATEDB;
   ```

3. Otorga permisos sobre el esquema public:
   ```sql
   \c buscadoc_db
   GRANT ALL ON SCHEMA public TO buscadoc_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO buscadoc_user;
   ```

## Ejecución y pruebas dentro del contenedor Docker

### Levantar el backend y la base de datos juntos

Para iniciar el backend y PostgreSQL en contenedores, ejecuta desde la raíz del proyecto:

```sh
docker-compose up --build
```

Esto construye la imagen y levanta ambos servicios. El backend estará disponible en [http://localhost:3010](http://localhost:3010).

### Levantar solo el backend (requiere que postgres esté corriendo)

```sh
docker-compose up backend
```

### Levantar solo la base de datos

```sh
docker-compose up postgres
```

### Acceso a la terminal del contenedor backend

Para acceder a la terminal del backend y ejecutar comandos manualmente (por ejemplo, migraciones o pruebas):

```sh
docker exec -it buscadoc_backend sh
```

### Ejecutar pruebas unitarias dentro del contenedor

1. Accede a la terminal del contenedor backend:
   ```sh
   docker exec -it buscadoc_backend sh
   ```
2. Ejecuta las pruebas:
   ```sh
   npm test
   ```

Esto ejecutará los tests definidos en la carpeta `__tests__` usando Jest y Supertest con mocks.

### Ejecución en modo desarrollo y producción

- **Modo desarrollo (hot reload con nodemon):**  
  Por defecto, el contenedor ejecuta el backend en modo desarrollo. Los cambios en el código reinician el servidor automáticamente.

- **Modo producción:**  
  Para ejecutar en modo producción, edita el `Dockerfile` y comenta la línea de desarrollo:
  ```dockerfile
  # CMD ["npm", "run", "dev"]
  CMD ["npm", "start"]
  ```
  Reconstruye la imagen y levanta los servicios nuevamente.

### Detener y limpiar los contenedores

- Detener todos los servicios:
  ```sh
  docker-compose down
  ```
- Eliminar los volúmenes de datos (incluye la base de datos):
  ```sh
  docker-compose down -v
  ```

## Configuración de variables de entorno y seguridad

### Ejemplo de archivo `.env`

Crea un archivo `.env` en la raíz del proyecto `backend` con el siguiente contenido adaptado a tu entorno:

```
# Base de datos
DATABASE_URL="postgresql://buscadoc_user:contraseña@localhost:5432/buscadoc_db"

# Configuración del servidor
PORT=3010
NODE_ENV=development

# Autenticación JWT
JWT_SECRET=tu_secreto_jwt_aqui_muy_seguro
JWT_EXPIRES_IN=24h

# SMTP para notificaciones por correo
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=usuario@example.com
SMTP_PASS=tu_contraseña_smtp
SMTP_FROM=no-reply@buscadoc.com

# Firebase Storage (archivos)
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
FIREBASE_APP_ID=tu_app_id

# Configuración CORS
CORS_ORIGIN=http://localhost:8080
```

### Recomendaciones de seguridad

- **No compartas ni subas el archivo `.env` al repositorio.**  
  Verifica que `.env` esté incluido en `.gitignore`.
- **Utiliza variables de entorno para todas las credenciales y datos sensibles.**
- **Cambia las contraseñas y secretos en producción.**  
  No uses valores por defecto.
- **Cumple con la LFPDPPP:**  
  - Informa y protege los datos personales de los usuarios.
  - Limita el acceso a datos sensibles solo a servicios autorizados.
  - Documenta el uso y almacenamiento de datos personales en la carpeta `docs/`.

### Buenas prácticas

- Mantén las credenciales fuera del código fuente.
- Usa diferentes archivos `.env` para desarrollo y producción.
- Revisa y actualiza los permisos de los usuarios en la base de datos.
- Audita regularmente el acceso y uso de datos personales.


## Ejecución del servidor

Para iniciar el servidor en modo producción:

```sh
npm start
```

### Ejecución en modo desarrollo con nodemon

Para evitar reiniciar manualmente el servidor cada vez que realices cambios en el código, puedes usar **nodemon**.  
Sigue estos pasos:

1. **Instalación**  
   Nodemon ya está incluido como dependencia de desarrollo en este proyecto (`devDependencies`).

2. **Script de desarrollo**  
   El archivo `package.json` incluye el siguiente script:
   ```json
   "dev": "nodemon server.js"
   ```

3. **Iniciar el servidor en modo desarrollo**  
   Ejecuta el siguiente comando en la terminal:
   ```sh
   npm run dev
   ```

Nodemon monitorea los archivos del proyecto y reinicia automáticamente el servidor al detectar cambios, facilitando el flujo de trabajo en desarrollo.

## Pruebas unitarias e integración

Las pruebas de integración para los endpoints REST se encuentran en la carpeta `__tests__` en la raíz del proyecto.  
Se utilizan **Jest** y **Supertest** para simular peticiones HTTP y validar la estructura de las respuestas, empleando mocks para el core de dominio y la persistencia.

### Ejecutar pruebas

```sh
npm test
```

Esto ejecutará todos los archivos de prueba ubicados en `backend/__tests__`.

---

## Configuración de logs y recomendaciones para monitoreo externo

### Logs en el backend

- El backend utiliza **Pino** como logger principal, configurado en `src/config/logger.js`.
- Los logs se envían por defecto a `stdout` y `stderr`, lo que permite que Docker los recolecte automáticamente.
- En desarrollo, puedes usar `pino-pretty` para visualizar los logs de forma legible.

### Acceso a logs en contenedores Docker

- Para ver los logs del backend en tiempo real:
  ```sh
  docker logs -f buscadoc_backend
  ```
- Los logs también pueden consultarse desde la interfaz de Docker Desktop.

### Recomendaciones para migrar logs y monitoreo a contenedores externos

- **Centralización de logs:**  
  Para ambientes productivos, redirige los logs a sistemas externos usando drivers de Docker o montando volúmenes:
  - **ELK Stack (Elasticsearch, Logstash, Kibana):** Para análisis y visualización avanzada.
  - **Grafana Loki:** Para almacenamiento y consulta eficiente de logs.
  - **Promtail/Filebeat:** Para enviar logs a Loki o ELK.
  - **Fluentd:** Para procesamiento y envío de logs a múltiples destinos.

- **Configuración recomendada:**
  - Mantén los logs en formato JSON para facilitar la integración con sistemas de monitoreo.
  - Configura alertas sobre errores críticos y eventos de seguridad.
  - Monta un volumen externo si necesitas persistencia local:
    ```yaml
    volumes:
      - ./logs:/app/logs
    ```
    y configura Pino para escribir en `/app/logs`.

- **Monitoreo de servicios:**
  - Usa **Prometheus** para métricas y monitoreo de recursos.
  - Integra **Grafana** para dashboards y visualización.
  - Considera herramientas como **Datadog** o **New Relic** para monitoreo integral.

### Buenas prácticas de seguridad en logs

- No registres datos personales sensibles en los logs (cumplimiento LFPDPPP).
- Limita el acceso a los logs solo a personal autorizado.
- Audita periódicamente los logs y configura rotación para evitar saturación de disco.


## Acceso a la API y documentación Swagger

### Endpoints principales

La API REST sigue la estructura recomendada por la arquitectura hexagonal, exponiendo los recursos bajo el prefijo `/api/{recurso}`.  
Algunos endpoints principales incluyen:

- **Usuarios:**  
  - `POST /api/register/patient` — Registro de paciente
  - `POST /api/register/doctor` — Registro de médico
  - `POST /api/login/patient` — Login de paciente
  - `POST /api/login/doctor` — Login de médico

- **Médicos:**  
  - `GET /api/doctors` — Listado de médicos
  - `GET /api/doctors/:id` — Perfil de médico
  - `GET /api/doctors/:id/comments` — Comentarios de médico

- **Citas:**  
  - `GET /api/appointments` — Listado de citas
  - `POST /api/appointments` — Crear cita

Consulta el archivo `docs/swagger.json` para la definición completa de los endpoints y sus parámetros.

### Acceso a la documentación Swagger

La documentación interactiva de la API está disponible en:

```
http://localhost:3010/api-docs/e6b2fa317dc910b88fd4c2a05f9934b47f46661d
```

Desde esta URL puedes:

- Visualizar todos los endpoints disponibles.
- Probar peticiones directamente desde el navegador.
- Consultar ejemplos de request/response y descripciones de parámetros.

### Recomendaciones

- Utiliza la documentación Swagger para validar la integración de nuevos adaptadores y casos de uso.
- Mantén el archivo `docs/swagger.json` actualizado conforme se agreguen o modifiquen endpoints.
- Para ambientes productivos, protege el acceso a Swagger con autenticación o limita su exposición solo a entornos de desarrollo.


## Referencias

- [Product Requirement Document](../docs/product_requirement_document.md)
- [Modelo de Datos](../docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Diagrama de arquitectura](../docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md)