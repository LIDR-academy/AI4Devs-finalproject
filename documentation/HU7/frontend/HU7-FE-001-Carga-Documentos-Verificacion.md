# HU7-FE-001: Carga de Documentos de Verificación

## Info
- **ID**: HU7-FE-001  
- **Tipo**: Frontend  
- **Prioridad**: Alta  
- **Estimación**: 10h  
- **Dependencias**: HU7-BE-001, HU7-DB-001

## CA cubiertos
- Auth doctor; 403 si no.
- Formulario con file input (PDF/JPG/PNG/JPEG), selector documentType (cedula default, diploma, other).
- Validación frontend: extensión y tamaño <=10MB.
- Mensajes claros de error; mostrar estado pending.
- Internacionalización ES/EN.

## Pasos Técnicos
1) Página `app/doctor/verification/page.tsx`
   - Lista documentos subidos (llama GET si existe).
   - Formulario de carga.
2) Componente `components/verification/UploadForm.tsx`
   - Validar tipo/tamaño antes de enviar.
   - Enviar multipart/form-data a POST `/api/v1/doctors/verification`.
   - Mostrar barra de progreso opcional.
3) Hook `hooks/useVerificationDocs.ts`
   - React Query para listar y subir; invalidar cache tras éxito.
4) UI
   - Mensaje de éxito: “Documento subido, pendiente de revisión”.
   - Mostrar errores específicos (tipo, tamaño, malware si backend responde).

## Archivos clave
- `frontend/src/app/doctor/verification/page.tsx`
- `frontend/src/components/verification/UploadForm.tsx`
- `frontend/src/hooks/useVerificationDocs.ts`
- i18n strings en es/en

## Testing (HU7-TEST-001)
- Validación de archivos.
- Manejo de errores del backend.
- Listado se refresca tras subir.
