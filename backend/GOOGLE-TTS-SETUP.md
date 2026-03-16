# Google Cloud Text-to-Speech - Setup Guide

This guide explains how to configure Google Cloud Text-to-Speech for meditation narration generation.

## Prerequisites

- Google Cloud account
- Project with billing enabled
- Google Cloud Text-to-Speech API enabled

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID**

---

## Step 2: Enable Text-to-Speech API

1. In Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Text-to-Speech API"
3. Click **Enable**

---

## Step 3: Create Service Account

1. Go to **IAM & Admin > Service Accounts**
2. Click **Create Service Account**
3. Fill in:
   - **Name**: `meditation-builder-tts`
   - **Description**: `Service account for Text-to-Speech narration generation`
4. Click **Create and Continue**
5. Select role: **Cloud Text-to-Speech API User**
6. Click **Done**

---

## Step 4: Generate Credentials JSON Key

1. In the Service Accounts list, find your new service account
2. Click the 3-dot menu → **Manage keys**
3. Click **Add Key > Create new key**
4. Select **JSON** format
5. Click **Create**
6. **Save the downloaded JSON file securely** (e.g., `google-tts-credentials.json`)

⚠️ **SECURITY WARNING**: Never commit this file to Git! Add it to `.gitignore`

---

## Step 5: Configure Application

You have **3 options** to provide credentials:

### Option 1: File Path (Recommended for local development)

1. Save the JSON key file to a secure location:
   ```
   C:\Users\YourUser\.gcp\meditation-builder-tts.json
   # or on Linux/Mac:
   /home/youruser/.gcp/meditation-builder-tts.json
   ```

2. Configure in `application-local.yml`:
   ```yaml
   google-cloud:
     tts:
       enabled: true
       credentials-path: C:\Users\YourUser\.gcp\meditation-builder-tts.json
   ```

### Option 2: Environment Variable (Recommended for Docker/Production)

1. Set environment variable:
   ```bash
   # Windows PowerShell
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\credentials.json"
   
   # Linux/Mac
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
   ```

2. Configure in `application.yml`:
   ```yaml
   google-cloud:
     tts:
       enabled: true
   ```

### Option 3: Base64-Encoded JSON (For Kubernetes/Cloud deployments)

1. Encode your JSON file to Base64:
   ```bash
   # Windows PowerShell
   $base64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("credentials.json"))
   echo $base64
   
   # Linux/Mac
   base64 -w 0 credentials.json
   ```

2. Set environment variable:
   ```bash
   # Windows PowerShell
   $env:GOOGLE_CREDENTIALS_JSON="<paste-base64-here>"
   
   # Linux/Mac
   export GOOGLE_CREDENTIALS_JSON="<paste-base64-here>"
   ```

3. Configure in `application.yml`:
   ```yaml
   google-cloud:
     tts:
       enabled: true
       credentials-json: ${GOOGLE_CREDENTIALS_JSON}
   ```

---

## Step 6: Enable Google TTS

Update `application-local.yml` or set environment variable:

```yaml
google-cloud:
  tts:
    enabled: true  # Set to true to use Google Cloud TTS
```

Or via environment variable:
```bash
export GOOGLE_TTS_ENABLED=true
```

---

## Configuration Options

All settings can be customized in `application.yml` or via environment variables:

```yaml
google-cloud:
  tts:
    # Enable/disable Google Cloud TTS
    enabled: ${GOOGLE_TTS_ENABLED:false}
    
    # Credentials (choose one method)
    credentials-path: ${GOOGLE_APPLICATION_CREDENTIALS:}
    credentials-json: ${GOOGLE_CREDENTIALS_JSON:}
    
    # Voice configuration
    voice:
      language-code: ${GOOGLE_TTS_LANGUAGE:es-ES}
      name: ${GOOGLE_TTS_VOICE_NAME:es-ES-Standard-B}
      gender: ${GOOGLE_TTS_GENDER:MALE}  # MALE, FEMALE, NEUTRAL
    
    # Audio configuration
    audio:
      encoding: ${GOOGLE_TTS_ENCODING:MP3}
      sample-rate: ${GOOGLE_TTS_SAMPLE_RATE:48000}
      speaking-rate: ${GOOGLE_TTS_SPEAKING_RATE:0.85}  # 0.25-4.0 (slower for meditation)
      pitch: ${GOOGLE_TTS_PITCH:0.0}  # -20.0 to 20.0
      volume-gain-db: ${GOOGLE_TTS_VOLUME:0.0}  # -96.0 to 16.0
```

### Available Spanish Voices

Premium voices (better quality):
- `es-ES-Neural2-A` - Female
- `es-ES-Neural2-B` - Male
- `es-ES-Neural2-C` - Female
- `es-ES-Neural2-D` - Female
- `es-ES-Neural2-E` - Female
- `es-ES-Neural2-F` - Male

Standard voices:
- `es-ES-Standard-A` - Female
- `es-ES-Standard-B` - Male (default)
- `es-ES-Standard-C` - Female
- `es-ES-Standard-D` - Female

WaveNet voices (high quality):
- `es-ES-Wavenet-B` - Male
- `es-ES-Wavenet-C` - Female
- `es-ES-Wavenet-D` - Female

> **Tip**: Neural2 voices offer the best quality for meditation narration.

---

## Testing

1. **Set `enabled: true`** in your configuration
2. **Restart the Spring Boot application**
3. **Generate a meditation** from the frontend
4. **Check logs** for:
   ```
   INFO - Initializing Google Cloud Text-to-Speech client...
   INFO - Google Cloud TTS client initialized successfully
   INFO - Synthesizing voice with Google Cloud TTS: X chars
   INFO - Google TTS synthesis completed: /tmp/narration-xxx.mp3 (Y bytes)
   ```

---

## Fallback Mode

If Google Cloud TTS is **disabled** or **fails**, the system automatically falls back to FFmpeg silent audio:

```
WARN - Google Cloud TTS is disabled or not configured. Using FFmpeg silent audio fallback.
INFO - Generating X seconds of silent audio for Y character script
```

This allows development and testing without Google Cloud credentials.

---

## Pricing

Google Cloud Text-to-Speech pricing (as of 2024):

- **Standard voices**: $4.00 / 1M characters
- **WaveNet voices**: $16.00 / 1M characters
- **Neural2 voices**: $16.00 / 1M characters
- **Free tier**: 0-1M characters/month (Standard), 0-1M characters/month (WaveNet/Neural2)

> **Example**: A 500-character meditation script costs ~$0.008 with Neural2 voices.

See [Google Cloud TTS Pricing](https://cloud.google.com/text-to-speech/pricing) for details.

---

## Troubleshooting

### Error: "Could not load the default credentials"

**Solution**: Verify credentials file path or environment variable:
```bash
# Check if file exists
ls -la /path/to/credentials.json

# Check environment variable
echo $GOOGLE_APPLICATION_CREDENTIALS
```

### Error: "Permission denied" or "Access denied"

**Solution**: Verify service account has **Cloud Text-to-Speech API User** role:
1. Go to **IAM & Admin > IAM**
2. Find your service account
3. Ensure it has the TTS role

### Error: "Text-to-Speech API has not been used"

**Solution**: Enable the API in your project:
1. Go to **APIs & Services > Library**
2. Search "Text-to-Speech"
3. Click **Enable**

### Using FFmpeg fallback instead of Google TTS

**Check**:
1. `google-cloud.tts.enabled: true` in config?
2. Credentials file exists and is valid JSON?
3. Check logs for initialization errors

---

## Security Best Practices

1. **Never commit credentials to Git**
   - Add to `.gitignore`:
     ```
     **/google-*.json
     **/*credentials*.json
     ```

2. **Use environment variables in production**
   - Avoid hardcoding paths in application.yml

3. **Rotate credentials regularly**
   - Create new service account keys periodically
   - Delete old keys

4. **Restrict service account permissions**
   - Only grant Text-to-Speech API User role
   - Don't use owner/editor roles

5. **Use Secret Management**
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager
   - Kubernetes Secrets

---

## Docker Configuration

For Docker deployments, mount credentials as a secret:

```yaml
# docker-compose.yml
services:
  meditation-builder:
    image: meditation-builder:latest
    environment:
      - GOOGLE_TTS_ENABLED=true
      - GOOGLE_APPLICATION_CREDENTIALS=/app/secrets/google-tts.json
    volumes:
      - ./secrets/google-tts.json:/app/secrets/google-tts.json:ro
```

Or use base64-encoded credentials:

```yaml
# docker-compose.yml
services:
  meditation-builder:
    image: meditation-builder:latest
    environment:
      - GOOGLE_TTS_ENABLED=true
      - GOOGLE_CREDENTIALS_JSON=${GOOGLE_CREDENTIALS_JSON}
```

---

## Quick Start Checklist

- [ ] Create Google Cloud project
- [ ] Enable Text-to-Speech API
- [ ] Create service account with TTS role
- [ ] Download JSON credentials file
- [ ] Save credentials securely (not in Git!)
- [ ] Configure `credentials-path` or `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] Set `google-cloud.tts.enabled: true`
- [ ] Restart application
- [ ] Test meditation generation
- [ ] Verify logs show "Google Cloud TTS client initialized"

---

**Need help?** Check the [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
