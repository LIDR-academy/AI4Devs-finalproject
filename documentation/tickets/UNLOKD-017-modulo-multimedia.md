# [UNLOKD-017] Implementar Módulo de Multimedia (Upload + S3)

## Tipo
- [x] Feature

## Épica
EPIC-4: Multimedia, Notificaciones y UX

## Sprint
Sprint 4

## Estimación
**Story Points**: 8

## Descripción
Implementar upload de multimedia (imágenes/audios/videos) con procesamiento (redimensión, compresión), almacenamiento en S3, generación de URLs firmadas.

## Historia de Usuario Relacionada
- HU-011: Subir imagen/video para enviar en mensaje

## Caso de Uso Relacionado
- UC-011: Subir Contenido Multimedia

## Criterios de Aceptación
- [ ] POST `/api/v1/media/upload` (multipart)
- [ ] Validación de tipo MIME y tamaño
- [ ] Procesamiento: Sharp (imágenes), FFmpeg (video/audio)
- [ ] Upload a S3 en `/media/{userId}/{uuid}.ext`
- [ ] Creación de registro en MEDIA_OBJECTS
- [ ] URLs firmadas con expiración 1 hora
- [ ] Tests

## Tareas Técnicas
- [ ] Crear módulo `media/`
- [ ] Configurar multer para multipart
- [ ] Implementar procesamiento con Sharp
- [ ] Configurar cliente S3 (AWS SDK)
- [ ] Implementar upload a S3
- [ ] Crear MEDIA_OBJECTS en DB
- [ ] Generar URLs firmadas
- [ ] Escribir tests

## Labels
`media`, `s3`, `upload`, `sprint-4`, `p1-high`

