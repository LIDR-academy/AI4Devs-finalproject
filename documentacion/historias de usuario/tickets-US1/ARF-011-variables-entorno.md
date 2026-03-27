# Work Ticket: ARF-011 — Variables de entorno y configuración segura

| Campo | Valor |
|-------|-------|
| **Tipo** | Seguridad |
| **Estimación** | 1h |
| **Dependencias** | Ninguna |

**Descripción**: Configurar el sistema de variables de entorno para que ninguna credencial quede en el código.

**Criterios de Aceptación**:
- [x] Archivos `.env.example` creados en `frontend/` y `backend/`.
- [x] `.env` y `.env.local` en `.gitignore`.
- [x] El `JWT_SECRET` y las llaves de API externas se leen exclusivamente desde variables de entorno.
- [x] La app falla con mensaje claro si una variable requerida no está definida.

**Tareas Técnicas**:
1. [x] Crear `backend/.env.example` y `frontend/.env.example`.
2. [x] Agregar validación de env vars.

---
**User Story de referencia (US-1)**: Como Curioso Cultural, quiero filtrar contenido por duración y mood.
