# 9. Riesgos, Suposiciones y Dependencias

> [Volver al Índice PRD](../PRD.md) | [Anterior: Métricas de Éxito](08-success-metrics.md) | [Siguiente: Plan de Lanzamiento](10-rollout-plan.md)

---

## 9.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación | Responsable |
|------|-----------|--------|------------|-------|
| Retrasos en aprobación de API de WhatsApp | Medio | Alto | Pre-enviar plantillas 1 semana antes del lanzamiento; fallback solo email para V1 | Backend |
| Agotamiento del pool de conexiones de PostgreSQL a escala | Bajo | Medio | Monitorizar pool de conexiones; añadir PgBouncer; escalar pods API | Backend |
| Regeneración de sitio estático lenta para eventos grandes | Bajo | Medio | Regeneración completa para MVP (suficientemente rápido para <200 invitados); optimizar después | Frontend |
| Fallos de webhook de Stripe | Bajo | Alto | Handlers de webhook idempotentes; lógica de reintento; dashboard de reconciliación manual | Backend |
| Caché de CDN sin invalidar correctamente | Medio | Medio | Cache busting basado en archivos (timestamp en nombre de archivo); endpoint de invalidación manual | DevOps |
| Fallos de entrega de email de magic link (límite de Gmail) | Medio | Medio | Límite de 500 emails/día de Gmail SMTP; planificar swap a Mailgun/Brevo para producción | Backend |

## 9.2 Riesgos de Negocio

| Riesgo | Probabilidad | Impacto | Mitigación | Responsable |
|------|-----------|--------|------------|-------|
| Baja tasa de conversión de borrador a publicado | Medio | Alto | Optimizar UX del paywall; ofrecer descuento por tiempo limitado; test A/B de precios | Producto |
| Competidor copia el Live Guest Journey | Medio | Medio | Construir lealtad de marca; iterar rápidamente; patentar UX de swipe-to-confirm si es posible | Producto |
| Precio demasiado alto para el mercado español | Medio | Alto | Investigar precios de competidores; test A/B de EUR 19 vs. EUR 29; ofrecer descuento early-bird | Producto |
| Alcance de marketing insuficiente | Alto | Alto | Asociarse con wedding planners; optimización SEO; presencia en redes sociales | Marketing |
| Demanda estacional (pico de temporada de bodas) | Alto | Medio | Infraestructura auto-scalable; load testing antes de temporada alta | DevOps |

## 9.3 Riesgos Operacionales

| Riesgo | Probabilidad | Impacto | Mitigación | Responsable |
|------|-----------|--------|------------|-------|
| Incumplimiento GDPR | Bajo | Crítico | Involucrar asesoría legal early; implementar protección de datos por diseño; DPA con vendors | Legal |
| Límite diario de Gmail SMTP (500 emails) durante testing | Alto | Bajo | Usar Mailtrap para desarrollo; monitorizar cuota diaria; planificar migración a Mailgun/Brevo | DevOps |
| Rechazo de plantilla de WhatsApp por Meta | Medio | Alto | Enviar plantillas early; tener plantillas de email de fallback; seguir guías de Meta | Producto |
| Brecha de datos (exposición de PII) | Bajo | Crítico | Encriptación a nivel de aplicación; acceso con privilegio mínimo; auditorías de seguridad regulares | Seguridad |
| Dependencia de personal clave | Medio | Medio | Documentación; code reviews; compartición de conocimiento; cross-training | Ingeniería |

## 9.4 Suposiciones Clave

| # | Suposición | Plan de Validación |
|---|-----------|-------------------|
| A1 | Las parejas están dispuestas a pagar EUR 19-29 por invitaciones digitales | Encuesta a 50 parejas comprometidas; test A/B de precios en lanzamiento |
| A2 | Los invitados harán RSVP vía formulario web mobile (sin app) | Testing de usabilidad con 10 invitados; medir tasa de completación |
| A3 | WhatsApp es el canal de comunicación preferido para bodas españolas | Investigación de mercado; encuesta a audiencia objetivo |
| A4 | Los accomplices (padrino/madrina) usarán activamente el panel en vivo | Entrevistas con 10 miembros recientes de bodas |
| A5 | PostgreSQL en Kubernetes es suficiente para escala MVP | Load testing; monitorizar rendimiento de queries; establecer triggers de scaling |
| A6 | La eliminación de datos a 30 días es aceptable para usuarios | Incluir en Términos de Servicio; encuesta de aceptación de usuarios |
| A7 | Los sitios estáticos cargan en <2s en mobile 3G | Testing con Lighthouse; monitoring RUM post-lanzamiento |

## 9.5 Dependencias Externas

| Dependencia | Proveedor | Estado | Impacto si No Disponible |
|-----------|----------|--------|----------------------|
| WhatsApp Business API | Meta | Aprobación necesaria | No se pueden enviar invitaciones WhatsApp ni mensajes en vivo |
| Email SMTP | Gmail (gratis) | Límite 500 emails/día | No se pueden enviar emails más allá de cuota diaria (magic links, invitaciones) |
| Stripe | Stripe | Cuenta necesaria | No se pueden procesar pagos (paywall de publicación) |
| Google Maps API | Google | Clave API necesaria | No se pueden embeber mapas ni proporcionar direcciones |
| CDN | Cloudflare | Configuración necesaria | Sitios estáticos servidos desde origin (más lento) |
| Dominio y SSL | Registrar | Configuración DNS necesaria | No se pueden servir sitios sobre HTTPS |

---

> [Volver al Índice PRD](../PRD.md) | [Anterior: Métricas de Éxito](08-success-metrics.md) | [Siguiente: Plan de Lanzamiento](10-rollout-plan.md)