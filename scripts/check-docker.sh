#!/bin/bash

# Script standalone para verificar y arrancar Docker
# Puede ejecutarse directamente o incluirse en otros scripts

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Incluir la librería
source "${SCRIPT_DIR}/lib/docker-check.sh"

# Ejecutar verificación
check_and_start_docker

exit $?
