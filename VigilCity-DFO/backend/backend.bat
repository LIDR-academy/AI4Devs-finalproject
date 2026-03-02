@echo off
set /p CONTINUE=¿Deseas continuar? (Y/N): 
if /i "%CONTINUE%" NEQ "Y" (
    echo Proceso cancelado.
    exit /b
)

REM Crear estructura principal del backend
REM mkdir backend
REM cd backend

REM Crear carpetas base
mkdir src
mkdir config
mkdir tests

REM Crear carpetas de la lógica de aplicación
mkdir src\application
mkdir src\application\user
mkdir src\application\report
mkdir src\application\comment
mkdir src\application\rating

REM Crear carpetas de la lógica de dominio
mkdir src\domain
mkdir src\domain\user
mkdir src\domain\report
mkdir src\domain\comment
mkdir src\domain\rating

REM Crear carpetas de infraestructura
mkdir src\infrastructure
mkdir src\infrastructure\controllers
mkdir src\infrastructure\database
mkdir src\infrastructure\models
mkdir src\infrastructure\database\models
mkdir src\infrastructure\database\migrations
mkdir src\infrastructure\database\seeds

REM Crear carpetas de interfaces
mkdir src\interfaces
mkdir src\interfaces\http

REM Crear archivos de aplicación
echo. > src\application\user\createUser.js
echo. > src\application\user\listUsers.js
echo. > src\application\user\deleteUser.js
echo. > src\application\report\createReport.js
echo. > src\application\report\listReports.js
echo. > src\application\report\deleteReport.js
echo. > src\application\comment\createComment.js
echo. > src\application\comment\listComments.js
echo. > src\application\comment\deleteComment.js
echo. > src\application\rating\createRating.js
echo. > src\application\rating\listRatings.js
echo. > src\application\rating\deleteRating.js

REM Crear archivos de dominio
echo. > src\domain\user\user.js
echo. > src\domain\user\userRepository.js
echo. > src\domain\report\report.js
echo. > src\domain\report\reportRepository.js
echo. > src\domain\comment\comment.js
echo. > src\domain\comment\commentRepository.js
echo. > src\domain\rating\rating.js
echo. > src\domain\rating\ratingRepository.js

REM Crear archivos de infraestructura
echo. > src\infrastructure\controllers\userController.js
echo. > src\infrastructure\controllers\reportController.js
echo. > src\infrastructure\controllers\commentController.js
echo. > src\infrastructure\controllers\ratingController.js
echo. > src\infrastructure\database\db.js

REM Crear archivos de interfaces
echo. > src\interfaces\http\userRoutes.js
echo. > src\interfaces\http\reportRoutes.js
echo. > src\interfaces\http\commentRoutes.js
echo. > src\interfaces\http\ratingRoutes.js

REM Crear archivos de configuración
echo {} > config\default.json
echo {} > config\development.json
echo {} > config\production.json

REM Crear archivos de prueba
mkdir tests\unit
mkdir tests\integration
echo. > tests\unit\userService.test.js
echo. > tests\unit\reportService.test.js
echo. > tests\unit\commentService.test.js
echo. > tests\unit\ratingService.test.js
echo. > tests\integration\userRoutes.test.js
echo. > tests\integration\reportRoutes.test.js
echo. > tests\integration\commentRoutes.test.js
echo. > tests\integration\ratingRoutes.test.js

REM Crear archivos adicionales
echo. > .env
echo FROM node:14 > Dockerfile
echo. > docker-compose.yml
echo {} > package.json

echo Estructura de archivos del backend creada exitosamente.
pause