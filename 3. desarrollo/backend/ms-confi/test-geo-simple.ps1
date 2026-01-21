# Script simple de prueba para endpoints Geo
# Asegúrate de que el servidor esté corriendo: npm run start:dev

$baseUrl = "http://localhost:8012"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "`n=== PRUEBA RÁPIDA - MÓDULO GEO ===" -ForegroundColor Cyan
Write-Host "Servidor: $baseUrl`n" -ForegroundColor Gray

# 1. Listar provincias (debe estar vacío)
Write-Host "1. Listar provincias..." -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/geo/provincias" -Method Get -Headers $headers
    Write-Host "   ✓ Total: $($r.total)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Crear provincia
Write-Host "`n2. Crear provincia 'Azuay'..." -ForegroundColor Yellow
$provincia = @{
    provi_cod_prov = "01"
    provi_nom_provi = "Azuay"
    provi_flg_acti = $true
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/geo/provincias" -Method Post -Headers $headers -Body $provincia
    Write-Host "   ✓ Provincia creada (ID: $($r.data.provi_cod_provi))" -ForegroundColor Green
    $provId = $r.data.provi_cod_provi
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "   Detalle: $body" -ForegroundColor Red
    }
}

# 3. Listar provincias nuevamente
Write-Host "`n3. Listar provincias (debe tener 1)..." -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/geo/provincias" -Method Get -Headers $headers
    Write-Host "   ✓ Total: $($r.total)" -ForegroundColor Green
    if ($r.total -gt 0) {
        Write-Host "   Provincia: $($r.data[0].provi_nom_provi) (Código: $($r.data[0].provi_cod_prov))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Crear cantón
Write-Host "`n4. Crear cantón 'Cuenca'..." -ForegroundColor Yellow
$canton = @{
    provi_cod_provi = 1
    canto_cod_cant = "01"
    canto_nom_canto = "Cuenca"
    canto_flg_acti = $true
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/geo/cantones" -Method Post -Headers $headers -Body $canton
    Write-Host "   ✓ Cantón creado (ID: $($r.data.canto_cod_canto))" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "   Detalle: $body" -ForegroundColor Red
    }
}

# 5. Listar cantones por provincia
Write-Host "`n5. Listar cantones de provincia '01'..." -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/geo/provincias/01/cantones" -Method Get -Headers $headers
    Write-Host "   ✓ Total: $($r.total)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Crear parroquia
Write-Host "`n6. Crear parroquia 'El Sagrario'..." -ForegroundColor Yellow
$parroquia = @{
    canto_cod_canto = 1
    parro_cod_parr = "01"
    parro_nom_parro = "El Sagrario"
    parro_tip_area = "U"
    parro_flg_acti = $true
} | ConvertTo-Json

try {
    $r = Invoke-RestMethod -Uri "$baseUrl/geo/parroquias" -Method Post -Headers $headers -Body $parroquia
    Write-Host "   ✓ Parroquia creada (ID: $($r.data.parro_cod_parro))" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "   Detalle: $body" -ForegroundColor Red
    }
}

# 7. Buscar parroquias
Write-Host "`n7. Buscar parroquias con 'Sagrario'..." -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/geo/parroquias/search?q=Sagrario&limit=10" -Method Get -Headers $headers
    Write-Host "   ✓ Total encontradas: $($r.total)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== PRUEBAS COMPLETADAS ===" -ForegroundColor Cyan
Write-Host "`nPara más pruebas, ver: TEST-GEO-ENDPOINTS.md" -ForegroundColor Gray
Write-Host "Swagger UI: http://localhost:8012/doc`n" -ForegroundColor Gray

