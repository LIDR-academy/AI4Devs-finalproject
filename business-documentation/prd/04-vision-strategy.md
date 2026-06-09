# 4. Visión y Estrategia del Producto

> [Volver al Índice PRD](../PRD.md) | [Anterior: Personas de Usuario](03-user-personas.md) | [Siguiente: Registro y Onboarding](05-registration-onboarding.md)

---

## 4.1 Métrica Principal (North Star)

**"Número de invitados que reciben una actualización de WhatsApp en vivo el día de su evento"**

Esta métrica captura la esencia de nuestra diferenciación: narración de eventos en tiempo real. Alinea todos los equipos hacia la entrega de la experiencia del Live Guest Journey.

## 4.2 Visión del Producto

> *Aura Planning se convierte en la forma predeterminada en que las parejas crean, gestionan y comparten la narrativa de su celebración — desde la primera invitación hasta el último baile.*

## 4.3 Límites del Alcance del MVP

### Dentro del Alcance (MVP)

- Registro de usuario con magic links (sin contraseña)
- Creación y gestión de eventos (un único propietario)
- Editor de plantillas (3 plantillas preestablecidas, personalización básica)
- Gestor de invitados (entrada manual + importación CSV, categorías)
- Formulario RSVP con necesidades de dietary/transporte
- Generación de sitios estáticos para micrositios de invitados (JAMstack)
- Paywall de publicación (pago único vía Stripe)
- Modo gratuito con límite de 5 invitados para pruebas
- Invitaciones por email vía Gmail SMTP
- Invitaciones por WhatsApp vía Meta Cloud API
- Recordatorios automatizados para no-respondedores
- Integración con Google Maps (embed + direcciones)
- Sincronización de calendario (Google Calendar, Apple Calendar)
- Modo Accomplice con acceso vía magic link
- Botones de notificación en vivo con confirmación de swipe
- Automatización de agradecimiento post-evento (email/WhatsApp)
- Eliminación automatizada de datos a los 30 días

### Fuera del Alcance (MVP)

- Subida de fotos por invitados (V3)
- Eventos corporativos, cumpleaños, bautizos (V3)
- Dashboard de proveedor/planner (V3+)
- Gestión multi-evento (V2)
- Soporte de dominio personalizado (V2)
- Registro de regalos / fondo de efectivo (V3)
- Constructor de plano de asientos (V2)
- Multi-idioma (Inglés) (V2)
- Co-host / propiedad compartida de eventos (V2)

## 4.4 Roadmap de Crecimiento

| Versión | Timeline | Enfoque | Funcionalidades Clave |
|---------|----------|---------|----------------------|
| **V1 (MVP)** | Semanas 1-8 | Bodas, España | Ciclo de vida de invitación core, RSVP, email + WhatsApp, modo accomplice |
| **V1.1** | Semanas 9-12 | Optimización | Automatización de recordatorios, sincronización de calendario, tarjetas de agradecimiento, analytics |
| **V2** | Meses 4-6 | Escalabilidad | Multi-evento, co-hosts, dominios personalizados, idioma inglés, planos de asientos |
| **V3** | Meses 7-12 | Diversificación | Registro de regalos, subida de fotos, eventos corporativos, dashboard de planner |

## 4.5 Estrategia de Diferenciación

| Dimensión | Competidores | Aura |
|-----------|------------|------|
| **Precio** | Suscripción o por invitación | Pago único (EUR 19-29) |
| **Comunicación** | Solo email | Email + WhatsApp (principal) |
| **Experiencia en Vivo** | Ninguna | Narrativa en tiempo real vía accomplice |
| **Arquitectura** | Server-rendered | Sitios estáticos JAMstack (rápido, barato) |
| **Privacidad de Datos** | Retención indefinida | Eliminación automática a los 30 días |
| **Audiencia Objetivo** | Todas las edades | Millennials/Gen Z (mobile-first) |

---

> [Volver al Índice PRD](../PRD.md) | [Anterior: Personas de Usuario](03-user-personas.md) | [Siguiente: Registro y Onboarding](05-registration-onboarding.md)