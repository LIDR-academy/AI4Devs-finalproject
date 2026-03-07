#!/bin/bash

# Script para consultar la base de datos TravelSplit
# Uso: ./consultar-bd.sh [comando]
# Requiere variables de entorno: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME

# Todas las variables deben estar configuradas en el entorno
# No se usan valores por defecto para mayor seguridad
if [ -z "$DB_HOST" ]; then
    echo "Error: DB_HOST no está configurada."
    exit 1
fi
if [ -z "$DB_PORT" ]; then
    echo "Error: DB_PORT no está configurada."
    exit 1
fi
if [ -z "$DB_USERNAME" ]; then
    echo "Error: DB_USERNAME no está configurada."
    exit 1
fi
if [ -z "$DB_NAME" ]; then
    echo "Error: DB_NAME no está configurada."
    exit 1
fi

# Verificar que la contraseña esté configurada
if [ -z "$DB_PASSWORD" ]; then
    echo "Error: DB_PASSWORD no está configurada. Por favor, configura la variable de entorno."
    echo "Ejemplo: export DB_PASSWORD=<valor-desde-env>"
    exit 1
fi

# Verificar si Docker está corriendo
if docker ps | grep -q travelsplit-postgres; then
    echo "Conectando a PostgreSQL en Docker..."
    docker exec -it travelsplit-postgres psql -U $DB_USERNAME -d $DB_NAME
else
    echo "Conectando a PostgreSQL local..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME
fi



