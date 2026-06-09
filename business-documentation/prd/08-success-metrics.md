# 8. Métricas de Éxito y KPIs

> [Volver al Índice PRD](../PRD.md) | [Anterior: Desglose de Trabajo](07-work-breakdown.md) | [Siguiente: Riesgos y Suposiciones](09-risks-assumptions.md)

---

## 8.1 Métricas de Activación

| Métrica | Definición | Objetivo | Medición |
|--------|-----------|--------|-------------|
| **Tasa de Completación de Registro** | % de usuarios que introducen email y verifican vía magic link | > 70% | Embudo de analytics |
| **Tasa de Creación de Eventos** | % de usuarios registrados que crean al menos un evento | > 60% | Embudo de analytics |
| **Tasa de Completación de Onboarding** | % de usuarios que completan el wizard de onboarding | > 50% | Embudo de analytics |
| **Tiempo hasta el Primer Evento** | Tiempo medio desde el registro hasta la creación del primer evento | < 10 minutos | Analytics |

## 8.2 Métricas de Conversión

| Métrica | Definición | Objetivo | Medición |
|--------|-----------|--------|-------------|
| **Conversión de Borrador a Publicado** | % de eventos en borrador que son publicados (pagados) | > 25% | Analytics + Stripe |
| **Promedio de Invitados por Evento** | Número medio de invitados por evento publicado | > 80 | Consulta a base de datos |
| **Ingreso por Publicación de Evento** | Ingreso promedio por evento publicado | EUR 25-29 | Datos de Stripe |
| **Tiempo hasta Publicación** | Tiempo medio desde la creación del evento hasta la publicación | < 30 minutos | Analytics |

## 8.3 Métricas de Engagement

| Métrica | Definición | Objetivo | Medición |
|--------|-----------|--------|-------------|
| **Tasa de Respuesta RSVP** | % de invitados que envían un RSVP | > 70% | Consulta a base de datos |
| **Tiempo de Completación de RSVP** | Tiempo medio desde la invitación hasta el envío de RSVP | < 48 horas | Consulta a base de datos |
| **Tasa de Entrega de WhatsApp** | % de mensajes de WhatsApp entregados exitosamente | > 95% | Datos de webhook de WhatsApp |
| **Tasa de Apertura de Email** | % de emails abiertos (vía pixel de tracking) | > 60% | Tracking de SES |
| **Mensajes en Vivo por Evento** | Número promedio de mensajes en vivo enviados por evento | > 5 | Consulta a base de datos |

## 8.4 Métricas de Calidad

| Métrica | Definición | Objetivo | Medición |
|--------|-----------|--------|-------------|
| **Tiempo de Carga del Micrositio** | Percentil 95 de tiempo de carga en mobile 3G | < 2 segundos | Lighthouse / RUM |
| **Tasa de Error de API** | % de requests de API que devuelven errores 5xx | < 1% | Monitoring |
| **Tasa de Error del Formulario RSVP** | % de envíos de RSVP que fallan validación | < 5% | Analytics |
| **Puntuación NPS** | Net Promoter Score de encuesta post-evento | > 50 | Herramienta de encuesta |

## 8.5 Métricas de Negocio

| Métrica | Definición | Objetivo | Medición |
|--------|-----------|--------|-------------|
| **Hosts Activos Mensuales** | Hosts únicos que iniciaron sesión este mes | 500 (Mes 3) | Analytics |
| **Eventos Publicados Mensualmente** | Eventos publicados por mes | 150 (Mes 3) | Consulta a base de datos |
| **Ingreso Recurrente Mensual** | Ingreso por tasas de publicación | EUR 4,500 (Mes 3) | Datos de Stripe |
| **Costo de Adquisición de Cliente** | Gasto de marketing / nuevos usuarios registrados | < EUR 5 | Analytics de marketing |
| **Tasa de Churn** | % de hosts que no crean un segundo evento (N/A para bodas) | N/A (uso único) | - |

---

> [Volver al Índice PRD](../PRD.md) | [Anterior: Desglose de Trabajo](07-work-breakdown.md) | [Siguiente: Riesgos y Suposiciones](09-risks-assumptions.md)