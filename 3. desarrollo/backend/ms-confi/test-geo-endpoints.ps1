# Script de prueba para endpoints del módulo Geo
# Ejecutar después de iniciar el servidor MS-CONFI

$baseUrl = "http://localhost:8012"
$headers = @{
    "Content-Type" = "application/json"
    # Agregar token JWT si es necesario
    # "Authorization" = "Bearer YOUR_TOKEN_HERE"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBAS DE ENDPOINTS - MÓDULO GEO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Listar provincias (debe estar vacío inicialmente)
Write-Host "1. GET /geo/provincias" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/geo/provincias" -Method Get -Headers $headers
    Write-Host "✓ Éxito" -ForegroundColor Green
    Write-Host "  Total: $($response.total)" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Respuesta: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""

# 2. Crear una provincia
Write-Host "2. POST /geo/provincias" -ForegroundColor Yellow
$provinciaData = @{
    provi_cod_prov = "01"
    provi_nom_provi = "Azuay"
    provi_flg_acti = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/geo/provincias" -Method Post -Headers $headers -Body $provinciaData
    Write-Host "✓ Provincia creada" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    $provinciaId = $response.data.provi_cod_provi
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Respuesta: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""

# 3. Listar provincias nuevamente (debe tener 1)
Write-Host "3. GET /geo/provincias (después de crear)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/geo/provincias" -Method Get -Headers $headers
    Write-Host "✓ Éxito" -ForegroundColor Green
    Write-Host "  Total: $($response.total)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4. Crear un cantón
Write-Host "4. POST /geo/cantones" -ForegroundColor Yellow
$cantonData = @{
    provi_cod_provi = 1
    canto_cod_cant = "01"
    canto_nom_canto = "Cuenca"
    canto_flg_acti = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/geo/cantones" -Method Post -Headers $headers -Body $cantonData
    Write-Host "✓ Cantón creado" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Respuesta: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""

# 5. Listar cantones por provincia
Write-Host "5. GET /geo/provincias/01/cantones" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/geo/provincias/01/cantones" -Method Get -Headers $headers
    Write-Host "✓ Éxito" -ForegroundColor Green
    Write-Host "  Total: $($response.total)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 6. Crear una parroquia
Write-Host "6. POST /geo/parroquias" -ForegroundColor Yellow
$parroquiaData = @{
    canto_cod_canto = 1
    parro_cod_parr = "01"
    parro_nom_parro = "El Sagrario"
    parro_tip_area = "U"
    parro_flg_acti = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/geo/parroquias" -Method Post -Headers $headers -Body $parroquiaData
    Write-Host "✓ Parroquia creada" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Respuesta: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""

# 7. Listar parroquias por cantón
Write-Host "7. GET /geo/provincias/01/cantones/01/parroquias" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/geo/provincias/01/cantones/01/parroquias" -Method Get -Headers $headers
    Write-Host "✓ Éxito" -ForegroundColor Green
    Write-Host "  Total: $($response.total)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 8. Buscar parroquias
Write-Host "8. GET /geo/parroquias/search?q=Sagrario" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/geo/parroquias/search?q=Sagrario&limit=10" -Method Get -Headers $headers
    Write-Host "✓ Éxito" -ForegroundColor Green
    Write-Host "  Total: $($response.total)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBAS COMPLETADAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

