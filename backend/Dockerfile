# Imagen base oficial de Node.js 22, recomendada para producción
FROM node:22-alpine

# Instalar dependencias del sistema necesarias para Prisma y otros paquetes nativos
RUN apk add --no-cache openssl

# Crear usuario no root para ejecutar la app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Directorio de trabajo
WORKDIR /app

# Copiar solo archivos necesarios para instalar dependencias
COPY package*.json ./

# Copiar la carpeta prisma (esquema y migraciones) antes de generar el cliente
COPY prisma/ ./prisma/

# Instalar dependencias en modo desarrollo (para pruebas y hot reload)
RUN npm ci

# Generar el cliente Prisma para la conexión con la base de datos
RUN npx prisma generate

# Copiar el resto del código fuente siguiendo la estructura hexagonal
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY docs/ ./docs/
COPY server.js ./
COPY src/config/logger.js ./src/config/logger.js

# Montar el archivo .env como volumen externo para mayor seguridad.
# Ejemplo de comando para docker run:
#   docker run -v /ruta/local/.env:/app/.env nombre_imagen
# Ejemplo en docker-compose (ver siguiente paso):
#   volumes:
#     - ./.env:/app/.env
# Si solo quieres copiar el archivo .env (no recomendado en producción), descomenta la siguiente línea:
# COPY .env .env

# Cambiar propietario de los archivos al usuario no root
RUN chown -R appuser:appgroup /app

# Exponer el puerto de la API
EXPOSE 3010

# HEALTHCHECK para verificar que el backend responde
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --spider --quiet http://localhost:3010/api-docs/e6b2fa317dc910b88fd4c2a05f9934b47f46661d || exit 1

# Usar usuario no root
USER appuser

# --- MODO DESARROLLO ---
# Habilitado por defecto para pruebas locales y hot reload con nodemon
CMD ["npm", "run", "dev"]

# --- MODO PRODUCCIÓN ---
# Para habilitar modo producción, comenta la línea anterior y descomenta la siguiente:
# CMD ["npm", "start"]

# Logging y monitoreo
# Los logs generados por pino se envían a stdout/stderr y pueden ser recolectados por herramientas externas (ELK, Loki, etc.)
# Para migrar logs, montar un volumen externo o redirigir stdout/stderr a un contenedor de logs.