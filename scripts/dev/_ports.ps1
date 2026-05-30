# Puertos habituales en desarrollo local. Fuente canónica en scripts; alinear con:
# - services/README.md (8080-8084)
# - infra/compose/README.md (Docker y dependencias)
# Dot-source: . "$PSScriptRoot\_ports.ps1"

$script:MtlPortDefinitions = @(
    @{ Port = 8080; Label = 'api-gateway (Spring Boot dev)' }
    @{ Port = 8081; Label = 'catalog-service' }
    @{ Port = 8082; Label = 'media-service' }
    @{ Port = 8083; Label = 'notification-service' }
    @{ Port = 8084; Label = 'ai-assistant-service' }
    @{ Port = 5173; Label = 'frontend Vite dev' }
    @{ Port = 5433; Label = 'PostgreSQL (host, Compose)' }
    @{ Port = 27017; Label = 'MongoDB' }
    @{ Port = 6379; Label = 'Redis' }
    @{ Port = 9000; Label = 'MinIO API' }
    @{ Port = 9001; Label = 'MinIO consola' }
    @{ Port = 9094; Label = 'Kafka (host)' }
    @{ Port = 8180; Label = 'Keycloak' }
    @{ Port = 1025; Label = 'Mailpit SMTP' }
    @{ Port = 8025; Label = 'Mailpit UI' }
    @{ Port = 9090; Label = 'Prometheus' }
    @{ Port = 3000; Label = 'Grafana' }
)

function Get-MtlPortNumbers {
    return @($script:MtlPortDefinitions | ForEach-Object { $_.Port })
}

function Get-MtlPortLabel {
    param([Parameter(Mandatory)][int]$Port)
    $match = $script:MtlPortDefinitions | Where-Object { $_.Port -eq $Port } | Select-Object -First 1
    if ($match) {
        return $match.Label
    }
    return 'puerto MTL (sin etiqueta en _ports.ps1)'
}
