# Backend - Buscadoc

Este backend implementa la arquitectura hexagonal (puertos y adaptadores) para desacoplar el core de dominio de frameworks y tecnologías.

## Dependencias principales

- `express@4.18.2` - API REST
- `prisma@5.10.1` y `@prisma/client@5.10.1` - ORM y cliente para PostgreSQL
- `pg@8.11.3` - Driver para PostgreSQL
- `dotenv@16.4.5` - Variables de entorno
- `cors@2.8.5` - Middleware CORS
- `nodemailer@6.9.8` - Envío de correos electrónicos
- `jsonwebtoken@9.0.2` - Autenticación JWT
- `bcryptjs@2.4.3` - Hash de contraseñas

## Estructura recomendada (hexagonal)

```
src/
  domain/         # Entidades y servicios de dominio
  application/    # Casos de uso
  adapters/
    in/           # Adaptadores de entrada (API REST, controladores)
    out/          # Adaptadores de salida (persistencia, email, storage)
  config/         # Configuración y utilidades
prisma/           # Modelos y migraciones
```

## Autenticación

- Se utiliza JWT (`jsonwebtoken`) y hash de contraseñas con `bcryptjs` para la autenticación inicial.
- La integración con Auth.js y OAuth2 se realizará en tickets futuros.

## Internacionalización

- El backend está preparado para soportar mensajes multilenguaje.
- La integración de dependencias específicas para i18n se realizará en tickets futuros.

## Seguridad

- Las credenciales y datos sensibles se gestionan mediante variables de entorno en `.env` (excluido del control de versiones).
- Cumplimiento con la LFPDPPP y normativas mexicanas de protección de datos personales.

## Instalación

```sh
npm install
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

## Variables de entorno

Crea un archivo `.env` con las siguientes variables:

```
# Base de datos
DATABASE_URL="postgresql://buscadoc_user:contraseña@localhost:5432/buscadoc_db"

# Configuración del servidor
PORT=3000
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

## Ejecución del servidor

Para iniciar el servidor de desarrollo:

```sh
npm start
```

## Referencias

- [Product Requirement Document](../docs/product_requirement_document.md)
- [Modelo de Datos](../docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Diagrama de arquitectura](../docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md)