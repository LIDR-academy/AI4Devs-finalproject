# Script PowerShell para consultar la base de datos TravelSplit
# Uso: .\consultar-bd.ps1
# Requiere variables de entorno: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME

# Todas las variables deben estar configuradas en el entorno
# No se usan valores por defecto para mayor seguridad
if (-not $env:DB_HOST) {
    Write-Host "Error: DB_HOST no está configurada." -ForegroundColor Red
    exit 1
}
if (-not $env:DB_PORT) {
    Write-Host "Error: DB_PORT no está configurada." -ForegroundColor Red
    exit 1
}
if (-not $env:DB_USERNAME) {
    Write-Host "Error: DB_USERNAME no está configurada." -ForegroundColor Red
    exit 1
}
if (-not $env:DB_NAME) {
    Write-Host "Error: DB_NAME no está configurada." -ForegroundColor Red
    exit 1
}

$DB_HOST = $env:DB_HOST
$DB_PORT = $env:DB_PORT
$DB_USERNAME = $env:DB_USERNAME
$DB_NAME = $env:DB_NAME

# Verificar que la contraseña esté configurada
if (-not $env:DB_PASSWORD) {
    Write-Host "Error: DB_PASSWORD no está configurada. Por favor, configura la variable de entorno." -ForegroundColor Red
    Write-Host "Ejemplo: `$env:DB_PASSWORD = '<valor-desde-env>'" -ForegroundColor Yellow
    exit 1
}

$DB_PASSWORD = $env:DB_PASSWORD

# Verificar si Docker está corriendo
$containerRunning = docker ps --filter "name=travelsplit-postgres" --format "{{.Names}}"

if ($containerRunning -eq "travelsplit-postgres") {
    Write-Host "Conectando a PostgreSQL en Docker..." -ForegroundColor Green
    docker exec -it travelsplit-postgres psql -U $DB_USERNAME -d $DB_NAME
} else {
    Write-Host "Docker no está corriendo o el contenedor no existe." -ForegroundColor Yellow
    Write-Host "Asegúrate de tener PostgreSQL instalado localmente o ejecuta: docker-compose up -d" -ForegroundColor Yellow
    
    # Intentar conectar directamente si psql está disponible
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        Write-Host "Conectando a PostgreSQL local..." -ForegroundColor Green
        $env:PGPASSWORD = $DB_PASSWORD
        psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME
    } else {
        Write-Host "psql no está instalado. Instala PostgreSQL o usa Docker." -ForegroundColor Red
    }
}

