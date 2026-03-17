# Multi-stage Dockerfile para Frontend
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Variables de entorno para el build de Vite
ARG VITE_API_BASE_URL
ARG VITE_USERS_API_BASE_URL
ARG VITE_TRIPS_API_BASE_URL
ARG VITE_BOOKING_API_BASE_URL
ARG VITE_MATCHING_API_BASE_URL
ARG VITE_OIDC_ISSUER
ARG VITE_OIDC_CLIENT_ID
ARG VITE_OIDC_REDIRECT_URI
ARG VITE_AUTH_DISABLED
# Cache bust manual del build
ARG BUILD_ID=dev

# Exportar variables para que Vite las use durante el build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_USERS_API_BASE_URL=$VITE_USERS_API_BASE_URL
ENV VITE_TRIPS_API_BASE_URL=$VITE_TRIPS_API_BASE_URL
ENV VITE_BOOKING_API_BASE_URL=$VITE_BOOKING_API_BASE_URL
ENV VITE_MATCHING_API_BASE_URL=$VITE_MATCHING_API_BASE_URL
ENV VITE_OIDC_ISSUER=$VITE_OIDC_ISSUER
ENV VITE_OIDC_CLIENT_ID=$VITE_OIDC_CLIENT_ID
ENV VITE_OIDC_REDIRECT_URI=$VITE_OIDC_REDIRECT_URI
ENV VITE_AUTH_DISABLED=$VITE_AUTH_DISABLED
ENV BUILD_ID=$BUILD_ID

# Construir la aplicación
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto
EXPOSE 3000

# Comando para ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]
