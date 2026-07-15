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

# Start Email Worker
if (-not $FrontendOnly) {
    Write-Host "Starting Email Worker..." -ForegroundColor Yellow
    $emailWorkerJob = Start-Process -FilePath "dotnet" `
        -ArgumentList "run", "--project", "backend/workers/Aura.Workers.Email" `
        -PassThru `
        -RedirectStandardOutput ".dev-email-worker.log" `
        -RedirectStandardError ".dev-email-worker-err.log"
    Write-Host "Email Worker starting (PID: $($emailWorkerJob.Id))" -ForegroundColor Green
}

# Start WhatsApp Worker
if (-not $FrontendOnly) {
    Write-Host "Starting WhatsApp Worker..." -ForegroundColor Yellow
    $whatsAppWorkerJob = Start-Process -FilePath "dotnet" `
        -ArgumentList "run", "--project", "backend/workers/Aura.Workers.WhatsApp" `
        -PassThru `
        -RedirectStandardOutput ".dev-whatsapp-worker.log" `
        -RedirectStandardError ".dev-whatsapp-worker-err.log"
    Write-Host "WhatsApp Worker starting (PID: $($whatsAppWorkerJob.Id))" -ForegroundColor Green
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
Write-Host "  Get-Content .dev-email-worker.log -Wait # Email Worker log" -ForegroundColor DarkGray
Write-Host "  Get-Content .dev-whatsapp-worker.log -Wait # WhatsApp Worker log" -ForegroundColor DarkGray
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
    
    if ($emailWorkerJob -and -not $emailWorkerJob.HasExited) {
        Stop-Process -Id $emailWorkerJob.Id -Force
        Write-Host "Stopped email worker (PID: $($emailWorkerJob.Id))" -ForegroundColor DarkGray
    }

    if ($whatsAppWorkerJob -and -not $whatsAppWorkerJob.HasExited) {
        Stop-Process -Id $whatsAppWorkerJob.Id -Force
        Write-Host "Stopped whatsapp worker (PID: $($whatsAppWorkerJob.Id))" -ForegroundColor DarkGray
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
