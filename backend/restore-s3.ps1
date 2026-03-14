# PowerShell script to restore missing files in LocalStack S3
$bucket = "meditation-media"

# Create bucket if it doesn't exist
Write-Host "Checking bucket $bucket..."
$bucketCheck = docker exec meditation-localstack awslocal s3 ls s3://$bucket 2>&1
if ($bucketCheck -match "NoSuchBucket") {
    Write-Host "Creating bucket $bucket..."
    docker exec meditation-localstack awslocal s3 mb s3://$bucket
}

# Create dummy local files
$dummyMedia = "$HOME\dummy_media.mp3"
$dummySubs = "$HOME\dummy_subs.srt"
[byte[]]$dummyData = 1..5120 | ForEach-Object { 0 }
[System.IO.File]::WriteAllBytes($dummyMedia, $dummyData)
"1`n00:00:01,000 --> 00:00:10,000`nEsta es una meditación de prueba." | Out-File -FilePath $dummySubs -Encoding utf8

# Get COMPLETED meditations from DB
Write-Host "Getting meditations from DB..."
$query = "SELECT output_media_url, subtitle_url FROM generation.meditation_output WHERE status = 'COMPLETED';"
$dbOutput = docker exec meditation-postgres psql -U meditation_user -d meditation -t -c $query

# Parse and sync
foreach ($line in $dbOutput) {
    if ($line -match "generation/.*") {
        $files = $line -split " " | Where-Object { $_ -like "*generation/*" }
        foreach ($file in $files) {
            $filename = ($file -split "/")[-1]
            $localFile = if ($filename -like "*.mp3" -or $filename -like "*.mp4") { $dummyMedia } else { $dummySubs }
            
            Write-Host "Uploading $file..."
            # Simple way to upload without complex volume mapping: use the container's stdin or copy
            docker cp $localFile "meditation-localstack:/tmp/upload"
            docker exec meditation-localstack awslocal s3 cp /tmp/upload s3://$bucket/$file
        }
    }
}

Write-Host "Restore complete."
Remove-Item $dummyMedia, $dummySubs
