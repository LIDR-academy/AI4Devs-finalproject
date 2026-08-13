# RunMarket — Infraestructura de despliegue

Este documento presenta **dos opciones únicas y cerradas** de infraestructura para RunMarket, siguiendo el criterio de diseño de preferir un único proveedor por opción salvo justificación técnica fuerte para diversificar. Ambas opciones parten de los mismos requisitos no negociables fijados en [`docs/ARCHITECTURE.md`](ARCHITECTURE.md):

- Frontend Next.js 15 (App Router) con SSR selectivo — solo catálogo y ficha de producto necesitan renderizado en servidor.
- Backend Express 4 + TypeScript, arquitectura en capas (Router → Controller → Service → Repository), sin estado en memoria: el `sessionId` vive en una cookie, no en el proceso. Esta propiedad es la que permite escalar el backend horizontalmente sin tocar código.
- Base de datos PostgreSQL 16 vía Prisma 5, con `schema.prisma`, migraciones y `prisma/seed.ts` ya definidos en el repositorio.
- Reglas de seguridad de `CLAUDE.md`: precio/stock siempre desde BD, Zod `.strict()`, CORS sin wildcard fuera de desarrollo, `sessionId` con `crypto.randomUUID()`, sin PII en logs, rate limiting en mutaciones. Estas reglas son de código y se mantienen idénticas en ambas opciones de infraestructura; lo que cambia es **dónde** se ejecutan y **cómo** se protegen sus variables de entorno.

> Nota sobre costes: los importes son orientativos a fecha de redacción y deben revisarse antes del despliegue final, ya que los proveedores cloud modifican periódicamente precios y límites de free tier.

---

## 1. Resumen ejecutivo

Para la **entrega académica del MVP** se recomienda un único proveedor: **AWS**, con todo el stack (frontend, backend y PostgreSQL) dockerizado en una sola instancia EC2 dentro del Free Tier, detrás de Nginx (con TLS vía Certbot opcional, ver sección 3.2) y un pipeline de GitHub Actions que despliega por SSH. Esta opción reutiliza directamente el `docker-compose.yml` que ya existe en el repositorio, tiene coste **0 €/mes** durante los 12 meses de Free Tier (que cubren sobradamente la ventana de evaluación académica) y permite aplicar de forma práctica Docker, Linux, reverse proxy/TLS y CI/CD — contenidos directamente relacionados con la sesión de infraestructura del máster. Su límite es operativo: todo el stack vive en un único host, por lo que su caída afecta a las tres capas a la vez, y pasado el Free Tier el coste sube a ~10-12 €/mes, en el límite superior del presupuesto fijado.

Para una **infraestructura profesional** capaz de evolucionar de cientos a millones de usuarios sin reescribir la arquitectura, se recomienda **AWS como proveedor único para todo el stack**: frontend Next.js autohospedado en contenedor (ECS Fargate), backend Express (ECS Fargate), base de datos (RDS), caché (ElastiCache), CDN (CloudFront) y secretos (Secrets Manager). Next.js en modo `standalone` soporta de forma nativa ISR (revalidación temporal) y su propio endpoint de Image Optimization sin depender de una plataforma externa; CloudFront delante del Application Load Balancer cubre el papel de CDN edge, cacheando las respuestas SSR de catálogo y ficha de producto según sus cabeceras `Cache-Control`. Se evaluó Vercel Pro como alternativa para el frontend — ofrece esas mismas capacidades sin configuración adicional — pero se descarta como recomendación principal porque introduce un segundo proveedor, una segunda facturación y un segundo plano de IAM para una ganancia de capacidades que Next.js self-hosted ya cubre dentro del alcance de SSR selectivo de RunMarket (solo dos tipos de página). Queda documentada en la sección 4.14 como alternativa válida si en el futuro el coste de operar esa capa por cuenta propia supera al de pagarla ya resuelta.

No se recomienda introducir Kubernetes ni microservicios en ninguna fase descrita en este documento, ni siquiera en la de escala alta. El backend Express actual, contenedorizado y sin estado, escala horizontalmente con ECS Fargate hasta volúmenes de tráfico muy superiores a los que un MVP de un solo dominio (catálogo + checkout simulado) necesita. Ambas decisiones solo se reconsiderarían ante una fragmentación real en dominios de negocio independientes (sección 5.6).

---

## 2. Tabla comparativa

| Dimensión | Opción A — MVP académico | Opción B — Infraestructura profesional |
|---|---|---|
| Objetivo | Entrega evaluable por profesores, coste mínimo | Producción real, cientos a millones de usuarios |
| Proveedor(es) | 1 (AWS) | 1 (AWS) |
| Coste estimado | 0 €/mes en Free Tier (12 meses); ~10-12 €/mes después | 60-140 €/mes en el arranque; crece por fases (sección 4.10) |
| Frontend | Next.js contenedorizado en la misma EC2, detrás de Nginx | Next.js `standalone` en ECS Fargate, servicio independiente del backend |
| Backend | Contenedor Express en la misma EC2 | AWS ECS Fargate, ≥2 tareas, Application Load Balancer |
| Base de datos | Contenedor PostgreSQL en la misma EC2 (volumen EBS) | AWS RDS PostgreSQL, backups automáticos + PITR |
| Caché | No aplica | Amazon ElastiCache Redis (introducido por fases, sección 4.4) |
| CDN | No aplica (podría añadirse CloudFront) | Amazon CloudFront delante del ALB, cachea SSR de catálogo/ficha y assets estáticos vía S3 |
| Secretos | `.env` local a la instancia, fuera de control de versiones | AWS Secrets Manager con rotación |
| CI/CD | GitHub Actions: build de imágenes + deploy por SSH | GitHub Actions multi-entorno: dev → staging → production |
| Observabilidad | `docker compose logs`, métricas básicas EC2 (gratis) | Sentry + CloudWatch Logs/Metrics + alarmas |
| Backups | Opcional — `pg_dump` programado + copia en S3 Free Tier | Obligatorios — automáticos RDS + PITR + snapshots cifrados |
| Seguridad | Security Group restringido, Nginx (+ Certbot opcional), reglas de `CLAUDE.md` | IAM de mínimo privilegio, VPC privada, WAF, Secrets Manager, reglas de `CLAUDE.md` |
| Escalado | Solo vertical (un único host) | Horizontal en API (ECS Auto Scaling), vertical/réplicas en BD |
| Separación de entornos | No aplica (un único entorno público) | dev / staging / production con BD y secretos independientes |
| Complejidad operativa | Media (gestión de un servidor Linux) | Media-alta, asumible para producción real |
| Riesgo principal | Punto único de fallo; coste tras el Free Tier | Disciplina de IAM/redes/observabilidad; coste creciente |

---

## 3. Opción A — MVP académico

### 3.1 Diagrama de infraestructura

```mermaid
flowchart TB
    U["Profesor / Evaluador"] -->|"HTTP o HTTPS\n(TLS opcional)"| NGINX["Nginx (+ Certbot opcional)\nReverse proxy"]

    subgraph EC2["AWS EC2 t3.micro · Free Tier\nDocker Compose"]
        NGINX -->|"/"| FE["Contenedor frontend\nNext.js 15 SSR (standalone)"]
        NGINX -->|"/api"| API["Contenedor backend\nExpress API · Node.js 20"]
        API -->|"DATABASE_URL\n(red interna de Compose)"| DB[("Contenedor PostgreSQL 16\nVolumen EBS")]
    end

    GH["GitHub Repository\nmonorepo npm workspaces"] -->|"build + push GHCR"| GHA["GitHub Actions"]
    GHA -->|"SSH deploy\ndocker compose pull && up -d"| EC2
    GHA -.->|"prisma migrate deploy\n(paso bloqueante, una vez)"| DB

    EC2 -.->|"pg_dump nocturno (opcional)"| S3[("Amazon S3 Free Tier\nBackups")]
```

### 3.2 Proveedores y servicios por capa

| Componente | Servicio AWS | Detalle |
|---|---|---|
| Cómputo | EC2 `t3.micro` (Free Tier, 750 h/mes durante 12 meses) | Único host; ejecuta los tres contenedores de la aplicación |
| Orquestación | Docker + Docker Compose | Reutiliza el `docker-compose.yml` ya existente en la raíz del repositorio, ampliado con servicios `frontend`, `backend` y `nginx` |
| Reverse proxy | Nginx | Único punto de entrada público; enruta `/` al frontend y `/api` al backend |
| TLS (opcional) | Certbot (Let's Encrypt) | Certificado gratuito sobre Nginx; omitible en la entrega académica (ver nota más abajo) |
| Almacenamiento | Volumen EBS gp3 (incluido en Free Tier hasta 30 GB) | Persistencia del volumen Docker de PostgreSQL |
| Backups (opcional) | Amazon S3 Free Tier (5 GB) | Destino de `pg_dump` programado, fuera del propio host; no es necesario para evaluar la entrega, solo para conservar datos generados durante la demo |
| Dominio (opcional) | Subdominio gratuito (DuckDNS) o Route 53 si se posee dominio propio | Solo necesario si se activa Certbot; sin TLS basta con la IP pública o el DNS por defecto de la EC2 |
| CI/CD | GitHub Actions + GitHub Container Registry (`ghcr.io`) | Build de imágenes, push y despliegue por SSH |

Esta opción reutiliza exactamente el modelo de datos y el `docker-compose.yml` que ya existen en el repositorio (servicio `postgres:16-alpine` con volumen `pgdata`), añadiendo dos servicios nuevos (`frontend`, `backend`) y uno de borde (`nginx`). No hay sorpresas arquitectónicas: lo que corre en local con `docker compose up -d` es, con variables de entorno de producción, lo mismo que corre en la EC2.

**Nota sobre TLS (opcional):** para la entrega académica, Certbot/TLS puede omitirse. Nginx sigue siendo necesario como único punto de entrada que enruta por path hacia frontend y backend sin tener que configurar CORS entre ellos, pero el certificado es prescindible: la aplicación puede servirse por HTTP plano en el puerto 80, sobre la IP pública o el DNS por defecto de la instancia, sin depender de tener un dominio (propio o gratuito vía DuckDNS) configurado antes de la demo. Los profesores pueden validar el flujo completo igualmente por HTTP. La contrapartida es que el tráfico —incluido el checkout simulado— viaja sin cifrar; es una concesión aceptable solo porque no hay datos de pago ni PII reales en esta fase, y nunca debe mantenerse así si la Opción A se usa con tráfico real. Activar Certbot sigue siendo gratuito y se recomienda en cuanto se disponga de un dominio, y es obligatorio al evolucionar hacia la Opción B.

### 3.3 Variables de entorno, migraciones y seed de Prisma

Variables de entorno necesarias en el `.env` de la instancia (nunca en el repositorio):

```text
DB_USER=<usuario-fuerte>
DB_PASSWORD=<contraseña-fuerte-generada>
DB_NAME=runmarket
DB_PORT=5432
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
CORS_ORIGIN=https://<dominio-publico>
SESSION_SECRET=<valor-aleatorio-fuerte>
ASSETS_BASE_URL=https://<dominio-publico>
NEXT_PUBLIC_API_URL=/api
NODE_ENV=production
```

Dos diferencias deliberadas respecto al `.env.example` de desarrollo:

- `DATABASE_URL` apunta al nombre del servicio Docker (`postgres`), no a `localhost`, y el puerto de PostgreSQL **no debe publicarse** en el host (`ports:` del servicio `postgres` se elimina en el compose de producción; el actual mapea `${DB_PORT}:5432` al host porque está pensado para desarrollo local, donde Prisma Studio y herramientas externas necesitan conectarse desde fuera del contenedor).
- `NEXT_PUBLIC_API_URL=/api` apunta a una ruta relativa servida por Nginx en el mismo origen, evitando configurar CORS entre dominios distintos.

Migraciones y seed, ejecutados como pasos explícitos del pipeline, nunca en el arranque del contenedor:

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run db:seed   # solo en el primer despliegue
```

`npm run db:seed` es el script real definido en `backend/package.json` (ejecuta `prisma/seed.ts` vía `ts-node`); no debe repetirse en cada deploy para no duplicar el catálogo de 13 productos.

### 3.4 CI/CD

Pipeline de GitHub Actions:

1. Instalar dependencias del monorepo, ejecutar lint, typecheck y tests (unitarios + integración backend, unitarios frontend).
2. Construir las imágenes Docker de `frontend` (`next build` con `output: 'standalone'`) y `backend` (`tsc` + runtime `node`).
3. Publicar ambas imágenes en GitHub Container Registry, etiquetadas con el SHA del commit.
4. Conectarse por SSH a la instancia EC2 (clave dedicada en GitHub Secrets).
5. `docker compose pull && docker compose up -d`.
6. `docker compose exec backend npx prisma migrate deploy` como paso bloqueante antes de considerar el despliegue exitoso.

Secretos en GitHub Actions: `EC2_HOST`, `EC2_USER`, `EC2_SSH_PRIVATE_KEY`. Las variables de la aplicación (`DATABASE_URL`, `CORS_ORIGIN`, `SESSION_SECRET`...) viven únicamente en el `.env` de la instancia, nunca en el repositorio ni en los logs de Actions.

### 3.5 Observabilidad

- `docker compose logs -f <servicio>` y `journald` para inspección puntual.
- Métricas básicas de EC2 (CPU, red, disco) incluidas gratis en CloudWatch a granularidad de 5 minutos, sin coste adicional.
- Opcional: un monitor de uptime externo gratuito (por ejemplo UptimeRobot, plan free) para recibir aviso si el host deja de responder antes de que lo note un evaluador. Es una herramienta SaaS de monitorización pasiva, no forma parte del stack desplegado, por lo que no contradice el criterio de proveedor único de infraestructura.

No se justifica introducir Datadog, Grafana o un stack ELK en esta fase: el volumen de tráfico académico no lo requiere y añadiría complejidad operativa sin beneficio medible.

### 3.6 Seguridad

- Security Group restringido a los puertos 22 (idealmente solo desde la IP de despliegue), 80 y 443.
- Clave SSH dedicada al despliegue, distinta de cualquier acceso administrativo personal, almacenada solo en GitHub Secrets.
- HTTPS gestionado por Nginx + Certbot, con renovación automática del certificado — opcional en la entrega académica (ver nota en 3.2); recomendado en cuanto se disponga de dominio, y obligatorio al evolucionar hacia la Opción B.
- PostgreSQL accesible únicamente desde la red interna de Docker Compose; sin puerto publicado al host ni a internet.
- `.env` fuera de control de versiones, con `SESSION_SECRET` y credenciales de base de datos generados específicamente para producción (nunca los valores de ejemplo de `.env.example`).
- Se mantienen sin cambios las reglas de seguridad de `CLAUDE.md` ya implementadas y verificadas en la revisión OWASP de cada historia: precio y stock siempre leídos de Prisma, Zod `.strict()` en los controllers, `sessionId` con `crypto.randomUUID()` en cookie `HttpOnly`, CORS restringido al dominio exacto, rate limiting en `POST /api/checkout` y `POST/PUT /api/cart`, sin PII en logs de Morgan.

### 3.7 Backups (opcional)

A diferencia de la Opción B, en el MVP académico el backup **no es un requisito**, sino una mejora opcional de bajo coste. La razón es la propia naturaleza de los datos: el catálogo se reconstruye al completo con `npm run db:seed` (13 productos deterministas), y los pedidos creados durante una demo son datos de prueba sin valor de negocio real — perder el contenido de la base de datos no impide continuar la evaluación, solo obliga a volver a ejecutar `prisma migrate deploy` y `db:seed`. Mantener el backup fuera del camino crítico simplifica la operación de una persona sobre un único host, que es justamente el objetivo de esta opción.

Si de todos modos se quiere disponer de una copia (por ejemplo, para no perder pedidos generados durante varias sesiones de prueba de los evaluadores), lo recomendado es:

- `pg_dump` programado por `cron` dentro del host, comprimido y rotado (conservar las últimas 7 copias).
- Copia adicional fuera del host hacia Amazon S3 Free Tier (5 GB), evitando que un fallo de la propia instancia se lleve también las copias de seguridad.
- Snapshot manual del volumen EBS antes de cambios estructurales relevantes (por ejemplo, antes de aplicar una migración Prisma con impacto en datos existentes).

Esta sección pasa a ser obligatoria, no opcional, en el momento en que la Opción A deje de usarse solo para evaluación académica y empiece a recibir pedidos reales (es decir, al migrar hacia la Opción B).

### 3.8 Costes mensuales

| Concepto | Coste durante Free Tier (12 meses) | Coste tras Free Tier |
|---|---|---|
| EC2 `t3.micro` | 0 €/mes | ~7,5 €/mes (eu-west-1, on-demand) |
| EBS gp3 30 GB | 0 €/mes | ~2,5 €/mes |
| S3 backups (opcional, 5 GB) | 0 €/mes | <0,5 €/mes |
| Transferencia de datos | 0 €/mes (tráfico académico bajo) | <1 €/mes |
| **Total** | **0 €/mes** | **~10-12 €/mes** |

El presupuesto fijado (ideal 0 €, máximo 10 €/mes) se cumple de forma estricta durante la ventana de Free Tier, que cubre ampliamente el periodo de entrega y evaluación del Trabajo Final. Si el proyecto debe seguir publicado más allá de los 12 meses, el coste se sitúa en el límite superior o ligeramente por encima; la mitigación más simple es apagar la instancia fuera de las ventanas de consulta, o migrar a una instancia Graviton (`t4g.micro`), entre un 10-20 % más económica que `t3.micro` para la misma carga.

### 3.9 Pros, contras y riesgos

**Pros:**

- Proveedor único: una sola consola, una sola facturación, sin latencia ni superficie de CORS entre proveedores distintos.
- Coste real de 0 €/mes durante toda la ventana de evaluación académica.
- Reutiliza literalmente el `docker-compose.yml` ya presente en el repositorio; no introduce arquitectura nueva.
- Sin cold start: los tres contenedores están siempre activos, a diferencia de un backend en un plan PaaS gratuito con hibernación por inactividad.
- Practica de forma directa Docker, Docker Compose, Nginx/TLS y CI/CD por SSH — contenido del módulo de infraestructura del máster.
- Camino de continuidad natural hacia la Opción B: las mismas imágenes Docker de `frontend` y `backend` son reutilizables en ECS Fargate sin reescritura.

**Contras:**

- Punto único de fallo: si el host cae, las tres capas caen a la vez.
- Mantenimiento manual del sistema operativo y de Docker (parches, reinicios).
- Sin backup activado (opción por defecto), la pérdida de datos no es recuperable; con backup activado, sigue siendo autogestionado, sin la automatización de un servicio de base de datos gestionado.
- El coste crece hacia (o ligeramente por encima de) el límite de 10 €/mes una vez expira el Free Tier.
- Mayor curva de entrada (SSH, Nginx, Security Groups) que una plataforma PaaS de despliegue por clic.

**Riesgos:**

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Caída de la instancia única | Frontend, backend y BD caídos simultáneamente | Snapshot EBS periódico, alarma básica de CloudWatch sobre estado de la instancia |
| Puerto de PostgreSQL publicado por error | Exposición de la base de datos a internet | Auditar que el `docker-compose.yml` de producción no incluye `ports:` en el servicio `postgres` |
| Clave SSH expuesta | Acceso no autorizado al servidor | Clave dedicada solo al deploy, Security Group restringido a la IP de origen cuando sea posible |
| Fin del Free Tier | El coste empieza a facturar de forma sostenida | Apagar la instancia fuera de ventanas de evaluación, o aceptar el coste de ~10-12 €/mes |
| Migración Prisma fallida en el deploy | API inconsistente con el esquema | `prisma migrate deploy` como paso bloqueante y explícito del pipeline |
| Disco lleno (logs, imágenes Docker antiguas) | Caída del servicio | `docker system prune` programado, volumen EBS con margen |

### 3.10 Recomendación final — Opción A

```text
Proveedor: AWS (único)
Cómputo: EC2 t3.micro (Free Tier) + Docker Compose
Frontend: contenedor Next.js detrás de Nginx
Backend: contenedor Express
Base de datos: contenedor PostgreSQL 16 + volumen EBS
Backups: opcional — pg_dump nocturno + copia en S3, prescindible porque el catálogo se reconstruye con el seed
CI/CD: GitHub Actions, build + push GHCR + deploy SSH
Coste: 0 €/mes en Free Tier; ~10-12 €/mes después
```

Es la opción coherente con el criterio de proveedor único: AWS aloja cómputo, almacenamiento y backups con un solo IAM y una sola factura, reutiliza el `docker-compose.yml` ya existente y no exige aprender una plataforma nueva además de AWS. Si el objetivo prioritario fuera minimizar el tiempo de mantenimiento por encima de demostrar conocimientos de infraestructura, una alternativa de menor esfuerzo operativo sería un PaaS como Railway (frontend + backend + PostgreSQL en un único proyecto, sin gestión de servidor), con un coste base de ~5 €/mes; se descarta como recomendación principal porque no alcanza el ideal de 0 €/mes y porque renuncia al valor formativo de operar Docker/Linux/Nginx que sí aporta la Opción A.

---

## 4. Opción B — Infraestructura profesional

### 4.1 Diagrama de infraestructura

```mermaid
flowchart TB
    U["Usuarios"] -->|"HTTPS"| CF["Amazon CloudFront\nCDN edge + TLS (ACM) + WAF"]

    CF -->|"/* (cacheado por Cache-Control / ISR)"| ALB["AWS Application Load Balancer"]
    CF -->|"/_next/static/* (cache largo, inmutable)"| S3STATIC[("Amazon S3\nAssets estáticos de build de Next.js")]

    ALB -->|"path: /"| FE1["ECS Fargate Task\nFrontend Next.js standalone"]
    ALB -->|"path: /"| FE2["ECS Fargate Task\nFrontend Next.js standalone"]
    ALB -->|"path: /api/*"| API1["ECS Fargate Task\nExpress API"]
    ALB -->|"path: /api/*"| API2["ECS Fargate Task\nExpress API"]

    API1 --> RDS[("Amazon RDS PostgreSQL\nMulti-AZ · Backups + PITR")]
    API2 --> RDS

    API1 -.->|"introducido por fases"| REDIS[("ElastiCache Redis\nCache / rate limit / cacheHandler ISR compartido")]
    API2 -.-> REDIS
    FE1 -.-> REDIS
    FE2 -.-> REDIS

    FE1 --> CW["CloudWatch Logs / Metrics / Alarmas"]
    API1 --> CW
    FE1 --> SENTRY["Sentry\nErrores frontend + backend"]
    API1 --> SENTRY

    GH["GitHub Actions"] -->|"build + push"| ECR["Amazon ECR"]
    ECR --> FE1
    ECR --> API1
    GH -.->|"invalidación tras deploy"| CF

    SM["AWS Secrets Manager"] --> API1
    SM --> API2
```

### 4.2 Proveedores y servicios por capa

| Componente | Servicio | Justificación |
|---|---|---|
| Frontend | AWS ECS Fargate, ≥2 tareas, Next.js en modo `standalone` | Mismo patrón de contenedor que el backend, sin segundo proveedor; ISR e Image Optimization corren dentro del propio contenedor (requiere `sharp` instalado) |
| Backend | AWS ECS Fargate, ≥2 tareas tras Application Load Balancer | Contenedor Express actual, sin cambios de arquitectura; Fargate evita gestionar servidores y permite Auto Scaling por CPU/RPS |
| Base de datos | AWS RDS PostgreSQL | Backups automáticos, PITR, Multi-AZ opcional; mismo motor que en desarrollo, sin migrar de PostgreSQL |
| Caché | Amazon ElastiCache Redis (por fases, ver 4.4) | Cache de catálogo, rate limiting distribuido y, si hay varias tareas de frontend, `cacheHandler` compartido de ISR |
| CDN | Amazon CloudFront | Único punto de entrada público; cachea SSR de catálogo/ficha por `Cache-Control`/ISR y assets estáticos con TTL largo; punto de anclaje del WAF |
| Almacenamiento estático de build | Amazon S3 | Sirve `_next/static/*` (assets versionados e inmutables) como origen de CloudFront, descargando esa carga de los contenedores de frontend |
| Secretos | AWS Secrets Manager | Rotación de credenciales de RDS, inyección en las task definitions de ECS sin hardcodear en imágenes |
| Observabilidad | Sentry + CloudWatch | Errores de aplicación (Sentry) y métricas/logs de infraestructura (CloudWatch) |
| Object storage (catálogo dinámico) | Amazon S3, bucket independiente (introducido cuando aplique, ver 4.6) | Si el catálogo pasa de imágenes estáticas del repositorio a subida dinámica de producto — distinto del bucket de assets de build de la fila anterior |
| WAF | AWS WAF, adjunto a CloudFront (introducido cuando hay tráfico público real, ver 4.6) | Protección frente a abuso una vez el riesgo de exposición pública lo justifique |

### 4.3 Variables de entorno, migraciones y seed de Prisma

Cada entorno (`dev`, `staging`, `production`) tiene su propio juego de variables, gestionado en Secrets Manager (backend) y en las variables de entorno de la task definition de ECS de cada servicio de frontend:

```text
# Backend — inyectado vía Secrets Manager en la task definition de ECS
NODE_ENV=production
DATABASE_URL=<RDS connection string, conexión pooled para runtime>
CORS_ORIGIN=https://<dominio-publico-del-entorno>
SESSION_SECRET=<rotado periódicamente>
ASSETS_BASE_URL=https://<dominio-publico-del-entorno>

# Frontend — variables de entorno de la task definition de ECS (build-time y runtime)
NEXT_PUBLIC_API_URL=/api
```

Al servir frontend y backend bajo el mismo dominio público a través de CloudFront/ALB con enrutado por path (`/` → frontend, `/api/*` → backend), `NEXT_PUBLIC_API_URL` puede ser una ruta relativa igual que en la Opción A, evitando CORS entre dominios distintos también en producción. `CORS_ORIGIN` se mantiene configurado de forma defensiva por si en el futuro se añade un cliente en otro origen (por ejemplo, una app móvil).

Migraciones y seed, ejecutados desde el pipeline de CI/CD contra cada entorno, nunca desde el arranque del contenedor:

```bash
npx prisma migrate deploy   # contra staging, después de pasar tests; contra production, tras aprobar staging
npm run db:seed             # solo en la primera puesta en marcha de cada entorno, nunca en production tras el lanzamiento
```

Se recomienda separar la conexión de runtime (pooled, usada por la aplicación) de la conexión administrativa usada para ejecutar migraciones, siguiendo el patrón estándar de RDS + Prisma en entornos con múltiples tareas concurrentes.

### 4.4 CDN, gestión de secretos, cache y escalado horizontal

**CDN:** Amazon CloudFront es el único punto de entrada público y cubre tanto el frontend como la API bajo el mismo dominio, con dos comportamientos de caché distintos por path. Las páginas SSR de catálogo y ficha de producto (las únicas con valor SEO, según `ARCHITECTURE.md`) se sirven con ISR: Next.js las regenera en segundo plano según `revalidate` y emite las cabeceras `Cache-Control`/`s-maxage` correspondientes, que CloudFront respeta para cachearlas en el edge sin lógica adicional. Los assets de `_next/static/*`, versionados e inmutables, se publican en S3 y se cachean en CloudFront con TTL largo. El comportamiento `/api/*` se enruta al backend con caché deshabilitada (TTL 0, forward de cookies y headers), igual que `/cart`, `/checkout` y `/orders` en el frontend, que siguen siendo Client Components sin caché por depender de estado de sesión.

**Consideración propia del autohospedaje:** a diferencia de Vercel, que gestiona de forma transparente un caché de ISR distribuido, con ≥2 tareas de frontend en Fargate cada contenedor tiene por defecto su propio caché de ISR en el sistema de ficheros local, lo que puede servir versiones ligeramente distintas de una página recién regenerada según qué tarea atienda la petición. Next.js permite configurar un `cacheHandler` personalizado en `next.config.js` para compartir ese caché entre tareas (respaldado por Redis o por S3); se recomienda activarlo en cuanto el servicio de frontend tenga más de una tarea, no antes — queda registrado como riesgo de aceptación temporal en la sección 4.13 si no se configura desde el principio.

**Gestión de secretos:** AWS Secrets Manager almacena `DATABASE_URL`, `SESSION_SECRET` y cualquier credencial futura (pasarela de pago real, proveedor de email). Las task definitions de ECS referencian los secretos por ARN; nunca se incrustan en la imagen Docker ni en variables de entorno planas del repositorio. La rotación automática de credenciales de RDS se activa desde el propio Secrets Manager sin cambios de código, siempre que el backend lea `DATABASE_URL` en cada arranque de tarea (no la cachee de forma estática más allá del proceso).

**Cache:** no se introduce Redis desde el primer día de la opción profesional. Se incorpora cuando se cumple alguna de estas condiciones (ver tabla completa en 4.6): el catálogo recibe lecturas repetidas que saturan RDS, se necesita rate limiting distribuido entre varias tareas de ECS (el `express-rate-limit` en memoria de un único proceso no es coherente entre tareas), se quiere persistir el carrito server-side de forma más rápida que con una consulta a PostgreSQL en cada operación, o el servicio de frontend pasa a tener más de una tarea y necesita un `cacheHandler` de ISR compartido (ver nota anterior).

**Escalado horizontal:** el backend Express ya es stateless por diseño — el `sessionId` vive en una cookie `HttpOnly`, no en memoria del proceso — por lo que añadir tareas de ECS Fargate no requiere ningún cambio de código, solo política de Auto Scaling. El servicio de frontend se escala de forma independiente con su propia política: el renderizado SSR consume más CPU por petición que la API, por lo que su umbral de Auto Scaling (por ejemplo, CPU ~50 % en lugar de ~60 %) y el tamaño de tarea pueden ajustarse de forma distinta al backend. Ambos servicios comparten el mismo Application Load Balancer, con un target group cada uno enrutado por path desde CloudFront, y un mínimo de 2 tareas por servicio en producción para alta disponibilidad básica entre zonas de disponibilidad.

### 4.5 Separación entre dev, staging y production

| Entorno | Frontend | Backend | Base de datos | Propósito |
|---|---|---|---|---|
| `dev` | Local (`docker compose up -d`, igual que la Opción A) | Local, igual que la Opción A | BD local en Docker, o instancia RDS `dev` compartida de bajo coste | Desarrollo individual, sin tráfico real |
| `staging` | Servicio ECS `frontend-staging`, 1 tarea | Servicio ECS `backend-staging`, 1 tarea | RDS `staging`, instancia pequeña, datos de prueba | Validación de release: aquí corren las migraciones primero y la suite E2E de Playwright contra el sistema completo |
| `production` | Servicio ECS `frontend-production`, ≥2 tareas | Servicio ECS `backend-production`, ≥2 tareas | RDS `production`, Multi-AZ cuando el presupuesto lo permita | Tráfico real de usuarios |

Cada entorno tiene su propio `CORS_ORIGIN`, su propia ruta de secretos en Secrets Manager, su propia distribución CloudFront/dominio y su propia base de datos — nunca se comparte una instancia de RDS entre `staging` y `production`. La promoción entre entornos es siempre vía pipeline (sección 4.7), nunca por despliegue manual directo a `production`.

Una capacidad a la que se renuncia deliberadamente al no usar Vercel es el *preview deployment* automático por cada Pull Request. Si en el futuro resulta valioso revisar cambios de frontend de forma aislada antes de fusionar, puede construirse como una tarea ECS efímera por PR lanzada desde el propio pipeline y destruida al cerrar la PR; no se incluye por defecto en esta opción porque no es necesaria para los objetivos de RunMarket en las fases descritas en este documento.

### 4.6 Cuándo introducir Redis, colas, object storage, read replicas, WAF, Kubernetes y microservicios

| Componente | Introducir cuando | No introducir aún si |
|---|---|---|
| **Redis** | Lecturas repetidas de catálogo saturan RDS, se necesita rate limiting coherente entre varias tareas de ECS, o se quiere acelerar lectura/escritura de carrito server-side | El tráfico sigue siendo bajo y una única tarea de backend es suficiente |
| **Colas de mensajes (SQS)** | Aparecen procesos asíncronos reales: envío de emails de confirmación, integración con pasarela de pago real, sincronización de stock con un sistema externo | El checkout sigue siendo simulado y no hay procesos que deban sobrevivir a un fallo de la petición HTTP |
| **Object storage (S3)** | El catálogo pasa de imágenes estáticas embebidas en el frontend a subida dinámica de producto, facturas o documentos | Las imágenes siguen siendo estáticas y versionadas junto al código, como en el MVP actual |
| **Read replicas** | Las lecturas de catálogo saturan la instancia primaria de RDS y el cuello de botella está confirmado en la base de datos, no en consultas mal indexadas o ausencia de cache | El cuello de botella está en la capa de API, en cache ausente, o en índices Prisma/PostgreSQL mejorables sin coste de infraestructura adicional |
| **WAF** | Existe tráfico público real, riesgo de bots, scraping agresivo del catálogo o intentos de abuso del checkout | El sistema sigue en fase de validación interna o con tráfico controlado |
| **Kubernetes** | Hay múltiples equipos, decenas de servicios independientes, o necesidad real de operar multi-cloud — ninguna de estas condiciones aplica a RunMarket en ninguna fase descrita aquí | Solo existen un frontend Next.js y una API Express; ECS Fargate ya resuelve el escalado horizontal sin el coste operativo de un control plane de Kubernetes |
| **Microservicios** | Aparecen dominios de negocio realmente independientes con ciclos de despliegue y equipos distintos: catálogo, pagos, inventario, logística | El dominio sigue siendo CRUD de catálogo + checkout simulado, sin necesidad de desplegar partes de la aplicación de forma independiente |

Kubernetes y microservicios quedan explícitamente fuera de cualquier fase de RunMarket descrita en este documento, incluida la de escala alta: ECS Fargate con Auto Scaling cubre con holgura varios órdenes de magnitud de tráfico por encima del esperado para un eCommerce de nicho como RunMarket antes de que la complejidad operativa de Kubernetes esté justificada.

### 4.7 CI/CD

Pipeline de GitHub Actions con promoción explícita entre entornos:

1. Instalar dependencias del monorepo, lint y typecheck.
2. Tests unitarios frontend (Vitest + RTL) y backend (Jest + Supertest), e integración backend contra PostgreSQL real en Docker (igual que en local).
3. Build de frontend (`next build`, modo `standalone`) y backend.
4. Construir las imágenes Docker de frontend y backend, publicarlas en Amazon ECR etiquetadas con el SHA del commit, y subir los assets de `_next/static/*` generados al bucket S3 del entorno correspondiente.
5. Desplegar a `staging`: rolling update de los servicios ECS `frontend-staging` y `backend-staging`.
6. Ejecutar `prisma migrate deploy` contra `staging` y la suite E2E de Playwright contra el sistema `staging` completo.
7. Si el paso anterior es verde, desplegar a `production`: rolling update de ambos servicios ECS y `prisma migrate deploy` contra `production`.
8. Invalidar en CloudFront las rutas HTML afectadas (`/`, `/product/*`) tras el despliegue de frontend, para no servir markup desactualizado mientras expira el TTL natural; los assets de `_next/static/*` no necesitan invalidación porque su nombre de fichero cambia con cada build (hash de contenido).
9. Smoke test del endpoint `/health` en `production` tras el despliegue.

### 4.8 Observabilidad

Nivel mínimo profesional:

- Sentry para errores de frontend y backend, con source maps.
- CloudWatch Logs para ECS; CloudWatch Metrics para ECS, ALB y RDS.
- Alarmas sobre: tasa de 5xx, latencia p99, CPU/memoria sostenida de las tareas ECS, número de conexiones a RDS, espacio de almacenamiento de RDS, fallos de migración en el pipeline.

Nivel avanzado, a introducir cuando la complejidad del sistema lo justifique (ver fases de escala en 4.11): OpenTelemetry para trazas distribuidas si aparecen llamadas entre varios servicios, y un log drain centralizado si en algún momento se reintroduce un proveedor externo (por ejemplo Vercel, según la alternativa de la sección 4.14) y conviene correlacionar logs entre plataformas distintas.

### 4.9 Seguridad

- HTTPS de extremo a extremo: certificado ACM en CloudFront (terminación TLS en el edge) y certificado ACM adicional en el ALB para el tramo interno; el Security Group del ALB se restringe al prefix list gestionado de CloudFront, de forma que el balanceador no acepta tráfico que no haya pasado por el edge.
- CORS restringido por entorno (`CORS_ORIGIN` distinto en `staging` y `production`).
- RDS en subred privada, sin IP pública, accesible solo desde el Security Group de las tareas ECS.
- Security Groups de mínimo privilegio: ALB ↔ ECS ↔ RDS, sin más tráfico permitido que el necesario.
- IAM con roles de tarea específicos por servicio (principio de mínimo privilegio), sin credenciales de larga duración.
- Secretos en AWS Secrets Manager con rotación, nunca en variables de entorno planas del repositorio o de la imagen.
- WAF (AWS WAF, reglas gestionadas) adjunto a la distribución de CloudFront — no al ALB —, introducido según la tabla de la sección 4.6.
- Backups cifrados en reposo (RDS, EBS, S3 con SSE).
- Dependabot o herramienta equivalente para dependencias del monorepo.
- Las reglas de seguridad de `CLAUDE.md` a nivel de código (precio/stock desde BD, Zod `.strict()`, `sessionId` con `crypto.randomUUID()`, rate limiting en mutaciones, sin PII en logs, sin `dangerouslySetInnerHTML`) se mantienen sin cambios: la infraestructura profesional añade controles de red y de plataforma, pero no sustituye ni relaja ninguna de las verificaciones de seguridad ya auditadas vía OWASP en cada historia de usuario.

### 4.10 Backups

- Backups automáticos de RDS con retención mínima de 7 días, ampliable a 30 si el negocio lo justifica.
- Point-in-time recovery (PITR) activado desde el primer despliegue profesional.
- Copia de snapshots a otra región cuando el volumen de datos o el riesgo de negocio lo justifiquen (fase de escala alta).
- Si se introduce S3 para object storage, versión y políticas de ciclo de vida desde el primer momento.
- Simulacros de restauración periódicos (al menos antes de cada hito de escala relevante).

### 4.11 Costes estimados por fase

| Fase | Coste orientativo | Comentario |
|---|---:|---|
| Primeros usuarios reales | 60-140 €/mes | CloudFront + 2 servicios Fargate pequeños (frontend + backend) + RDS instancia pequeña, sin Redis aún |
| Cientos/miles de usuarios | 150-450 €/mes | ≥2 tareas Fargate con Auto Scaling, RDS Multi-AZ opcional, Redis introducido, CloudFront + WAF |
| Escala alta | 450-2.000+ €/mes | Read replicas, colas, object storage a escala, WAF avanzado, observabilidad ampliada |
| Escala masiva | Variable | Arquitectura por dominios, multi-región, decisiones dominadas por producto y organización, no solo por infraestructura |

Estos costes no incluyen equipo humano, soporte enterprise, dominio ni herramientas premium de analítica de producto.

### 4.12 Camino evolutivo

```mermaid
flowchart LR
    A["Fase 1\nMVP académico\nOpción A (AWS, EC2 único)"] --> B["Fase 2\nPrimeros usuarios reales"]
    B --> C["Fase 3\nCientos / miles de usuarios"]
    C --> D["Fase 4\nEscala alta"]
    D --> E["Fase 5\nEscala masiva"]
```

- **Fase 1 — MVP académico:** Opción A completa (sección 3). Objetivo: que los profesores validen la arquitectura funcional con coste cero.
- **Fase 2 — Primeros usuarios reales:** migrar de la EC2 única a 1-2 tareas ECS Fargate de frontend y 1-2 de backend, detrás de CloudFront, + RDS PostgreSQL pequeña. Incorporar Sentry. Crear el entorno `staging`. Automatizar migraciones desde CI/CD. Aún sin Redis.
- **Fase 3 — Cientos/miles de usuarios:** ≥2 tareas Fargate con Auto Scaling y Application Load Balancer. RDS con backups reforzados y monitorización activa. Introducir Redis para cache de catálogo y rate limiting distribuido. Alertas operativas y políticas de rollback definidas.
- **Fase 4 — Escala alta:** read replicas para consultas intensivas de catálogo. CDN/cache más agresiva. Colas de mensajes para tareas asíncronas (emails, pagos reales si se incorporan). Object storage si las imágenes dejan de ser estáticas. WAF avanzado y trazas distribuidas.
- **Fase 5 — Escala masiva:** posible separación por dominios de negocio (catálogo, pedidos, pagos, inventario) si y solo si existen equipos independientes que lo justifiquen; arquitectura orientada a eventos; multi-región para frontend y servicios críticos; particionado y estrategias de consistencia en base de datos. Esta es la única fase en la que Kubernetes o microservicios podrían reconsiderarse, y únicamente si la organización (no solo el tráfico) lo demanda.

### 4.13 Pros, contras y riesgos

**Pros:**

- Escala horizontalmente sin reescribir la aplicación: el backend Express stateless actual es compatible con ECS Fargate sin cambios de código.
- Mantiene PostgreSQL y Prisma sin migrar de motor ni de ORM.
- Proveedor único de verdad: un solo IAM, una sola red privada y una sola facturación para frontend, backend, datos, caché, CDN y observabilidad de infraestructura.
- Next.js self-hosted en Fargate reutiliza exactamente las mismas imágenes Docker que ya se construyen para la Opción A, sin reescritura al pasar de una a otra.
- Separación clara de entornos, con migraciones y seeds controlados por pipeline.
- Camino de crecimiento documentado fase a fase, sin saltos arquitectónicos abruptos.
- Evita deliberadamente la sobreingeniería de Kubernetes/microservicios mientras el dominio de negocio siga siendo único.

**Contras:**

- Coste mensual significativamente mayor que la Opción A desde el primer escalón.
- Exige disciplina de IAM, redes privadas y observabilidad que no es necesaria en el MVP académico.
- RDS y ECS Fargate requieren más conocimiento operativo que una plataforma PaaS de despliegue por clic.
- El autohospedaje de Next.js exige configurar y mantener tú mismo la coherencia del caché de ISR entre tareas (`cacheHandler` compartido) y la invalidación de CloudFront tras cada deploy — capacidades que una plataforma especializada como Vercel resuelve sin configuración.
- Se renuncia a los preview deployments automáticos por Pull Request, salvo que se construyan explícitamente en el pipeline (sección 4.5).

**Riesgos:**

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fuga de credenciales de base de datos | Acceso no autorizado a datos de pedidos | Secrets Manager con rotación, RDS sin IP pública |
| Falta de Auto Scaling bien calibrado | Caída bajo picos de tráfico | Políticas de escalado por CPU/RPS probadas en `staging` antes de producción |
| Migraciones Prisma fallidas en producción | Inconsistencia de esquema con tráfico real | `prisma migrate deploy` validado primero en `staging`, bloqueante en el pipeline |
| Caché de ISR inconsistente entre tareas de frontend | Usuarios distintos ven versiones distintas de catálogo/ficha tras una revalidación | Configurar `cacheHandler` compartido (Redis o S3) en cuanto el servicio de frontend tenga ≥2 tareas |
| Ausencia de WAF con tráfico público creciente | Abuso del checkout o scraping agresivo del catálogo | Introducir WAF según el umbral definido en la tabla de la sección 4.6, no esperar a un incidente |
| Coste descontrolado por falta de límites de Auto Scaling | Factura inesperada | Límites máximos de tareas/instancias definidos explícitamente, alarmas de billing |

### 4.14 Recomendación final — Opción B

```text
Frontend: Next.js standalone en AWS ECS Fargate, ≥2 tareas
Backend: AWS ECS Fargate, ≥2 tareas, Application Load Balancer
CDN: Amazon CloudFront (frontend SSR/ISR + assets estáticos en S3 + WAF)
Base de datos: AWS RDS PostgreSQL, backups automáticos + PITR
Caché: ElastiCache Redis, introducido por fases (incluye cacheHandler de ISR si aplica)
Secretos: AWS Secrets Manager
Observabilidad: Sentry + CloudWatch
CI/CD: GitHub Actions, dev → staging → production
Coste de arranque: 60-140 €/mes
```

Esta combinación cumple de forma estricta el criterio de proveedor único también en la opción profesional: AWS centraliza cómputo, datos, caché, CDN, secretos y observabilidad bajo un único IAM y una única red privada, sin necesidad de un segundo proveedor para el frontend. Next.js en modo `standalone` cubre, dentro del alcance de SSR selectivo de RunMarket (solo catálogo y ficha de producto), las mismas capacidades que se buscaban en una plataforma externa — ISR, Image Optimization, CDN edge — a cambio de asumir su configuración y operación.

**Alternativa válida — Vercel Pro:** sigue siendo una opción legítima para el frontend si en algún momento el coste de operar y mantener el caché de ISR compartido, las invalidaciones de CloudFront y el pipeline de imágenes propio supera al de pagar una plataforma que ya lo resuelve sin configuración, o si el equipo crece y los preview deployments automáticos por Pull Request aportan suficiente valor de productividad. En ese escenario se mantendría el resto del stack (ECS para el backend, RDS, ElastiCache, Secrets Manager, CloudWatch) sin cambios, sustituyendo únicamente el servicio de frontend Fargate por Vercel Pro.

---

## 5. Recomendaciones finales

| | Opción A — MVP académico | Opción B — Infraestructura profesional |
|---|---|---|
| Proveedor(es) | AWS (único) | AWS (único) |
| Coste | 0 €/mes en Free Tier; ~10-12 €/mes después | 60-140 €/mes de arranque, escalando por fases |
| Cuándo usarla | Entrega y evaluación académica del Trabajo Final | Cuando existan usuarios reales o se planifique el lanzamiento |
| Esfuerzo de mantenimiento | Medio, por una sola persona, sobre un único host | Medio-alto, sobre una única plataforma (AWS), con dos servicios contenedorizados independientes |

Ambas opciones parten de la misma arquitectura definida en `docs/ARCHITECTURE.md` y no requieren modificarla: Next.js, Express y PostgreSQL vía Prisma se mantienen en los dos escenarios. La diferencia entre ellas no es de stack tecnológico, sino de **quién opera cada pieza** y **cuánta automatización y resiliencia se paga por adelantado**. La transición de la Opción A a la Opción B es incremental y no exige un rediseño: las mismas imágenes Docker de `frontend` y `backend` construidas para la EC2 única son las que se publican en ECR y se despliegan en ECS Fargate cuando llegue el momento de escalar.

---

## 6. Fuentes consultadas

- AWS Free Tier: https://aws.amazon.com/free/
- Amazon EC2 Pricing: https://aws.amazon.com/ec2/pricing/on-demand/
- AWS Fargate Pricing: https://aws.amazon.com/fargate/pricing/
- Amazon RDS for PostgreSQL Pricing: https://aws.amazon.com/rds/postgresql/pricing/
- Amazon ElastiCache Pricing: https://aws.amazon.com/elasticache/pricing/
- AWS Secrets Manager Pricing: https://aws.amazon.com/secrets-manager/pricing/
- AWS WAF Pricing: https://aws.amazon.com/waf/pricing/
- Amazon CloudFront Pricing: https://aws.amazon.com/cloudfront/pricing/
- Amazon S3 Pricing: https://aws.amazon.com/s3/pricing/
- Next.js — Self-Hosting: https://nextjs.org/docs/app/building-your-application/deploying#self-hosting
- Vercel Pricing (alternativa considerada): https://vercel.com/pricing
- Docker Compose documentation: https://docs.docker.com/compose/
- GitHub Actions documentation: https://docs.github.com/en/actions
- Certbot (Let's Encrypt): https://certbot.eff.org/
