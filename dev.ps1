#!/usr/bin/env pwsh
param(
    [switch]$SkipInfra,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$ErrorActionPreference = "Stop"

Write-Host "Starting Aura Planning local development environment..." -ForegroundColor Cyan

# Start infrastructure
if (-not $SkipInfra -and -not $BackendOnly -and -not $FrontendOnly) {
    Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
    docker compose up -d
    Write-Host "Infrastructure started. Waiting for services to be ready..." -ForegroundColor Green
    Start-Sleep -Seconds 5
}

# Start backend
if (-not $FrontendOnly) {
    Write-Host "Starting backend API..." -ForegroundColor Yellow
    $backendJob = Start-Process -FilePath "dotnet" `
        -ArgumentList "run", "--project", "backend/src/Aura.Api", "--launch-profile", "http" `
        -PassThru `
        -RedirectStandardOutput ".dev-backend.log" `
        -RedirectStandardError ".dev-backend-err.log"
    Write-Host "Backend starting (PID: $($backendJob.Id))" -ForegroundColor Green
    Write-Host "  -> http://localhost:5000" -ForegroundColor DarkGray
    Write-Host "  -> Swagger: http://localhost:5000/scalar/v1" -ForegroundColor DarkGray
}

# Start frontend
if (-not $BackendOnly) {
    Write-Host "Starting frontend..." -ForegroundColor Yellow
    $frontendJob = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c", "npm", "start" `
        -WorkingDirectory "frontend" `
        -PassThru `
        -RedirectStandardOutput ".dev-frontend.log" `
        -RedirectStandardError ".dev-frontend-err.log"
    Write-Host "Frontend starting (PID: $($frontendJob.Id))" -ForegroundColor Green
    Write-Host "  -> http://localhost:4200" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "All services started!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor DarkGray
Write-Host "  docker compose logs -f           # Watch infra logs" -ForegroundColor DarkGray
Write-Host "  Get-Content .dev-backend.log -Wait  # Backend log" -ForegroundColor DarkGray
Write-Host "  Get-Content .dev-frontend.log -Wait # Frontend log" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

try {
    if ($backendJob) {
        Wait-Process -Id $backendJob.Id
    }
} finally {
    Write-Host ""
    Write-Host "Stopping services..." -ForegroundColor Yellow
    
    if ($backendJob -and -not $backendJob.HasExited) {
        Stop-Process -Id $backendJob.Id -Force
        Write-Host "Stopped backend (PID: $($backendJob.Id))" -ForegroundColor DarkGray
    }
    
    if ($frontendJob -and -not $frontendJob.HasExited) {
        Stop-Process -Id $frontendJob.Id -Force
        Write-Host "Stopped frontend (PID: $($frontendJob.Id))" -ForegroundColor DarkGray
    }
    
    if (-not $SkipInfra -and -not $BackendOnly -and -not $FrontendOnly) {
        docker compose down
        Write-Host "Infrastructure stopped" -ForegroundColor Green
    }
    
    Write-Host "Done." -ForegroundColor Cyan
}
