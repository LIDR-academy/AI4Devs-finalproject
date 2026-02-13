# Manual FFmpeg Installation (Windows)

Si el script automático falla, sigue estos pasos manuales:

## Opción 1: Instalación Manual Rápida (5 minutos)

### Paso 1: Descargar FFmpeg
1. Abre tu navegador
2. Ve a: https://www.gyan.dev/ffmpeg/builds/
3. Descarga: **ffmpeg-release-essentials.zip** (≈50 MB)
   - O usa el link directo: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip

### Paso 2: Extraer
1. Ve a tu carpeta de Descargas
2. Haz clic derecho en `ffmpeg-release-essentials.zip`
3. Selecciona "Extraer todo..."
4. Extrae a `C:\` (raíz del disco C)
5. Renombra la carpeta extraída a `ffmpeg` (debería quedar: `C:\ffmpeg`)

### Paso 3: Verificar estructura
Asegúrate de que la estructura sea:
```
C:\ffmpeg\
  ├── bin\
  │   ├── ffmpeg.exe  ← Este es el ejecutable principal
  │   ├── ffplay.exe
  │   └── ffprobe.exe
  ├── doc\
  └── presets\
```

### Paso 4: Agregar al PATH de Windows
1. Presiona `Windows + R`
2. Escribe `sysdm.cpl` y presiona Enter
3. Ve a la pestaña "Opciones avanzadas"
4. Haz clic en "Variables de entorno..."
5. En la sección "Variables de usuario":
   - Selecciona la variable `Path`
   - Haz clic en "Editar..."
   - Haz clic en "Nuevo"
   - Escribe: `C:\ffmpeg\bin`
   - Haz clic en "Aceptar" en todos los diálogos

### Paso 5: Verificar
1. **Cierra VS Code completamente**
2. Abre una nueva terminal PowerShell
3. Ejecuta:
   ```powershell
   ffmpeg -version
   ```
4. Deberías ver algo como:
   ```
   ffmpeg version N-XXX-gXXX Copyright (c) 2000-2024 the FFmpeg developers
   ```

---

## Opción 2: Usar Chocolatey (si ya lo tienes instalado)

```powershell
# Ejecutar como Administrador
choco install ffmpeg
```

---

## Opción 3: Usar Scoop (si ya lo tienes instalado)

```powershell
scoop install ffmpeg
```

---

## Opción 4: Configurar ruta personalizada en la aplicación

Si no quieres agregar FFmpeg al PATH del sistema, puedes configurar la ruta en tu aplicación:

1. Edita `backend/src/main/resources/application-local.yml`
2. Agrega o modifica:
   ```yaml
   ffmpeg:
     path: C:/ffmpeg/bin/ffmpeg.exe  # Usa / en vez de \
     enable-fallback: false
   ```
3. Reinicia la aplicación Spring Boot

---

## Solución de Problemas

### Error: "ffmpeg is not recognized..."

**Causa:** FFmpeg no está en el PATH o no reiniciaste la terminal.

**Solución:**
1. Cierra VS Code completamente
2. Abre VS Code nuevamente
3. Intenta de nuevo: `ffmpeg -version`

### Error: "Access Denied" al agregar al PATH

**Causa:** Permisos insuficientes.

**Solución 1:** Agregar a PATH de usuario (no requiere Admin):
- En Variables de entorno, usa la sección "Variables de usuario" en lugar de "Variables del sistema"

**Solución 2:** Configurar en la aplicación:
- Usa la Opción 4 arriba (configurar `ffmpeg.path` en `application-local.yml`)

### FFmpeg instalado pero la aplicación no lo encuentra

**Síntoma:** Logs muestran "FFmpeg not found or IO error"

**Solución:**
1. Verifica que FFmpeg está en PATH:
   ```powershell
   where.exe ffmpeg
   ```
   Debería mostrar: `C:\ffmpeg\bin\ffmpeg.exe`

2. Si no aparece, reinicia VS Code

3. Si sigue sin funcionar, configura la ruta absoluta en `application-local.yml`:
   ```yaml
   ffmpeg:
     path: C:/ffmpeg/bin/ffmpeg.exe
   ```

### El script PowerShell no se ejecuta

**Error:** "... cannot be loaded because running scripts is disabled..."

**Solución:**
```powershell
# Ejecutar el script con bypass de política
powershell -ExecutionPolicy Bypass -File install-ffmpeg.ps1
```

---

## Verificación Final

Después de instalar, verifica con estos comandos:

```powershell
# Verificar versión
ffmpeg -version

# Debería mostrar algo como:
# ffmpeg version N-XXX-gXXX Copyright (c) 2000-2024...
# configuration: ...
# libavcodec     XX.XX.XXX
# ...

# Verificar ubicación
where.exe ffmpeg

# Debería mostrar:
# C:\ffmpeg\bin\ffmpeg.exe
```

---

## Para la aplicación Meditation Builder

Una vez instalado FFmpeg, la aplicación lo usará automáticamente. Los logs deberían mostrar:

```
INFO ... FfmpegAudioRendererAdapter : Rendering audio: ...
DEBUG ... FfmpegAudioRendererAdapter : Executing FFmpeg command: ...
INFO ... FfmpegAudioRendererAdapter : Audio rendering completed via FFmpeg: ...
```

En lugar de:

```
WARN ... FfmpegAudioRendererAdapter : FFmpeg not found or IO error: ...
WARN ... FfmpegAudioRendererAdapter : Falling back to copy for development
```

---

## Contacto

Si sigues teniendo problemas, verifica:
1. Que `C:\ffmpeg\bin\ffmpeg.exe` existe
2. Que reiniciaste VS Code después de modificar el PATH
3. Los logs de la aplicación Spring Boot para ver el error exacto
