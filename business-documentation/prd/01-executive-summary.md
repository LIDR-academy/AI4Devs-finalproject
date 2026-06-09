# 1. Resumen Ejecutivo

> [Volver al Índice PRD](../PRD.md) | [Siguiente: Declaración del Problema](02-problem-opportunity.md)

---

## 1.1 Qué Estamos Construyendo

**Aura Planning** es una plataforma SaaS que reemplaza las invitaciones de boda en papel con un ecosistema digital interactivo. Combina tres capacidades principales:

1. **Diseño** — Plantillas de invitación hermosas y personalizables que no requieren habilidades de diseño
2. **Logística** — Gestión centralizada de invitados, seguimiento de RSVP, coordinación de dietary/transporte
3. **Comunicación** — Invitaciones multicanal (email + WhatsApp) con recordatorios automatizados y un **Live Guest Journey** — narración de eventos en tiempo real gestionada por un "accomplice" de confianza

**Eslogan:** *"Diseña la narrativa de tu evento, gestiona la logística sin esfuerzo."*

## 1.2 Por Qué Es Importante

| Problema | Estado Actual | Solución de Aura |
|---------|--------------|------------------|
| Las invitaciones en papel cuestan EUR 800-1,200 para 120 invitados | Diseño + impresión + franqueo | Pago único de EUR 29.99 — ahorro del 97% |
| El seguimiento de RSVP vía WhatsApp/teléfono es caótico | Hojas de cálculo, mensajes perdidos | Dashboard en tiempo real con seguimiento dietary/transporte |
| Los invitados carecen de actualizaciones en tiempo real del evento | Momentos perdidos, preguntas constantes | Narrativa en vivo vía WhatsApp gestionada por un accomplice |
| Las parejas gestionan la logística el día de su boda | Estrés, distracción de la celebración | El accomplice gestiona toda la comunicación con invitados |

## 1.3 Diferenciador Clave

El **Live Guest Journey** — una funcionalidad de narración de eventos en tiempo real vía WhatsApp — es nuestra funcionalidad estrella. Ningún competidor (Zankyou, Bodas.net, WithJoy, Joy) ofrece esto. Apunta a la emoción e inmediatez que demandan los Millennials y Gen Z, mientras asegura que la pareja pueda disfrutar de su día sin distracciones técnicas.

## 1.4 Modelo de Negocio

| Nivel | Precio | Funcionalidades |
|------|-------|----------|
| **Gratis (Borrador)** | EUR 0 | Acceso completo al diseño, 5 invitados, sin publicación |
| **Publicación Estándar** | EUR 19 | Invitados ilimitados, sitio estático, invitaciones por email, seguimiento RSVP |
| **Publicación Premium** | EUR 29 | Estándar + invitaciones WhatsApp + Live Guest Journey + Sincronización de calendario |
| **Registro de Regalos** (V3) | 2% comisión plataforma | Regalos en efectivo vía Stripe Connect |

**Estrategia:** "Prueba antes de comprar" (Efecto IKEA). Los usuarios invierten tiempo configurando su evento gratis, creando alta fricción de cambio. Una vez invertidos, prefieren pagar en lugar de empezar en otro lugar.

## 1.5 Alcance del MVP

El MVP entrega un ciclo de vida completo de invitación digital:

```
Registrar -> Crear Evento -> Diseñar -> Añadir Invitados -> Pagar -> Publicar -> Invitados RSVP -> Seguir
```

**Lanzamiento objetivo:** Timeline de desarrollo de 8 semanas  
**Mercado inicial:** España (idioma español), solo bodas  
**Futuro:** Expansión LATAM, idioma inglés, otros tipos de celebración (V3)

---

> [Volver al Índice PRD](../PRD.md) | [Siguiente: Declaración del Problema](02-problem-opportunity.md)