### HU-003: Actualizar Perfil de Usuario

**Como** usuario autenticado en UNLOKD,
**quiero** actualizar mi información de perfil (nombre para mostrar, foto de avatar, estado),
**para que** pueda personalizar mi identidad en la aplicación y los demás usuarios me vean como deseo.

#### Criterios de Aceptación

- [ ] El sistema debe permitir visualizar los datos actuales del perfil (email no editable, username no editable)
- [ ] El sistema debe permitir editar el campo display_name (mínimo 1 carácter, máximo 255)
- [ ] El sistema debe permitir subir una nueva foto de avatar (JPG, PNG, WebP, máximo 5MB)
- [ ] El sistema debe redimensionar automáticamente la imagen a 512x512px preservando aspect ratio
- [ ] El sistema debe permitir seleccionar estado de presencia (online/offline)
- [ ] El sistema debe validar que display_name no esté vacío
- [ ] El sistema debe mostrar vista previa de la imagen antes de confirmar
- [ ] El sistema debe subir la imagen a S3 y obtener la URL
- [ ] El sistema debe actualizar el registro en USERS con los nuevos datos
- [ ] El sistema debe eliminar la imagen anterior de S3 al subir nueva (limpieza)
- [ ] El sistema debe mostrar mensaje de éxito tras guardar cambios
- [ ] El sistema debe actualizar la interfaz inmediatamente con los nuevos datos
- [ ] La actualización debe completarse en menos de 2 segundos (sin imagen) o 5 segundos (con imagen)

#### Notas Adicionales

- El email no puede modificarse (es el identificador único de login)
- El username no puede modificarse (es el identificador público único)
- Si no se proporciona avatar, usar avatar por defecto generado con iniciales
- Validar tipo MIME real del archivo (no solo extensión) para seguridad
- Sanitizar el display_name para prevenir XSS
- Las URLs de S3 deben ser firmadas y con expiración

#### Historias de Usuario Relacionadas

- HU-001: Registro de usuario (crea el perfil inicial)
- HU-002: Login de usuario (requisito para editar perfil)
- HU-004: Crear chat (el perfil actualizado se muestra en los chats)

#### Detalle Técnico

**Endpoints:**
- GET `/api/v1/users/me` (obtener perfil actual)
- PUT `/api/v1/users/me` (actualizar perfil)
- PUT `/api/v1/users/me/avatar` (subir avatar específicamente)

**Request Body (actualizar perfil):**
```json
{
  "displayName": "Mi Nuevo Nombre",
  "presenceStatus": "online"
}
```

**Request Body (subir avatar):**
```
multipart/form-data con campo "avatar"
```

**Response:**
```json
{
  "id": "uuid-...",
  "email": "usuario@example.com",
  "username": "usuario",
  "displayName": "Mi Nuevo Nombre",
  "avatarUrl": "https://s3.../avatars/uuid.jpg",
  "presenceStatus": "online",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

**Módulos NestJS:**
- `src/modules/users/` (users.controller.ts, users.service.ts)
- `src/modules/media/` (media.service.ts para upload a S3)

**Tablas DB:**
- USERS (display_name, avatar_url, presence_status, updated_at)

**Storage:**
- S3-compatible (Backblaze/Wasabi) para almacenar avatares
- Ruta: `/avatars/{userId}/{uuid}.jpg`

**Validaciones:**
- `@MinLength(1)` `@MaxLength(255)` para displayName
- Validación de tipo MIME para imagen (image/jpeg, image/png, image/webp)
- Validación de tamaño máximo (5MB)

**Tests:**
- **Unitarios**:
  - Validación de display_name
  - Validación de tamaño y tipo de imagen
  - Redimensionamiento de imagen a 512x512
- **Integración**:
  - Actualización exitosa de perfil en DB
  - Upload de imagen a S3 y obtención de URL
  - Eliminación de imagen anterior de S3
- **E2E**:
  - Flujo completo de actualización de perfil
  - Actualización con nueva imagen
  - Intento de subir archivo no válido
  - Actualización sin cambios (idempotente)

**Prioridad:** P0 - High (Sprint 1)
**Estimación:** 5 Story Points
**Caso de Uso Relacionado:** UC-003 - Gestionar Perfil

