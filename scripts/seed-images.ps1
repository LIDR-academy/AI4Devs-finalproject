#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Sube imágenes de muestra a MinIO para el entorno de desarrollo de INK·LINK.
    Descarga imágenes libres de derechos desde picsum.photos.

.DESCRIPTION
    Requiere: MinIO corriendo en localhost:9000 (docker-compose up -d storage)
    Alternativa con Docker: docker compose --profile seed-images up seed-images

.EXAMPLE
    ./scripts/seed-images.ps1
    ./scripts/seed-images.ps1 -MinioUrl "http://localhost:9000" -Force
#>
param(
    [string]$MinioUrl = "http://localhost:9000",
    [string]$BucketName = "inklink-images",
    [string]$AccessKey = "minioadmin",
    [string]$SecretKey = "minioadmin",
    [switch]$Force  # re-upload even if files exist
)

$ErrorActionPreference = "Stop"

$Artists = @(
    "matias-herrera",
    "fernanda-munoz",
    "cristobal-vidal",
    "antonia-reyes",
    "javier-castro"
)

function Upload-Image {
    param([string]$SourceUrl, [string]$DestPath)

    $fullDest = "$MinioUrl/$BucketName/$DestPath"

    # Check if already exists (skip unless -Force)
    if (-not $Force) {
        try {
            $head = Invoke-WebRequest -Uri $fullDest -Method Head -UseBasicParsing -ErrorAction SilentlyContinue
            if ($head.StatusCode -eq 200) {
                Write-Host "  skip (already exists): $DestPath" -ForegroundColor DarkGray
                return
            }
        } catch { }
    }

    Write-Host "  uploading: $DestPath" -ForegroundColor Cyan

    # Download image bytes
    $bytes = (Invoke-WebRequest -Uri $SourceUrl -UseBasicParsing).Content

    # Upload via MinIO S3 API (presigned PUT not needed for public bucket)
    $headers = @{
        "Content-Type" = "image/jpeg"
    }

    # Use mc if available, else fall back to Invoke-WebRequest with HMAC auth
    $mc = Get-Command "mc" -ErrorAction SilentlyContinue
    if ($mc) {
        $tmp = [System.IO.Path]::GetTempFileName() + ".jpg"
        [System.IO.File]::WriteAllBytes($tmp, $bytes)
        & mc cp $tmp "local/$BucketName/$DestPath" | Out-Null
        Remove-Item $tmp -Force
    } else {
        # Docker fallback: el alias de mc no persiste entre contenedores efímeros y
        # --network host no funciona en Docker Desktop (Windows/macOS), así que se
        # configura el alias y se copia en un único contenedor unido a la red del compose
        $tmp = [System.IO.Path]::GetTempFileName() + ".jpg"
        [System.IO.File]::WriteAllBytes($tmp, $bytes)
        docker run --rm --network $script:DockerNetwork -v "${tmp}:/img.jpg" --entrypoint sh minio/mc `
            -c "mc alias set local http://storage:9000 $AccessKey $SecretKey >/dev/null && mc cp /img.jpg 'local/$BucketName/$DestPath'"
        Remove-Item $tmp -Force
    }
}

Write-Host "INK·LINK — Seed de imágenes en MinIO" -ForegroundColor Magenta
Write-Host "MinIO: $MinioUrl | Bucket: $BucketName`n"

# Configure mc alias if mc is available
$mc = Get-Command "mc" -ErrorAction SilentlyContinue
if ($mc) {
    & mc alias set local $MinioUrl $AccessKey $SecretKey | Out-Null
    & mc mb --ignore-existing "local/$BucketName" | Out-Null
    & mc anonymous set download "local/$BucketName" | Out-Null
    Write-Host "mc configurado correctamente.`n" -ForegroundColor Green
} else {
    Write-Host "mc CLI no encontrado. Se usará mc vía Docker.`n" -ForegroundColor Yellow
    $script:DockerNetwork = docker inspect inklink-storage --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}'
    if (-not $script:DockerNetwork) {
        throw "No se encontró el contenedor inklink-storage. Levanta la infraestructura con: docker-compose up -d"
    }
    docker run --rm --network $script:DockerNetwork --entrypoint sh minio/mc -c `
        "mc alias set local http://storage:9000 $AccessKey $SecretKey >/dev/null && mc mb --ignore-existing local/$BucketName && mc anonymous set download local/$BucketName" | Out-Null
}

foreach ($slug in $Artists) {
    Write-Host "Artista: $slug" -ForegroundColor Yellow
    for ($i = 1; $i -le 12; $i++) {
        $num = $i.ToString("D2")
        $seed = "$slug-$i"
        Upload-Image `
            -SourceUrl "https://picsum.photos/seed/$seed/800/800" `
            -DestPath "$slug/work-$num.jpg"
        Upload-Image `
            -SourceUrl "https://picsum.photos/seed/$seed/400/400" `
            -DestPath "$slug/work-$num-thumb.jpg"
    }
}

Write-Host "`nLogos de marca..." -ForegroundColor Yellow
foreach ($brand in @('eternal-ink', 'cheyenne', 'dynamic-color')) {
    Upload-Image `
        -SourceUrl "https://picsum.photos/seed/$brand/200/80" `
        -DestPath "brands/$brand.png"
}

Write-Host "`n✅ Seed de imágenes completado." -ForegroundColor Green
Write-Host "Puedes verificar en http://localhost:9001 (usuario: minioadmin / minioadmin)"
