@echo off
REM Script para iniciar Docker Desktop y el contenedor de PostgreSQL
REM Este script está diseñado para Windows

echo Verificando si Docker Desktop está en ejecución...
docker ps >nul 2>&1

if errorlevel 1 (
    echo Docker no está corriendo. Iniciando Docker Desktop...
    REM Intenta iniciar Docker Desktop
    for /f %%i in ('wmic logicaldisk get name ^| find ":"') do (
        if exist "%%i\Program Files\Docker\Docker\Docker.exe" (
            start "" "%%i\Program Files\Docker\Docker\Docker.exe"
            echo Esperando a que Docker Desktop inicie (esto puede tomar 30-60 segundos)...
            timeout /t 10 /nobreak
            goto docker_started
        )
    )
    
    REM Si llega aquí, no encontró Docker Desktop
    echo ERROR: No se encontró Docker Desktop en el sistema.
    echo Por favor, instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

:docker_started
echo Docker está corriendo. Iniciando PostgreSQL...
docker-compose up -d

echo.
echo ✅ PostgreSQL está corriendo en localhost:5432
echo.
echo Credenciales:
echo   Usuario: frapen_user
echo   Contraseña: frapen_password_dev
echo   Base de datos: frapen_angels
echo.
echo Abre DBeaver y crea una conexión con estos datos.
echo.
pause
