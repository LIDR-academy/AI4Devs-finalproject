#!/usr/bin/env bash
set -e

SKIP_INFRA=false
BACKEND_ONLY=false
FRONTEND_ONLY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-infra)
            SKIP_INFRA=true
            shift
            ;;
        --backend-only)
            BACKEND_ONLY=true
            shift
            ;;
        --frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "Starting Aura Planning local development environment..."

# Start infrastructure
if [ "$SKIP_INFRA" = false ] && [ "$BACKEND_ONLY" = false ] && [ "$FRONTEND_ONLY" = false ]; then
    echo "Starting infrastructure services..."
    docker compose up -d
    echo "Infrastructure started. Waiting for services to be ready..."
    sleep 5
fi

# Start backend
if [ "$FRONTEND_ONLY" = false ]; then
    echo "Starting backend API..."
    dotnet run --project backend/src/Aura.Api --launch-profile http > .dev-backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend starting (PID: $BACKEND_PID)"
    echo "  -> http://localhost:5000"
    echo "  -> Swagger: http://localhost:5000/scalar/v1"
fi

# Start Email Worker
if [ "$FRONTEND_ONLY" = false ]; then
    echo "Starting Email Worker..."
    dotnet run --project backend/workers/Aura.Workers.Email > .dev-email-worker.log 2>&1 &
    EMAIL_WORKER_PID=$!
    echo "Email Worker starting (PID: $EMAIL_WORKER_PID)"
fi

# Start frontend
if [ "$BACKEND_ONLY" = false ]; then
    echo "Starting frontend..."
    (cd frontend && npm start) > .dev-frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend starting (PID: $FRONTEND_PID)"
    echo "  -> http://localhost:4200"
fi

echo ""
echo "All services started!"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f           # Watch infra logs"
echo "  tail -f .dev-backend.log         # Backend log"
echo "  tail -f .dev-email-worker.log    # Email Worker log"
echo "  tail -f .dev-frontend.log        # Frontend log"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup function
cleanup() {
    echo ""
    echo "Stopping services..."
    
    if [ -n "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "Stopped backend (PID: $BACKEND_PID)"
    fi
    
    if [ -n "$EMAIL_WORKER_PID" ] && kill -0 $EMAIL_WORKER_PID 2>/dev/null; then
        kill $EMAIL_WORKER_PID
        echo "Stopped email worker (PID: $EMAIL_WORKER_PID)"
    fi
    
    if [ -n "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "Stopped frontend (PID: $FRONTEND_PID)"
    fi
    
    if [ "$SKIP_INFRA" = false ] && [ "$BACKEND_ONLY" = false ] && [ "$FRONTEND_ONLY" = false ]; then
        docker compose down
        echo "Infrastructure stopped"
    fi
    
    echo "Done."
    exit 0
}

trap cleanup INT TERM

# Wait for backend process if it exists
if [ -n "$BACKEND_PID" ]; then
    wait $BACKEND_PID
fi
