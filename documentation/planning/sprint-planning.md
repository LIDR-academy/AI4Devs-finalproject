# Sprint Planning - MVP UNLOKD

## Roadmap General del MVP

**Duración Total**: 8 semanas (4 sprints de 2 semanas cada uno)
**Inicio**: 06 de enero de 2025
**Fin MVP**: 02 de marzo de 2025

**Equipo**: 1 desarrollador full-stack
**Capacidad por sprint**: ~20-26 story points

---

## Sprint 1: Fundación - Autenticación y Usuarios

### Fechas
**Inicio**: Lunes 06/01/2025
**Fin**: Domingo 19/01/2025
**Duración**: 14 días (10 días laborables)

### Objetivo del Sprint
Establecer la infraestructura base del proyecto y permitir que usuarios se registren, autentiquen y gestionen sus perfiles básicos.

### Story Points
**Comprometidos**: 21 puntos
**Capacidad del equipo**: 21 puntos/sprint

### Tickets del Sprint
1. **UNLOKD-001** (5 pts) - Setup proyecto NestJS + MySQL + Redis con Docker
2. **UNLOKD-002** (8 pts) - Implementar módulo de autenticación (registro + login + JWT)
3. **UNLOKD-003** (5 pts) - Implementar módulo de usuarios y perfiles
4. **UNLOKD-004** (2 pts) - Crear migraciones de base de datos (USERS, CONTACTS)
5. **UNLOKD-005** (1 pt) - Tests E2E de autenticación

### Historias de Usuario Cubiertas
- HU-001: Registro de usuario con email y contraseña
- HU-002: Login de usuario y obtención de JWT
- HU-003: Actualizar perfil de usuario (nombre, avatar)

### Criterios de Éxito
- [ ] Proyecto levanta correctamente con `docker-compose up`
- [ ] Endpoint de health check respondiendo
- [ ] Usuario puede registrarse exitosamente
- [ ] Usuario puede hacer login y recibir JWT
- [ ] Usuario puede actualizar su perfil y subir avatar
- [ ] Tests E2E pasando con cobertura > 80%

### Riesgos Identificados
- **Alto**: Setup inicial puede tomar más tiempo de lo estimado si hay problemas con Docker
  - **Mitigación**: Dedicar primer día completo a setup, tener docker-compose bien documentado
- **Medio**: Integración con S3 para avatares puede requerir configuración adicional
  - **Mitigación**: Usar alternativa local (MinIO) si S3 real no está disponible

### Ceremonias
- **Sprint Planning**: Lunes 06/01 - 9:00 AM
- **Daily Standups**: Diario 9:30 AM (15 min)
- **Sprint Review**: Viernes 17/01 - 4:00 PM
- **Sprint Retrospective**: Viernes 17/01 - 5:00 PM

---

## Sprint 2: Mensajería Básica

### Fechas
**Inicio**: Lunes 20/01/2025
**Fin**: Domingo 02/02/2025
**Duración**: 14 días

### Objetivo del Sprint
Implementar mensajería en tiempo real con chats 1-a-1, envío/recepción de mensajes de texto y WebSocket funcional.

### Story Points
**Comprometidos**: 21 puntos

### Tickets del Sprint
1. **UNLOKD-006** (5 pts) - Implementar módulo de chats
2. **UNLOKD-007** (5 pts) - Implementar módulo de mensajes
3. **UNLOKD-008** (8 pts) - Implementar WebSocket gateway
4. **UNLOKD-009** (2 pts) - Crear migraciones (CHATS, CHAT_MEMBERS, MESSAGES)
5. **UNLOKD-010** (1 pt) - Tests E2E de mensajería básica

### Historias de Usuario Cubiertas
- HU-004: Crear chat 1-a-1 con un contacto
- HU-005: Enviar mensaje de texto simple en chat
- HU-006: Ver timeline de mensajes de un chat (paginado)

### Criterios de Éxito
- [ ] Usuario puede crear chat con un contacto
- [ ] Usuario puede enviar mensaje de texto
- [ ] Mensaje llega en tiempo real vía WebSocket al receptor
- [ ] Timeline muestra mensajes con paginación correcta
- [ ] Tests E2E de flujo completo pasando

### Riesgos Identificados
- **Alto**: WebSocket puede ser complejo, especialmente manejo de reconexión
  - **Mitigación**: Usar Socket.IO (abstracción probada), empezar con casos simples
- **Medio**: Paginación cursor-based puede requerir ajustes en queries
  - **Mitigación**: Usar índices compuestos optimizados en MySQL

### Dependencias
- Sprint 1 debe estar **100% completo** antes de empezar Sprint 2

---

## Sprint 3: Motor de Condiciones (DIFERENCIADOR CLAVE)

### Fechas
**Inicio**: Lunes 03/02/2025
**Fin**: Domingo 16/02/2025
**Duración**: 14 días

### Objetivo del Sprint
Implementar el motor de condiciones de desbloqueo que diferencia a UNLOKD: mensajes temporizados (TIME) y protegidos por contraseña (PASSWORD).

**⚠️ Este es el sprint más crítico del MVP - contiene el diferenciador clave del producto.**

### Story Points
**Comprometidos**: 26 puntos (mayor capacidad por importancia)

### Tickets del Sprint
1. **UNLOKD-011** (5 pts) - Diseñar arquitectura del motor de condiciones (Strategy Pattern)
2. **UNLOKD-012** (5 pts) - Implementar condición TIME
3. **UNLOKD-013** (8 pts) - Implementar condición PASSWORD
4. **UNLOKD-014** (5 pts) - Implementar servicio de desbloqueo
5. **UNLOKD-015** (2 pts) - Crear migraciones condiciones
6. **UNLOKD-016** (1 pt) - Tests motor de condiciones

### Historias de Usuario Cubiertas
- HU-007: Enviar mensaje con condición temporal
- HU-008: Enviar mensaje con contraseña de 4 dígitos
- HU-009: Intentar desbloquear mensaje condicionado
- HU-010: Recibir notificación push de mensaje nuevo

### Criterios de Éxito
- [ ] Usuario puede enviar mensaje con fecha/hora de desbloqueo
- [ ] Usuario puede enviar mensaje con PIN de 4 dígitos
- [ ] Receptor puede intentar desbloquear con PIN
- [ ] Sistema valida intentos y aplica límites
- [ ] Scheduler desbloquea mensajes TIME automáticamente
- [ ] Notificaciones push funcionan correctamente
- [ ] Tests con cobertura > 80%

### Riesgos Identificados
- **Crítico**: Arquitectura debe ser extensible para futuros tipos (QUIZ, BIOMETRIC, etc.)
  - **Mitigación**: Aplicar Strategy Pattern estrictamente, code review exhaustivo
- **Alto**: Scheduler con BullMQ puede fallar en producción
  - **Mitigación**: Tests de integración robustos, monitoreo de cola Redis
- **Alto**: Seguridad del motor (no exponer contraseñas, validar en backend)
  - **Mitigación**: Security review específico, nunca enviar hashes al cliente

### Dependencias
- Sprint 2 debe estar completo
- BullMQ configurado y funcionando
- Redis operativo

---

## Sprint 4: Multimedia, Notificaciones y UX

### Fechas
**Inicio**: Lunes 17/02/2025
**Fin**: Domingo 02/03/2025
**Duración**: 14 días

### Objetivo del Sprint
Pulir el MVP con multimedia, notificaciones push y UI atractiva para mensajes bloqueados.

### Story Points
**Comprometidos**: 21 puntos

### Tickets del Sprint
1. **UNLOKD-017** (8 pts) - Implementar módulo de multimedia (upload + S3)
2. **UNLOKD-018** (5 pts) - Implementar worker de notificaciones push
3. **UNLOKD-019** (5 pts) - Implementar previsualización difuminada frontend
4. **UNLOKD-020** (3 pts) - Implementar contador regresivo visual

### Historias de Usuario Cubiertas
- HU-011: Subir imagen/video para enviar en mensaje
- HU-012: Ver previsualización difuminada de mensaje bloqueado
- HU-013: Ver contador regresivo para mensaje temporizado

### Criterios de Éxito
- [ ] Usuario puede subir imagen/video y enviar en mensaje
- [ ] Mensajes bloqueados tienen UI atractiva con blur y gradientes
- [ ] Contador regresivo se actualiza en tiempo real
- [ ] Notificaciones push llegan correctamente
- [ ] Tests pasando

### Riesgos Identificados
- **Medio**: Procesamiento de video puede ser lento
  - **Mitigación**: Procesamiento asíncrono, mostrar progreso al usuario
- **Medio**: FCM/APNs requieren configuración compleja
  - **Mitigación**: Documentar setup paso a paso, usar Firebase Admin SDK

### Dependencias
- Sprint 3 debe estar completo
- S3 o equivalente configurado
- Firebase/FCM configurado para notificaciones

---

## Métricas y Seguimiento

### Velocidad del Equipo
- **Sprint 1**: 21 puntos (estimado)
- **Sprint 2**: 21 puntos (estimado)
- **Sprint 3**: 26 puntos (estimado)
- **Sprint 4**: 21 puntos (estimado)

**Velocidad promedio objetivo**: 22 puntos/sprint

### Definition of Done (DoD)

Un ticket se considera "Done" cuando:
- [ ] Código implementado y funcional
- [ ] Tests unitarios escritos y pasando (cobertura > 80%)
- [ ] Tests E2E escritos y pasando (si aplica)
- [ ] Code review aprobado por al menos 1 reviewer
- [ ] Sin linter errors ni warnings críticos
- [ ] Documentación actualizada (README, comentarios código)
- [ ] Merge a rama `develop` exitoso

### Definition of Ready (DoR)

Un ticket está listo para trabajarse cuando:
- [ ] Tiene descripción clara y completa
- [ ] Tiene criterios de aceptación definidos
- [ ] Tiene estimación en story points
- [ ] Todas las dependencias están resueltas
- [ ] Tiene historia de usuario y caso de uso relacionados
- [ ] El equipo entiende qué hay que hacer

---

## Retrospectivas y Mejora Continua

Al final de cada sprint:
1. **¿Qué salió bien?** - Celebrar éxitos
2. **¿Qué salió mal?** - Identificar problemas
3. **¿Qué podemos mejorar?** - Acciones concretas
4. **Compromisos para el próximo sprint** - 1-3 acciones específicas

---

## Hitos Clave del MVP

| Fecha | Hito | Descripción |
|-------|------|-------------|
| 19/01 | Fin Sprint 1 | Autenticación funcionando |
| 02/02 | Fin Sprint 2 | Mensajería básica funcional |
| 16/02 | **Fin Sprint 3** | **Motor de condiciones completo (DIFERENCIADOR)** |
| 02/03 | **MVP COMPLETO** | **Producto listo para testing beta** |

---

## Próximos Pasos Post-MVP

1. **Testing Beta** (1-2 semanas)
2. **Ajustes basados en feedback** (1 semana)
3. **Preparación para lanzamiento**
4. **Launch 🚀**

