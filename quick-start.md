# Quick Start Guide

Este documento explica cómo compilar y levantar el backend y frontend del proyecto Meditation Builder.

## Requisitos previos

- Java 21 (JDK)
- Maven 3.8+
- Node.js 18+ y npm

## Backend (Spring Boot)

1. **Compilar el backend:**

   ```sh
   cd backend
   mvn clean install -DskipTests
   ```

2. **Levantar el backend:**

   ```sh
   mvn spring-boot:run
   ```

   El backend estará disponible por defecto en `http://localhost:8080`.

## Frontend (React + Vite)

1. **Instalar dependencias:**

   ```sh
   cd frontend
   npm install
   ```

2. **Construir el frontend:**

   ```sh
   npm run build
   ```

3. **Levantar el frontend:**

   ```sh
   npm run dev
   ```

   El frontend estará disponible por defecto en `http://localhost:3010`.

## Notas

- Para desarrollo local, asegúrate de que tanto el backend como el frontend estén corriendo simultáneamente.
- Consulta los archivos `application.yml` y `application-local.yml` en `backend/src/main/resources` para configuración avanzada.
- Si tienes problemas, revisa los logs de consola para más detalles.
