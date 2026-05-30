# Utilidades compartidas para scripts locales MyTreeLibrary (PowerShell).
# Dot-source: . "$PSScriptRoot\_common.ps1"

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-MtlRepoRoot {
    $dir = $PSScriptRoot
    while ($null -ne $dir -and $dir -ne '') {
        $pom = Join-Path $dir 'services\pom.xml'
        if (Test-Path -LiteralPath $pom) {
            return (Resolve-Path -LiteralPath $dir).Path
        }
        $parent = Split-Path -Path $dir -Parent
        if ([string]::IsNullOrEmpty($parent) -or $parent -eq $dir) {
            break
        }
        $dir = $parent
    }
    throw 'No se encontró la raíz del monorepo (services/pom.xml). Ejecuta desde el clone del proyecto.'
}

function Write-MtlInfo {
    param([Parameter(Mandatory)][string]$Message)
    Write-Host "[mtl] $Message" -ForegroundColor Cyan
}

function Write-MtlOk {
    param([Parameter(Mandatory)][string]$Message)
    Write-Host "[mtl] $Message" -ForegroundColor Green
}

function Write-MtlWarn {
    param([Parameter(Mandatory)][string]$Message)
    Write-Host "[mtl] $Message" -ForegroundColor Yellow
}

function Write-MtlError {
    param([Parameter(Mandatory)][string]$Message)
    Write-Host "[mtl] $Message" -ForegroundColor Red
}

function Assert-CommandInPath {
    param(
        [Parameter(Mandatory)][string]$Name,
        [string]$Hint
    )
    if (-not (Get-Command -Name $Name -ErrorAction SilentlyContinue)) {
        $extra = if ($Hint) { " $Hint" } else { '' }
        throw "No se encontró '$Name' en PATH.$extra"
    }
}

function Invoke-MtlInDirectory {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][scriptblock]$Action
    )
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "No existe el directorio: $Path"
    }
    Push-Location -LiteralPath $Path
    try {
        & $Action
    }
    finally {
        Pop-Location
    }
}

function Test-MtlGitWorkingTreeClean {
    $status = git status --porcelain 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "git status falló: $status"
    }
    return [string]::IsNullOrWhiteSpace(($status | Out-String).Trim())
}
