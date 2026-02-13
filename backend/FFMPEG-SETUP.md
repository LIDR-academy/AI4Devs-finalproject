# FFmpeg Setup for Meditation Builder

## Overview

The Meditation Builder application uses FFmpeg to render audio and video meditation content. FFmpeg must be installed and accessible to the Spring Boot application.

## Installation Options

### Option 1: Install FFmpeg Locally (Recommended for Development)

#### Windows

1. **Download FFmpeg:**
   - Visit https://www.gyan.dev/ffmpeg/builds/
   - Download the "ffmpeg-release-full.7z" build
   - Or use direct link: https://www.gyan.dev/ffmpeg/builds/ffmpeg-git-full.7z

2. **Extract:**
   - Extract to `C:\ffmpeg` (or your preferred location)
   - The folder structure should be: `C:\ffmpeg\bin\ffmpeg.exe`

3. **Add to PATH (Option A - System-wide):**
   - Open "Environment Variables" in Windows Settings
   - Edit the "Path" variable
   - Add: `C:\ffmpeg\bin`
   - Restart your IDE/terminal

4. **Configure in Application (Option B - App-specific):**
   - Edit `backend/src/main/resources/application-local.yml`
   - Set the FFmpeg path:
     ```yaml
     ffmpeg:
       path: C:/ffmpeg/bin/ffmpeg.exe
       enable-fallback: false
     ```

5. **Verify Installation:**
   ```bash
   ffmpeg -version
   ```

#### macOS

```bash
# Using Homebrew
brew install ffmpeg

# Verify
ffmpeg -version
```

#### Linux (Ubuntu/Debian)

```bash
# Using apt
sudo apt update
sudo apt install ffmpeg

# Verify
ffmpeg -version
```

### Option 2: Run Application in Docker

If you prefer to run the Spring Boot application in Docker (where FFmpeg is pre-configured):

```bash
cd backend
docker-compose up app
```

The application will be available at http://localhost:8080

## Configuration

### Application Properties

The FFmpeg configuration is managed in `application.yml`:

```yaml
ffmpeg:
  path: ${FFMPEG_PATH:ffmpeg}          # Path to FFmpeg executable
  enable-fallback: ${FFMPEG_ENABLE_FALLBACK:true}  # Enable fallback mode
```

### Environment Variables

You can also configure via environment variables:

- `FFMPEG_PATH`: Path to FFmpeg executable (e.g., `C:/ffmpeg/bin/ffmpeg.exe`)
- `FFMPEG_ENABLE_FALLBACK`: `true` or `false`

### Fallback Mode

**Development Mode (fallback enabled):**
- If FFmpeg is not found, the application will copy the narration audio as output
- Useful for testing other parts of the pipeline
- Set `ffmpeg.enable-fallback: true`

**Production Mode (fallback disabled):**
- If FFmpeg fails, the application will throw an exception
- Ensures you never deploy without proper media rendering
- Set `ffmpeg.enable-fallback: false`

## Troubleshooting

### "Cannot run program 'ffmpeg': CreateProcess error=2"

**Cause:** FFmpeg is not in the system PATH or the configured path is incorrect.

**Solution:**
1. Verify FFmpeg is installed: `ffmpeg -version`
2. If not in PATH, configure the full path in `application-local.yml`:
   ```yaml
   ffmpeg:
     path: C:/ffmpeg/bin/ffmpeg.exe
   ```
3. Restart the application

### FFmpeg Command Fails with Exit Code

**Check logs** for the FFmpeg output:
- Set logging level to DEBUG: `logging.level.com.hexagonal.meditation.generation.infrastructure.out.adapter.ffmpeg: DEBUG`
- Check console logs for FFmpeg error messages

**Common issues:**
- Input file not found
- Invalid codec or format
- Insufficient disk space

### Windows Path Issues

If using Windows paths in configuration, use forward slashes or escape backslashes:
- ✅ `C:/ffmpeg/bin/ffmpeg.exe`
- ✅ `C:\\ffmpeg\\bin\\ffmpeg.exe`
- ❌ `C:\ffmpeg\bin\ffmpeg.exe` (will not work)

## Testing FFmpeg Integration

Run a simple test to verify FFmpeg is working:

```bash
# From the backend directory
mvn test -Dtest=FfmpegAudioRendererAdapterTest
mvn test -Dtest=FfmpegVideoRendererAdapterTest
```

## Required FFmpeg Features

The application requires FFmpeg with support for:
- **Video codecs:** H.264 (libx264)
- **Audio codecs:** AAC, MP3 (libmp3lame)
- **Filters:** amix, loudnorm, scale, subtitles
- **Formats:** MP4, MP3, SRT

Most standard FFmpeg builds include these by default.

## Performance Considerations

- FFmpeg rendering can be CPU-intensive
- Video rendering takes longer than audio (typically 10-30 seconds for a 5-minute meditation)
- Consider using a dedicated rendering queue for production environments

## Docker FFmpeg Container

The `backend/docker-compose.yml` includes a pre-configured FFmpeg container:

```yaml
ffmpeg:
  image: jrottenberg/ffmpeg:6.1-alpine
  container_name: meditation-ffmpeg
```

This is primarily used for containerized deployments. For local development, installing FFmpeg locally is simpler.
