$testDirectory = "c:\ai4devs\AI4Devs-finalproject-finalproject-MRR\Backend\src\ConsultCore31.Tests\Controllers"
$files = Get-ChildItem -Path $testDirectory -Filter "*ControllerTests.cs" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Actualizar nombres de métodos de prueba
    $updatedContent = $content -replace '(public async Task Update_.*_DebeRetornarOk\()', 'public async Task Update_ConIdYDtoValidos_DebeRetornarNoContent()'
    $updatedContent = $updatedContent -replace '(public async Task Delete_.*_DebeRetornarOk\()', 'public async Task Delete_ConIdExistente_DebeRetornarNoContent()'
    
    # Guardar cambios
    if ($content -ne $updatedContent) {
        Set-Content -Path $file.FullName -Value $updatedContent
        Write-Host "Actualizado: $($file.Name)"
    }
}

Write-Host "Proceso completado."
