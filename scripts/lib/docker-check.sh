#!/bin/bash

# Librería compartida para verificar y arrancar Docker
# Incluir en otros scripts con: source scripts/lib/docker-check.sh

check_and_start_docker() {
    echo "🐳 Verificando Docker..."
    
    # Verificar si Docker está corriendo
    if docker ps &>/dev/null; then
        echo "✅ Docker está corriendo"
        return 0
    fi
    
    echo "⚠️  Docker no está corriendo"
    echo ""
    
    # Detectar sistema operativo
    OS="$(uname -s)"
    case "${OS}" in
        Darwin*)
            echo "💡 Intentando arrancar Docker Desktop en macOS..."
            
            # Verificar si Docker.app existe
            if [ -d "/Applications/Docker.app" ]; then
                open -a Docker
                echo "⏳ Esperando a que Docker arranque..."
                
                # Esperar hasta 60 segundos a que Docker esté listo
                MAX_WAIT=60
                ELAPSED=0
                while [ $ELAPSED -lt $MAX_WAIT ]; do
                    if docker ps &>/dev/null; then
                        echo "✅ Docker arrancado exitosamente"
                        return 0
                    fi
                    sleep 2
                    ELAPSED=$((ELAPSED + 2))
                    echo -n "."
                done
                
                echo ""
                echo "❌ Docker no respondió después de ${MAX_WAIT} segundos"
                echo "💡 Por favor, inicia Docker Desktop manualmente:"
                echo "   1. Abre Docker Desktop desde Applications"
                echo "   2. Espera a que el ícono aparezca en la barra de menú"
                echo "   3. Verifica con: docker ps"
                return 1
            else
                echo "❌ Docker Desktop no está instalado en /Applications/Docker.app"
                echo "💡 Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop"
                return 1
            fi
            ;;
        Linux*)
            echo "💡 Intentando arrancar Docker daemon en Linux..."
            
            # Intentar con systemctl (systemd)
            if command -v systemctl &>/dev/null; then
                sudo systemctl start docker
                sleep 5
                if docker ps &>/dev/null; then
                    echo "✅ Docker arrancado exitosamente"
                    return 0
                fi
            fi
            
            # Intentar con service (init.d)
            if command -v service &>/dev/null; then
                sudo service docker start
                sleep 5
                if docker ps &>/dev/null; then
                    echo "✅ Docker arrancado exitosamente"
                    return 0
                fi
            fi
            
            echo "❌ No se pudo arrancar Docker automáticamente"
            echo "💡 Por favor, inicia Docker manualmente:"
            echo "   sudo systemctl start docker"
            echo "   # o"
            echo "   sudo service docker start"
            return 1
            ;;
        *)
            echo "❌ Sistema operativo no soportado: ${OS}"
            echo "💡 Por favor, inicia Docker manualmente y ejecuta de nuevo"
            return 1
            ;;
    esac
}

# Si el script se ejecuta directamente (no como source)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_and_start_docker
fi
