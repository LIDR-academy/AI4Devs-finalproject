# 🚀 VigilCity Backend

Bienvenido al backend de VigilCity, una aplicación diseñada para gestionar reportes, comentarios y calificaciones. Este proyecto está construido con Node.js y utiliza PostgreSQL como base de datos.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu máquina:

- [Node.js](https://nodejs.org/) (v14 o superior)
- [PostgreSQL](https://www.postgresql.org/) (v14 o superior)
- [Docker](https://www.docker.com/) (opcional, para ejecutar la base de datos en un contenedor)

## 📦 Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/difeorqui/VigilCity-DFO.git
   cd VigilCity-DFO/backend
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**

   Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:

   ```plaintext
   DB_USERNAME=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=nombre_de_tu_base_de_datos
   DB_HOST=localhost
   DB_PORT=5432
   JWT_SECRET=tu_secreto_jwt
   POSTGRES_USER=tu_usuario_postgres
   POSTGRES_PASSWORD=tu_contraseña_postgres
   POSTGRES_DB=nombre_de_tu_base_de_datos_postgres
   ```

   Crea un archivo `.env` en la carpeta `VigilCity-DFO\backend\vigilcity-db` y añade las siguientes variables:

   ```plaintext
   POSTGRES_USER=tu_usuario_postgres
   POSTGRES_PASSWORD=tu_contraseña_postgres
   POSTGRES_DB=nombre_de_tu_base_de_datos_postgres
   ```

4. **Inicia la base de datos (opcional):**

   Si deseas usar Docker para la base de datos, ejecuta:

   ```bash
   docker-compose up -d
   ```

## ⚙️ Uso

1. **Inicia el servidor:**

   ```bash
   npm start
   ```

   O para desarrollo:

   ```bash
   npm run dev
   ```

2. **Accede a la API:**

   La API estará disponible en `http://localhost:3000/api`.

## 🧪 Pruebas

Para ejecutar las pruebas, utiliza el siguiente comando: 

    ```bash
    npm test
    ```
