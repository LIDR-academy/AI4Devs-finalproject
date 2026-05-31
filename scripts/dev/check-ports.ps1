# Lista puertos MTL en escucha (microservicios, Vite, Compose).
# Uso: .\scripts\dev\check-ports.ps1
#      .\scripts\dev\check-ports.ps1 -All   # también muestra puertos libres

[CmdletBinding()]
param(
    [switch]$All
)

. "$PSScriptRoot\_common.ps1"
. "$PSScriptRoot\_ports.ps1"

$portNumbers = Get-MtlPortNumbers
$portSet = [System.Collections.Generic.HashSet[int]]::new()
foreach ($p in $portNumbers) {
    [void]$portSet.Add($p)
}

Write-MtlInfo 'Comprobando puertos en escucha (desarrollo local MTL)…'

$byPort = @{}

function Add-ListeningPort {
    param([int]$Port, [int]$ProcessId)
    if (-not $portSet.Contains($Port)) { return }
    if ($byPort.ContainsKey($Port)) { return }
    $procName = '?'
    if ($ProcessId -gt 0) {
        $proc = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
        if ($proc) { $procName = $proc.ProcessName }
    }
    $byPort[$Port] = [pscustomobject]@{
        Port      = $Port
        Label     = Get-MtlPortLabel -Port $Port
        Process   = $procName
        ProcessId = $ProcessId
    }
}

try {
    foreach ($conn in Get-NetTCPConnection -State Listen -ErrorAction Stop) {
        Add-ListeningPort -Port $conn.LocalPort -ProcessId $conn.OwningProcess
    }
}
catch {
    Write-MtlWarn "Get-NetTCPConnection: $($_.Exception.Message). Probando netstat…"
    $lines = netstat -ano | Select-String 'LISTENING'
    foreach ($line in $lines) {
        if ($line.Line -notmatch ':(\d+)\s+\S+\s+LISTENING\s+(\d+)\s*$') {
            continue
        }
        Add-ListeningPort -Port ([int]$Matches[1]) -ProcessId ([int]$Matches[2])
    }
}

$listening = @($byPort.Values | Sort-Object Port)

if ($listening.Count -eq 0) {
    Write-MtlOk 'Ningún puerto MTL habitual está en escucha.'
}
else {
    Write-Host ''
    Write-Host 'En escucha:' -ForegroundColor Yellow
    $listening | Format-Table -AutoSize Port, Label, Process, ProcessId
}

if ($All) {
    $free = @($portNumbers | Where-Object { -not $byPort.ContainsKey($_) } | ForEach-Object {
        [pscustomobject]@{
            Port  = $_
            Label = Get-MtlPortLabel -Port $_
            State = 'libre'
        }
    })
    if ($free.Count -gt 0) {
        Write-Host ''
        Write-Host 'Libres (habitual MTL):' -ForegroundColor DarkGray
        $free | Format-Table -AutoSize Port, Label, State
    }
}

Write-MtlInfo 'Referencia: services/README.md, infra/compose/README.md'
