#!/bin/sh
set -e

echo "==> Ejecutando migraciones de base de datos..."
if npx prisma migrate deploy; then
  echo "==> Migración exitosa. Ejecutando seed..."
  if node prisma/seed.js; then
    echo "==> Seed ejecutado correctamente."
  else
    echo "==> Error al ejecutar el seed. Revisa los logs para más detalles."
  fi
else
  echo "==> Error en la migración. El seed no se ejecutará."
fi

echo "==> Iniciando backend Buscadoc..."
exec npm run dev
# Para producción, cambia por:
# exec npm start