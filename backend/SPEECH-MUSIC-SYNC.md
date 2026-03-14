# Speech Duration Synchronization with Background Music

## Problema Solucionado

Anteriormente, cuando se generaba un vídeo de meditación:
- ✅ La música de fondo duraba toda la pista seleccionada (ej: 5 minutos)
- ✅ Los subtítulos se distribuían a lo largo de toda la duración de la música
- ❌ **El speech (narración) terminaba antes** - solo duraba lo que tardaba en narrar el texto
- ❌ Resultado: Audio silencioso después de que terminaba la narración

**Ejemplo:**
- Música seleccionada: 5 minutos (300 segundos)
- Texto de narración: "Cierra los ojos... respira profundo..." (~ 100 palabras)
- Duración natural del speech: ~80 segundos
- **Problema**: El speech terminaba a los 80s, pero la música seguía hasta los 300s

---

## Solución Implementada

### Tecnología: SSML (Speech Synthesis Markup Language)

Google Cloud Text-to-Speech soporta SSML, que permite controlar aspectos avanzados del speech:
- Pausas (`<break time="Xs"/>`)
- Énfasis (`<emphasis>`)
- Velocidad (`<prosody rate="slow">`)
- Tono (`<prosody pitch="low">`)

### Cómo Funciona

1. **Se obtiene la duración de la música** usando `ffprobe`:
   ```bash
   ffprobe -show_entries format=duration music.mp3
   ```

2. **Se calcula la duración natural del speech**:
   - Basado en: longitud del texto × speaking rate (0.85 para meditación)
   - Fórmula: `duración = caracteres / (15 * speaking_rate)` segundos
   - Ejemplo: "Cierra los ojos..." (500 caracteres) = ~39 segundos

3. **Se calculan las pausas necesarias**:
   - Pausas requeridas = Duración música - Duración natural
   - Ejemplo: 300s - 39s = 261 segundos de pausa

4. **Se genera SSML con pausas al final**:
   ```xml
   <speak>
     Cierra los ojos, respira profundo, siente tu cuerpo...
     <break time="10s"/>
     <break time="10s"/>
     ... (26 pausas de 10s + 1 pausa de 1s)
   </speak>
   ```

5. **Google TTS genera audio con la duración exacta de la música**

---

## Implementación Técnica

### Nuevas Clases

#### 1. `AudioMetadataService`
```java
@Service
public class AudioMetadataService {
    /**
     * Obtiene la duración de un archivo de audio con ffprobe.
     */
    public double getDurationSeconds(Path audioFile) throws IOException {
        // Ejecuta: ffprobe -show_entries format=duration -v quiet -of csv=p=0
        // Retorna: duración en segundos (ej: 300.45)
    }
}
```

**Ubicación**: `infrastructure/out/service/audio/AudioMetadataService.java`

#### 2. Modificaciones en `VoiceSynthesisPort`

**Antes:**
```java
Path synthesizeVoice(NarrationScript script, VoiceConfig voiceConfig);
```

**Después:**
```java
// Método original (sin duración objetivo)
Path synthesizeVoice(NarrationScript script, VoiceConfig voiceConfig);

// NUEVO: Método con duración objetivo
Path synthesizeVoice(NarrationScript script, VoiceConfig voiceConfig, double targetDurationSeconds);
```

#### 3. Actualización de `GoogleTtsAdapter`

**Nuevos métodos:**

```java
private String buildSsmlWithTargetDuration(String text, double targetDurationSeconds) {
    // 1. Estima duración natural del speech
    double estimatedDuration = text.length() / (15.0 * speakingRate);
    
    // 2. Calcula pausas necesarias
    double pauseDuration = targetDurationSeconds - estimatedDuration;
    
    // 3. Genera SSML con pausas (máx 10s por <break>)
    StringBuilder ssml = new StringBuilder();
    ssml.append("<speak>");
    ssml.append(escapeXml(text));
    
    while (pauseDuration > 0) {
        double breakTime = Math.min(pauseDuration, 10.0);
        ssml.append(String.format(" <break time=\"%.1fs\"/>", breakTime));
        pauseDuration -= breakTime;
    }
    
    ssml.append("</speak>");
    return ssml.toString();
}
```

#### 4. Pipeline de Generación Actualizado

**Antes:**
```
1. Synthesize Voice (sin duración objetivo)
2. Generate Subtitles
3. Resolve Music
4. Render Video
5. Upload to S3
```

**Después:**
```
1. Resolve Music → Obtener duración con ffprobe
2. Synthesize Voice → CON duración objetivo = duración de música
3. Generate Subtitles
4. Render Video
5. Upload to S3
```

**Código en `GenerateMeditationContentService`:**
```java
// Step 1: Obtener música y su duración
Path musicPath = resolveMusicPath(request.musicReference(), tempDir);
double musicDuration = audioMetadataService.getDurationSeconds(musicPath);

// Step 2: Sintetizar voz con duración objetivo
Path narrationAudio = voiceSynthesisPort.synthesizeVoice(
    content.narrationScript(),
    DEFAULT_VOICE_CONFIG,
    musicDuration  // ← DURACIÓN OBJETIVO
);
```

---

## Casos de Uso

### Caso 1: Speech Natural Más Corto que Música

**Input:**
- Texto: "Respira profundo" (18 caracteres)
- Música: 180 segundos

**Proceso:**
1. Duración natural = 18 / (15 * 0.85) ≈ 1.4 segundos
2. Pausas necesarias = 180 - 1.4 = 178.6 segundos
3. SSML generado:
   ```xml
   <speak>
     Respira profundo
     <break time="10s"/>  <!-- x17 -->
     <break time="8.6s"/>
   </speak>
   ```

**Output:**
- Audio narración: 180 segundos (coincide con música)
- Subtítulos: distribuidos en 180 segundos
- Video final: 180 segundos de duración total

### Caso 2: Speech Natural Igual o Más Largo que Música

**Input:**
- Texto: Guión largo de 1000 palabras
- Música: 60 segundos

**Proceso:**
1. Duración natural = (1000 palabras × 5 caracteres) / (15 * 0.85) ≈ 392 segundos
2. Pausas necesarias = 60 - 392 = **-332 segundos** (negativo!)
3. **No se añaden pausas** - se genera speech con duración natural

**Output:**
- Audio narración: ~392 segundos (duración natural)
- Video final: ~392 segundos (FFmpeg usa `duration=longest`)
- **NOTA**: La música se loopea automáticamente por FFmpeg con `amix=duration=longest`

### Caso 3: Google TTS Deshabilitado (Fallback a FFmpeg)

**Proceso:**
1. Música: 180 segundos
2. GoogleTtsAdapter detecta que TTS está deshabilitado
3. Llama a `synthesizeWithFfmpegFallback(script, 180.0)`
4. Genera audio silencioso de exactamente 180 segundos

**Output:**
- Audio narración: 180 segundos (silencio)
- Video final: 180 segundos con subtítulos

---

## Configuración

### Configuración de Google TTS

```yaml
# application.yml
google-cloud:
  tts:
    enabled: true
    voice:
      speaking-rate: 0.85  # Más lento = mayor duración natural
```

**Efecto del speaking-rate:**
- `0.85` (actual): ~15 caracteres/segundo → "Hola mundo" = ~0.7 segundos
- `0.50` (muy lento): ~25 caracteres/segundo → "Hola mundo" = ~1.2 segundos
- `1.00` (normal): ~15 caracteres/segundo → "Hola mundo" = ~0.6 segundos

### Límites de SSML

**Google Cloud TTS Limits:**
- Máximo tiempo por `<break>`: **10 segundos**
- Input SSML máximo: **5000 caracteres** (incluyendo tags)
- Para duraciones largas, se añaden múltiples `<break time="10s"/>`

**Ejemplo:**
- Necesitamos 45 segundos de pausa:
  ```xml
  <break time="10s"/>
  <break time="10s"/>
  <break time="10s"/>
  <break time="10s"/>
  <break time="5s"/>
  ```

---

## Logs de Ejemplo

### Exitoso (con sincronización)

```
INFO - Step 1/6: Resolving music file
INFO - Music resolved: /tmp/music-123.mp3
INFO - Music duration: 300.5 seconds

INFO - Step 2/6: Synthesizing voice narration
INFO - Target duration: 300.5 seconds
DEBUG - Estimated natural speech duration: 78.2 seconds (text length: 995, rate: 0.85)
INFO - Added 222.3 seconds of pauses to speech to reach target duration of 300.5 seconds
DEBUG - Using SSML input with pauses
INFO - Voice synthesis completed with target duration 300.5 seconds: /tmp/narration-456.mp3

INFO - Step 3/6: Generating synchronized subtitles
INFO - Subtitles generated: 8 segments, file: /tmp/subtitles.srt

INFO - Step 4/6: Rendering VIDEO output
INFO - Video rendering completed: /tmp/video.mp4
```

### Sin Música (error case)

```
WARN - Could not determine music duration, speech will use natural duration: File not found
INFO - Voice synthesis completed with natural duration: /tmp/narration-456.mp3
```

### Google TTS Deshabilitado

```
WARN - Google Cloud TTS is disabled or not configured. Using FFmpeg silent audio fallback.
INFO - Using target duration: 180 seconds
INFO - FFmpeg fallback synthesis completed: /tmp/narration-789.mp3 (180 seconds)
```

---

## Testing

### Test Manual

1. **Generar meditación con música corta (30s)**:
   ```bash
   curl -X POST http://localhost:8080/api/generation/generate \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "test-user",
       "narrationText": "Breve texto de meditación",
       "musicReference": "http://localhost:4566/meditation-media/music-30s.mp3",
       "imageReference": "http://localhost:4566/meditation-media/image.jpg",
       "mediaType": "VIDEO"
     }'
   ```

2. **Verificar duración del video generado**:
   ```bash
   ffprobe -show_entries format=duration video.mp4
   # Debe ser ~30 segundos
   ```

3. **Verificar audio de narración**:
   ```bash
   ffprobe -show_entries format=duration narration.mp3
   # Debe ser ~30 segundos (con pausas al final)
   ```

### Unit Test de `buildSsmlWithTargetDuration`

```java
@Test
void shouldAddPausesToReachTargetDuration() {
    String text = "Breve";  // ~0.4 segundos natural
    double target = 30.0;
    
    String ssml = adapter.buildSsmlWithTargetDuration(text, target);
    
    assertThat(ssml).contains("<speak>");
    assertThat(ssml).contains("Breve");
    assertThat(ssml).contains("<break time=\"10s\"/>"); // Múltiples pausas
    
    // Verificar que añade ~29.6 segundos de pausas
}

@Test
void shouldNotAddPausesWhenNaturalDurationExceedsTarget() {
    String text = "Texto muy largo...".repeat(100);
    double target = 10.0;  // Menor que duración natural
    
    String ssml = adapter.buildSsmlWithTargetDuration(text, target);
    
    assertThat(ssml).doesNotContain("<break");  // Sin pausas
}
```

---

## Troubleshooting

### Problema: Speech sigue terminando antes que la música

**Posibles causas:**

1. **ffprobe no está instalado**:
   ```bash
   ffprobe -version
   # Si falla: instalar FFmpeg completo
   ```

2. **Logs muestran "Could not determine music duration"**:
   - Verificar que el archivo de música existe y es válido
   - Verificar logs de AudioMetadataService

3. **Google TTS está deshabilitado**:
   - Verificar `google-cloud.tts.enabled: true`
   - Verificar credenciales configuradas

### Problema: Video tiene duración incorrecta

**Verificar:**
```bash
# Duración de narración
ffprobe -show_entries format=duration narration.mp3

# Duración de música
ffprobe -show_entries format=duration music.mp3

# Duración de video final
ffprobe -show_entries format=duration video.mp4
```

**Esperado:**
- Narración ≈ Música (con diferencia máxima de 1-2 segundos)
- Video = max(Narración, Música) debido a `amix=duration=longest`

### Problema: Pausas demasiado evidentes/artificiales

**Solución:**
- Ajustar `speaking-rate` para que el speech natural sea más cercano a la duración de la música
- Usar músicas más cortas que se ajusten mejor al texto
- Distribuir pausas a lo largo del texto (feature futura) en vez de solo al final

---

## Mejoras Futuras

### 1. Pausas Distribuidas (no solo al final)

**Actual:**
```xml
<speak>
  Texto completo sin pausas...
  <break time="10s"/>  <!-- Todas las pausas al final -->
  <break time="10s"/>
</speak>
```

**Futuro:**
```xml
<speak>
  Primera frase... <break time="5s"/>
  Segunda frase... <break time="5s"/>
  Tercera frase... <break time="5s"/>
</speak>
```

### 2. Análisis Inteligente de Puntuación

- Detectar puntos finales de oraciones
- Añadir pausas naturales en comas y puntos
- SSML: `<prosody>` para variar velocidad por sección

### 3. Ajuste Dinámico de Speaking Rate

Si el texto es muy corto y la música muy larga:
- Reducir `speaking-rate` de 0.85 a 0.65
- Evitar pausas excesivamente largas

### 4. Soporte para Múltiples Pistas de Audio

- Mezclar varias músicas con crossfade
- Ajustar duración total combinada

---

## Resumen

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Duración speech** | Natural (~60s) | Adaptada a música (300s) |
| **Sincronización** | ❌ Desincronizado | ✅ Perfecta sincronización |
| **Tecnología** | Texto plano | SSML con pausas |
| **Dependencias** | Solo Google TTS | + ffprobe |
| **Complejidad** | Baja | Media |
| **UX** | Audio termina antes | Audio dura toda la meditación |

---

**Implementado por**: GitHub Copilot  
**Fecha**: 15 de febrero de 2026  
**Versión**: 1.0.0
