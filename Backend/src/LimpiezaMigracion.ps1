# Script de limpieza para eliminar archivos temporales de migración
# Fecha: 31/05/2025

Write-Host "Iniciando limpieza de archivos temporales de migración..." -ForegroundColor Cyan

# Función para eliminar un directorio si existe
function Remove-DirectoryIfExists {
    param (
        [string]$path,
        [string]$description
    )
    
    if (Test-Path $path) {
        Write-Host "Eliminando $($description): $path" -ForegroundColor Yellow
        Remove-Item -Path $path -Recurse -Force
        Write-Host "✓ $($description) eliminado correctamente." -ForegroundColor Green
    } else {
        Write-Host "El directorio $path no existe, no es necesario eliminarlo." -ForegroundColor Gray
    }
}

# Directorios a eliminar
$directories = @(
    @{
        Path = ".\MigracionCamelCase"
        Description = "Directorio de herramienta de migración inicial"
    },
    @{
        Path = ".\MigracionSQL"
        Description = "Directorio de herramienta de migración SQL"
    },
    @{
        Path = ".\VerificadorTablas"
        Description = "Directorio de herramienta de verificación de tablas"
    },
    @{
        Path = "..\docs"
        Description = "Directorio de documentación en ubicación incorrecta"
    }
)

# Eliminar cada directorio
foreach ($dir in $directories) {
    Remove-DirectoryIfExists -path $dir.Path -description $dir.Description
}

# Buscar y eliminar archivos de log de migración
$logFiles = Get-ChildItem -Path "." -Filter "migracion_log_*.txt" -Recurse
if ($logFiles.Count -gt 0) {
    Write-Host "Eliminando archivos de log de migración..." -ForegroundColor Yellow
    foreach ($file in $logFiles) {
        Write-Host "Eliminando archivo de log: $($file.FullName)" -ForegroundColor Yellow
        Remove-Item -Path $file.FullName -Force
    }
    Write-Host "✓ Archivos de log eliminados correctamente." -ForegroundColor Green
} else {
    Write-Host "No se encontraron archivos de log para eliminar." -ForegroundColor Gray
}

Write-Host "`nLimpieza completada exitosamente." -ForegroundColor Cyan
Write-Host "Se han eliminado todos los archivos temporales de migración." -ForegroundColor Cyan
Write-Host "La documentación de la migración se encuentra en: ..\..\docs\backend\MigracionCamelCase.md" -ForegroundColor Cyan

# Mantener la ventana abierta para ver los resultados
Write-Host "`nPresiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
