### HU-008: Enviar Mensaje con Contraseña de 4 Dígitos

**Como** usuario autenticado y miembro de un chat,
**quiero** enviar un mensaje protegido con un PIN de 4 dígitos,
**para que** solo pueda verlo quien conozca la contraseña, ideal para regalos con ubicación secreta o confesiones románticas.

#### Criterios de Aceptación

- [ ] El sistema debe permitir seleccionar condición tipo "Contraseña" al componer mensaje
- [ ] El sistema debe mostrar campo para ingresar PIN de 4 dígitos numéricos
- [ ] El sistema debe validar que el PIN contiene solo números (0-9)
- [ ] El sistema debe validar que el PIN tiene exactamente 4 dígitos
- [ ] El sistema debe solicitar confirmar el PIN para evitar errores
- [ ] El sistema debe permitir configurar número máximo de intentos (default: 3, rango: 1-10)
- [ ] El sistema debe hashear el PIN con bcrypt antes de almacenar (nunca texto plano)
- [ ] El sistema debe crear mensaje con visibility_type='CONDITIONAL' y status='PENDING'
- [ ] El sistema debe crear condición tipo PASSWORD con password_hash y max_attempts
- [ ] El sistema debe mostrar sugerencia: "Comparte este PIN con el receptor por otro medio"
- [ ] El emisor debe poder ver el mensaje completo (siempre)
- [ ] El receptor debe ver "🔒 Protegido con contraseña (X intentos restantes)"
- [ ] El sistema debe registrar cada intento de desbloqueo en MESSAGE_UNLOCK_ATTEMPTS
- [ ] Al alcanzar max_attempts sin éxito, el mensaje debe cambiar a status='FAILED'
- [ ] Un mensaje FAILED no puede desbloquearse nunca
- [ ] El envío del mensaje debe completarse en menos de 1 segundo

#### Notas Adicionales

- El PIN nunca se almacena en texto plano (solo hash bcrypt con factor 10+)
- El sistema NO envía el PIN al receptor automáticamente (debe comunicarse por otro medio)
- Cada intento fallido incrementa contador en Redis por (messageId, userId)
- El emisor puede ver cuántos intentos ha hecho el receptor (futuro)
- Considerar opción de restablecer intentos por parte del emisor (futuro)
- Usar bcrypt.compare() para validar PIN (timing-attack resistant)

#### Historias de Usuario Relacionadas

- HU-005: Enviar mensaje de texto (base de esta funcionalidad)
- HU-007: Enviar mensaje temporal (otra condición del motor)
- HU-009: Intentar desbloquear mensaje (el receptor ingresa el PIN)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/messages`

**Request Body:**
```json
{
  "chatId": "chat-uuid",
  "contentType": "TEXT",
  "contentText": "La fiesta es en el rooftop a las 9 PM 😏",
  "visibilityType": "CONDITIONAL",
  "condition": {
    "type": "PASSWORD",
    "password": "1234",
    "maxAttempts": 3
  }
}
```

**Response:**
```json
{
  "messageId": "message-uuid",
  "chatId": "chat-uuid",
  "visibilityType": "CONDITIONAL",
  "status": "PENDING",
  "condition": {
    "type": "PASSWORD",
    "maxAttempts": 3
  },
  "createdAt": "2025-02-03T10:00:00Z"
}
```

**Módulos NestJS:**
- `src/modules/messages/`
- `src/modules/conditions/` (password-condition.strategy.ts)

**Tablas DB:**
- MESSAGES (visibility_type='CONDITIONAL', status='PENDING')
- MESSAGE_CONDITIONS (condition_type='PASSWORD', password_hash, max_attempts)
- MESSAGE_UNLOCK_ATTEMPTS (para registrar intentos)

**Validaciones:**
- `@IsString()` `@Length(4, 4)` para password
- `@Matches(/^[0-9]{4}$/)` para validar solo dígitos
- `@Min(1)` `@Max(10)` para maxAttempts

**Seguridad:**
- Hash con bcrypt factor 10: `await bcrypt.hash(pin, 10)`
- Comparación con bcrypt: `await bcrypt.compare(input, hash)`
- Rate limiting en intentos de desbloqueo
- Nunca exponer password_hash en respuestas API

**Tests:**
- **Unitarios**:
  - Validación de formato de PIN (4 dígitos numéricos)
  - Hash correcto con bcrypt
  - Lógica de max_attempts
- **Integración**:
  - Creación de mensaje + condición con hash
  - Registro de intentos en MESSAGE_UNLOCK_ATTEMPTS
  - Cambio a status='FAILED' al alcanzar límite
- **E2E**:
  - Flujo completo de envío con contraseña
  - Intento de desbloqueo con PIN correcto (éxito)
  - Intento con PIN incorrecto (falla, decrementa intentos)
  - Alcanzar límite de intentos (mensaje FAILED)
  - PIN con formato inválido (debe fallar validación)

**Prioridad:** P1 - High (Sprint 3) - DIFERENCIADOR CLAVE
**Estimación:** 8 Story Points
**Caso de Uso Relacionado:** UC-008 - Enviar Mensaje con Contraseña

