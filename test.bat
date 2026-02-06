@echo off
REM Windows batch script for running tests via Docker Compose

if "%1"=="" (
    echo Usage: test.bat [command]
    echo Commands:
    echo   build       - Build Docker images
    echo   test        - Run all tests
    echo   infra       - Run integration tests
    echo   unit        - Run unit tests
    echo   storage     - Run storage infrastructure test
    echo   shell       - Open shell in backend container
    echo   clean       - Clean up containers
    exit /b 1
)

if "%1"=="build" (
    docker-compose build
) else if "%1"=="test" (
    docker-compose run --rm backend pytest -v
) else if "%1"=="infra" (
    docker-compose run --rm backend pytest tests/integration/ -v
) else if "%1"=="unit" (
    docker-compose run --rm backend pytest tests/unit/ -v
) else if "%1"=="storage" (
    docker-compose run --rm backend pytest tests/integration/test_storage_config.py -v
) else if "%1"=="shell" (
    docker-compose run --rm backend /bin/sh
) else if "%1"=="clean" (
    docker-compose down -v
    docker system prune -f
) else (
    echo Unknown command: %1
    exit /b 1
)
