# Quick Start Guide

Este documento explica cómo compilar y levantar el backend y frontend del proyecto Meditation Builder.

Para empezar rápidamente:
1. **Levantar la infraestructura (Docker)**: Sigue los pasos de la sección [Infrastructure](#infrastructure-docker).
2. **Levantar el Backend**: Sigue los pasos de la sección [Backend](#backend-spring-boot). El backend debe estar corriendo en local (puerto 8080) para que el frontend pueda comunicarse con él.
3. **Acceder a la aplicación**: Una vez el backend esté levantado, puedes usar el frontend desplegado en producción: [https://ai-4-devs-finalproject-nine.vercel.app/](https://ai-4-devs-finalproject-nine.vercel.app/)

🎥 **Vídeos de demostración**:
- Puedes ver un vídeo del proceso de configuración inicial en [docs/quick-start/1. Build local backend.mkv](docs/quick-start/1.%20Build%20local%20backend.mkv).
- También dispones de un vídeo del funcionamiento completo (Login con Google, creación de un Podcast y creación de un Vídeo) en [docs/quick-start/2. Login, create postcast and create video.mkv](docs/quick-start/2.%20Login,%20create%20postcast%20and%20create%20video.mkv).

## Requisitos previos

- Java 21 (JDK)
- Maven 3.8+
- Node.js 18+ y npm

## Infrastructure (Docker)

Arranca los containers LocalStack (S3), PostgreSQL y ffmpeg via Docker Compose antes de ejecutar el backend:

```sh
cd backend
docker-compose up -d
```



## Backend (Spring Boot)

1. **Compilar el backend:**

   ```sh
   mvn clean install -DskipTests
   ```

2. **Levantar el backend:**

   ```sh
   mvn spring-boot:run
   ```

   El backend estará disponible por defecto en `http://localhost:8080`.
