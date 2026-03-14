# HU7-BE-001: Endpoint de Carga de Documentos de Verificación

## Info
- **ID**: HU7-BE-001  
- **Tipo**: Backend  
- **Prioridad**: Alta  
- **Estimación**: 15h  
- **Dependencias**: HU7-DB-001, HU2-DB-001

## CA cubiertos
- Auth JWT, role doctor; 403 si no.
- POST `/doctors/verification` multipart/form-data.
- Validar tipo MIME real y extensión (PDF/JPG/PNG/JPEG) y tamaño <=10MB.
- Escanear malware (ClamAV o servicio) antes de almacenar.
- Almacenar archivo en directorio encriptado (`/storage/uploads/`), nombre `{doctorId}_{ts}_{rand}.ext`, permisos 700.
- Registrar en `VERIFICATION_DOCUMENTS` con status pending.
- URLs firmadas temporales para acceso admin.
- Respuesta 201 con metadatos.
- Auditoría `upload_verification_document`.

## Pasos Técnicos
1) **DTO/Validación** `dto/verification/upload-document.dto.ts`
   - Campos: document (file), documentType enum.
2) **Servicio** `services/verification.service.ts`
   - Validar MIME real (file-type lib).
   - Scan malware (adaptador ClamAV).
   - Guardar archivo (fs) en ruta configurada.
   - Guardar registro en DB (status pending).
   - Audit log.
3) **Controlador** `controllers/verification.controller.ts`
   - POST `/api/v1/doctors/verification`
   - Usa `@UseInterceptors(FileInterceptor('document', { limits: { fileSize: 10*1024*1024 } }))`
4) **Seguridad**
   - Path traversal protection.
   - Permisos del directorio 700.
   - Claves de encriptación en .env (si se cifra metadatos).
5) **Variables .env**
   - `UPLOADS_PATH=/var/www/citaya/storage/uploads`
   - `MAX_FILE_SIZE_MB=10`

## Archivos a crear/modificar
- `backend/src/controllers/verification.controller.ts`
- `backend/src/services/verification.service.ts`
- `backend/src/dto/verification/upload-document.dto.ts`
- `backend/src/entities/verification-document.entity.ts`
- Configuración de multer/adaptador Nest.

## Testing (HU7-TEST-001)
- Archivos válidos/ inválidos (tipo, tamaño).
- Malware detectado → 400 con código MALWARE_DETECTED.
- Registro DB y archivo creado.
- Auditoría creada.
