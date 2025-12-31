### HU-014: Enviar Mensaje con Quiz (Pregunta + Respuesta)

**Como** usuario autenticado en un chat,
**quiero** enviar un mensaje protegido con una pregunta que debe responderse correctamente,
**para que** pueda crear acertijos personalizados, trivia o desafíos divertidos relacionados con nuestra historia compartida.

#### Criterios de Aceptación

- [ ] El sistema debe permitir seleccionar condición tipo "Quiz" al componer mensaje
- [ ] El sistema debe mostrar campos para:
  - Pregunta (máximo 500 caracteres)
  - Respuesta correcta (máximo 100 caracteres)
  - (Opcional) Número máximo de intentos (default: ilimitado, rango: 1-10)
- [ ] El sistema debe validar que pregunta y respuesta no estén vacías
- [ ] El sistema debe crear mensaje con visibility_type='CONDITIONAL' y status='PENDING'
- [ ] El sistema debe crear condición tipo QUIZ con quiz_question y quiz_correct_answer
- [ ] El sistema debe almacenar la respuesta en minúsculas y sin espacios extra (normalizada)
- [ ] El emisor debe ver el mensaje completo incluyendo pregunta y respuesta
- [ ] El receptor debe ver solo la pregunta, no la respuesta correcta
- [ ] El receptor debe poder ingresar su respuesta en un campo de texto
- [ ] El sistema debe comparar respuestas de forma case-insensitive y con trim
- [ ] El sistema debe permitir variaciones comunes (ej: "madrid" == "Madrid" == " madrid ")
- [ ] Si la respuesta es correcta, desbloquear inmediatamente
- [ ] Si la respuesta es incorrecta, incrementar contador de intentos
- [ ] Si se configura max_attempts y se alcanza, marcar mensaje como FAILED
- [ ] El sistema debe registrar todos los intentos en MESSAGE_UNLOCK_ATTEMPTS
- [ ] El envío del mensaje debe completarse en menos de 1 segundo

#### Notas Adicionales

- La comparación de respuestas es case-insensitive: "Madrid" == "madrid"
- Se aplica trim a ambas respuestas antes de comparar
- Considerar permitir respuestas múltiples válidas separadas por "|" (ej: "madrid|Madrid|la capital")
- Para el MVP, solo texto simple (no opción múltiple)
- Futuro: permitir hints/pistas que se revelan tras X intentos fallidos
- Futuro: permitir respuestas de opción múltiple (A, B, C, D)
- Futuro: banco de preguntas/trivia predefinidas por categoría

#### Historias de Usuario Relacionadas

- HU-007: Enviar mensaje temporal (otra condición del motor)
- HU-008: Enviar mensaje con contraseña (similar, pero quiz es más flexible)
- HU-009: Intentar desbloquear mensaje (el receptor responde la pregunta)

#### Detalle Técnico

**Endpoints:**
- POST `/api/v1/messages`

**Request Body:**
```json
{
  "chatId": "chat-uuid",
  "contentType": "TEXT",
  "contentText": "¡Felicitaciones! Ganaste el premio 🎁",
  "visibilityType": "CONDITIONAL",
  "condition": {
    "type": "QUIZ",
    "quizQuestion": "¿En qué ciudad nos conocimos?",
    "quizCorrectAnswer": "Madrid",
    "maxAttempts": 5
  }
}
```

**Response:**
```json
{
  "messageId": "uuid-...",
  "chatId": "chat-uuid",
  "visibilityType": "CONDITIONAL",
  "status": "PENDING",
  "condition": {
    "type": "QUIZ",
    "quizQuestion": "¿En qué ciudad nos conocimos?",
    "maxAttempts": 5
  },
  "createdAt": "2025-02-05T10:00:00Z"
}
```

**Desbloqueo (receptor intenta):**
```json
POST /api/v1/messages/{messageId}/unlock
{
  "quizAnswer": "madrid"
}
```

**Módulos NestJS:**
- `src/modules/messages/`
- `src/modules/conditions/` (quiz-condition.strategy.ts)

**Tablas DB:**
- MESSAGES (visibility_type='CONDITIONAL', status='PENDING')
- MESSAGE_CONDITIONS (condition_type='QUIZ', quiz_question, quiz_correct_answer, max_attempts)
- MESSAGE_UNLOCK_ATTEMPTS (para registrar intentos)

**Lógica de Validación (QuizConditionStrategy):**
```typescript
class QuizConditionStrategy implements ConditionStrategy {
  validate(input: string, condition: MessageCondition): boolean {
    const normalizedInput = input.toLowerCase().trim();
    const normalizedAnswer = condition.quiz_correct_answer.toLowerCase().trim();
    
    // Permitir múltiples respuestas válidas separadas por "|"
    const validAnswers = normalizedAnswer.split('|');
    
    return validAnswers.some(answer => 
      answer.trim() === normalizedInput
    );
  }
}
```

**Validaciones:**
- `@MinLength(1)` `@MaxLength(500)` para quizQuestion
- `@MinLength(1)` `@MaxLength(100)` para quizCorrectAnswer
- `@Min(1)` `@Max(10)` para maxAttempts (si se proporciona)
- Normalización: `answer.toLowerCase().trim()`

**Tests:**
- **Unitarios**:
  - Comparación case-insensitive
  - Trim de espacios extra
  - Soporte de múltiples respuestas válidas ("|")
  - Lógica de max_attempts
- **Integración**:
  - Creación de mensaje + condición QUIZ
  - Registro de intentos correctos/incorrectos
  - Cambio a FAILED al alcanzar límite
- **E2E**:
  - Flujo completo de envío con quiz
  - Intento con respuesta correcta (éxito inmediato)
  - Intento con respuesta incorrecta (falla, permite reintentar)
  - Alcanzar límite de intentos (mensaje FAILED)
  - Variaciones de capitalización (deben funcionar)

**Prioridad:** P2 - Medium (Backlog priorizado)
**Estimación:** 5 Story Points
**Caso de Uso Relacionado:** Similar a UC-008 pero con quiz en lugar de PIN

