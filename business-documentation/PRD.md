# Documento de Requisitos del Producto (PRD)
# Aura Planning — Invitaciones Digitales y Narrativa de Eventos en Tiempo Real

> **Versión:** 1.0  
> **Fecha:** 8 de junio de 2026  
> **Autor:** Senior Product Manager  
> **Estado:** Borrador — Revisión Interna  
> **Fuente:** [Aura.MD](../Aura.MD) + Análisis de Arquitectura Técnica  
> **Audiencia:** Ingeniería, Diseño, Producto, Dirección

---

## Tabla de Contenidos

| # | Sección | Enlace |
|---|---------|--------|
| 1 | Resumen Ejecutivo | [01-executive-summary.md](prd/01-executive-summary.md) |
| 2 | Declaración del Problema y Oportunidad | [02-problem-opportunity.md](prd/02-problem-opportunity.md) |
| 3 | Personas de Usuario | [03-user-personas.md](prd/03-user-personas.md) |
| 4 | Visión y Estrategia del Producto | [04-vision-strategy.md](prd/04-vision-strategy.md) |
| 5 | Registro y Onboarding | [05-registration-onboarding.md](prd/05-registration-onboarding.md) |
| 6 | Especificación de Funcionalidades del MVP | [06-mvp-features.md](prd/06-mvp-features.md) |
| 7 | Desglose de Trabajo por Disciplina | [07-work-breakdown.md](prd/07-work-breakdown.md) |
| 8 | Métricas de Éxito y KPIs | [08-success-metrics.md](prd/08-success-metrics.md) |
| 9 | Riesgos, Suposiciones y Dependencias | [09-risks-assumptions.md](prd/09-risks-assumptions.md) |
| 10 | Plan de Lanzamiento | [10-rollout-plan.md](prd/10-rollout-plan.md) |
| 11 | Anexo | [11-appendix.md](prd/11-appendix.md) |

---

## Referencia Rápida

### Modelo de Negocio

| Nivel | Precio | Funcionalidades |
|------|-------|----------|
| **Gratis (Borrador)** | EUR 0 | Acceso completo al diseño, 5 invitados, sin publicación |
| **Publicación Estándar** | EUR 19 | Invitados ilimitados, sitio estático, invitaciones por email, seguimiento RSVP |
| **Publicación Premium** | EUR 29 | Estándar + WhatsApp + Live Guest Journey + Sincronización de calendario |
| **Registro de Regalos** (V3) | 2% comisión plataforma | Regalos en efectivo vía Stripe Connect |

### Alcance del MVP

```
Registrar -> Crear Evento -> Diseñar -> Añadir Invitados -> Pagar -> Publicar -> Invitados RSVP -> Seguir
```

**Lanzamiento objetivo:** Timeline de desarrollo de 8 semanas  
**Mercado inicial:** España (idioma español), solo bodas  
**Futuro:** Expansión LATAM, idioma inglés, otros tipos de celebración (V3)

### Diferenciador Clave

El **Live Guest Journey** — narración de eventos en tiempo real vía WhatsApp — gestionado por un "accomplice" de confianza. Ningún competidor (Zankyou, Bodas.net, WithJoy, Joy) ofrece esto.

### Decisiones Abiertas

**18 decisiones pendientes** — Ver [11-appendix.md](prd/11-appendix.md) para el registro completo de decisiones.

### Roadmap de Crecimiento

| Versión | Timeline | Enfoque |
|---------|----------|---------|
| **V1 (MVP)** | Semanas 1-8 | Bodas, España |
| **V1.1** | Semanas 9-12 | Optimización |
| **V2** | Meses 4-6 | Escalabilidad |
| **V3** | Meses 7-12 | Diversificación |

---

*Documento raíz. Navega a las secciones individuales usando los enlaces anteriores.*