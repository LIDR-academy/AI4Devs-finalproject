### HU-011: Subir Imagen/Video para Enviar en Mensaje

**Como** usuario autenticado en un chat,
**quiero** subir archivos multimedia (imágenes, audios, videos) para incluirlos en mis mensajes,
**para que** pueda crear mensajes condicionados ricos con contenido visual o audiovisual bloqueado.

#### Criterios de Aceptación

- [ ] El sistema debe permitir adjuntar archivo desde el botón "📎" en el chat
- [ ] El sistema debe abrir el selector de archivos del dispositivo
- [ ] El sistema debe aceptar tipos de archivo:
  - Imágenes: JPG, JPEG, PNG, GIF, WebP (máximo 10MB)
  - Audios: MP3, M4A, AAC, OGG, WAV (máximo 25MB)
  - Videos: MP4, MOV, AVI, WebM (máximo 100MB)
- [ ] El sistema debe validar tipo MIME real del archivo (no solo extensión)
- [ ] El sistema debe validar tamaño del archivo según tipo
- [ ] El sistema debe mostrar vista previa del archivo antes de confirmar
- [ ] Para imágenes, el sistema debe permitir crop/recorte básico
- [ ] El sistema debe mostrar barra de progreso durante la subida
- [ ] El sistema debe comprimir/optimizar el archivo:
  - Imágenes: redimensionar a máximo 2048x2048px, comprimir JPEG a 85%
  - Videos: recodificar a H.264, máximo 720p
  - Audios: comprimir a 128kbps MP3/AAC
- [ ] El sistema debe subir el archivo a S3 en ruta `/media/{userId}/{uuid}.ext`
- [ ] El sistema debe crear registro en MEDIA_OBJECTS con metadatos
- [ ] El sistema debe retornar media_id al cliente
- [ ] El usuario debe poder enviar mensaje incluyendo el media_id
- [ ] El sistema debe permitir cancelar durante la subida
- [ ] El sistema debe eliminar archivos no asociados a mensaje después de 24 horas
- [ ] La subida debe soportar archivos > 5MB mediante chunks
- [ ] La subida debe completarse en tiempo razonable (< 30 segundos para 10MB)

#### Notas Adicionales

- El procesamiento de archivos se hace de forma asíncrona (no bloquear UI)
- Usar workers separados para procesamiento pesado de video
- Las URLs de acceso deben ser firmadas con expiración de 1 hora
- Un media_id solo puede usarse una vez (asociado a un mensaje)
- Para el MVP, no se aplica cifrado a los archivos (futuro)
- Validar tipo MIME real usando librerías (no confiar en extensión)
- Sanitizar metadatos del archivo (EXIF, etc.) por privacidad

#### Historias de Usuario Relacionadas

- HU-005: Enviar mensaje de texto (base, ahora con multimedia)
- HU-007: Enviar mensaje temporal (con imagen/video bloqueado)
- HU-008: Enviar mensaje con contraseña (con multimedia protegido)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/media/upload` (multipart/form-data)

**Request:**
```
multipart/form-data con campo "file"
```

**Response:**
```json
{
  "mediaId": "uuid-...",
  "url": "https://s3.../preview-signed-url",
  "mimeType": "image/jpeg",
  "size": 1024000,
  "previewUrl": "https://s3.../thumbnail-url"
}
```

**Uso posterior (enviar mensaje con multimedia):**
```json
POST /api/v1/messages
{
  "chatId": "chat-uuid",
  "contentType": "IMAGE",
  "mediaId": "uuid-...",
  "visibilityType": "CONDITIONAL",
  "condition": {...}
}
```

**Módulos NestJS:**
- `src/modules/media/` (media.controller.ts, media.service.ts, file-processor.service.ts)
- Workers para procesamiento pesado

**Tablas DB:**
- MEDIA_OBJECTS (id, public_id, storage_key, mime_type, size_bytes, created_at, expires_at)

**Storage:**
- S3-compatible (Backblaze/Wasabi/MinIO)
- Estructura: `/media/{userId}/{uuid}.ext`

**Procesamiento:**
- Imágenes: Sharp library
- Videos: FFmpeg
- Audios: FFmpeg o Sox

**Validaciones:**
- Validación de tipo MIME real
- Validación de tamaño según tipo
- Rate limiting: máximo 10 archivos/min/usuario
- Escaneo de malware (futuro)

**Tests:**
- **Unitarios**:
  - Validación de tipo y tamaño
  - Redimensionamiento de imagen a 2048x2048
  - Compresión de video a 720p
- **Integración**:
  - Upload exitoso a S3
  - Creación de registro en MEDIA_OBJECTS
  - Generación de URL firmada
  - Eliminación de archivo tras 24h si no usado
- **E2E**:
  - Flujo completo de subida de imagen
  - Subida de video y envío en mensaje
  - Intento con archivo muy grande (debe fallar)
  - Intento con tipo no soportado (debe fallar)
  - Cancelación durante subida

**Prioridad:** P1 - High (Sprint 4)
**Estimación:** 8 Story Points
**Caso de Uso Relacionado:** UC-011 - Subir Contenido Multimedia

