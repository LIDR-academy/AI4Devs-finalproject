#!/usr/bin/env pwsh
# Windows PowerShell equivalent of prod.sh — see docs/prod-development-setup.md.
# Requires PowerShell 7.3+ (for $PSNativeCommandUseErrorActionPreference), plus on PATH:
# terraform, aws cli, node, ssh + scp (Windows OpenSSH Client), tar (built into Windows 10+),
# curl.exe (built into Windows 10+).
param(
    [string]$Command
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $true

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$TfDir = Join-Path $Root "infra\terraform\envs\prod"
$DockerDir = Join-Path $Root "infra\docker"
$SecretsFile = Join-Path $DockerDir "prod.secrets.env"
$SshAlias = "realsavefooding-prod"
$AwsRegion = "eu-west-1"
$BuildInstanceType = "t3.small"   # temporary size while building the frontend (needs ~2GB RAM)
$RunInstanceType = "t3.micro"     # steady-state size (free-tier eligible)

function Show-Usage {
    Write-Host "Usage: .\prod.ps1 {deploy|destroy|app-deploy}"
    Write-Host "  deploy      - terraform apply (provisions/updates the AWS prod infra)"
    Write-Host "  destroy     - terraform destroy (tears down the AWS prod infra)"
    Write-Host "  app-deploy  - build the app images on the EC2 box and deploy containers + migrations"
    Write-Host "                (see docs/deployment/aws-free-tier-runbook.md for prerequisites: SSH-over-SSM"
    Write-Host "                config alias '$SshAlias', session-manager-plugin installed)"
    exit 1
}

function Get-TfOutput {
    param([Parameter(Mandatory)][string]$Name)
    Push-Location $TfDir
    try { terraform output -raw $Name }
    finally { Pop-Location }
}

function Invoke-SshBox {
    param([Parameter(Mandatory)][string]$RemoteCommand)
    ssh -o ConnectTimeout=15 $SshAlias $RemoteCommand
}

function Test-SshBox {
    try {
        ssh -o ConnectTimeout=15 $SshAlias "echo OK" *> $null
        return $true
    }
    catch { return $false }
}

function Wait-ForSsm {
    param([Parameter(Mandatory)][string]$InstanceId)
    Write-Host "Waiting for instance to boot and register with SSM..."
    for ($i = 0; $i -lt 20; $i++) {
        if (Test-SshBox) {
            Write-Host "Reachable."
            return
        }
        Start-Sleep -Seconds 10
    }
    throw "ERROR: instance did not become reachable over SSH-over-SSM in time."
}

function Resize-Instance {
    param([Parameter(Mandatory)][string]$InstanceId, [Parameter(Mandatory)][string]$NewType)
    Write-Host "Resizing $InstanceId to $NewType..."
    aws ec2 stop-instances --region $AwsRegion --instance-ids $InstanceId | Out-Null
    aws ec2 wait instance-stopped --region $AwsRegion --instance-ids $InstanceId
    aws ec2 modify-instance-attribute --region $AwsRegion --instance-id $InstanceId `
        --instance-type "{`"Value`": `"$NewType`"}" | Out-Null
    aws ec2 start-instances --region $AwsRegion --instance-ids $InstanceId | Out-Null
    aws ec2 wait instance-running --region $AwsRegion --instance-ids $InstanceId
    Wait-ForSsm -InstanceId $InstanceId
}

function New-JwtSecret {
    # .NET-native replacement for `openssl rand -base64 48` — avoids an OpenSSL dependency on Windows.
    $bytes = New-Object byte[] 48
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    [Convert]::ToBase64String($bytes)
}

function Confirm-SecretsFile {
    if (Test-Path $SecretsFile) { return }

    Write-Host "No $SecretsFile found — generating one (JWT secret + VAPID keys)."
    Write-Host "This only runs once per environment: regenerating these later invalidates existing"
    Write-Host "JWTs/push subscriptions, so this file is precious — back it up somewhere durable."

    $jwtSecret = New-JwtSecret

    Push-Location (Join-Path $Root "back")
    $vapidJson = node -e "console.log(JSON.stringify(require('web-push').generateVAPIDKeys()))"
    Pop-Location
    $vapid = $vapidJson | ConvertFrom-Json

    $content = @"
JWT_SECRET=$jwtSecret
VAPID_PUBLIC_KEY=$($vapid.publicKey)
VAPID_PRIVATE_KEY=$($vapid.privateKey)
VAPID_SUBJECT=mailto:CHANGE-ME@example.com
AWS_SES_FROM_ADDRESS=CHANGE-ME@example.com
"@
    Set-Content -Path $SecretsFile -Value $content -NoNewline

    # Best-effort Windows equivalent of `chmod 600` — restrict the file to the current user.
    try {
        icacls $SecretsFile /inheritance:r | Out-Null
        icacls $SecretsFile /grant:r "$($env:USERNAME):(R,W)" | Out-Null
    }
    catch { Write-Host "Warning: could not restrict ACLs on $SecretsFile — restrict access manually." }

    Write-Host "Wrote $SecretsFile — edit VAPID_SUBJECT/AWS_SES_FROM_ADDRESS before continuing if the"
    Write-Host "placeholders don't suit you (the from-address must be verifiable in SES)."
}

function Get-TfVarValue {
    param([Parameter(Mandatory)][string]$Name)
    # Reads a quoted string value out of terraform.tfvars without relying on regex-in-a-string
    # portability gotchas (a `sed`-with-\s bug on the bash side once produced a mangled DB password).
    $parseScript = @'
const fs = require("fs");
const content = fs.readFileSync(process.argv[2], "utf8");
const re = new RegExp(process.argv[1] + "\\s*=\\s*\"([^\"]*)\"");
const m = content.match(re);
if (!m) { process.exit(1); }
process.stdout.write(m[1]);
'@
    node -e $parseScript $Name (Join-Path $TfDir "terraform.tfvars")
}

function Import-EnvFile {
    param([Parameter(Mandatory)][string]$Path)
    Get-Content $Path | ForEach-Object {
        if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
            Set-Item -Path "Env:$($Matches[1])" -Value $Matches[2]
        }
    }
}

function Invoke-AppDeploy {
    Confirm-SecretsFile

    Write-Host "Reading Terraform outputs..."
    $instanceId = Get-TfOutput "ec2_instance_id"
    $cloudfrontDomain = Get-TfOutput "cloudfront_domain"
    $rdsEndpoint = Get-TfOutput "rds_endpoint"
    $s3Bucket = Get-TfOutput "s3_receipts_bucket"
    $snsArn = Get-TfOutput "sns_topic_arn"

    $dbName = try { Get-TfVarValue "db_name" } catch { "RealSaveFooding" }
    $dbUsername = try { Get-TfVarValue "db_username" } catch { "realsavefooding" }
    $dbPassword = Get-TfVarValue "db_password"

    Write-Host "Instance: $instanceId"
    Write-Host "CloudFront: $cloudfrontDomain"

    if (-not (Test-SshBox)) {
        Write-Host "ERROR: cannot reach '$SshAlias' over SSH-over-SSM." -ForegroundColor Red
        Write-Host "See docs/deployment/aws-free-tier-runbook.md for the ~/.ssh/config + session-manager-plugin setup." -ForegroundColor Red
        exit 1
    }

    $tempDir = $env:TEMP
    $backTar = Join-Path $tempDir "rsf-back-src.tar.gz"
    $frontTar = Join-Path $tempDir "rsf-front-src.tar.gz"

    Write-Host "Packaging source..."
    tar --exclude='node_modules' --exclude='dist' -czf $backTar -C $Root back
    tar --exclude='node_modules' --exclude='dist' --exclude='.output' --exclude='test-results' `
        --exclude='playwright-report' -czf $frontTar -C $Root front

    Write-Host "Transferring source and building backend natively (no resize needed)..."
    scp $backTar "${SshAlias}:/tmp/back-src.tar.gz"
    Invoke-SshBox "rm -rf /tmp/build && mkdir -p /tmp/build && tar -xzf /tmp/back-src.tar.gz -C /tmp/build"
    Invoke-SshBox "cd /tmp/build/back && sudo docker builder prune -af >/dev/null && sudo docker build -t realsavefooding-api:latest ."

    Write-Host "Resizing to $BuildInstanceType to build the frontend (Bun/Vite needs ~2GB RAM)..."
    Resize-Instance -InstanceId $instanceId -NewType $BuildInstanceType

    Write-Host "Transferring frontend source and building natively..."
    scp $frontTar "${SshAlias}:/tmp/front-src.tar.gz"
    Invoke-SshBox "rm -rf /tmp/build && mkdir -p /tmp/build && tar -xzf /tmp/front-src.tar.gz -C /tmp/build"
    Import-EnvFile -Path $SecretsFile
    Invoke-SshBox "cd /tmp/build/front && sudo docker builder prune -af >/dev/null && sudo docker build --build-arg VITE_API_BASE_URL=$cloudfrontDomain/api --build-arg VITE_VAPID_PUBLIC_KEY=$($env:VAPID_PUBLIC_KEY) -t realsavefooding-front:latest ."

    Write-Host "Resizing back down to $RunInstanceType..."
    Resize-Instance -InstanceId $instanceId -NewType $RunInstanceType

    Write-Host "Writing back.env and deploying containers..."
    $backEnvPath = Join-Path $tempDir "rsf-back.env"
    $backEnvContent = @"
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://${dbUsername}:${dbPassword}@${rdsEndpoint}/${dbName}?sslmode=require
JWT_SECRET=$($env:JWT_SECRET)
JWT_EXPIRES_IN=1d
AWS_REGION=$AwsRegion
AWS_S3_BUCKET=$s3Bucket
AWS_SNS_TOPIC_ARN=$snsArn
AWS_SES_FROM_ADDRESS=$($env:AWS_SES_FROM_ADDRESS)
VAPID_PUBLIC_KEY=$($env:VAPID_PUBLIC_KEY)
VAPID_PRIVATE_KEY=$($env:VAPID_PRIVATE_KEY)
VAPID_SUBJECT=$($env:VAPID_SUBJECT)
"@
    Set-Content -Path $backEnvPath -Value $backEnvContent -NoNewline

    scp $backEnvPath "${SshAlias}:/tmp/back.env"
    scp (Join-Path $DockerDir "docker-compose.prod.yml") "${SshAlias}:/tmp/docker-compose.prod.yml"
    Invoke-SshBox "sudo mkdir -p /opt/realsavefooding && sudo mv /tmp/back.env /opt/realsavefooding/back.env && sudo chmod 600 /opt/realsavefooding/back.env && sudo mv /tmp/docker-compose.prod.yml /opt/realsavefooding/docker-compose.prod.yml"
    Remove-Item -Force -ErrorAction SilentlyContinue $backEnvPath, $backTar, $frontTar

    Invoke-SshBox "cd /opt/realsavefooding && sudo docker compose -f docker-compose.prod.yml up -d --force-recreate"

    Write-Host "Running database migrations..."
    Invoke-SshBox "cd /opt/realsavefooding && sudo docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy"

    Write-Host "Sanity check..."
    Invoke-SshBox "curl -s -o /dev/null -w 'backend (local):  %{http_code}\n' http://localhost:3000/api/health"
    Invoke-SshBox "curl -s -o /dev/null -w 'frontend (local): %{http_code}\n' http://localhost:4173/"
    curl.exe -s -o NUL -w "backend (public):  %{http_code}`n" "$cloudfrontDomain/api/health"
    curl.exe -s -o NUL -w "frontend (public): %{http_code}`n" "$cloudfrontDomain/"

    Write-Host "Done. App URL: $cloudfrontDomain"
}

if (-not $Command) { Show-Usage }

switch ($Command) {
    "deploy" {
        Push-Location $TfDir
        try { terraform apply } finally { Pop-Location }
    }
    "destroy" {
        Push-Location $TfDir
        try { terraform destroy } finally { Pop-Location }
    }
    "app-deploy" { Invoke-AppDeploy }
    default { Show-Usage }
}
