### HU-009: Intentar Desbloquear Mensaje Condicionado

**Como** usuario receptor de un mensaje condicionado,
**quiero** intentar desbloquearlo proporcionando los datos requeridos (contraseña, respuesta, esperando el tiempo),
**para que** pueda acceder al contenido bloqueado si cumplo correctamente las condiciones definidas por el emisor.

#### Criterios de Aceptación

- [ ] El sistema debe mostrar modal/pantalla de desbloqueo al hacer tap en mensaje bloqueado
- [ ] El modal debe mostrar el tipo de condición y qué se requiere:
  - TIME: contador regresivo y botón "Desbloquear" (habilitado solo si llegó la hora)
  - PASSWORD: campo para ingresar PIN de 4 dígitos
  - QUIZ: pregunta y campo para respuesta
- [ ] El sistema debe validar los datos ingresados antes de enviar
- [ ] El sistema debe verificar que la condición se cumple en el backend:
  - TIME: available_from <= NOW()
  - PASSWORD: bcrypt.compare(input, password_hash)
  - QUIZ: input == correct_answer (case-insensitive, trim)
- [ ] Si el desbloqueo es exitoso:
  - El sistema debe registrar intento SUCCESS en MESSAGE_UNLOCK_ATTEMPTS
  - El sistema debe cambiar mensaje a status='UNLOCKED'
  - El sistema debe actualizar unlocked_at con timestamp actual
  - El sistema debe mostrar el contenido completo del mensaje
  - El sistema debe reproducir animación celebratoria
  - El sistema debe notificar al emisor vía WebSocket
- [ ] Si el desbloqueo falla:
  - El sistema debe registrar intento FAILURE con failure_reason
  - El sistema debe decrementar intentos restantes (si aplica)
  - El sistema debe mostrar mensaje claro: "PIN incorrecto. Te quedan X intentos"
  - El sistema debe permitir reintentar si quedan intentos
- [ ] Si se alcanza max_attempts:
  - El sistema debe cambiar mensaje a status='FAILED'
  - El sistema debe mostrar "Límite alcanzado. No puedes desbloquear este mensaje"
  - El sistema debe notificar al emisor
- [ ] El sistema debe implementar rate limiting: máximo 10 intentos por minuto por usuario
- [ ] El sistema debe validar que el usuario es miembro del chat
- [ ] El sistema debe validar que el usuario NO es el emisor
- [ ] La validación debe completarse en menos de 500ms

#### Notas Adicionales

- NUNCA enviar password_hash ni quiz_correct_answer al cliente
- Validar TODAS las condiciones en el backend (no confiar en el cliente)
- Usar bcrypt.compare() para contraseñas (timing-attack resistant)
- Registrar todos los intentos para auditoría y estadísticas
- Un mensaje en estado FAILED no puede desbloquearse nunca
- Un mensaje desbloqueado (UNLOCKED) permanece así (no se puede "re-bloquear")
- Para mensajes con visualización única, tras desbloqueo se elimina automáticamente (futuro)

#### Historias de Usuario Relacionadas

- HU-007: Enviar mensaje temporal (el receptor desbloquea cuando llega la hora)
- HU-008: Enviar mensaje con contraseña (el receptor ingresa el PIN)
- HU-012: Ver previsualización bloqueada (visualización previa al desbloqueo)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/messages/{messageId}/unlock`

**Request Body (para PASSWORD):**
```json
{
  "password": "1234"
}
```

**Request Body (para QUIZ):**
```json
{
  "quizAnswer": "Respuesta correcta"
}
```

**Request Body (para TIME):**
```json
{
  "clientTime": "2025-12-31T20:00:00Z"
}
```

**Response (éxito):**
```json
{
  "success": true,
  "status": "UNLOCKED",
  "content": {
    "contentType": "TEXT",
    "text": "La fiesta es en el rooftop a las 9 PM 😏",
    "mediaUrl": null
  }
}
```

**Response (falla):**
```json
{
  "success": false,
  "status": "PENDING",
  "reason": "INVALID_PASSWORD",
  "attemptsLeft": 2,
  "message": "PIN incorrecto. Te quedan 2 intentos"
}
```

**Módulos NestJS:**
- `src/modules/messages/` (unlock-message.service.ts)
- `src/modules/conditions/` (condition-strategy.interface.ts, time-condition.strategy.ts, password-condition.strategy.ts, quiz-condition.strategy.ts)

**Tablas DB:**
- MESSAGES (actualizar status y unlocked_at si éxito)
- MESSAGE_CONDITIONS (para obtener la condición)
- MESSAGE_UNLOCK_ATTEMPTS (registrar cada intento)

**Patrón de Diseño:**
- **Strategy Pattern** para validación de condiciones:
  - `ConditionStrategy` interface
  - `TimeConditionStrategy`
  - `PasswordConditionStrategy`
  - `QuizConditionStrategy`

**Validaciones:**
- Usuario es miembro del chat (403 si no)
- Usuario NO es el emisor (emisor siempre ve todo)
- Mensaje existe y es CONDITIONAL
- No se alcanzó max_attempts (si aplica)
- Rate limiting: máximo 10 intentos/min/usuario

**Tests:**
- **Unitarios**:
  - Lógica de cada ConditionStrategy
  - Comparación segura de contraseñas (bcrypt)
  - Contador de intentos restantes
- **Integración**:
  - Registro correcto de intentos en DB
  - Actualización de status a UNLOCKED/FAILED
  - Notificación WebSocket al emisor
- **E2E**:
  - Desbloqueo exitoso con PIN correcto
  - Desbloqueo fallido con PIN incorrecto
  - Alcanzar límite de intentos (status=FAILED)
  - Desbloqueo de mensaje TIME cuando llega la hora
  - Intento antes de tiempo (TIME) debe fallar
  - Usuario no miembro intenta desbloquear (403)

**Prioridad:** P1 - High (Sprint 3) - DIFERENCIADOR CLAVE
**Estimación:** 5 Story Points
**Caso de Uso Relacionado:** UC-009 - Intentar Desbloquear Mensaje Condicionado

