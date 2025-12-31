### HU-004: Crear Chat 1-a-1 con un Contacto

**Como** usuario autenticado en UNLOKD,
**quiero** iniciar una conversación privada (chat 1-a-1) con uno de mis contactos,
**para que** pueda enviarle mensajes condicionados de forma directa y privada.

#### Criterios de Aceptación

- [ ] El sistema debe permitir seleccionar un contacto de mi lista de contactos
- [ ] El sistema debe verificar si ya existe un chat 1-a-1 entre ambos usuarios
- [ ] Si el chat ya existe, el sistema debe redirigir al chat existente (no crear duplicado)
- [ ] Si el chat no existe, el sistema debe crear un nuevo chat tipo DIRECT
- [ ] El sistema debe agregar ambos usuarios como miembros del chat (CHAT_MEMBERS)
- [ ] El sistema debe asignar rol OWNER al creador y rol MEMBER al contacto
- [ ] El sistema debe generar un public_id (UUID) único para el chat
- [ ] El sistema debe redirigir automáticamente a la pantalla del chat tras creación
- [ ] El sistema debe establecer conexión WebSocket para mensajería en tiempo real
- [ ] El sistema debe mostrar el chat vacío listo para enviar mensajes
- [ ] El sistema no debe permitir crear chat con usuarios bloqueados
- [ ] La creación del chat debe completarse en menos de 500ms

#### Notas Adicionales

- Solo puede existir un chat DIRECT entre dos usuarios específicos (no duplicados)
- Un chat DIRECT siempre tiene exactamente 2 miembros
- El campo title de un chat DIRECT es NULL (se deriva del nombre del contacto)
- Ambos usuarios tienen permisos completos en un chat 1-a-1 (enviar, leer, salir)
- El public_id se usa para todas las referencias en la API (no el id interno)
- Si un usuario "sale" del chat, el chat no se elimina pero deja de aparecer en su lista

#### Historias de Usuario Relacionadas

- HU-002: Login de usuario (requisito para crear chats)
- HU-005: Enviar mensaje de texto (siguiente acción tras crear chat)
- HU-007: Enviar mensaje con condición temporal (funcionalidad diferenciadora en el chat)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/chats`

**Request Body:**
```json
{
  "type": "DIRECT",
  "memberIds": ["contact-user-id"]
}
```

**Response:**
```json
{
  "chatId": "uuid-...",
  "publicId": "uuid-...",
  "type": "DIRECT",
  "members": [
    {
      "userId": "creator-id",
      "role": "OWNER",
      "user": {
        "username": "creator",
        "displayName": "Creador",
        "avatarUrl": "..."
      }
    },
    {
      "userId": "contact-id",
      "role": "MEMBER",
      "user": {
        "username": "contacto",
        "displayName": "Contacto",
        "avatarUrl": "..."
      }
    }
  ],
  "createdAt": "2025-01-20T10:00:00Z"
}
```

**Módulos NestJS:**
- `src/modules/chats/` (chats.controller.ts, chats.service.ts, chats.repository.ts)
- `src/modules/realtime/` (realtime.gateway.ts para WebSocket)

**Tablas DB:**
- CHATS (id, public_id, type='DIRECT', created_by, created_at)
- CHAT_MEMBERS (id, chat_id, user_id, role, joined_at)

**Validaciones:**
- Validar que el usuario autenticado puede crear chats
- Validar que contact_id existe y está activo
- Validar que contact_id != creator_id (no chat consigo mismo)
- Verificar que el contacto no ha bloqueado al usuario

**Tests:**
- **Unitarios**:
  - Verificación de chat existente entre dos usuarios
  - Generación de public_id único (UUID v4)
  - Asignación correcta de roles
- **Integración**:
  - Creación exitosa de chat y miembros en DB
  - Detección de chat duplicado y retorno del existente
  - Creación de WebSocket connection tras crear chat
- **E2E**:
  - Flujo completo de creación de chat nuevo
  - Intento de crear chat duplicado (debe retornar existente)
  - Creación de chat y envío de primer mensaje
  - Intento de crear chat con usuario bloqueado (debe fallar)

**Prioridad:** P0 - Blocker (Sprint 2)
**Estimación:** 5 Story Points
**Caso de Uso Relacionado:** UC-005 - Crear Chat 1-a-1

