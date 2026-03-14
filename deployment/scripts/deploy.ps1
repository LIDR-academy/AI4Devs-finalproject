param(
    [switch]$DryRun,
    [ValidateSet('development','staging','production')]
    [string]$Env = 'development',
    [string]$Registry = $env:DOCKER_REGISTRY_URL
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RootDir = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$DeployDir = Join-Path $RootDir 'deployment'
$LogDir = Join-Path $DeployDir 'logs'
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

$TimeStamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$LogFile = Join-Path $LogDir "deploy-$TimeStamp.log"

$script:CurrentEnv = $Env
$script:DryRun = [bool]$DryRun
$script:RegistryUrl = $Registry
$script:ImageNamespace = if ($env:DOCKER_IMAGE_NAMESPACE) { $env:DOCKER_IMAGE_NAMESPACE } else { 'ipfs-gateway' }
$script:VersionTag = if ($env:DOCKER_IMAGE_TAG) { $env:DOCKER_IMAGE_TAG } else { 'latest' }

$ServiceConfig = @{
    backend = @{ Context = (Join-Path $RootDir 'backend');  Dockerfile = (Join-Path $DeployDir 'docker/backend/Dockerfile') }
    frontend = @{ Context = (Join-Path $RootDir 'frontend'); Dockerfile = (Join-Path $DeployDir 'docker/frontend/Dockerfile') }
    celery = @{ Context = (Join-Path $RootDir 'backend');   Dockerfile = (Join-Path $DeployDir 'docker/celery/Dockerfile') }
    nginx = @{ Context = (Join-Path $DeployDir 'docker/nginx'); Dockerfile = (Join-Path $DeployDir 'docker/nginx/Dockerfile') }
}

function Write-Log {
    param(
        [string]$Level,
        [string]$Message,
        [ConsoleColor]$Color = [ConsoleColor]::Gray
    )
    $line = "[{0}] [{1}] {2}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Level, $Message
    Write-Host $line -ForegroundColor $Color
    Add-Content -Path $script:LogFile -Value $line
}

function Info([string]$Message) { Write-Log -Level 'INFO' -Message $Message -Color Cyan }
function Ok([string]$Message) { Write-Log -Level 'OK' -Message $Message -Color Green }
function Warn([string]$Message) { Write-Log -Level 'WARN' -Message $Message -Color Yellow }
function Err([string]$Message) { Write-Log -Level 'ERROR' -Message $Message -Color Red }

function Invoke-CommandSafe {
    param([string]$Command)

    if ($script:DryRun) {
        Warn "[DRY-RUN] $Command"
        return
    }

    Info "Running: $Command"
    try {
        Invoke-Expression "$Command *>> `"$script:LogFile`""
        Ok 'Command succeeded'
    }
    catch {
        Err "Command failed: $Command"
        throw
    }
}

function Assert-Prerequisites {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Err 'docker command not found.'
        exit 2
    }
    try {
        & docker compose version *> $null
    }
    catch {
        Err 'docker compose command is not available.'
        exit 2
    }
}

function Get-ComposeFile {
    switch ($script:CurrentEnv) {
        'development' { Join-Path $script:DeployDir 'docker-compose.dev.yml' }
        'staging' { Join-Path $script:DeployDir 'docker-compose.prod.yml' }
        'production' { Join-Path $script:DeployDir 'docker-compose.prod.yml' }
        default { Join-Path $script:DeployDir 'docker-compose.dev.yml' }
    }
}

function Get-ProjectName {
    switch ($script:CurrentEnv) {
        'development' { 'ipfs-gateway-dev' }
        'staging' { 'ipfs-gateway-staging' }
        'production' { 'ipfs-gateway-prod' }
        default { 'ipfs-gateway-dev' }
    }
}

function Get-ImageRef([string]$Service, [string]$Tag) {
    $base = "$($script:ImageNamespace)/$Service:$Tag"
    if ([string]::IsNullOrWhiteSpace($script:RegistryUrl)) { return $base }
    return "$($script:RegistryUrl)/$base"
}

function Validate-EnvFile {
    $envFile = Join-Path $script:DeployDir '.env'
    if (-not (Test-Path $envFile)) {
        Warn 'deployment/.env not found. Compose actions may fail. Copy deployment/.env.example to deployment/.env first.'
    }
}

function Select-Environment {
    Write-Host ''
    Write-Host 'Select environment:'
    Write-Host '1) development'
    Write-Host '2) staging'
    Write-Host '3) production'
    $choice = Read-Host 'Choice [1-3]'

    switch ($choice) {
        '1' { $script:CurrentEnv = 'development' }
        '2' { $script:CurrentEnv = 'staging' }
        '3' { $script:CurrentEnv = 'production' }
        default { Err 'Invalid environment choice.'; return }
    }

    Ok "Environment set to: $script:CurrentEnv"
}

function List-Images {
    Invoke-CommandSafe 'docker images'
}

function Build-Images {
    $tag = Read-Host "Enter image version tag [$($script:VersionTag)]"
    if ([string]::IsNullOrWhiteSpace($tag)) { $tag = $script:VersionTag }

    foreach ($service in $ServiceConfig.Keys) {
        $config = $ServiceConfig[$service]
        $target = Get-ImageRef -Service $service -Tag $tag
        Invoke-CommandSafe "docker build -t '$target' -f '$($config.Dockerfile)' '$($config.Context)'"
    }

    $script:VersionTag = $tag
    Ok "Build complete with tag: $script:VersionTag"
}

function Retag-Image {
    $source = Read-Host 'Source image (name:tag)'
    $target = Read-Host 'Target image (name:tag)'

    if ([string]::IsNullOrWhiteSpace($source) -or [string]::IsNullOrWhiteSpace($target)) {
        Err 'Source and target image are required.'
        return
    }

    Invoke-CommandSafe "docker image inspect '$source' *> `$null"
    Invoke-CommandSafe "docker tag '$source' '$target'"
}

function Push-Registry {
    $image = Read-Host 'Image to push (name:tag)'
    if ([string]::IsNullOrWhiteSpace($image)) {
        Err 'Image is required.'
        return
    }

    Invoke-CommandSafe "docker push '$image'"
}

function Deploy-Application {
    Validate-EnvFile
    $composeFile = Get-ComposeFile
    $projectName = Get-ProjectName
    Invoke-CommandSafe "`$env:COMPOSE_PROJECT_NAME='$projectName'; docker compose -f '$composeFile' up --build -d"
}

function Run-SingleContainer {
    $image = Read-Host 'Image (name:tag)'
    $container = Read-Host 'Container name'
    $portMap = Read-Host 'Port mapping (e.g. 8080:80) [optional]'
    $envFile = Read-Host 'Env file path [optional]'

    if ([string]::IsNullOrWhiteSpace($image) -or [string]::IsNullOrWhiteSpace($container)) {
        Err 'Image and container name are required.'
        return
    }

    $cmd = "docker run -d --name '$container'"
    if (-not [string]::IsNullOrWhiteSpace($portMap)) { $cmd += " -p '$portMap'" }
    if (-not [string]::IsNullOrWhiteSpace($envFile)) { $cmd += " --env-file '$envFile'" }
    $cmd += " '$image'"

    Invoke-CommandSafe $cmd
}

function View-Logs {
    $composeFile = Get-ComposeFile
    $projectName = Get-ProjectName

    Write-Host '1) Full stack logs'
    Write-Host '2) Single service logs'
    $mode = Read-Host 'Choice [1-2]'

    switch ($mode) {
        '1' {
            Invoke-CommandSafe "`$env:COMPOSE_PROJECT_NAME='$projectName'; docker compose -f '$composeFile' logs --tail=200"
        }
        '2' {
            $service = Read-Host 'Service name'
            if ([string]::IsNullOrWhiteSpace($service)) {
                Err 'Service name is required.'
                return
            }
            Invoke-CommandSafe "`$env:COMPOSE_PROJECT_NAME='$projectName'; docker compose -f '$composeFile' logs --tail=200 '$service'"
        }
        default { Err 'Invalid log mode.' }
    }
}

function Stop-Services {
    $composeFile = Get-ComposeFile
    $projectName = Get-ProjectName
    Invoke-CommandSafe "`$env:COMPOSE_PROJECT_NAME='$projectName'; docker compose -f '$composeFile' down"
}

function Restart-Services {
    $composeFile = Get-ComposeFile
    $projectName = Get-ProjectName
    $service = Read-Host 'Service to restart (leave empty for all)'

    if ([string]::IsNullOrWhiteSpace($service)) {
        Invoke-CommandSafe "`$env:COMPOSE_PROJECT_NAME='$projectName'; docker compose -f '$composeFile' restart"
    }
    else {
        Invoke-CommandSafe "`$env:COMPOSE_PROJECT_NAME='$projectName'; docker compose -f '$composeFile' restart '$service'"
    }
}

function Toggle-DryRun {
    $script:DryRun = -not $script:DryRun
    Ok "Dry-run mode is now: $($script:DryRun)"
}

function Set-RegistryUrl {
    $registry = Read-Host 'Registry URL (empty to clear)'
    $script:RegistryUrl = $registry
    Ok "Registry URL updated: $(if ([string]::IsNullOrWhiteSpace($script:RegistryUrl)) {'<none>'} else {$script:RegistryUrl})"
}

function Show-Menu {
    Clear-Host
    Write-Host '==========================================='
    Write-Host '  IPFS Gateway Deployment CLI'
    Write-Host '==========================================='
    Write-Host ''
    Write-Host "Current Environment: $($script:CurrentEnv)"
    Write-Host "Dry-Run Mode: $($script:DryRun)"
    Write-Host "Registry: $(if ([string]::IsNullOrWhiteSpace($script:RegistryUrl)) {'<none>'} else {$script:RegistryUrl})"
    Write-Host "Log File: $($script:LogFile)"
    Write-Host ''
    Write-Host '1. Select Environment'
    Write-Host '2. List Images'
    Write-Host '3. Build Images'
    Write-Host '4. Tag/Rename Image'
    Write-Host '5. Push to Registry'
    Write-Host '6. Deploy Application'
    Write-Host '7. Run Single Container'
    Write-Host '8. View Logs'
    Write-Host '9. Stop Services'
    Write-Host '10. Restart Services'
    Write-Host '11. Toggle Dry-Run'
    Write-Host '12. Set Registry URL'
    Write-Host '0. Exit'
    Write-Host ''
}

function Main {
    Assert-Prerequisites

    while ($true) {
        Show-Menu
        $choice = Read-Host 'Enter choice'

        switch ($choice) {
            '1' { Select-Environment }
            '2' { List-Images }
            '3' { Build-Images }
            '4' { Retag-Image }
            '5' { Push-Registry }
            '6' { Deploy-Application }
            '7' { Run-SingleContainer }
            '8' { View-Logs }
            '9' { Stop-Services }
            '10' { Restart-Services }
            '11' { Toggle-DryRun }
            '12' { Set-RegistryUrl }
            '0' { Ok 'Exiting deployment CLI.'; break }
            default { Err 'Invalid choice. Please enter a number from 0 to 12.' }
        }

        [void](Read-Host 'Press Enter to continue...')
    }
}

Main
