@echo off
REM Crear la estructura de carpetas para el proyecto GuardianPaws Backend

REM Navegar al directorio del proyecto
cd guardianpaws-backend

REM Crear carpetas principales
mkdir src
mkdir src\config
mkdir src\modules
mkdir test

REM Crear subcarpetas para módulos
mkdir src\modules\adoption
mkdir src\modules\auth
mkdir src\modules\chat
mkdir src\modules\image
mkdir src\modules\pet
mkdir src\modules\report
mkdir src\modules\user

REM Confirmación de creación
echo Estructura de carpetas creada exitosamente. 