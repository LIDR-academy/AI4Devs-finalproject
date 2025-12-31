# Backlog Priorizado - UNLOKD MVP

Este documento contiene el backlog completo del MVP organizado por prioridad y sprint planificado.

## Leyenda de Prioridades

- **P0 - Blocker**: Funcionalidad crítica sin la cual el MVP no puede funcionar
- **P1 - High**: Funcionalidad importante para el diferenciador o experiencia básica
- **P2 - Medium**: Funcionalidad deseable pero no crítica para MVP
- **P3 - Low**: Nice-to-have, puede postponerse post-MVP

---

## Sprint 1: Fundación - Autenticación y Usuarios

### P0 - Blockers (Must Have)

| ID | Ticket | Story Points | Asignado | Status |
|----|--------|--------------|----------|--------|
| UNLOKD-001 | Setup proyecto NestJS + MySQL + Redis con Docker | 5 | - | Backlog |
| UNLOKD-002 | Implementar módulo de autenticación | 8 | - | Backlog |
| UNLOKD-004 | Crear migraciones DB (USERS, CONTACTS) | 2 | - | Backlog |

### P1 - High (Should Have)

| ID | Ticket | Story Points | Asignado | Status |
|----|--------|--------------|----------|--------|
| UNLOKD-003 | Implementar módulo de usuarios y perfiles | 5 | - | Backlog |
| UNLOKD-005 | Tests E2E de autenticación | 1 | - | Backlog |

**Total Sprint 1**: 21 story points

---

## Sprint 2: Mensajería Básica

### P0 - Blockers

| ID | Ticket | Story Points | Asignado | Status |
|----|--------|--------------|----------|--------|
| UNLOKD-006 | Implementar módulo de chats | 5 | - | Backlog |
| UNLOKD-007 | Implementar módulo de mensajes | 5 | - | Backlog |
| UNLOKD-008 | Implementar WebSocket gateway | 8 | - | Backlog |
| UNLOKD-009 | Crear migraciones (CHATS, MESSAGES) | 2 | - | Backlog |

### P1 - High

| ID | Ticket | Story Points | Asignado | Status |
|----|--------|--------------|----------|--------|
| UNLOKD-010 | Tests E2E de mensajería | 1 | - | Backlog |

**Total Sprint 2**: 21 story points

---

## Sprint 3: Motor de Condiciones (DIFERENCIADOR)

### P1 - High (Diferenciador Clave)

| ID | Ticket | Story Points | Asignado | Status |
|----|--------|--------------|----------|--------|
| UNLOKD-011 | Arquitectura motor de condiciones (Strategy) | 5 | - | Backlog |
| UNLOKD-012 | Implementar condición TIME | 5 | - | Backlog |
| UNLOKD-013 | Implementar condición PASSWORD | 8 | - | Backlog |
| UNLOKD-014 | Implementar servicio de desbloqueo | 5 | - | Backlog |
| UNLOKD-015 | Crear migraciones condiciones | 2 | - | Backlog |
| UNLOKD-016 | Tests motor de condiciones | 1 | - | Backlog |

**Total Sprint 3**: 26 story points

**⚠️ Nota**: Este sprint contiene el diferenciador clave de UNLOKD. Prioridad máxima.

---

## Sprint 4: Multimedia, Notificaciones y UX

### P1 - High

| ID | Ticket | Story Points | Asignado | Status |
|----|--------|--------------|----------|--------|
| UNLOKD-017 | Implementar módulo de multimedia (S3) | 8 | - | Backlog |
| UNLOKD-018 | Implementar worker de notificaciones push | 5 | - | Backlog |
| UNLOKD-019 | UI previsualización difuminada frontend | 5 | - | Backlog |

### P2 - Medium

| ID | Ticket | Story Points | Asignado | Status |
|----|--------|--------------|----------|--------|
| UNLOKD-020 | Contador regresivo visual | 3 | - | Backlog |

**Total Sprint 4**: 21 story points

---

## Backlog Post-MVP (Futuras Iteraciones)

### Funcionalidades Futuras Priorizadas

#### Alta Prioridad (Post-MVP Inmediato)

1. **Condición QUIZ** (5 pts)
   - Mensajes protegidos por preguntas personalizadas
   - HU-014: Enviar mensaje con quiz

2. **Chats grupales (> 2 participantes)** (8 pts)
   - Ampliar de 1-a-1 a grupos de hasta 10 personas

3. **Estadísticas de desbloqueo** (5 pts)
   - HU-015: Ver historial de mensajes desbloqueados
   - Badges y logros

4. **Condición BIOMETRIC** (5 pts)
   - Desbloqueo con huella digital / Face ID

#### Media Prioridad

5. **Plantillas prediseñadas** (8 pts)
   - "Invitación sorpresa", "Regalo con acertijo", etc.

6. **Banco de acertijos** (5 pts)
   - Trivia predefinida por categorías

7. **Modo cápsula del tiempo** (3 pts)
   - Mensajes que se autodestruyen tras X tiempo

8. **Notificaciones en app** (3 pts)
   - Centro de notificaciones sin salir de la app

#### Baja Prioridad (Nice-to-Have)

9. **Invitación de contactos vía WhatsApp/SMS** (3 pts)
10. **Compartir logros en redes sociales** (2 pts)
11. **Modo oscuro** (2 pts)
12. **Localización i18n** (5 pts)
13. **PWA para web** (5 pts)

---

## Priorización por Valor de Negocio

### Matriz Valor vs Esfuerzo

```
Alto Valor, Bajo Esfuerzo (Hacer YA):
✅ Sprint 1: Autenticación
✅ Sprint 2: Mensajería básica
✅ Sprint 3: Condiciones TIME + PASSWORD

Alto Valor, Alto Esfuerzo (Planificar):
✅ Sprint 4: Multimedia + Notificaciones
📋 Post-MVP: Condición QUIZ
📋 Post-MVP: Chats grupales

Bajo Valor, Bajo Esfuerzo (Rellenar huecos):
📋 Post-MVP: Modo oscuro
📋 Post-MVP: Invitación contactos

Bajo Valor, Alto Esfuerzo (Evitar):
❌ Marketplace de plantillas
❌ Integración redes sociales avanzada
```

---

## Criterios de Priorización

### P0 - Blocker
- Sin esto, el MVP no funciona
- Bloquea desarrollo de otras funcionalidades
- Ejemplos: Setup proyecto, Auth, DB básica

### P1 - High
- Funcionalidad core del diferenciador
- Alta demanda de usuarios target
- Ejemplos: Motor de condiciones, Multimedia, Notificaciones

### P2 - Medium
- Mejora significativa de UX
- No bloquea MVP pero aporta valor
- Ejemplos: Estadísticas, Quiz, Contador regresivo

### P3 - Low
- Nice-to-have
- Puede postponerse sin impacto
- Ejemplos: Modo oscuro, i18n

---

## Backlog Grooming

### Frecuencia
**Cada semana** (miércoles) - 1 hora

### Objetivos del Grooming
1. Refinar tickets del próximo sprint
2. Estimar nuevos tickets agregados
3. Actualizar prioridades según feedback
4. Identificar dependencias y riesgos
5. Asegurar que tickets cumplen Definition of Ready

### Participantes
- Product Owner (define prioridades)
- Desarrollador (estima esfuerzo)
- Opcional: Diseñador UX (para tickets de frontend)

---

## Historias de Usuario por Prioridad

### P0 - Must Have (MVP Crítico)
- HU-001: Registro de usuario
- HU-002: Login de usuario
- HU-004: Crear chat 1-a-1
- HU-005: Enviar mensaje texto
- HU-006: Ver timeline mensajes

### P1 - Should Have (Diferenciador)
- HU-003: Actualizar perfil
- HU-007: Mensaje con condición temporal
- HU-008: Mensaje con contraseña
- HU-009: Desbloquear mensaje
- HU-010: Notificación push
- HU-011: Subir multimedia
- HU-012: Previsualización bloqueada
- HU-013: Contador regresivo

### P2 - Could Have (Post-MVP)
- HU-014: Mensaje con quiz
- HU-015: Historial desbloqueados (estadísticas)

---

## Roadmap Visual

```
MVP (8 semanas)
├─ Sprint 1 (2 sem) ───► Autenticación + Usuarios
├─ Sprint 2 (2 sem) ───► Mensajería Básica
├─ Sprint 3 (2 sem) ───► Motor Condiciones (DIFERENCIADOR) ⭐
└─ Sprint 4 (2 sem) ───► Multimedia + Notificaciones + UX

Post-MVP (4-6 semanas)
├─ Iteración 1 ───► QUIZ + Grupos + Estadísticas
├─ Iteración 2 ───► BIOMETRIC + Plantillas + Acertijos
└─ Iteración 3 ───► Gamificación + Social + Viralidad
```

---

## Seguimiento del Backlog

### Métricas Clave
- **Velocidad**: Story points completados por sprint
- **Burndown**: Trabajo restante vs tiempo
- **Scope Creep**: Tickets agregados mid-sprint (evitar!)
- **Tech Debt**: Tickets de refactor acumulados

### Actualización
Este backlog se actualiza:
- **Semanalmente** después del grooming
- **Cada sprint** después de planning y retrospectiva
- **Ad-hoc** cuando se identifiquen nuevos tickets críticos

---

## Notas Finales

- **El MVP debe completarse en 8 semanas** (4 sprints)
- **El Sprint 3 es el más crítico** - contiene el diferenciador
- **No agregar scope mid-sprint** salvo emergencias
- **Post-MVP: iterar basado en feedback de beta testers**

