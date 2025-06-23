# Script para ejecutar la migración SQL
# Fecha: 22/06/2025

param (
    [string]$connectionString = "Server=localhost;Database=ConsultCore31;Trusted_Connection=True;MultipleActiveResultSets=true"
)

$scriptPath = Join-Path $PSScriptRoot "20250622_AddSoftDeleteFieldsToTipoDocumento.sql"

Write-Host "Ejecutando migración desde: $scriptPath"
Write-Host "Usando conexión: $connectionString"

try {
    # Cargar el ensamblado de SQL Server
    Add-Type -Path "C:\Program Files (x86)\Microsoft SQL Server\150\DAC\bin\Microsoft.SqlServer.Dac.dll"
    
    # Crear la conexión
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()
    
    # Leer el contenido del script SQL
    $sqlScript = Get-Content -Path $scriptPath -Raw
    
    # Crear el comando SQL
    $command = New-Object System.Data.SqlClient.SqlCommand
    $command.Connection = $connection
    $command.CommandText = $sqlScript
    
    # Ejecutar el script
    $command.ExecuteNonQuery()
    
    Write-Host "Migración ejecutada correctamente." -ForegroundColor Green
}
catch {
    Write-Host "Error al ejecutar la migración: $_" -ForegroundColor Red
}
finally {
    # Cerrar la conexión
    if ($connection -and $connection.State -eq 'Open') {
        $connection.Close()
        Write-Host "Conexión cerrada." -ForegroundColor Yellow
    }
}
