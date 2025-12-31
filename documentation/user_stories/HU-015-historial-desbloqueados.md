### HU-015: Ver Historial de Mensajes Desbloqueados (Estadísticas)

**Como** usuario de UNLOKD,
**quiero** ver estadísticas y el historial de mensajes que he desbloqueado,
**para que** pueda recordar momentos especiales y ver mis logros de desbloqueo.

#### Criterios de Aceptación

- [ ] El sistema debe mostrar una sección de "Estadísticas" en el perfil del usuario
- [ ] El sistema debe mostrar métricas generales:
  - Total de mensajes desbloqueados
  - Total de mensajes enviados condicionados
  - Tasa de éxito en desbloqueos
  - Promedio de intentos hasta desbloqueo
- [ ] El sistema debe mostrar lista de mensajes desbloqueados recientemente (últimos 20)
- [ ] Para cada mensaje desbloqueado, mostrar:
  - Fecha de desbloqueo
  - De quién era el mensaje
  - Tipo de condición (TIME, PASSWORD, QUIZ)
  - Número de intentos que tomó
  - Preview del contenido (si el usuario lo permite)
- [ ] El sistema debe permitir filtrar por:
  - Tipo de condición
  - Rango de fechas
  - Emisor específico
- [ ] El sistema debe permitir buscar en el historial por texto
- [ ] El sistema debe mostrar "badges" o logros por hitos:
  - "Primera vez" - Primer mensaje desbloqueado
  - "Detective" - 10 mensajes desbloqueados
  - "Maestro" - 50 mensajes desbloqueados
  - "Experto en acertijos" - 10 QUIZ resueltos correctamente
  - "Puntual" - 10 mensajes TIME desbloqueados en los primeros 5 minutos
- [ ] El sistema debe permitir ocultar/eliminar mensajes del historial (privacidad)
- [ ] El sistema debe mostrar gráfico de actividad de desbloqueos por mes
- [ ] La carga de estadísticas debe completarse en menos de 1 segundo

#### Notas Adicionales

- Las estadísticas se calculan a partir de MESSAGE_UNLOCK_ATTEMPTS y MESSAGE_READ_EVENTS
- Considerar privacidad: el usuario puede optar por no guardar historial
- Los logros/badges son locales (no competitivos) para el MVP
- Futuro: permitir compartir estadísticas en redes sociales
- Futuro: comparar estadísticas con amigos (opt-in)
- Futuro: ranking de "mejor desbloqueador" en grupos de amigos
- Las estadísticas deben calcularse de forma eficiente (usar índices, cachear resultados)

#### Historias de Usuario Relacionadas

- HU-009: Intentar desbloquear mensaje (genera datos para estadísticas)
- HU-007: Enviar mensaje temporal (contribuye a "mensajes enviados condicionados")
- HU-008: Enviar mensaje con contraseña (contribuye a estadísticas)

#### Detalle Técnico

**Endpoints:**
- GET `/api/v1/stats/me` (estadísticas generales)
- GET `/api/v1/stats/unlocked-history` (historial detallado)

**Response (estadísticas generales):**
```json
{
  "totalUnlocked": 45,
  "totalConditionedSent": 23,
  "successRate": 0.85,
  "averageAttempts": 1.8,
  "breakdown": {
    "TIME": 20,
    "PASSWORD": 15,
    "QUIZ": 10
  },
  "badges": [
    {
      "id": "detective",
      "name": "Detective",
      "description": "Desbloqueaste 10 mensajes",
      "unlockedAt": "2025-02-10T15:30:00Z",
      "icon": "🕵️"
    }
  ]
}
```

**Response (historial detallado):**
```json
{
  "history": [
    {
      "messageId": "uuid-...",
      "unlockedAt": "2025-02-10T15:30:00Z",
      "sender": {
        "userId": "uuid-...",
        "displayName": "Ana",
        "avatarUrl": "..."
      },
      "conditionType": "PASSWORD",
      "attemptsCount": 2,
      "preview": "La fiesta es en el rooftop..."
    },
    ...
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
```

**Módulos NestJS:**
- `src/modules/stats/` (stats.controller.ts, stats.service.ts)

**Tablas DB:**
- MESSAGE_UNLOCK_ATTEMPTS (para contar intentos y calcular promedios)
- MESSAGE_READ_EVENTS (para saber qué mensajes fueron leídos)
- MESSAGES (para obtener tipo de condición)

**Queries Optimizadas:**
```sql
-- Total desbloqueados por usuario
SELECT COUNT(DISTINCT message_id) 
FROM MESSAGE_UNLOCK_ATTEMPTS
WHERE user_id = ? AND result = 'SUCCESS';

-- Promedio de intentos
SELECT AVG(attempt_count) FROM (
  SELECT message_id, COUNT(*) as attempt_count
  FROM MESSAGE_UNLOCK_ATTEMPTS
  WHERE user_id = ? AND result = 'FAILURE'
  GROUP BY message_id
) AS attempts;

-- Breakdown por tipo
SELECT mc.condition_type, COUNT(*) as count
FROM MESSAGE_UNLOCK_ATTEMPTS mua
JOIN MESSAGES m ON mua.message_id = m.id
JOIN MESSAGE_CONDITIONS mc ON m.id = mc.message_id
WHERE mua.user_id = ? AND mua.result = 'SUCCESS'
GROUP BY mc.condition_type;
```

**Badges/Logros (lógica):**
```typescript
const BADGES = [
  {
    id: 'first_time',
    name: 'Primera vez',
    condition: (stats) => stats.totalUnlocked >= 1
  },
  {
    id: 'detective',
    name: 'Detective',
    condition: (stats) => stats.totalUnlocked >= 10
  },
  {
    id: 'master',
    name: 'Maestro',
    condition: (stats) => stats.totalUnlocked >= 50
  },
  {
    id: 'quiz_expert',
    name: 'Experto en acertijos',
    condition: (stats) => stats.breakdown.QUIZ >= 10
  }
];
```

**Validaciones:**
- Validar que el usuario solo puede ver sus propias estadísticas
- Validar parámetros de paginación y filtros
- Rate limiting para prevenir scraping masivo de datos

**Tests:**
- **Unitarios**:
  - Cálculo correcto de promedios
  - Lógica de otorgamiento de badges
  - Agrupación por tipo de condición
- **Integración**:
  - Queries eficientes con índices
  - Generación correcta de estadísticas agregadas
- **E2E**:
  - Visualización de estadísticas tras desbloquear mensajes
  - Historial actualizado en tiempo real
  - Otorgamiento de badge "Primera vez"
  - Filtrado por tipo de condición

**Prioridad:** P2 - Low (Backlog priorizado - feature nice-to-have)
**Estimación:** 5 Story Points
**Caso de Uso Relacionado:** Extensión de funcionalidad base, no es UC del MVP

