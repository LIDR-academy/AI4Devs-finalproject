# LocalStack S3 Setup - Troubleshooting Guide

## Problem: "The specified bucket does not exist"

### Error Message
```
java.lang.RuntimeException: Failed to upload media to S3: The specified bucket does not exist 
(Service: S3, Status Code: 404, ...)
```

### Root Cause
The S3 bucket `meditation-media` does not exist in LocalStack.

---

## Solution 1: Automatic Creation (Recommended)

The bucket is created automatically when you start LocalStack with docker-compose.

**Steps:**
1. Stop current containers:
   ```powershell
   cd backend
   docker-compose down
   ```

2. Restart LocalStack (with auto-initialization):
   ```powershell
   docker-compose up -d localstack
   ```

3. Verify bucket creation:
   ```powershell
   docker-compose logs localstack
   ```
   
   You should see:
   ```
   LocalStack is ready. Creating S3 bucket...
   make_bucket: meditation-media
   S3 bucket 'meditation-media' created successfully
   ```

4. Restart your Spring Boot application

---

## Solution 2: Manual Creation (if automatic fails)

Run the PowerShell script:
```powershell
cd backend
.\create-s3-bucket.ps1
```

This will:
- Check if LocalStack is running
- Create the `meditation-media` bucket
- Verify bucket creation
- Display current configuration

---

## Solution 3: AWS CLI Manual Commands

If you prefer manual control:

1. **Check LocalStack is running:**
   ```powershell
   curl http://localhost:4566/_localstack/health
   ```

2. **Set AWS credentials (for LocalStack):**
   ```powershell
   $env:AWS_ACCESS_KEY_ID="test"
   $env:AWS_SECRET_ACCESS_KEY="test"
   ```

3. **Create bucket:**
   ```powershell
   aws --endpoint-url=http://localhost:4566 s3 mb s3://meditation-media
   ```

4. **Verify bucket exists:**
   ```powershell
   aws --endpoint-url=http://localhost:4566 s3 ls
   ```

---

## Verification Checklist

Before starting your Spring Boot application, verify:

- [ ] LocalStack is running: `docker ps | grep localstack`
- [ ] LocalStack is healthy: `curl http://localhost:4566/_localstack/health`
- [ ] Bucket exists: `aws --endpoint-url=http://localhost:4566 s3 ls | grep meditation-media`
- [ ] Configuration matches:
  - `application-local.yml`: `bucket-name: meditation-media`
  - `application-local.yml`: `endpoint: http://localhost:4566`
  - `application-local.yml`: `access-key: test`

---

## Common Issues

### Issue 1: LocalStack not starting
**Symptom:** Cannot connect to http://localhost:4566

**Solution:**
```powershell
# Check if port 4566 is in use
netstat -an | findstr :4566

# Restart LocalStack
docker-compose restart localstack

# Check logs
docker-compose logs -f localstack
```

### Issue 2: Bucket created but still getting 404
**Symptom:** Bucket exists but application cannot find it

**Solution:**
1. Check configuration in `application-local.yml`:
   ```yaml
   aws:
     s3:
       endpoint: http://localhost:4566
       bucket-name: meditation-media
   ```

2. Verify Spring profile is active:
   ```powershell
   # In application startup logs, look for:
   # "The following profiles are active: local"
   ```

3. Restart Spring Boot application

### Issue 3: Permission denied errors
**Symptom:** 403 Forbidden errors

**Solution:**
LocalStack uses dummy credentials. Ensure your configuration has:
```yaml
aws:
  credentials:
    access-key: test
    secret-key: test
```

### Issue 4: Script execution disabled
**Symptom:** PowerShell script won't run

**Solution:**
```powershell
# Allow script execution (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run with bypass
powershell -ExecutionPolicy Bypass -File .\create-s3-bucket.ps1
```

---

## Environment Configuration

### Development (Local)
```yaml
# application-local.yml
aws:
  region: us-east-1
  s3:
    endpoint: http://localhost:4566  # LocalStack
    bucket-name: meditation-media
  credentials:
    access-key: test
    secret-key: test
```

### Production
```yaml
# application.yml or environment variables
aws:
  region: us-east-1
  s3:
    endpoint: # Empty (use real AWS S3)
    bucket-name: meditation-media-prod
  credentials:
    access-key: ${AWS_ACCESS_KEY_ID}
    secret-key: ${AWS_SECRET_ACCESS_KEY}
```

---

## Testing Bucket Access

### Upload Test File
```powershell
# Create test file
echo "test content" > test.txt

# Upload to LocalStack
aws --endpoint-url=http://localhost:4566 s3 cp test.txt s3://meditation-media/test.txt

# List bucket contents
aws --endpoint-url=http://localhost:4566 s3 ls s3://meditation-media/

# Download test file
aws --endpoint-url=http://localhost:4566 s3 cp s3://meditation-media/test.txt downloaded.txt

# Cleanup
Remove-Item test.txt, downloaded.txt
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `docker-compose up -d localstack` | Start LocalStack |
| `docker-compose logs localstack` | View initialization logs |
| `.\create-s3-bucket.ps1` | Create bucket manually |
| `aws --endpoint-url=http://localhost:4566 s3 ls` | List all buckets |
| `docker-compose restart localstack` | Restart LocalStack |
| `docker-compose down -v` | Reset all data |

---

## Additional Resources

- **LocalStack Documentation**: https://docs.localstack.cloud/
- **AWS CLI Installation**: https://aws.amazon.com/cli/
- **LocalStack Init Scripts**: https://docs.localstack.cloud/references/init-hooks/
- **S3 API Reference**: https://docs.aws.amazon.com/AmazonS3/latest/API/

---

**Still having issues?** Check the [docker-compose.yml](docker-compose.yml) configuration and verify the `init-localstack.sh` script is mounted correctly.
