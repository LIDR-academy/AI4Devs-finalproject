# Usar la imagen oficial de Node.js
FROM node:18-alpine

RUN echo "🚀 Dockerfile iniciado correctamente"

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

RUN echo "✅ Build completado correctamente"

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"] 