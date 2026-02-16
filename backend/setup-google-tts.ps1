# Google Cloud TTS Configuration Helper
# This script helps you configure Google Cloud Text-to-Speech credentials

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Google Cloud TTS Setup Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if credentials file exists
Write-Host "Step 1: Checking for credentials file..." -ForegroundColor Yellow
Write-Host ""

$defaultPath = "$env:USERPROFILE\.gcp\meditation-tts.json"
$customPath = Read-Host "Enter path to Google Cloud credentials JSON file (or press Enter for default: $defaultPath)"

if ([string]::IsNullOrWhiteSpace($customPath)) {
    $customPath = $defaultPath
}

if (Test-Path $customPath) {
    Write-Host "[OK] Credentials file found: $customPath" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Credentials file not found: $customPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Go to https://console.cloud.google.com/" -ForegroundColor White
    Write-Host "2. Create a project and enable Text-to-Speech API" -ForegroundColor White
    Write-Host "3. Create a Service Account with 'Cloud Text-to-Speech API User' role" -ForegroundColor White
    Write-Host "4. Download JSON key file and save it to:" -ForegroundColor White
    Write-Host "   $customPath" -ForegroundColor Cyan
    Write-Host ""
    
    $createDir = Read-Host "Create directory now? (y/n)"
    if ($createDir -eq 'y') {
        $dir = Split-Path $customPath -Parent
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "[OK] Directory created: $dir" -ForegroundColor Green
        Write-Host "Please download and save your JSON key file there." -ForegroundColor Yellow
    }
    
    exit
}

# Validate JSON format
Write-Host ""
Write-Host "Step 2: Validating JSON format..." -ForegroundColor Yellow
try {
    $json = Get-Content $customPath -Raw | ConvertFrom-Json
    
    if ($json.type -eq "service_account") {
        Write-Host "[OK] Valid service account credentials" -ForegroundColor Green
        Write-Host "  Project ID: $($json.project_id)" -ForegroundColor Gray
        Write-Host "  Client Email: $($json.client_email)" -ForegroundColor Gray
    } else {
        Write-Host "[WARNING] Not a service account key file" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Invalid JSON format: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Ask if user wants to configure application-local.yml
Write-Host ""
Write-Host "Step 3: Configure application-local.yml..." -ForegroundColor Yellow
$configure = Read-Host "Do you want to update application-local.yml automatically? (y/n)"

if ($configure -eq 'y') {
    $appConfigPath = "src\main\resources\application-local.yml"
    
    if (-not (Test-Path $appConfigPath)) {
        $copyExample = Read-Host "application-local.yml not found. Copy from example? (y/n)"
        if ($copyExample -eq 'y') {
            $examplePath = "src\main\resources\application-local.yml.example"
            if (Test-Path $examplePath) {
                Copy-Item $examplePath $appConfigPath
                Write-Host "[OK] Copied from example template" -ForegroundColor Green
            } else {
                Write-Host "[ERROR] Example file not found: $examplePath" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "Please create application-local.yml manually" -ForegroundColor Yellow
            exit
        }
    }
    
    # Read current config
    $config = Get-Content $appConfigPath -Raw
    
    # Update Google TTS enabled flag
    $config = $config -replace '(?m)^(\s*enabled:\s*)false', '$1true'
    
    # Update credentials path (escape backslashes for YAML)
    $escapedPath = $customPath -replace '\\', '\\'
    $config = $config -replace '(?m)^(\s*credentials-path:\s*).*', "`$1$escapedPath"
    
    # Write back
    $config | Set-Content $appConfigPath -NoNewline
    
    Write-Host "[OK] Updated application-local.yml" -ForegroundColor Green
    Write-Host "  enabled: true" -ForegroundColor Gray
    Write-Host "  credentials-path: $customPath" -ForegroundColor Gray
}

# Set environment variable
Write-Host ""
Write-Host "Step 4: Set environment variable..." -ForegroundColor Yellow
$setEnv = Read-Host "Do you want to set GOOGLE_APPLICATION_CREDENTIALS environment variable? (y/n)"

if ($setEnv -eq 'y') {
    $env:GOOGLE_APPLICATION_CREDENTIALS = $customPath
    $env:GOOGLE_TTS_ENABLED = "true"
    
    Write-Host "[OK] Environment variables set for this session:" -ForegroundColor Green
    Write-Host "  GOOGLE_APPLICATION_CREDENTIALS=$customPath" -ForegroundColor Gray
    Write-Host "  GOOGLE_TTS_ENABLED=true" -ForegroundColor Gray
    Write-Host ""
    Write-Host "NOTE: These are session-only. To make permanent:" -ForegroundColor Yellow
    Write-Host "  Windows: System Properties > Environment Variables" -ForegroundColor Gray
    Write-Host "  Or add to your PowerShell profile" -ForegroundColor Gray
}

# Test connection (optional)
Write-Host ""
Write-Host "Step 5: Test Google Cloud TTS connection..." -ForegroundColor Yellow
$testConnection = Read-Host "Do you want to test the connection now? (requires Maven) (y/n)"

if ($testConnection -eq 'y') {
    Write-Host ""
    Write-Host "Starting Spring Boot application..." -ForegroundColor Gray
    Write-Host "Check logs for: 'Google Cloud TTS client initialized successfully'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
    Write-Host ""
    
    # Start Spring Boot
    mvn spring-boot:run -Dspring-boot.run.profiles=local
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your Spring Boot application" -ForegroundColor White
Write-Host "2. Generate a meditation from the frontend" -ForegroundColor White
Write-Host "3. Check logs for 'Google Cloud TTS client initialized successfully'" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  Quick Start: GOOGLE-TTS-QUICKSTART.md" -ForegroundColor Cyan
Write-Host "  Full Guide:  GOOGLE-TTS-SETUP.md" -ForegroundColor Cyan
Write-Host ""
