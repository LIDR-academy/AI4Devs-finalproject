# Google Cloud Text-to-Speech Integration - Implementation Summary

## ✅ What Has Been Implemented

### 1. Dependencies
- ✅ Added `google-cloud-texttospeech:2.40.0` to `pom.xml`

### 2. Configuration Classes
- ✅ `GoogleCloudTtsConfig.java` - Spring Boot configuration with 3 authentication methods:
  - File path (credentials-path)
  - Base64-encoded JSON (credentials-json)
  - Application Default Credentials (env var)
- ✅ Automatic `TextToSpeechClient` bean creation when enabled

### 3. Adapter Implementation
- ✅ `GoogleTtsAdapter.java` - Updated with:
  - Real Google Cloud TTS integration
  - Automatic fallback to FFmpeg silent audio if disabled/fails
  - Configurable voice settings (language, voice name, gender)
  - Configurable audio settings (sample rate, speaking rate, pitch, volume)

### 4. Configuration Files
- ✅ `application.yml` - Added Google TTS configuration section with:
  - Enable/disable flag
  - Credentials paths
  - Voice settings (Spanish by default)
  - Audio quality settings (optimized for meditation: 0.85 speaking rate)
- ✅ `application-local.yml.example` - Template with all configuration options

### 5. Documentation
- ✅ `GOOGLE-TTS-SETUP.md` - Complete setup guide (7 pages) with:
  - Step-by-step Google Cloud setup
  - 3 authentication methods
  - Voice selection guide
  - Troubleshooting section
  - Security best practices
  - Docker/Kubernetes configuration
- ✅ `GOOGLE-TTS-QUICKSTART.md` - 3-minute quick start guide
- ✅ `setup-google-tts.ps1` - Interactive PowerShell setup script

### 6. Security
- ✅ Updated `.gitignore` with comprehensive credential patterns:
  - `**/google-*.json`
  - `**/*credentials*.json`
  - `.gcp/`
  - And more...

---

## 🚀 How to Use

### Quick Setup (3 steps)

1. **Get Google Cloud Credentials**
   - Follow: `backend/GOOGLE-TTS-QUICKSTART.md`
   - Download JSON key file

2. **Configure**
   ```powershell
   # Option A: Run setup script
   cd backend
   .\setup-google-tts.ps1
   
   # Option B: Manual configuration
   # Edit application-local.yml:
   google-cloud:
     tts:
       enabled: true
       credentials-path: C:\Users\YourUser\.gcp\meditation-tts.json
   ```

3. **Restart Application**
   ```bash
   mvn spring-boot:run
   ```

### Verify Installation

Check logs for:
```
✓ INFO - Initializing Google Cloud Text-to-Speech client...
✓ INFO - Google Cloud TTS client initialized successfully
```

When generating meditation:
```
✓ INFO - Synthesizing voice with Google Cloud TTS: X chars
✓ INFO - Google TTS synthesis completed: /tmp/narration-xxx.mp3 (Y bytes)
```

---

## 🔧 Configuration Options

### Enable/Disable

```yaml
google-cloud:
  tts:
    enabled: false  # Set to true to use Google Cloud TTS
```

Or via environment variable:
```bash
export GOOGLE_TTS_ENABLED=true
```

### Voice Selection

**Recommended for meditation:**

| Voice | Gender | Quality | Speaking Rate |
|-------|--------|---------|---------------|
| `es-ES-Neural2-B` | Male | ⭐⭐⭐⭐⭐ | 0.85 (calm) |
| `es-ES-Neural2-A` | Female | ⭐⭐⭐⭐⭐ | 0.85 (calm) |

Configure in `application.yml`:
```yaml
google-cloud:
  tts:
    voice:
      name: es-ES-Neural2-B
      gender: MALE
      language-code: es-ES
    audio:
      speaking-rate: 0.85  # Slower for meditation (0.8-0.9)
      pitch: 0.0
      volume-gain-db: 0.0
```

### Authentication Methods

**Priority order:**

1. `credentials-json` (Base64-encoded, for containers)
2. `credentials-path` (File path, for local dev)
3. `GOOGLE_APPLICATION_CREDENTIALS` (Environment variable)

---

## 🔄 Fallback Behavior

### When Google TTS is Disabled
```yaml
google-cloud.tts.enabled: false
```
→ Uses **FFmpeg silent audio** (duration estimated from text length)

### When Google TTS Fails
→ Automatically falls back to **FFmpeg silent audio**

Logs will show:
```
WARN - Google Cloud TTS failed: <error>. Falling back to FFmpeg.
INFO - Generating X seconds of silent audio
```

---

## 💰 Cost Estimation

**Google Cloud Text-to-Speech Pricing:**

- **Free tier**: 1M characters/month (Standard) + 1M characters/month (Neural2/WaveNet)
- **Neural2 voices**: $16 per million characters
- **Standard voices**: $4 per million characters

**Example costs:**

| Meditation Length | Characters | Cost (Neural2) | Cost (Standard) |
|-------------------|------------|----------------|-----------------|
| 100 words | ~500 | $0.008 | $0.002 |
| 300 words | ~1,500 | $0.024 | $0.006 |
| 1,000 words | ~5,000 | $0.080 | $0.020 |

**For typical meditation (300 words):**
- Neural2 voice: ~$0.024 (less than 3 cents)
- Within free tier: First 42,000 meditations/month FREE

---

## 📁 Files Created/Modified

### New Files
```
backend/
├── src/main/java/.../infrastructure/config/
│   └── GoogleCloudTtsConfig.java          ← Spring Boot config
├── src/main/resources/
│   └── application-local.yml.example      ← Configuration template
├── GOOGLE-TTS-SETUP.md                    ← Complete setup guide
├── GOOGLE-TTS-QUICKSTART.md               ← Quick start guide
├── setup-google-tts.ps1                   ← Setup script
└── IMPLEMENTATION-SUMMARY.md              ← This file
```

### Modified Files
```
backend/
├── pom.xml                                ← Added Google TTS dependency
├── src/main/resources/application.yml     ← Added TTS configuration
├── src/main/java/.../GoogleTtsAdapter.java ← Real TTS implementation
└── .gitignore                             ← Added credential patterns
```

---

## ✅ Testing Checklist

Before using in production:

- [ ] Google Cloud project created
- [ ] Text-to-Speech API enabled
- [ ] Service account created with TTS role
- [ ] JSON key downloaded and secured
- [ ] Credentials configured (file path or env var)
- [ ] `google-cloud.tts.enabled: true` set
- [ ] Application restarted
- [ ] Test meditation generated successfully
- [ ] Logs confirm "Google Cloud TTS client initialized"
- [ ] Audio file has actual speech (not silent)
- [ ] Credentials added to `.gitignore`

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Still using FFmpeg fallback | Check `enabled: true` and credentials path |
| "Could not load credentials" | Verify JSON file exists and is valid |
| "Permission denied" | Check service account has TTS API User role |
| "API not enabled" | Enable Text-to-Speech API in Console |
| Application fails to start | Set `enabled: false` to use fallback mode |

**Full troubleshooting**: See `GOOGLE-TTS-SETUP.md`

---

## 🔒 Security Notes

### ⚠️ CRITICAL
- **NEVER commit credentials to Git**
- Credentials are now in `.gitignore`
- Use environment variables in production
- Rotate credentials regularly

### Best Practices
1. Store credentials in secure location (not in project folder)
2. Use Secret Management in production:
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager
   - Kubernetes Secrets
3. Restrict service account to TTS API only
4. Monitor API usage and costs

---

## 📚 Additional Resources

- [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
- [Voice Selection Guide](https://cloud.google.com/text-to-speech/docs/voices)
- [SSML Support](https://cloud.google.com/text-to-speech/docs/ssml)
- [Pricing Calculator](https://cloud.google.com/products/calculator)

---

## 🎯 Next Steps

1. **Get Google Cloud credentials** (follow GOOGLE-TTS-QUICKSTART.md)
2. **Run setup script**: `.\setup-google-tts.ps1`
3. **Restart application**
4. **Test meditation generation**
5. **Fine-tune voice settings** (speaking rate, pitch, voice selection)

---

**Questions?** Check the documentation or open an issue.

**Ready to use?** Just set `enabled: true` and provide your credentials!
