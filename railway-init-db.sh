#!/bin/bash
# Script de inicialización de base de datos para Railway

echo "🚀 Inicializando base de datos..."

# Verificar que las variables de entorno existan
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASS" ]; then
    echo "❌ Error: Variables de base de datos no configuradas"
    exit 1
fi

echo "✅ Variables de entorno encontradas"

# Importar schema
echo "📋 Importando schema..."
mysql -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < db/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema importado correctamente"
else
    echo "❌ Error importando schema"
    exit 1
fi

# Importar datos iniciales
echo "📊 Importando datos iniciales..."
mysql -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < db/data.sql

if [ $? -eq 0 ]; then
    echo "✅ Datos importados correctamente"
else
    echo "⚠️ Advertencia: Error importando datos (puede que ya existan)"
fi

echo "🎉 Base de datos inicializada correctamente"
