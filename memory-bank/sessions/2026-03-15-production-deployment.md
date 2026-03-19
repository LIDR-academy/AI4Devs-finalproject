# Sesión: production-deployment — Despliegue MVP en Producción

**Fecha**: 2026-03-15  
**Estado**: ✅ Completado  
**ADR generado**: [ADR-011](../architecture/011-docker-ecr-lightsail-caddy.md)

---

## Objetivo

Desplegar el MVP completo de Adresles en producción con coste mínimo:
- API + Worker + Redis en AWS Lightsail con Docker Compose + Caddy (HTTPS automático)
- Dashboard Admin en Vercel (free tier)
- CI/CD automatizado con GitHub Actions

---

## Infraestructura Creada

### AWS

| Recurso | Detalle |
|---|---|
| **Lightsail instance** | `adresles-prod`, `small_3_0` (2GB RAM), Ubuntu 22.04, `eu-central-1` |
| **IP estática** | `52.57.222.42` (Lightsail static IP) |
| **ECR repo API** | `788980370883.dkr.ecr.eu-central-1.amazonaws.com/adresles-api` |
| **ECR repo Worker** | `788980370883.dkr.ecr.eu-central-1.amazonaws.com/adresles-worker` |
| **IAM user deploy** | `Cursor-Deployer` con `AmazonEC2ContainerRegistryFullAccess` + Lightsail inline policy |

### DNS (Route 53)

| Registro | Tipo | Valor |
|---|---|---|
| `backend.adresles.com` | A | `52.57.222.42` |
| `simulator.adresles.com` | CNAME | `cname.vercel-dns.com` |
| `adresles.com` | — | **SIN MODIFICAR** (WordPress en KonsoleH) |

### Servidor (52.57.222.42)

- Docker 29.3.0 + Docker Compose v5.1.0
- AWS CLI 1.22 (para login ECR)
- Directorio de trabajo: `~/adresles-prod/`
  - `docker-compose.yml` ← copia de `infrastructure/docker/docker-compose.prod.yml`
  - `Caddyfile`
  - `.env.prod` (secretos reales, NO en repo)
  - `.env` (variables de Compose: `ECR_REGISTRY`, `IMAGE_TAG`)

---

## Bugs Encontrados y Soluciones

### Bug 1: `dist/main.js` vs `dist/src/main.js`

**Causa**: el `tsconfig.json` de `apps/api` no tiene `rootDir` definido. TypeScript usa la carpeta raíz del tsconfig como `rootDir`, por lo que `src/main.ts` compila a `dist/src/main.js`.

**Solución**: `CMD ["node", "dist/src/main.js"]` en el Dockerfile de la API.

**Nota**: el Worker sí tiene `rootDir: "./src"` → compila a `dist/main.js` correctamente.

---

### Bug 2: Prisma no encuentra `libssl.so.1.1`

**Error**:
```
PrismaClientInitializationError: Unable to require libquery_engine-linux-musl.so.node
Details: Error loading shared library libssl.so.1.1: No such file or directory
```

**Causa**: Alpine 3.17+ usa OpenSSL 3.x. El engine `linux-musl` (sin sufijo de versión) requiere OpenSSL 1.1 que ya no está disponible en Alpine moderno.

**Causa raíz adicional**: Prisma no puede detectar la versión de OpenSSL si `openssl` no está instalado en la imagen runner.

**Solución**:
1. `schema.prisma`: `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]`
2. Ambos Dockerfiles runner: `RUN apk add --no-cache openssl`

---

### Bug 3: `Cannot find module 'dotenv'` en Worker

**Causa**: `dotenv` estaba en `devDependencies` en `apps/worker/package.json`. `pnpm deploy --prod` excluye `devDependencies`.

**Solución**: mover `dotenv` a `dependencies` en `apps/worker/package.json`.

---

### Bug 4: `small_ipv6_3_0` Lightsail sin IPv4

**Causa**: el bundle `small_ipv6_3_0` ($10/mes) solo asigna una IPv6, sin IPv4 pública. Route 53 necesita un registro A (IPv4).

**Solución**: usar el bundle `small_3_0` ($12/mes) que sí asigna IPv4 pública.

---

### Bug 5: `Output Directory` duplicado en Vercel

**Error**: `apps/web-admin/apps/web-admin/.next` (ruta duplicada)

**Causa**: Vercel prepende el Root Directory al Output Directory. Si Root Directory = `apps/web-admin` y Output Directory = `apps/web-admin/.next`, la ruta resultante duplica el prefijo.

**Solución**: Output Directory = `.next` (relativo al Root Directory).

---

### Bug 6: Vercel desplegando desde `main` (sin código)

**Causa**: Vercel despliega desde `main` por defecto, pero el código bueno estaba en `finalproject-SVL-v3`.

**Solución**:
- `Settings → Git → Production Branch` → `finalproject-SVL-v3`
- `Settings → General → Root Directory` → `apps/web-admin`
- Trigger con `git commit --allow-empty` + push a `finalproject-SVL-v3`

---

## Estado Final

```
Container                Status         URL
─────────────────────────────────────────────────────
adresles-prod-api-1      Up (healthy)   backend.adresles.com/api → {"status":"ok"}
adresles-prod-caddy-1    Up             :80 → :443 redirect; TLS 1.3 (Let's Encrypt)
adresles-prod-redis-1    Up (healthy)   PONG
adresles-prod-worker-1   Up             "Escuchando jobs de process-conversation..."

Vercel                   Ready          simulator.adresles.com
```

---

## GitHub Actions (deploy.yml)

El workflow en `.github/workflows/deploy.yml` se activa con push a `main`:
1. Login a ECR con credenciales `Cursor-Deployer`
2. Build + push imágenes API y Worker a ECR
3. SSH al servidor → `docker compose pull` → `docker compose up -d`
4. `docker image prune -f`

**Secrets necesarios en GitHub**:
- `AWS_ACCOUNT_ID`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `LIGHTSAIL_HOST` (`52.57.222.42`)
- `LIGHTSAIL_SSH_KEY` (contenido de `adresles-prod.pem`)

---

## Aprendizajes Clave

1. **pnpm monorepo + Docker**: `pnpm deploy --prod /standalone` es la forma correcta de crear un bundle sin symlinks de workspace. Requiere `files: ["dist"]` en packages como `shared-types` que tienen `dist/` en `.gitignore`.

2. **Prisma en Alpine**: siempre añadir `openssl` al runner Y especificar `binaryTargets` con la versión correcta de OpenSSL. Alpine 3.17+ ≡ `linux-musl-openssl-3.0.x`.

3. **Lightsail vs EC2**: Para MVP, Lightsail es más simple (firewall integrado, IP estática sencilla) pero el bundle IPv6-only no permite registros A en Route 53.

4. **Caddy vs Traefik para single-server**: Caddy es más simple para un servidor único — un archivo de configuración, sin labels en docker-compose.

5. **Vercel + monorepo**: establecer Root Directory Y Production Branch antes del primer deploy. El Output Directory es RELATIVO al Root Directory (`.next`, no `apps/web-admin/.next`).
