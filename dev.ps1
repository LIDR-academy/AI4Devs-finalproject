#!/usr/bin/env pwsh
# Windows PowerShell equivalent of dev.sh — see docs/local-development-setup.md.
# Requires PowerShell 7.3+ (for $PSNativeCommandUseErrorActionPreference).
$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $true

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ComposeFile = Join-Path $Root "infra\docker\docker-compose.local.yml"
$DbContainer = "RealSaveFooding-postgres"

$script:BackProc = $null
$script:FrontProc = $null

function Stop-DevServices {
    Write-Host ""
    Write-Host "Stopping dev services..."
    if ($script:BackProc -and -not $script:BackProc.HasExited) {
        Stop-Process -Id $script:BackProc.Id -Force -ErrorAction SilentlyContinue
    }
    if ($script:FrontProc -and -not $script:FrontProc.HasExited) {
        Stop-Process -Id $script:FrontProc.Id -Force -ErrorAction SilentlyContinue
    }
    docker compose -f $ComposeFile stop
}

try {
    # 1. Start DB
    $conflicting = docker ps --filter "publish=5432" --format "{{.Names}}" |
        Where-Object { $_ -and $_ -ne $DbContainer }
    foreach ($name in $conflicting) {
        Write-Host "Port 5432 is in use by '$name'; stopping it..."
        docker stop $name | Out-Null
    }

    Write-Host "Starting database..."
    docker compose -f $ComposeFile up -d

    Write-Host "Waiting for Postgres to be ready..."
    while ($true) {
        $ready = $true
        try { docker exec $DbContainer pg_isready -U postgres -q 2>$null }
        catch { $ready = $false }
        if ($ready) { break }
        Start-Sleep -Seconds 1
    }
    Write-Host "Database ready."

    # 2. Start backend
    Write-Host "Starting backend..."
    $script:BackProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run start:dev" `
        -WorkingDirectory (Join-Path $Root "back") -NoNewWindow -PassThru

    # 3. Start frontend
    Write-Host "Starting frontend..."
    $script:FrontProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev" `
        -WorkingDirectory (Join-Path $Root "front") -NoNewWindow -PassThru

    Write-Host ""
    Write-Host "Dev environment running. Press Ctrl+C to stop."
    Wait-Process -Id $script:BackProc.Id, $script:FrontProc.Id
}
finally {
    Stop-DevServices
}
