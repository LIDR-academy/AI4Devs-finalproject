$testDirectory = "c:\ai4devs\AI4Devs-finalproject-finalproject-MRR\Backend\src\ConsultCore31.Tests\Controllers"
$files = Get-ChildItem -Path $testDirectory -Filter "*ControllerTests.cs" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Buscar métodos Update y Delete que esperan OkObjectResult
    $updatedContent = $content -replace '(\[Fact\][^\[]*?Update[^\[]*?Assert\.IsType<)OkObjectResult(>\(result\);)', '$1NoContentResult$2'
    $updatedContent = $updatedContent -replace '(\[Fact\][^\[]*?Delete[^\[]*?Assert\.IsType<)OkObjectResult(>\(result\);)', '$1NoContentResult$2'
    
    # Actualizar nombres de métodos de prueba
    $updatedContent = $updatedContent -replace '(public async Task Update_.*_DebeRetornarOk)', '$1_DebeRetornarNoContent'
    $updatedContent = $updatedContent -replace '(public async Task Delete_.*_DebeRetornarOk)', '$1_DebeRetornarNoContent'
    
    # Guardar cambios
    if ($content -ne $updatedContent) {
        Set-Content -Path $file.FullName -Value $updatedContent
        Write-Host "Actualizado: $($file.Name)"
    }
}

Write-Host "Proceso completado."
