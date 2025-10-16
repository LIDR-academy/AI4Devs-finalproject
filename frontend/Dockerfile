# Imagen base oficial de Node.js 22 para producción y SSR
FROM node:22-alpine

# Instalar dependencias del sistema necesarias para Next.js y paquetes nativos
RUN apk add --no-cache libc6-compat

# Crear usuario no root para ejecutar la app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Directorio de trabajo
WORKDIR /app

# Copiar solo archivos necesarios para instalar dependencias
COPY package.json ./
#COPY pnpm-lock.yaml ./
#COPY yarn.lock ./
COPY package-lock.json ./

# Instalar dependencias en modo producción
RUN npm ci --omit=dev

# Copiar el resto del código fuente siguiendo la estructura Next.js
COPY public/ ./public/
COPY app/ ./app/
COPY lib/ ./lib/
COPY components/ ./components/
COPY src/ ./src/
COPY styles/ ./styles/
COPY next.config.mjs ./
COPY tsconfig.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Montar el archivo .env como volumen externo para mayor seguridad.
# Ejemplo de comando para docker run:
#   docker run -v /ruta/local/.env:/app/.env nombre_imagen
# Ejemplo en docker-compose:
#   volumes:
#     - ./.env:/app/.env
# Si solo quieres copiar el archivo .env (no recomendado en producción), descomenta la siguiente línea:
# COPY .env .env

# Cambiar propietario de los archivos al usuario no root
RUN chown -R appuser:appgroup /app

# Construir la aplicación Next.js para producción
RUN npm run build

# Exponer el puerto de la aplicación SSR
EXPOSE 3000

# HEALTHCHECK para verificar que el frontend responde en la ruta principal
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --spider --quiet http://localhost:3000/ || exit 1

# Usar usuario no root
USER appuser

# --- MODO PRODUCCIÓN ---
CMD ["npm", "start"]

# --- MODO DESARROLLO ---
# Para habilitar modo desarrollo, comenta la línea anterior y descomenta la siguiente:
# CMD ["npm", "run", "dev"]

# Seguridad y buenas prácticas
# - No copies archivos sensibles ni credenciales al contenedor.
# - Monta .env como volumen externo.
# - Mantén la lógica de negocio fuera del Dockerfile y scripts de arranque.