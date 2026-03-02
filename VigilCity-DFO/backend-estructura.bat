@echo off
set /p CONTINUE=¿Deseas continuar? (Y/N): 
if /i "%CONTINUE%" NEQ "Y" (
    echo Proceso cancelado.
    exit /b
)

REM Crear estructura principal del monorepo
mkdir backend
cd backend

REM Crear carpetas base para cada microservicio
set SERVICES=reportes usuarios comentarios notificaciones
for %%S in (%SERVICES%) do (
    mkdir microservicio-%%S
    cd microservicio-%%S
    mkdir src config tests

    REM Crear carpetas de la estructura interna
    mkdir src\application src\domain src\infrastructure src\interfaces
    mkdir src\domain\entities src\domain\repositories src\domain\services
    mkdir src\infrastructure\controllers src\infrastructure\database src\infrastructure\messageQueue
    mkdir src\infrastructure\database\models
    mkdir src\interfaces\http src\interfaces\events
    mkdir tests\unit tests\integration

    REM Crear archivos básicos en cada microservicio
    echo. > src\application\create%%S.js
    echo. > src\application\list%%S.js
    echo. > src\application\delete%%S.js

    echo. > src\domain\entities\%%S.js
    echo. > src\domain\repositories\%%SRepository.js
    echo. > src\domain\services\%%SService.js

    echo. > src\infrastructure\controllers\%%SController.js
    echo. > src\infrastructure\database\models\%%SModel.js
    echo. > src\infrastructure\messageQueue\%%SPublisher.js
    echo. > src\infrastructure\webserver.js

    echo. > src\interfaces\http\%%SRoutes.js
    echo. > src\interfaces\events\%%SEvents.js

    REM Crear archivos de configuración
    echo {} > config\default.json
    echo {} > config\development.json
    echo {} > config\production.json

    REM Crear archivos de prueba
    echo. > tests\unit\%%SService.test.js
    echo. > tests\integration\%%SRoutes.test.js

    REM Crear archivos de entorno y Docker
    echo. > .env
    echo FROM node:14 > Dockerfile
    echo. > docker-compose.yml
    echo {} > package.json

    REM Volver a la carpeta del backend para el siguiente servicio
    cd ..
)

echo Estructura de archivos del backend creada exitosamente.
pause
