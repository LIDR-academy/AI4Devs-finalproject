# Épicas del MVP UNLOKD

Este documento define las 4 épicas principales del MVP de UNLOKD, organizadas por sprint y alineadas con los objetivos de negocio.

## EPIC-1: Fundación - Autenticación y Usuarios

**Objetivo**: Establecer la base técnica y permitir que usuarios se registren, autentiquen y gestionen sus perfiles.

**Valor de Negocio**: Sin autenticación no hay producto. Es el primer paso crítico.

**Sprint**: Sprint 1 (06/01 - 19/01)

**Story Points Totales**: 21 puntos

### Tickets Incluidos
- UNLOKD-001 (5 pts): Setup proyecto NestJS + MySQL + Redis con Docker
- UNLOKD-002 (8 pts): Implementar módulo de autenticación (registro + login + JWT)
- UNLOKD-003 (5 pts): Implementar módulo de usuarios y perfiles
- UNLOKD-004 (2 pts): Crear migraciones de base de datos (USERS, CONTACTS)
- UNLOKD-005 (1 pt): Tests E2E de autenticación

### Criterios de Éxito
- [ ] Usuarios pueden registrarse con email y contraseña
- [ ] Usuarios pueden hacer login y obtener JWT
- [ ] Usuarios pueden actualizar su perfil y avatar
- [ ] Todos los tests pasando
- [ ] Documentación completa

### Riesgos
- **Riesgo Medio**: Configuración inicial de Docker puede tomar más tiempo si hay problemas de compatibilidad
- **Mitigación**: Tener docker-compose.yml bien documentado y testeado

---

## EPIC-2: Mensajería Básica

**Objetivo**: Permitir comunicación en tiempo real entre usuarios mediante chats 1-a-1 y mensajes de texto simples.

**Valor de Negocio**: Base de la plataforma de mensajería, requisito para funcionalidades diferenciadas.

**Sprint**: Sprint 2 (20/01 - 02/02)

**Story Points Totales**: 21 puntos

### Tickets Incluidos
- UNLOKD-006 (5 pts): Implementar módulo de chats (crear chat 1-a-1)
- UNLOKD-007 (5 pts): Implementar módulo de mensajes (envío y recepción)
- UNLOKD-008 (8 pts): Implementar WebSocket gateway para tiempo real
- UNLOKD-009 (2 pts): Crear migraciones (CHATS, CHAT_MEMBERS, MESSAGES)
- UNLOKD-010 (1 pt): Tests E2E de mensajería básica

### Criterios de Éxito
- [ ] Usuarios pueden crear chats 1-a-1
- [ ] Usuarios pueden enviar y recibir mensajes de texto en tiempo real
- [ ] Timeline de mensajes con paginación funciona correctamente
- [ ] WebSocket establece conexión y sincroniza mensajes
- [ ] Todos los tests pasando

### Riesgos
- **Riesgo Alto**: WebSocket puede ser complejo de implementar y testear
- **Mitigación**: Usar Socket.IO (abstracción probada), documentar bien la arquitectura de eventos

---

## EPIC-3: Motor de Condiciones (DIFERENCIADOR)

**Objetivo**: Implementar el sistema de condiciones de desbloqueo que diferencia a UNLOKD de otras apps de mensajería.

**Valor de Negocio**: **MÁXIMO**. Este es el diferenciador clave del producto. Sin esto, UNLOKD es solo otra app de chat.

**Sprint**: Sprint 3 (03/02 - 16/02)

**Story Points Totales**: 26 puntos

### Tickets Incluidos
- UNLOKD-011 (5 pts): Diseñar arquitectura del motor de condiciones (Strategy Pattern)
- UNLOKD-012 (5 pts): Implementar condición TIME (temporal)
- UNLOKD-013 (8 pts): Implementar condición PASSWORD (con hash + intentos)
- UNLOKD-014 (5 pts): Implementar servicio de desbloqueo con validaciones
- UNLOKD-015 (2 pts): Crear migraciones (MESSAGE_CONDITIONS, MESSAGE_UNLOCK_ATTEMPTS)
- UNLOKD-016 (1 pt): Tests unitarios + E2E del motor de condiciones

### Criterios de Éxito
- [ ] Usuarios pueden enviar mensajes con condición TIME
- [ ] Usuarios pueden enviar mensajes con condición PASSWORD
- [ ] Usuarios receptores pueden intentar desbloquear mensajes
- [ ] Sistema valida condiciones en backend de forma segura
- [ ] Límite de intentos funciona correctamente
- [ ] Scheduler desbloquea mensajes TIME automáticamente
- [ ] Todos los tests pasando (cobertura > 80%)

### Riesgos
- **Riesgo Alto**: La arquitectura del motor debe ser extensible para futuros tipos de condiciones
- **Mitigación**: Usar Strategy Pattern estricto, documentar bien interfaces
- **Riesgo Medio**: Scheduler con BullMQ puede tener problemas de sincronización
- **Mitigación**: Tests exhaustivos de scheduling, usar Redis para estado compartido

---

## EPIC-4: Multimedia, Notificaciones y UX

**Objetivo**: Enriquecer la experiencia con contenido multimedia, notificaciones push y UI pulida para mensajes bloqueados.

**Valor de Negocio**: Alto. Convierte el MVP de "funcional" a "usable y atractivo".

**Sprint**: Sprint 4 (17/02 - 02/03)

**Story Points Totales**: 21 puntos

### Tickets Incluidos
- UNLOKD-017 (8 pts): Implementar módulo de multimedia (upload + S3)
- UNLOKD-018 (5 pts): Implementar worker de notificaciones push (FCM/APNs)
- UNLOKD-019 (5 pts): Implementar previsualización difuminada en frontend
- UNLOKD-020 (3 pts): Implementar contador regresivo visual para mensajes temporizados

### Criterios de Éxito
- [ ] Usuarios pueden subir imágenes, audios y videos
- [ ] Usuarios reciben notificaciones push de mensajes nuevos
- [ ] Mensajes bloqueados se muestran con UI atractiva (blur, iconos, gradientes)
- [ ] Contador regresivo funciona en tiempo real para mensajes TIME
- [ ] Todos los tests pasando

### Riesgos
- **Riesgo Medio**: Integración con S3 y procesamiento de video puede ser lenta
- **Mitigación**: Procesamiento asíncrono con workers, optimizar con Sharp/FFmpeg
- **Riesgo Medio**: FCM/APNs requieren configuración externa compleja
- **Mitigación**: Documentar bien el setup, usar Firebase Admin SDK

---

## Resumen por Sprint

| Sprint | Épica | Story Points | Complejidad | Prioridad |
|--------|-------|--------------|-------------|-----------|
| 1 | EPIC-1: Fundación | 21 | Media | P0 Blocker |
| 2 | EPIC-2: Mensajería Básica | 21 | Alta | P0 Blocker |
| 3 | EPIC-3: Motor Condiciones | 26 | **Muy Alta** | P1 High (Diferenciador) |
| 4 | EPIC-4: Multimedia/Notif/UX | 21 | Media-Alta | P1 High |

**Total MVP**: 89 Story Points en 8 semanas (4 sprints de 2 semanas)

---

## Dependencias Entre Épicas

```
EPIC-1 (Fundación)
    ↓
EPIC-2 (Mensajería Básica)
    ↓
EPIC-3 (Motor Condiciones) ← DIFERENCIADOR CLAVE
    ↓
EPIC-4 (Multimedia/Notif/UX)
```

Cada épica depende de la anterior. No se puede empezar Sprint 2 sin completar Sprint 1.

---

## Definición de "Done" para una Épica

Una épica se considera completa cuando:
- [ ] Todos los tickets incluidos están en status "Done"
- [ ] Todos los tests (unitarios + E2E) están pasando
- [ ] Code review aprobado para todos los tickets
- [ ] Documentación técnica actualizada
- [ ] Demo funcional presentada al equipo/stakeholders
- [ ] Sin bugs críticos o blockers abiertos
- [ ] Métricas de cobertura de tests > 80%

