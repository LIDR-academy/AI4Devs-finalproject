#!/bin/bash

echo "🔍 Diagnosticando puerto 5432 (PostgreSQL)..."
echo ""

# Verificar qué está usando el puerto 5432
if lsof -i :5432 &> /dev/null; then
    echo "⚠️  Puerto 5432 está en uso:"
    echo ""
    lsof -i :5432
    echo ""
    
    # Obtener información del proceso
    PID=$(lsof -ti :5432 | head -1)
    if [ ! -z "$PID" ]; then
        echo "📋 Información del proceso (PID: $PID):"
        ps -p $PID -o pid,comm,args
        echo ""
        
        # Verificar si es un contenedor Docker
        if docker ps -a --format "{{.ID}} {{.Names}}" | grep -q "$PID\|postgres"; then
            echo "🐳 Parece ser un contenedor Docker"
            echo ""
            echo "Contenedores Docker relacionados con PostgreSQL:"
            docker ps -a | grep -i postgres
            echo ""
            
            read -p "¿Deseas detener y eliminar estos contenedores? (s/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Ss]$ ]]; then
                echo "Deteniendo contenedores..."
                docker ps -a --filter "name=postgres" --format "{{.Names}}" | xargs -r docker stop
                docker ps -a --filter "name=postgres" --format "{{.Names}}" | xargs -r docker rm
                echo "✅ Contenedores detenidos"
                echo ""
                echo "Espera 5 segundos y verifica de nuevo..."
                sleep 5
                if ! lsof -i :5432 &> /dev/null; then
                    echo "✅ Puerto 5432 ahora está libre!"
                else
                    echo "⚠️  El puerto aún está ocupado. Puede ser PostgreSQL local."
                fi
            fi
        else
            # Verificar si es PostgreSQL local
            COMMAND=$(ps -p $PID -o comm= 2>/dev/null)
            if [[ "$COMMAND" == *"postgres"* ]]; then
                echo "💾 Parece ser PostgreSQL local (no Docker)"
                echo ""
                echo "Opciones:"
                echo "1. Detener PostgreSQL local"
                echo "2. Usar puerto alternativo en Docker"
                echo ""
                
                read -p "¿Deseas detener PostgreSQL local? (s/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Ss]$ ]]; then
                    # Intentar detener con brew services
                    if command -v brew &> /dev/null; then
                        echo "Deteniendo PostgreSQL con Homebrew..."
                        brew services stop postgresql@14 2>/dev/null
                        brew services stop postgresql@15 2>/dev/null
                        brew services stop postgresql 2>/dev/null
                    fi
                    
                    # Detener proceso directamente
                    echo "Deteniendo proceso (PID: $PID)..."
                    kill -9 $PID 2>/dev/null
                    sleep 2
                    
                    if ! lsof -i :5432 &> /dev/null; then
                        echo "✅ PostgreSQL local detenido. Puerto 5432 ahora está libre!"
                    else
                        echo "⚠️  No se pudo detener. Puede requerir permisos de administrador."
                        echo "   Intenta: sudo kill -9 $PID"
                    fi
                else
                    echo ""
                    echo "💡 Usa puerto alternativo ejecutando:"
                    echo "   docker compose -f docker-compose.alt-ports.yml up -d"
                fi
            else
                echo "❓ Proceso desconocido usando el puerto"
                echo ""
                echo "Opciones:"
                echo "1. Detener el proceso manualmente: kill -9 $PID"
                echo "2. Usar puerto alternativo: docker compose -f docker-compose.alt-ports.yml up -d"
            fi
        fi
    fi
else
    echo "✅ Puerto 5432 está libre!"
    echo ""
    echo "Puedes ejecutar: docker compose up -d"
fi

echo ""
echo "📊 Estado actual del puerto:"
lsof -i :5432 2>/dev/null || echo "   Puerto libre"
