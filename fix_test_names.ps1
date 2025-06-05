$testDirectory = "c:\ai4devs\AI4Devs-finalproject-finalproject-MRR\Backend\src\ConsultCore31.Tests\Controllers"
$files = Get-ChildItem -Path $testDirectory -Filter "*ControllerTests.cs" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Corregir nombres de métodos duplicados
    $updatedContent = $content -replace 'public async Task (Update_.*?)_DebeRetornarOk_DebeRetornarNoContent\(', 'public async Task $1_DebeRetornarNoContent('
    $updatedContent = $updatedContent -replace 'public async Task (Delete_.*?)_DebeRetornarOk_DebeRetornarNoContent\(', 'public async Task $1_DebeRetornarNoContent('
    
    # Guardar cambios
    if ($content -ne $updatedContent) {
        Set-Content -Path $file.FullName -Value $updatedContent
        Write-Host "Actualizado: $($file.Name)"
    }
}

Write-Host "Proceso completado."
