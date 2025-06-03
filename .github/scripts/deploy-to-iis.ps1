param(
    [string]$sourcePath,
    [string]$destinationServer,
    [string]$siteName,
    [string]$username,
    [string]$password
)

# Información de depuración
Write-Host "Desplegando desde: $sourcePath"
Write-Host "Servidor destino: $destinationServer"
Write-Host "Nombre del sitio: $siteName"

# Ejecutar MSDeploy
$msdeployPath = "C:\Program Files\IIS\Microsoft Web Deploy V3\msdeploy.exe"
$arguments = @(
    "-verb:sync",
    "-source:contentPath=$sourcePath",
    "-dest:contentPath=$siteName,computerName=$destinationServer/msdeploy.axd,username=$username,password=$password,authType=Basic",
    "-allowUntrusted",
    "-enableRule:DoNotDeleteRule"
)

# Ejecutar el comando
& $msdeployPath @arguments

# Devolver el código de salida
exit $LASTEXITCODE
