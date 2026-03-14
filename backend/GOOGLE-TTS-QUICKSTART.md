# Google Cloud Text-to-Speech - Quick Setup

## 🎯 Quick Start (3 minutes)

### 1. Get Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable **Text-to-Speech API** (APIs & Services → Library)
4. Create a **Service Account** (IAM & Admin → Service Accounts)
5. Assign role: **Cloud Text-to-Speech API User**
6. Download **JSON key file**

📖 **Detailed guide**: See [GOOGLE-TTS-SETUP.md](./GOOGLE-TTS-SETUP.md)

### 2. Configure Application

**Option A: File Path** (easiest for local dev)

1. Save your JSON key to: `C:\Users\YourUser\.gcp\meditation-tts.json`

2. Edit `src/main/resources/application-local.yml`:
   ```yaml
   google-cloud:
     tts:
       enabled: true
       credentials-path: C:\Users\YourUser\.gcp\meditation-tts.json
   ```

**Option B: Environment Variable**

```powershell
# Windows PowerShell
$env:GOOGLE_TTS_ENABLED = "true"
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\credentials.json"

# Linux/Mac
export GOOGLE_TTS_ENABLED=true
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### 3. Restart Application

```bash
mvn spring-boot:run
```

### 4. Verify

Generate a meditation and check logs for:
```
✓ INFO - Initializing Google Cloud Text-to-Speech client...
✓ INFO - Google Cloud TTS client initialized successfully
✓ INFO - Synthesizing voice with Google Cloud TTS: X chars
✓ INFO - Google TTS synthesis completed
```

---

## 🔧 Configuration Options

### Voice Selection

**Spanish voices** (recommended for meditation):

| Voice Name | Gender | Quality | Notes |
|------------|--------|---------|-------|
| `es-ES-Neural2-B` | Male | ⭐⭐⭐⭐⭐ | **Best for meditation** |
| `es-ES-Neural2-A` | Female | ⭐⭐⭐⭐⭐ | Premium quality |
| `es-ES-Wavenet-B` | Male | ⭐⭐⭐⭐ | High quality |
| `es-ES-Standard-B` | Male | ⭐⭐⭐ | Good (cheaper) |

Configure in `application-local.yml`:
```yaml
google-cloud:
  tts:
    voice:
      name: es-ES-Neural2-B  # Change to your preferred voice
      gender: MALE
      language-code: es-ES
```

### Audio Settings

```yaml
google-cloud:
  tts:
    audio:
      speaking-rate: 0.85  # 0.8-0.9 recommended for calm meditation
      pitch: 0.0           # -5.0 to 5.0 for voice variation
      volume-gain-db: 0.0  # Adjust overall volume
```

---

## 💰 Pricing

- **First 1M characters/month**: FREE
- **Neural2/WaveNet**: $16/million characters
- **Standard voices**: $4/million characters

**Example**: 500-character meditation ≈ **$0.008** (less than 1 cent)

---

## 🔄 Fallback Mode

If Google TTS is **disabled** or **fails**, the system automatically uses **FFmpeg silent audio**:

```yaml
google-cloud:
  tts:
    enabled: false  # Uses FFmpeg fallback
```

This allows development without Google Cloud credentials.

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Could not load default credentials" | Check `credentials-path` exists and is valid JSON |
| "Permission denied" | Verify service account has **Cloud Text-to-Speech API User** role |
| "API not enabled" | Enable Text-to-Speech API in Google Cloud Console |
| Still using FFmpeg fallback | Check `enabled: true` and credentials are configured |

**Full troubleshooting guide**: See [GOOGLE-TTS-SETUP.md](./GOOGLE-TTS-SETUP.md)

---

## 📁 Files

- `GOOGLE-TTS-SETUP.md` - Complete setup guide with all details
- `application-local.yml.example` - Configuration template
- `GoogleCloudTtsConfig.java` - Spring Boot configuration class
- `GoogleTtsAdapter.java` - TTS implementation with fallback

---

## ✅ Security Checklist

- [ ] Never commit credentials JSON to Git
- [ ] Add `*credentials*.json` to `.gitignore`
- [ ] Use environment variables in production
- [ ] Restrict service account to TTS API only
- [ ] Rotate credentials regularly

---

**Need help?** Open an issue or check the [detailed setup guide](./GOOGLE-TTS-SETUP.md)
