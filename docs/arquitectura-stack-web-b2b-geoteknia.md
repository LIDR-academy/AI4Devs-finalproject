# Arquitectura y Stack Tecnológico — Geoteknia

> Documento de referencia para el equipo técnico. Cubre la decisión de arquitectura, el stack elegido, las alternativas evaluadas y los riesgos con sus mitigaciones.

---

## 1. Contexto y fuerzas que mandan la decisión

El proyecto es un **greenfield** B2B de captación de leads para una ingeniería geotécnica española. Antes de elegir cualquier tecnología se fijaron las restricciones reales:

| Fuerza | Descripción | Consecuencia tecnológica |
|---|---|---|
| **SEO es el producto** | CWV en verde como *quality gate*, schema JSON-LD, sitemap dinámico, ~100–160 URLs | SSG + ISR on-demand obligatorio |
| **Escala real modesta** | Objetivo 12M: 3.500 sesiones/mes, ~40 leads/mes | No es un problema de concurrencia; es de rendimiento de página y coste bajo |
| **Cuello de botella = contenido** | Portal interno con flujo editorial IA (Claude) + revisión humana | API de Claude server-side; clave nunca en cliente |
| **Publicar desde portal → revalidar frontal** | RF-21: publicar contenido sin desplegar código | ISR on-demand (`revalidatePath`) nativo en Next.js |
| **RGPD/LOPDGDD + equipo PYME** | Datos en región EU, Consent Mode v2, DPA con proveedores | Postgres EU; sin PII de leads en prompts de Claude |

---

## 2. Stack elegido — Next.js full-stack (monolito modular)

### Tabla de componentes

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend público** | Next.js 15 (App Router) + React 19 + TypeScript | SSG + ISR on-demand resuelve CWV y SEO de raíz; `next/image` genera AVIF/WebP automáticamente; Metadata API + componentes JSON-LD integrados |
| **Backend / API** | Route Handlers + Server Actions (mismo proyecto Next.js) | Un solo despliegue, un solo lenguaje, tipos E2E sin contrato API manual; la clave de Claude vive solo en servidor |
| **Base de datos** | PostgreSQL gestionado — **Neon** (serverless, scale-to-zero, branching por PR) | Postgres estándar = cero lock-in de motor; Neon cuesta casi nada en idle en MVP; branching de BD por PR encaja con previews de Vercel; **región EU** (RGPD) |
| **ORM / migraciones** | **Prisma** (schema, migraciones, seeds) + **Zod** (validación runtime) | Migraciones reproducibles y versionadas; Zod valida formularios multi-paso y la salida estructurada de Claude |
| **Caché** | CDN/edge de Vercel (páginas ISR) + **Upstash Redis** (opcional, fase 2) | El 90% del tráfico es contenido cacheable en edge; Redis solo cuando se añada cola de generación IA o rate-limiting avanzado |
| **Auth** | **Auth.js v5 (NextAuth)** — credenciales + TOTP 2FA + RBAC en BD + audit log | Control total, coste cero, cumple RF-17/RNF-ADMIN; hash argon2; sesiones con expiración |
| **Integración IA** | SDK oficial `@anthropic-ai/sdk` server-side | Modelo por defecto `claude-sonnet-4-6`; `claude-opus-4-8` para piezas pillar; prompt caching; retries con backoff; log de tokens en BD + tope mensual + alerta |
| **Email transaccional** | **Resend** + React Email | Plantillas tipadas en React; confirmación <2 h con técnico asignado (RF-Q3) |
| **Anti-spam** | **Cloudflare Turnstile** | Sin fricción, sin datos de comportamiento a Google → mejor para Consent Mode v2 / RGPD |
| **Infraestructura** | **Vercel** (front + funciones) + **Neon** (DB) + **Cloudflare** (DNS/WAF) | Cero servidores que mantener; preview por PR; escalado automático; WAF de CF protege `/admin` |
| **CI/CD** | GitHub Actions: lint + typecheck + test + **Lighthouse CI (gate CWV)** + `prisma migrate deploy` | Lighthouse CI como *quality gate* es requisito explícito del PRD (RNF-PERF) |
| **Observabilidad** | Sentry (errores) + GA4/GTM + Consent Mode v2 (producto) + Axiom (logs) + panel propio de coste IA | Separa observabilidad técnica de analítica de negocio |
| **Testing** | Vitest (unidad) + Playwright (E2E) + Lighthouse CI (rendimiento/a11y) | Playwright cubre los flujos críticos del DoD: formulario multi-paso, login+2FA, flujo editorial Borrador IA→Publicado |

### Patrón arquitectónico

**Monolito modular** sobre Next.js. Un despliegue, fronteras de dominio limpias en código (`/lib/leads`, `/lib/projects`, `/lib/content`, `/lib/ia`). Permite extraer el back-office como servicio independiente (p. ej. NestJS) cuando el volumen lo justifique, sin reescribir el dominio.

---

## 3. Alternativas evaluadas

### Alternativa B — Next.js frontal + NestJS backend desacoplado

- **Cuándo elegirla:** el portal evoluciona a plataforma con integraciones ERP/CRM corporativo o un equipo backend dedicado.
- **Trade-off:** más piezas (2 despliegues, 2 ciclos de CI, contratos API, Redis+BullMQ para colas), MVP más lento, coste más alto en idle. No rentabiliza la complejidad a 3.500 sesiones/mes.
- **Ruta de migración desde A:** la capa `/lib` del monolito es la frontera; se extrae como NestJS sin tocar el front.

### Alternativa C — Astro (público) + Supabase (BaaS)

- **Cuándo elegirla:** SEO/CWV es dogma absoluto y el portal admin puede ser sencillo.
- **Trade-off:** dos paradigmas (Astro islands + portal React), el back-office es más artesanal, RLS de Supabase tiene curva; concentra BD+Auth+Storage en un solo proveedor (lock-in moderado).

### Comparativa

| Criterio | **A — Next.js full-stack** ✅ | **B — Next.js + NestJS** | **C — Astro + Supabase** |
|---|---|---|---|
| Escalabilidad | Alta (edge + serverless) | Muy alta | Alta en lectura |
| Mantenibilidad | Muy alta: 1 lenguaje, 1 repo | Media: 2 despliegues | Media: 2 paradigmas |
| Seguridad | Buena | Muy buena | Buena (RLS potente pero frágil) |
| Coste MVP | **Muy bajo** | Medio-alto | **El más bajo** |
| Velocidad de entrega | **La más alta** | La más baja | Alta en público, media en portal |
| Ajuste RF-21 (publicar→revalidar) | Nativo (ISR on-demand) | Requiere webhook | Rebuild o ISR de Astro |

---

## 4. Diagramas de arquitectura

### MVP

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE                              │
│                   DNS + WAF + Turnstile                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
    Visitante B2B               Usuario interno
    (móvil/desktop)             (/admin)
          │                             │
┌─────────▼─────────────────────────────▼────────────────────────┐
│                           VERCEL                                │
│  ┌─────────────────────┐   ┌────────────────────────────────┐  │
│  │   Next.js Frontal   │   │    Portal /admin (noindex)     │  │
│  │   SSG + ISR on-dem  │   │  Auth.js + RBAC + 2FA + log   │  │
│  │   JSON-LD, sitemap  │   └──────────────┬─────────────────┘  │
│  │   CWV optimizado    │                  │                     │
│  └──────────┬──────────┘   ┌─────────────▼──────────────────┐  │
│             │              │   Route Handlers + Server Acts  │  │
│             └──────────────►   Leads · Proyectos · Content   │  │
│                            │   IA (Claude server-side)       │  │
│                            └──────────────┬─────────────────-┘  │
└────────────────────────────────────────── │ ────────────────────┘
                                            │
              ┌─────────────────────────────┼────────────────────┐
              │                             │                    │
    ┌─────────▼────────┐        ┌───────────▼──────┐  ┌────────▼──────┐
    │  PostgreSQL Neon  │        │  API de Claude   │  │    Resend     │
    │  (región EU)      │        │  Sonnet / Opus   │  │  Email trans. │
    │  Prisma ORM       │        │  Prompt caching  │  │  React Email  │
    └──────────────────┘        └──────────────────┘  └───────────────┘

    ← GA4 + GTM + Consent Mode v2 (desde el navegador, bloqueado hasta consentimiento) →
```

### Escalado (cuando el volumen o el equipo lo justifiquen)

```
┌──────────┐    ┌──────────────────────┐    ┌──────────────────────────────┐
│Cloudflare│───►│  Next.js (edge/ISR)  │───►│  API Next.js / NestJS extra  │
│CDN + WAF │    └──────────────────────┘    └──────────┬───────────────────┘
└──────────┘                                           │
                    ┌──────────────────────────────────┤
                    │                                  │
         ┌──────────▼──────────┐          ┌───────────▼────────────┐
         │  Redis (Upstash)    │          │  Cola BullMQ/QStash    │
         │  Cache + rate-limit │          │  Workers: IA + email   │
         └─────────────────────┘          │  + sitemap             │
                                          └───────────┬────────────┘
                                                      │
                               ┌──────────────────────▼─────────────────┐
                               │  Postgres EU + read replicas + PITR    │
                               └────────────────────────────────────────┘
```

---

## 5. Riesgos y mitigaciones

| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| R1 | **Contenido IA impreciso (YMYL):** dato normativo erróneo = responsabilidad real | Alto | Flujo Borrador IA→Revisión→Aprobado→Publicado obligatorio; audit log de quién aprueba; aviso explícito de verificación técnica |
| R2 | **Coste/latencia/rate-limits de Claude** | Medio | Default Sonnet 4.6, Opus solo para pillar; prompt caching; log tokens + tope mensual + alerta; retries backoff; timeout; degradación elegante |
| R3 | **RGPD: PII de leads y transferencias** | Alto | Datos en región EU; Consent Mode v2; Turnstile en vez de reCAPTCHA; no enviar PII en prompts a Claude; DPA con cada proveedor |
| R4 | **Indexación fallida** (hunde el proyecto) | Crítico | SSG/ISR; validación de schema en CI; sitemap automático + GSC; canonical explícito; `/admin` con noindex + robots disallow |
| R5 | **CWV se degradan** con galerías pesadas | Medio | Lighthouse CI como gate de despliegue; AVIF/WebP; lazy-load; `next/image`; presupuesto de performance por plantilla |
| R6 | **Seguridad de `/admin`** | Alto | RBAC + 2FA, argon2, rate-limiting, audit log, WAF Cloudflare, sesiones con expiración, aislamiento del frontal |
| R7 | **Lock-in de Vercel** | Medio | Next.js portable (adaptador Node/contenedor); Postgres estándar; lógica en `/lib` desacoplada del runtime |
| R8 | **Bus factor en equipo pequeño** | Medio | Stack único TS E2E; servicios gestionados; Prisma+Zod como contratos vivos; E2E Playwright sobre flujos críticos del DoD |
| R9 | **Scope creep** (portal cliente, ERP, multidioma) | Medio | Respetar "Fuera de alcance" del PRD; fronteras modulares para entrar aisladas |

---

## 6. Disparadores para evolucionar la arquitectura

| Señal | Acción |
|---|---|
| Generación IA en lote o lenta | Añadir cola BullMQ/QStash + workers |
| Picos de lectura > 50k sesiones/mes | Read replicas + Redis para caché |
| Back-office crece a plataforma | Extraer NestJS (frontera ya definida en `/lib`) |
| Portal cliente externo (fase 2) | Módulo aislado, no rompe el monolito |
