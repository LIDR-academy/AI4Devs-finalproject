@echo off
REM Development setup script for SEPE Templates Comparator (Windows)

setlocal EnableDelayedExpansion

echo [INFO] Setting up SEPE Templates Comparator development environment...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo [SUCCESS] Docker and Docker Compose are installed

REM Check if required files exist
if not exist "docker-compose.yml" (
    echo [ERROR] Required file docker-compose.yml not found
    exit /b 1
)

if not exist "backend\Dockerfile" (
    echo [ERROR] Required file backend\Dockerfile not found
    exit /b 1
)

if not exist "frontend\Dockerfile" (
    echo [ERROR] Required file frontend\Dockerfile not found
    exit /b 1
)

if not exist "env.example" (
    echo [ERROR] Required file env.example not found
    exit /b 1
)

echo [SUCCESS] All required files found

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating .env file from env.example...
    copy env.example .env >nul
    echo [WARNING] Please review and update the .env file with your specific configuration
) else (
    echo [INFO] .env file already exists
)

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\logs" mkdir backend\logs
if not exist "database\backups" mkdir database\backups
if not exist "logs" mkdir logs
echo [SUCCESS] Directories created

REM Build and start services
echo [INFO] Building and starting services...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build services
    exit /b 1
)

docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services
    exit /b 1
)

echo [SUCCESS] Services started

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...

REM Wait for database
echo [INFO] Waiting for PostgreSQL...
:wait_postgres
timeout /t 2 /nobreak >nul
docker-compose exec postgres pg_isready -U sepe_user -d sepe_comparator >nul 2>&1
if %errorlevel% neq 0 goto wait_postgres

REM Wait for Redis
echo [INFO] Waiting for Redis...
:wait_redis
timeout /t 2 /nobreak >nul
docker-compose exec redis redis-cli ping >nul 2>&1
if %errorlevel% neq 0 goto wait_redis

REM Wait for backend
echo [INFO] Waiting for backend API...
:wait_backend
timeout /t 5 /nobreak >nul
curl -f http://localhost:8000/api/v1/health >nul 2>&1
if %errorlevel% neq 0 goto wait_backend

echo [SUCCESS] All services are ready

REM Run database migrations
echo [INFO] Running database migrations...
docker-compose exec backend alembic upgrade head
if %errorlevel% neq 0 (
    echo [ERROR] Database migrations failed
    exit /b 1
)

echo [SUCCESS] Database migrations completed

REM Display status
echo.
echo [SUCCESS] Development environment setup complete!
echo.
echo 🚀 Services are running:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:8000
echo   - API Docs:  http://localhost:8000/docs
echo   - PostgreSQL: localhost:5432
echo   - Redis:     localhost:6379
echo.
echo 📝 Useful commands:
echo   - View logs:     docker-compose logs -f
echo   - Stop services: docker-compose down
echo   - Restart:       docker-compose restart
echo   - Shell access:  docker-compose exec backend bash
echo.
echo [INFO] Happy coding! 🎉

pause
