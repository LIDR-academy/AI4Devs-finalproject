#!/bin/bash
# Crear la estructura de carpetas para el proyecto GuardianPaws Backend

# Navegar al directorio del proyecto
cd guardianpaws-backend || exit

# Crear carpetas principales
mkdir -p src/config
mkdir -p src/modules
mkdir -p test

# Crear subcarpetas para módulos
mkdir -p src/modules/adoption
mkdir -p src/modules/auth
mkdir -p src/modules/chat
mkdir -p src/modules/image
mkdir -p src/modules/pet
mkdir -p src/modules/report
mkdir -p src/modules/user

# Confirmación de creación
echo "Estructura de carpetas creada exitosamente." 