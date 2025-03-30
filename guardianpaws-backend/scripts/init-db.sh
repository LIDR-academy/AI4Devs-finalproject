#!/bin/bash

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL no está instalado"
    exit 1
fi

# Verificar la conexión antes de proceder
echo "Verificando conexión..."
PGPASSWORD=GuardianPaws123! psql -h localhost -U guardianpaws_admin -d guardianpaws -c "\conninfo" || {
    echo "Error: No se pudo conectar a la base de datos"
    exit 1
}

# Ejecutar el script de inicialización
echo "Inicializando la base de datos..."
PGPASSWORD=GuardianPaws123! psql -h localhost -U guardianpaws_admin -d guardianpaws -f infrastructure/db/init.sql || {
    echo "Error: No se pudo inicializar la base de datos"
    exit 1
}

echo "Base de datos inicializada correctamente" 