#!/bin/bash

# Verificar si se proporcionó un argumento
if [ -z "$1" ]; then
    echo "Uso: ./switch-db.sh [local|aws]"
    exit 1
fi

# Verificar que el argumento sea válido
if [ "$1" != "local" ] && [ "$1" != "aws" ]; then
    echo "Error: El argumento debe ser 'local' o 'aws'"
    exit 1
fi

# Crear una copia de seguridad del archivo .env actual
cp .env .env.backup

# Actualizar el archivo .env
if [ "$1" = "local" ]; then
    echo "Cambiando a base de datos local..."
    sed -i 's/DB_ENVIRONMENT=.*/DB_ENVIRONMENT=local/' .env
    sed -i 's/DB_HOST=.*/DB_HOST=localhost/' .env
    sed -i 's/DB_PORT=.*/DB_PORT=5432/' .env
    sed -i 's/DB_USERNAME=.*/DB_USERNAME=guardianpaws_admin/' .env
    sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=GuardianPaws123!/' .env
    sed -i 's/DB_NAME=.*/DB_NAME=guardianpaws/' .env
else
    echo "Cambiando a base de datos AWS..."
    sed -i 's/DB_ENVIRONMENT=.*/DB_ENVIRONMENT=aws/' .env
    sed -i 's/DB_HOST=.*/DB_HOST=guardianpaws-db.c4jyg8saer66.us-east-1.rds.amazonaws.com/' .env
    sed -i 's/DB_PORT=.*/DB_PORT=5432/' .env
    sed -i 's/DB_USERNAME=.*/DB_USERNAME=guardianpaws_admin/' .env
    sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=GuardianPaws123!/' .env
    sed -i 's/DB_NAME=.*/DB_NAME=guardianpaws/' .env
fi

echo "Configuración actualizada. Base de datos cambiada a: $1" 