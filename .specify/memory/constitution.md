<!--
  SYNC IMPACT REPORT
  ==================
  Version Change: [TEMPLATE] → 1.0.0 (INITIAL RATIFICATION — full constitution drafted from project documentation)

  Modified Principles: N/A (first population of template)

  Added Sections:
    - I. Curaduría Sobre Cantidad
    - II. Transparencia de Acceso
    - III. Arquitectura por Capas (Microservicios Orientados a Eventos)
    - IV. Seguridad en Profundidad (Defense-in-Depth)
    - V. Calidad Verificada (Pirámide de Pruebas)
    - VI. Resiliencia e Integración Defensiva
    - VII. Simplicity & YAGNI
    - Stack Tecnológico Canonical
    - Gobernanza

  Removed Sections: All placeholder tokens replaced.

  Templates requiring updates:
    ✅ plan-template.md   — "Constitution Check" section aligns with principles below.
    ✅ spec-template.md   — Scope/requirements sections compatible with these principles.
    ✅ tasks-template.md  — Phase/task categorization reflects testing, security, and observability principles.

  Follow-up TODOs:
    - TODO(RATIFICATION_DATE): Date kept as 2026-03-08 (today, first adoption). Confirm if a prior governing date exists.
    - TODO(AUTHOR): Author name(s) not provided in project documentation; mark as pending.
-->

# Arteflujo Constitution

## Core Principles

### I. Curaduría Sobre Cantidad

El catálogo de **arteflujo** DEBE contener exclusivamente contenido con valor artístico
verificable: obras premiadas en festivales internacionales (Óscar, Cannes, Berlinale, etc.),
cine de autor, música selecta o propuestas ingeniosas y audaces documentadas. El volumen de
contenido es secundario a la calidad.

**Rationale:** La propuesta de valor central frente a plataformas de scroll infinito es la
selección editorial premium. Incluir contenido sin criterio de calidad destruye la identidad
del producto.

**Rules:**
- Todo ítem indexado DEBE tener al menos un `HITO` o una justificación en `valor_cultural`
  (máx. 280 caracteres) antes de ser publicado.
- El campo `vibe_mood` es obligatorio para habilitar el filtro de descubrimiento.
- Contenido sin metadatos de calidad verificados NO DEBE aparecer en resultados públicos.

---

### II. Transparencia de Acceso

El sistema DEBE comunicar sin ambigüedad el costo y la forma de acceso a cada obra mediante
el sistema visual de tres estados:
- 🟢 **Abierto** — Gratuito o dominio público.
- 🟡 **Suscripción** — Requiere cuenta activa en la plataforma origen.
- 🔵 **Premium/VOD** — Pago único por alquiler o compra.

**Rationale:** La transparencia sobre el acceso es un pilar de confianza del usuario y un
requisito de negocio para la monetización por afiliación.

**Rules:**
- Cada `OBRA` DEBE tener un `ESTADO_ACCESO` definido. El valor NULL no está permitido.
- El campo `permite_iframe` en `PLATAFORMA_ORIGEN` DEBE ser evaluado antes de renderizar
  cualquier reproductor; si es `false`, DEBE usarse Deep Linking, nunca un iframe roto.
- Los parámetros de afiliación DEBEN ser inyectados dinámicamente en el backend, nunca
  hardcodeados en el frontend.

---

### III. Arquitectura por Capas (Microservicios Orientados a Eventos)

El sistema DEBE seguir la arquitectura de cuatro capas establecida:
1. **Cliente/Edge** — Next.js + CDN + Load Balancer.
2. **Servicios** — API Gateway → Auth Service, Servicio de Curaduría, Motor de Agregación,
   Servicio de Usuario.
3. **Integración** — Motor de Agregación + Redis Cache + APIs de terceros.
4. **Datos** — PostgreSQL (metadata relacional) + Redis (caché de sesiones y búsquedas).

**Rationale:** El Motor de Agregación realiza indexación pesada que no debe afectar la
latencia del frontend. La separación de microservicios permite escalar servicios individuales
durante picos de tráfico (ej. estrenos de cortos premiados).

**Rules:**
- El API Gateway DEBE ser el único punto de entrada público; los microservicios internos NO
  DEBEN ser expuestos directamente a Internet.
- Toda comunicación entre servicios MUST usar TLS 1.3 (HTTPS).
- La lógica de negocio (ej. filtros de Dial de Tiempo, asignación de Moods) DEBE residir en
  el Servicio de Curaduría, no en el frontend.
- Los metadatos de APIs externas DEBEN ser cacheados en Redis; las consultas directas a APIs
  externas en cada request están PROHIBIDAS sin pasar por la capa de caché.
- La estructura de ficheros canónica es:
  ```
  arteflujo-project/
  ├── frontend/   # Next.js (React)
  └── backend/    # NestJS (Node.js)
  ```

---

### IV. Seguridad en Profundidad (Defense-in-Depth)

La seguridad DEBE aplicarse en todas las capas del sistema sin excepción.

**Rationale:** La plataforma gestiona perfiles de usuario, tokens de sesión y enlaces de
afiliación monetizables. Una brecha afecta la confianza del usuario y los ingresos.

**Rules:**
- Autenticación mediante **JWT** sin estado; los tokens DEBEN ser validados en el API Gateway
  antes de propagar cualquier request a microservicios internos.
- Las credenciales y llaves de API de terceros (YouTube, Vimeo, MUBI) NUNCA deben estar en
  el código fuente; DEBEN gestionarse via **AWS Secrets Manager** o equivalente.
- RBAC obligatorio: Usuario (Watchlist + Moods) vs. Curador/Admin (catálogo + Hitos).
- Sanitización XSS MUST aplicarse a todos los campos de texto renderizados en el frontend
  (especialmente `valor_cultural` y `DATO_CONTEXTO`).
- CORS estricto: solo el origen oficial de arteflujo puede consumir el API Gateway.
- Rate Limiting por IP y por usuario en todos los endpoints de búsqueda.
- Los microservicios y la BD DEBEN residir en una VPC privada (AWS).

---

### V. Calidad Verificada (Pirámide de Pruebas)

Las pruebas DEBEN seguir el modelo de pirámide de automatización con énfasis en la
resiliencia de integraciones externas.

**Rationale:** La plataforma depende de APIs de terceros (YouTube, Vimeo, MUBI) que pueden
fallar o cambiar sus contratos. Las pruebas garantizan la estabilidad del producto sin consumir
cuotas reales.

**Rules:**
- **Unitarias (Backend):** Jest / NestJS Testing — validar lógica de Curaduría, DTOs y
  cálculo de duraciones.
- **Unitarias (Frontend):** React Testing Library — interactividad del Dial de Tiempo y
  renderizado de iconos de acceso.
- **Contratos de API:** Pact — compatibilidad continua con YouTube, Vimeo y MUBI.
- **E2E:** Playwright o Cypress — flujos: Descubrimiento, Watchlist, Modo Contexto.
- **Carga:** K6 o JMeter — estresar el Motor de Agregación durante picos simulados.
- Las APIs externas DEBEN mockearse en entornos de desarrollo y CI. Consumir cuotas reales
  en pruebas automáticas está PROHIBIDO.

---

### VI. Resiliencia e Integración Defensiva

El sistema DEBE degradarse de forma elegante ante fallos de APIs externas.

**Rationale:** La disponibilidad de contenido depende de terceros fuera del control de
arteflujo. Un fallo en Vimeo no puede derribar la plataforma completa.

**Rules:**
- **Circuit Breaker:** Si una API externa falla repetidamente, el contenido afectado DEBE
  marcarse como "No disponible temporalmente" sin propagar el error al resto del catálogo.
- **Caché de Metadatos:** Los metadatos de terceros DEBEN actualizarse mediante cron job
  nocturno; la frescura máxima aceptable es 24 horas para contenido activo.
- **Validación de Deep Links:** Un servicio en segundo plano DEBE verificar periódicamente
  que los enlaces externos sigan activos.
- Las respuestas de error al cliente DEBEN ser amigables y contextuales, nunca stacktraces
  crudos.

---

### VII. Simplicidad y YAGNI

Empezar simple. Todo incremento de complejidad arquitéctonica DEBE justificarse con una
necesidad real documentada en el plan de la feature.

**Rationale:** El proyecto es un MVP. La sobre-ingeniería consume tiempo sin valor para el
usuario final.

**Rules:**
- No agregar entidades, microservicios o capas sin que exista una historia de usuario que
  las requiera explícitamente.
- Los diseños optativos de mayor complejidad (ej. ElasticSearch, mensajería con Kafka) DEBEN
  documentarse como opciones futuras, no implementarse en el MVP.
- Toda violación a este principio DEBE registrarse en la tabla "Complexity Tracking" del
  `plan.md` de la feature correspondiente.

---

## Stack Tecnológico Canonical

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | Next.js (React) | SSR para SEO de fichas técnicas de obras |
| Backend | NestJS (Node.js) | Manejo eficiente de múltiples calls async a APIs externas |
| Base de Datos | PostgreSQL (Amazon RDS) | Integridad referencial entre Obras, Hitos y Contexto |
| Caché | Redis (Amazon ElastiCache) | Sesiones y metadatos frecuentes |
| Mensajería | Amazon SNS/SQS | Comunicación asíncrona entre el Agregador y notificaciones |
| Computación | AWS Fargate (ECS) | Contenedores sin gestión de servidores |
| CDN / Seguridad | Amazon CloudFront + AWS WAF | Entrega rápida y protección anti-scraping |
| Secretos | AWS Secrets Manager | Llaves de API de terceros y credenciales |

Desviaciones del stack canonical en features de producción DEBEN ser aprobadas mediante
enmienda a esta constitución.

---

## Gobernanza

Esta Constitución tiene precedencia sobre cualquier otra práctica, guía técnica o preferencia
individual. Todo el código, diseño de API y modelo de datos producidos para arteflujo DEBEN
cumplir con los principios aquí establecidos.

**Proceso de Enmienda:**
1. Identificar el principio afectado y describir el cambio propuesto.
2. Documentar la motivación y el impacto esperado en el plan de la feature.
3. Incrementar la versión semántica según la escala del cambio (MAJOR / MINOR / PATCH).
4. Actualizar `LAST_AMENDED_DATE` con la fecha ISO del día del cambio.
5. Propagar los cambios a las plantillas dependientes (plan, spec, tasks) según el Sync
   Impact Report adjunto.

**Compliance Reviews:**
- Cada PR DEBE verificar cumplimiento con los principios III (Arquitectura), IV (Seguridad)
  y V (Pruebas) como mínimo.
- Las tareas en `tasks.md` DEBEN incluir categorías de seguridad y observabilidad cuando
  aplique.

**TODO(AUTHOR):** William Alberto Orejuela Rios.

**Version**: 1.0.0 | **Ratified**: 2026-03-08 | **Last Amended**: 2026-03-08
