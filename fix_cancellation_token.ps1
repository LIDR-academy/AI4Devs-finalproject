$testFiles = Get-ChildItem -Path "Backend\src\ConsultCore31.Tests\Services" -Filter "*ServiceTests.cs" -Recurse

foreach ($file in $testFiles) {
    Write-Host "Procesando archivo: $($file.FullName)"
    
    $content = Get-Content -Path $file.FullName -Raw
    
    # Patrones de reemplazo para diferentes métodos
    $patterns = @(
        @{
            Pattern = '(?<=// Act\s+var result = await _service\.GetAllAsync\()(?!\(CancellationToken\.None\))(?=\s*;)'
            Replacement = '(CancellationToken.None)'
        },
        @{
            Pattern = '(?<=// Act\s+var result = await _service\.GetByIdAsync\()(\d+)(?!\s*,\s*CancellationToken\.None)(?=\s*\))'
            Replacement = '$1, CancellationToken.None'
        },
        @{
            Pattern = '(?<=// Act\s+var result = await _service\.CreateAsync\()([^,\)]+)(?!\s*,\s*CancellationToken\.None)(?=\s*\))'
            Replacement = '$1, CancellationToken.None'
        },
        @{
            Pattern = '(?<=// Act\s+var result = await _service\.UpdateAsync\()([^,\)]+)(?!\s*,\s*CancellationToken\.None)(?=\s*\))'
            Replacement = '$1, CancellationToken.None'
        },
        @{
            Pattern = '(?<=// Act\s+var result = await _service\.DeleteAsync\()(\d+)(?!\s*,\s*CancellationToken\.None)(?=\s*\))'
            Replacement = '$1, CancellationToken.None'
        },
        @{
            Pattern = '(?<=// Act\s+var result = await _service\.ExistsAsync\()(\d+)(?!\s*,\s*CancellationToken\.None)(?=\s*\))'
            Replacement = '$1, CancellationToken.None'
        },
        @{
            Pattern = '(?<=Assert\.ThrowsAsync<KeyNotFoundException>\(\(\) => _service\.UpdateAsync\()([^,\)]+)(?!\s*,\s*CancellationToken\.None)(?=\s*\))'
            Replacement = '$1, CancellationToken.None'
        },
        @{
            Pattern = '(?<=Assert\.ThrowsAsync<KeyNotFoundException>\(\(\) => _service\.DeleteAsync\()(\d+)(?!\s*,\s*CancellationToken\.None)(?=\s*\))'
            Replacement = '$1, CancellationToken.None'
        }
    )
    
    $modified = $false
    
    foreach ($pattern in $patterns) {
        if ($content -match $pattern.Pattern) {
            $content = $content -replace $pattern.Pattern, $pattern.Replacement
            $modified = $true
        }
    }
    
    if ($modified) {
        Write-Host "Guardando cambios en: $($file.FullName)"
        $content | Set-Content -Path $file.FullName -NoNewline
    } else {
        Write-Host "No se encontraron cambios para: $($file.FullName)"
    }
}

Write-Host "Proceso completado."
