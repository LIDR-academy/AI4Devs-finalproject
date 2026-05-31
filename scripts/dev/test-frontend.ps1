# Ejecuta tests Vitest del frontend (npm test = vitest run).
# Uso: .\scripts\dev\test-frontend.ps1
#      .\scripts\dev\test-frontend.ps1 -SkipInstall

[CmdletBinding()]
param(
    [switch]$SkipInstall
)

. "$PSScriptRoot\_common.ps1"

$repoRoot = Get-MtlRepoRoot
$frontendDir = Join-Path $repoRoot 'frontend'
Assert-CommandInPath -Name 'npm' -Hint 'Instala Node.js (npm incluido).'

Write-MtlInfo 'Frontend: npm test en frontend/'

Invoke-MtlInDirectory -Path $frontendDir -Action {
    if (-not $SkipInstall) {
        Write-MtlInfo 'npm ci…'
        npm ci
        if ($LASTEXITCODE -ne 0) {
            throw "npm ci terminó con código $LASTEXITCODE"
        }
    }
    npm test
    if ($LASTEXITCODE -ne 0) {
        throw "npm test terminó con código $LASTEXITCODE"
    }
}

Write-MtlOk 'Frontend: tests completados.'
