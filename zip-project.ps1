# Get current timestamp for unique zip name
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Default project path is current directory
$projectPath = Get-Location
$projectName = Split-Path $projectPath -Leaf

# Create zip file name with timestamp
$zipName = "${projectName}_${timestamp}.zip"
$zipPath = Join-Path $projectPath $zipName

# Files and folders to exclude
$excludePatterns = @(
    '*.zip',
    '*\node_modules\*',
    '*\.git\*',
    '*\bin\*',
    '*\obj\*',
    '*\.vs\*',
    '*\__pycache__\*',
    '*\.env',
    '*\.venv\*',
    '*.pyc'
)

Write-Host "Creating zip file: $zipName"
Write-Host "Excluding patterns: $($excludePatterns -join ', ')`n"

try {
    # Compress the folder while excluding specified patterns
    Get-ChildItem -Path $projectPath -Exclude $excludePatterns |
        Where-Object {
            $item = $_
            -not ($excludePatterns | Where-Object { $item.FullName -like $_})
        } |
        Compress-Archive -DestinationPath $zipPath -Force

    Write-Host "`nProject successfully zipped to: $zipPath" -ForegroundColor Green
}
catch {
    Write-Host "Error creating zip file: $_" -ForegroundColor Red
}