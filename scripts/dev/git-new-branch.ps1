# Crea rama desde main actualizado (sin merge local de otras ramas).
# Uso: .\scripts\dev\git-new-branch.ps1 -Prefix fix -Name revision-bugs-entrega-dos
#      .\scripts\dev\git-new-branch.ps1 -Prefix feature -Name mi-tarea -Stash

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('feature', 'fix', 'chore')]
    [string]$Prefix,

    [Parameter(Mandatory)]
    [string]$Name,

    [switch]$Stash
)

. "$PSScriptRoot\_common.ps1"

Assert-CommandInPath -Name 'git'

$branchSegment = ($Name.Trim() -replace '\s+', '-').ToLowerInvariant()
if ([string]::IsNullOrWhiteSpace($branchSegment)) {
    throw 'El nombre de rama no puede estar vacío.'
}
if ($branchSegment -notmatch '^[a-z0-9]+(-[a-z0-9]+)*$') {
    throw "Nombre de rama no válido: '$branchSegment'. Usa minúsculas, números y guiones."
}

$fullBranch = "$Prefix/$branchSegment"
$repoRoot = Get-MtlRepoRoot

Push-Location -LiteralPath $repoRoot
try {
    $clean = Test-MtlGitWorkingTreeClean
    if (-not $clean) {
        if ($Stash) {
            $stashMsg = "WIP antes de $fullBranch"
            Write-MtlWarn "Cambios sin commit; guardando en stash: $stashMsg"
            git stash push -u -m $stashMsg
            if ($LASTEXITCODE -ne 0) {
                throw 'git stash push falló'
            }
        }
        else {
            Write-MtlError 'Hay cambios sin commitear. Opciones:'
            Write-Host '  - Commit (recomendado) o Cursor: .cursor/commands/git-commit.md'
            Write-Host '  - Stash: .\scripts\dev\git-new-branch.ps1 -Prefix ... -Name ... -Stash'
            Write-Host '  - Abortar y limpiar el working tree manualmente'
            exit 1
        }
    }

    Write-MtlInfo 'checkout main'
    git checkout main
    if ($LASTEXITCODE -ne 0) { throw 'git checkout main falló' }

    Write-MtlInfo 'git pull origin main'
    git pull origin main
    if ($LASTEXITCODE -ne 0) { throw 'git pull origin main falló' }

    Write-MtlInfo "checkout -b $fullBranch"
    git checkout -b $fullBranch
    if ($LASTEXITCODE -ne 0) { throw "git checkout -b $fullBranch falló" }

    Write-MtlOk "Rama creada: $fullBranch"
    Write-Host ''
    Write-Host 'Primera subida:  git push -u origin HEAD'
    Write-Host 'PR hacia main: docs/onboarding/github-branching.md'
    if ($Stash) {
        Write-Host 'Recuperar stash: git stash pop'
    }
}
finally {
    Pop-Location
}
