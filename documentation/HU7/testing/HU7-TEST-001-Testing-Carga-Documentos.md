# HU7-TEST-001: Testing - Carga de Documentos de Verificación

## Info
- **ID**: HU7-TEST-001  
- **Prioridad**: Alta  
- **Estimación**: 10h  
- **Dependencias**: HU7-FE-001, HU7-BE-001, HU7-DB-001

## Plan
### Backend
- Subida exitosa (PDF/JPG/PNG/JPEG) con tamaño <=10MB.
- Rechazo tipo inválido (400 INVALID_FILE_TYPE).
- Rechazo tamaño excedido (400 FILE_TOO_LARGE).
- Rechazo malware detectado (400 MALWARE_DETECTED).
- Registro DB correcto y archivo existe.
- Auditoría creada.

### Frontend
- Validación previa de extensión/tamaño.
- Mostrar errores devueltos por backend.
- Refrescar lista tras subir.

### E2E
- Flujo: subir documento -> ver estado pending en lista.
- Flujo negativo: archivo .exe -> muestra error.

## Archivos sugeridos
- `backend/tests/integration/verification/upload.test.ts`
- `frontend/tests/components/verification/UploadForm.test.tsx`
- `frontend/tests/e2e/verification/upload.spec.ts`

## Métricas
- Cobertura servicio verificación ≥85%
- Validaciones frontend ≥80% branches
