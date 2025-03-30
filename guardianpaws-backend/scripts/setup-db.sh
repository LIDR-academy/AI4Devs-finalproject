#!/bin/bash

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL no está instalado"
    exit 1
fi

# Solicitar contraseña del usuario postgres
echo "Por favor, ingresa la contraseña del usuario postgres:"
read -s POSTGRES_PASSWORD
export PGPASSWORD=$POSTGRES_PASSWORD

# Crear el usuario si no existe
echo "Creando usuario guardianpaws_admin..."
psql -U postgres -d postgres -c "DROP USER IF EXISTS guardianpaws_admin;" 2>/dev/null || true
psql -U postgres -d postgres -c "CREATE USER guardianpaws_admin WITH PASSWORD 'GuardianPaws123!';" 2>/dev/null || true

# Dar privilegios al usuario
echo "Configurando privilegios..."
psql -U postgres -d postgres -c "ALTER USER guardianpaws_admin WITH SUPERUSER;" 2>/dev/null || true

# Crear la base de datos si no existe
echo "Creando base de datos guardianpaws..."
psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS guardianpaws;" 2>/dev/null || true
psql -U postgres -d postgres -c "CREATE DATABASE guardianpaws;" 2>/dev/null || true

# Dar todos los privilegios al usuario sobre la base de datos
echo "Configurando permisos de la base de datos..."
psql -U postgres -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE guardianpaws TO guardianpaws_admin;" 2>/dev/null || true

# Verificar la conexión
echo "Verificando conexión..."
PGPASSWORD=GuardianPaws123! psql -h localhost -U guardianpaws_admin -d guardianpaws -c "\conninfo" || {
    echo "Error: No se pudo verificar la conexión"
    exit 1
}

echo "Configuración de la base de datos completada" 