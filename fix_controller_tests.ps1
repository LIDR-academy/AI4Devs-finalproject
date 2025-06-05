$testDirectory = "c:\ai4devs\AI4Devs-finalproject-finalproject-MRR\Backend\src\ConsultCore31.Tests\Controllers"
$files = Get-ChildItem -Path $testDirectory -Filter "*ControllerTests.cs" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $modified = $false
    
    # Corregir las pruebas que esperan que NoContentResult tenga una propiedad Value
    if ($content -match "var okResult = Assert\.IsType<NoContentResult>\(result\);\s+var returnValue = Assert\.IsAssignableFrom<object>\(okResult\.Value\);") {
        $content = $content -replace "var okResult = Assert\.IsType<NoContentResult>\(result\);\s+var returnValue = Assert\.IsAssignableFrom<object>\(okResult\.Value\);\s+Assert\.Contains\(.*?\);", "Assert.IsType<NoContentResult>(result);"
        $modified = $true
    }
    
    # Corregir nombres de métodos de prueba
    if ($content -match "public async Task (Update|Delete)_.*_DebeRetornarOk_DebeRetornarNoContent") {
        $content = $content -replace "public async Task (Update|Delete)_(.*)_DebeRetornarOk_DebeRetornarNoContent", "public async Task `$1_`$2_DebeRetornarNoContent"
        $modified = $true
    }
    
    # Guardar cambios si se modificó el archivo
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Actualizado: $($file.Name)"
    }
}

Write-Host "Proceso completado."
