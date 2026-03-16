# Usar imagen oficial de PHP 8.3 CLI
FROM php:8.3-cli

# Instalar extensiones necesarias
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo pdo_mysql mysqli \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Establecer directorio de trabajo
WORKDIR /app

# Variable para invalidar cache de Docker (cambiar este valor fuerza rebuild)
ENV CACHE_BUST=2025-11-01-v2

# Copiar archivos de la aplicación
COPY . /app

# Limpiar submódulos antiguos y cachés que puedan causar conflictos
RUN rm -rf lib/Resend && \
    rm -rf vendor && \
    echo "Limpieza completada: lib/Resend y vendor eliminados"

# Instalar dependencias de Composer desde cero
RUN composer install --no-dev --optimize-autoloader --no-cache

# Exponer puerto
EXPOSE 8080

# Comando para iniciar el servidor (PRODUCCIÓN: display_errors OFF)
CMD ["php", "-d", "display_errors=0", "-d", "log_errors=1", "-S", "0.0.0.0:8080", "-t", ".", "index.php"]
