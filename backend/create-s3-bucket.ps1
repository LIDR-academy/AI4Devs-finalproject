# create-s3-bucket.ps1 — Manually create the meditation-media bucket in LocalStack
# Usage: .\create-s3-bucket.ps1

$env:AWS_ACCESS_KEY_ID     = "test"
$env:AWS_SECRET_ACCESS_KEY = "test"
$env:AWS_DEFAULT_REGION    = "us-east-1"

$endpoint  = "http://localhost:4566"
$bucket    = "meditation-media"

Write-Host "Creating S3 bucket '$bucket' in LocalStack ($endpoint)..."
aws --endpoint-url=$endpoint s3 mb "s3://$bucket"

Write-Host "Listing buckets to confirm:"
aws --endpoint-url=$endpoint s3 ls
