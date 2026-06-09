# 10. Plan de Lanzamiento

> [Volver al Índice PRD](../PRD.md) | [Anterior: Riesgos y Suposiciones](09-risks-assumptions.md) | [Siguiente: Anexo](11-appendix.md)

---

## 10.1 Lanzamiento por Fases

| Fase | Timeline | Usuarios | Objetivos | Criterios de Éxito |
|-------|----------|-------|-------|-----------------|
| **Alfa** | Semana 1-3 | Equipo interno (5-10) | Validar flujos core, identificar bugs críticos | Zero bugs P0/P1; todas las historias de usuario pasan |
| **Beta** | Semana 4-7 | 50 parejas comprometidas | Validar embudo de conversión, recopilar feedback NPS | > 20% conversión; NPS > 40; < 5% tasa de error |
| **GA** | Semana 8+ | Público (España) | Alcanzar 500 MAH en Mes 3 | > 25% conversión; NPS > 50; EUR 4,500 MRR |

## 10.2 Alfa (Testing Interno)

| Aspecto | Detalle |
|--------|--------|
| **Duración** | 2 semanas |
| **Usuarios** | Equipo interno (5-10 personas) |
| **Alcance** | Conjunto completo de funcionalidades MVP |
| **Objetivos** | Validar flujos core, identificar bugs críticos, testear rendimiento |
| **Criterios de Éxito** | Zero bugs P0/P1; todas las historias de usuario pasan criterios de aceptación |
| **Criterios de Rollback** | Cualquier pérdida de datos, vulnerabilidad de seguridad, o flujo crítico roto |

## 10.3 Beta (Beta Cerrada)

| Aspecto | Detalle |
|--------|--------|
| **Duración** | 3 semanas |
| **Usuarios** | 50 parejas comprometidas (reclutadas vía redes sociales, foros de bodas) |
| **Alcance** | MVP completo + tracking de analytics |
| **Objetivos** | Validar embudo de conversión,搜集 feedback NPS, testear a escala |
| **Criterios de Éxito** | > 20% conversión de borrador a publicado; NPS > 40; < 5% tasa de error de API |
| **Criterios de Rollback** | Conversión < 10%; NPS < 20; quejas críticas de usuarios |
| **Feature Flags** | Live Guest Journey (on/off); Invitaciones WhatsApp (on/off) |

## 10.4 Disponibilidad General (GA)

| Aspecto | Detalle |
|--------|--------|
| **Duración** | Continuo |
| **Usuarios** | Público (España, idioma español) |
| **Alcance** | MVP completo + campaña de marketing |
| **Objetivos** | Alcanzar 500 MAH (Monthly Active Hosts) en Mes 3 |
| **Criterios de Éxito** | > 25% conversión de borrador a publicado; NPS > 50; EUR 4,500 MRR en Mes 3 |
| **Criterios de Rollback** | Ingresos < EUR 1,000 en Mes 2; problema de seguridad crítico |

## 10.5 Feature Flags

| Funcionalidad | Flag | Por Defecto | Estrategia de Lanzamiento |
|---------|------|---------|-----------------|
| Live Guest Journey | `feature.live-journey` | Off (Alfa) -> On (Beta) | Lanzamiento gradual al 50% de usuarios beta |
| Invitaciones WhatsApp | `feature.whatsapp` | Off (Alfa) -> On (Beta) | Requiere aprobación de API de WhatsApp |
| Gift Registry | `feature.gift-registry` | Off | Funcionalidad V3; no habilitada en MVP |
| Subida de Fotos | `feature.photo-upload` | Off | Funcionalidad V3; no habilitada en MVP |
| Sincronización de Calendario | `feature.calendar-sync` | On | Habilitada desde el lanzamiento |

## 10.6 Criterios de Rollback

| Disparador | Acción |
|---------|--------|
| Pérdida o corrupción de datos | Rollback inmediato al último estado conocido bueno; notificar a usuarios afectados |
| Vulnerabilidad de seguridad | Hotfix dentro de 24 horas; rollback si fix no está listo |
| Tasa de error de API > 10% por 30 minutos | Investigar; rollback si la causa raíz es un despliegue reciente |
| Tasa de entrega de WhatsApp < 80% | Deshabilitar funcionalidad WhatsApp; fallback a solo email |
| Fallos de procesamiento de pagos > 5% | Investigar integración de Stripe; rollback si es un problema de código |
| NPS < 20 durante beta | Pausar lanzamiento; investigar feedback de usuarios; iterar |

---

> [Volver al Índice PRD](../PRD.md) | [Anterior: Riesgos y Suposiciones](09-risks-assumptions.md) | [Siguiente: Anexo](11-appendix.md)