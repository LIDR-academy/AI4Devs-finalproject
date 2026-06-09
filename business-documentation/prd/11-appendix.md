# 11. Anexo

> [Volver al Índice PRD](../PRD.md) | [Anterior: Plan de Lanzamiento](10-rollout-plan.md)

---

## 11.1 Glosario

| Término | Definición |
|------|-----------|
| **Host** | La persona que crea y gestiona el evento (pareja, planner) |
| **Guest** | Un invitado al evento |
| **Accomplice** | Una persona de confianza con acceso limitado para enviar actualizaciones en vivo (padrino, madrina) |
| **Micrositio** | La página de invitación estática servida vía CDN a los invitados |
| **Magic Link** | Un token de autenticación de un solo uso enviado vía email (login sin contraseña) |
| **Slug** | Identificador amigable para URL de un evento (ej. `maria-y-juan-2026`) |
| **SSG** | Static Site Generator - servicio que genera HTML/CSS/JS por evento |
| **JAMstack** | JavaScript, APIs, Markup - patrón de arquitectura para sitios estáticos |
| **ULID** | Identificador Únicamente Único Lexicográficamente Ordenable |
| **RSVP** | Répondez s'il vous plait - respuesta del invitado a la invitación |
| **Efecto IKEA** | Sesgo cognitivo donde los usuarios valoran más las cosas en las que han invertido esfuerzo en crear |
| **MVP** | Producto Mínimo Viable - conjunto de funcionalidades más pequeño que entrega valor core |
| **MoSCoW** | Método de priorización: Must have, Should have, Could have, Won't have |
| **NPS** | Net Promoter Score - medida de satisfacción y lealtad del usuario |
| **MRR** | Ingreso Recurrente Mensual - ingreso mensual predecible |
| **MAH** | Hosts Activos Mensuales - hosts únicos que iniciaron sesión durante el mes |

## 11.2 Matriz Competitiva

| Funcionalidad | Aura | Zankyou | Bodas.net | WithJoy | Paperless Post |
|---------|------|---------|-----------|---------|----------------|
| Invitaciones digitales | Sí | Sí | Sí | Sí | Sí |
| Seguimiento RSVP | Sí | Sí | Sí | Sí | Sí |
| Gestión de invitados | Sí | Sí | Sí | Sí | No |
| Personalización de plantillas | Sí | Sí | Sí | Sí | Sí |
| Invitaciones por WhatsApp | Sí | No | No | No | No |
| Actualizaciones de evento en vivo | Sí | No | No | No | No |
| Modo Accomplice | Sí | No | No | No | No |
| Swipe-to-send | Sí | No | No | No | No |
| Sitio estático (rápido) | Sí | No | No | No | No |
| Pago único | Sí | No | No | Sí | No |
| Modo borrador gratis | Sí | No | No | Sí | No |
| Eliminación automática a 30 días | Sí | No | No | No | No |
| Registro de regalos | No (V3) | Sí | Sí | Sí | No |
| Subida de fotos | No (V3) | Sí | Sí | Sí | No |
| Multi-idioma | No (V2) | Sí | Sí | Sí | Sí |
| Marketplace de proveedores | No (V3) | Sí | Sí | No | No |

## 11.3 Registro de Decisiones Abiertas

| ID | Decisión | Opciones | Estado | Responsable | Deadline |
|----|----------|---------|--------|-------|----------|
| D-01 | Flujo de onboarding de accomplice | A: Solo enlace, B: Cuenta completa, C: Perfil ligero | Abierta | Producto | Semana 2 |
| D-02 | Profundidad de personalización de plantilla | Solo colores/fuentes vs. también layout | Abierta | Diseño | Semana 2 |
| D-03 | Pipeline de build de sitio estático | Plantillas Razor vs. interpolación de strings | Abierta | Backend | Semana 3 |
| D-04 | Proveedor de API de WhatsApp | API Meta directa vs. BSP (Twilio) | Abierta | Backend | Semana 2 |
| D-05 | Encriptación en reposo | SQLCipher vs. AES-256 a nivel de aplicación | Abierta | Backend | Semana 3 |
| D-06 | Proveedor de CDN | Cloudflare seleccionado | Resuelta | DevOps | Semana 3 |
| D-07 | Proveedor de hosting | Kubernetes (Rancher Desktop local, TBD producción) | Resuelta | DevOps | Semana 3 |
| D-08 | Precio de publicación | EUR 19 vs. EUR 29 vs. por niveles | Abierta | Producto | Semana 2 |
| D-09 | Número de plantillas en lanzamiento | 3 vs. 5 | Abierta | Diseño | Semana 2 |
| D-10 | Campos del formulario RSVP | Mínimo (asistencia) vs. completo (todos los campos) | Abierta | UX | Semana 2 |
| D-11 | Plantillas de mensaje por defecto | 5 vs. 8 | Abierta | Producto | Semana 3 |
| D-12 | Alcance de sincronización de calendario | Solo Google vs. Google + Apple + Outlook | Abierta | Frontend | Semana 4 |
| D-13 | Almacenamiento de JWT | httpOnly cookie vs. Bearer token | Abierta | Backend | Semana 3 |
| D-14 | Tipo de clave primaria | ULID vs. GUID vs. entero | Abierta | Backend | Semana 3 |
| D-15 | Banner de cookies GDPR | Requerido vs. no necesario (sin cookies de terceros) | Abierta | Legal | Semana 4 |
| D-16 | Arquitectura de servicio en background | BackgroundService único vs. cola distribuida | Abierta | Backend | Semana 4 |
| D-17 | Herramienta de tracking de errores | Sentry vs. Application Insights | Abierta | DevOps | Semana 3 |
| D-18 | Pasos del wizard de onboarding | Obligatorios vs. omitibles | Abierta | UX | Semana 2 |

## 11.4 Resumen del Stack Tecnológico

| Capa | Tecnología | Justificación |
|-------|-----------|-----------|
| **API Backend** | .NET 10 (ASP.NET Core Web API) | Alto rendimiento, tipado fuerte, excelente soporte de EF Core |
| **Dashboard del Host** | Angular 22 (Standalone components) | SPA enterprise-grade, signals para estado reactivo, tipado estricto |
| **Micrositios de Invitados** | HTML/JS/CSS estático (JAMstack) | Coste cero por visita, cacheado en CDN, ultra-rápido |
| **Panel de Accomplice** | Angular 22 (embebido en dashboard) | Reutiliza infraestructura SPA del host, acceso basado en tokens |
| **Base de Datos** | PostgreSQL 16 + EF Core | Soporte multi-pod, escrituras concurrentes, producción-listo |
| **Autenticación** | Magic links + JWT | UX sin contraseña, superficie de ataque reducida |
| **Email** | Gmail SMTP (IEmailService) | Gratis para MVP, abstracto para swap futuro a Mailgun/Brevo |
| **WhatsApp** | Meta Cloud API | Canal oficial, mensajes de plantilla, recibos de entrega |
| **Pagos** | Stripe | PCI-compliant, webhooks, pagos únicos |
| **Maps** | Google Maps API | Embeds, geocodificación, deep links de direcciones - generoso tier gratis |
| **Cola/Caché** | DragonflyDB | Compatible con Redis, 25x más rápido, menor memoria que Redis |
| **Object Storage** | MinIO | Compatible con S3, self-hosted, para sitios estáticos y backups |
| **CDN** | Cloudflare | Distribución de sitios estáticos desde origin MinIO, HTTPS, edge caching |
| **Hosting** | Kubernetes | Rancher Desktop local, portable a cualquier cloud provider |

## 11.5 Historial del Documento

| Versión | Fecha | Autor | Cambios |
|---------|------|--------|---------|
| 1.0 | 2026-06-08 | Senior Product Manager | Creación inicial del PRD |

## 11.6 Documentos de Referencia

- Requisitos de Negocio: [Aura.MD](../Aura.MD)
- Convenciones Técnicas: `conventions/technical-conventions.md`
- Convenciones de Git: `conventions/git-conventions.md`
- Análisis de Arquitectura Técnica: `.tmp/technical-architecture-analysis.md`
- Análisis de PO Assistant: (generado durante la sesión de planificación)

---

> [Volver al Índice PRD](../PRD.md) | [Anterior: Plan de Lanzamiento](10-rollout-plan.md)