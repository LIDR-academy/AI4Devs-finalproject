param(
    [switch] $SkipMigrations
)

$ErrorActionPreference = "Stop"

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDirectory "../..")
$envPath = Join-Path $scriptDirectory ".env"
$envExamplePath = Join-Path $scriptDirectory ".env.example"
$composePath = Join-Path $scriptDirectory "docker-compose.sqlserver.yml"
$backendPath = Join-Path $repoRoot "backend"
$infrastructureProject = Join-Path $backendPath "TejaFlow.Infrastructure/TejaFlow.Infrastructure.csproj"
$startupProject = Join-Path $backendPath "TejaFlow.WebApi/TejaFlow.WebApi.csproj"

if (-not (Test-Path $envPath)) {
    Copy-Item -Path $envExamplePath -Destination $envPath
    Write-Host "Created deploy/docker/.env from .env.example. Review MSSQL_SA_PASSWORD before production use."
}

$envValues = @{}
Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
        return
    }

    $parts = $line -split "=", 2
    if ($parts.Length -eq 2) {
        $envValues[$parts[0]] = $parts[1]
    }
}

if (-not $envValues.ContainsKey("MSSQL_SA_PASSWORD") -or [string]::IsNullOrWhiteSpace($envValues["MSSQL_SA_PASSWORD"])) {
    throw "MSSQL_SA_PASSWORD is required in deploy/docker/.env."
}

if (-not $envValues.ContainsKey("TEJAFLOW_DB_NAME") -or [string]::IsNullOrWhiteSpace($envValues["TEJAFLOW_DB_NAME"])) {
    $envValues["TEJAFLOW_DB_NAME"] = "TejaFlow"
}

Push-Location $scriptDirectory
try {
    docker compose --env-file $envPath -f $composePath up -d
}
finally {
    Pop-Location
}

Write-Host "Waiting for SQL Server on localhost:1433..."
$deadline = (Get-Date).AddMinutes(3)
do {
    $connection = Test-NetConnection -ComputerName localhost -Port 1433 -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        break
    }

    Start-Sleep -Seconds 3
} while ((Get-Date) -lt $deadline)

if (-not $connection.TcpTestSucceeded) {
    throw "SQL Server did not open port 1433 before the timeout."
}

if ($SkipMigrations) {
    Write-Host "SQL Server is running. Skipped EF Core migrations."
    exit 0
}

Write-Host "Applying EF Core migrations to TejaFlow..."
$env:ConnectionStrings__TejaFlowDb = "Server=localhost,1433;Database=$($envValues["TEJAFLOW_DB_NAME"]);User Id=sa;Password=$($envValues["MSSQL_SA_PASSWORD"]);TrustServerCertificate=True;Encrypt=True"
dotnet dotnet-ef database update `
    --project $infrastructureProject `
    --startup-project $startupProject

Write-Host "SQL Server is running and the TejaFlow database is ready."
