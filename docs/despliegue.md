# Guía de despliegue — INKSPIRE

> Opciones gratuitas o de muy bajo coste para publicar INKSPIRE en internet con un dominio `.com`.
> Última actualización: 2026-07-21. Los planes gratuitos cambian con frecuencia: **verifica límites y precios antes de contratar**.

---

## 1. Resumen ejecutivo

- **Qué hay que desplegar**: 4 piezas — SPA Angular 20 (estática), API .NET 10 (contenedor), PostgreSQL 16 + PostGIS, y almacenamiento público de imágenes (hoy MinIO local).
- **Coste mínimo real**: **≈ US$ 10 al año**, y ese gasto es **solo el dominio `.com`**. No existen dominios `.com` gratuitos: el registro es la única partida obligatoria.
- **Todo el resto puede ser US$ 0/mes** combinando planes gratuitos permanentes (Netlify/Cloudflare Pages + Render + Neon + Cloudflare R2).
- **Opción recomendada (A)**: frontend en Netlify + API en Render (plan gratuito) + base de datos en Neon + imágenes en Cloudflare R2. Cero servidores que administrar, despliegue automático desde GitHub, HTTPS incluido.
- **Contrapartida principal del plan gratuito**: la API de Render **se duerme tras 15 min de inactividad** y la primera petición tarda ~50 s en responder. Se mitiga con un *ping* periódico o pagando US$ 7/mes.
- **Si prefieres cero cold-start**: opción B (Google Cloud Run) o opción C (VPS único con el `docker-compose.yml` que ya existe, ~US$ 4-5/mes).
- **Requiere 7 ajustes de código** antes de desplegar (URLs hardcodeadas, CORS, puerto dinámico, migraciones, secretos). Están listados y detallados en §5 — ninguno es complejo.

---

## 2. Qué se despliega (inventario del proyecto)

| Pieza | Tecnología | Dónde vive hoy | Necesidad en producción |
|---|---|---|---|
| SPA | Angular 20 → `dist/frontend/browser` | `frontend/` + `nginx.conf` | Hosting estático + CDN |
| API | .NET 10 / ASP.NET Core, puerto 5000 | `backend/Dockerfile` | Runtime de contenedores |
| Base de datos | PostgreSQL 16 **+ extensión PostGIS** | `docker-compose.yml` (`postgis/postgis:16-3.4`) | Postgres gestionado que permita `CREATE EXTENSION postgis` |
| Imágenes | MinIO (bucket `inklink-images`, acceso anónimo de lectura) | `docker-compose.yml` | Bucket S3 público o CDN de objetos |
| Pagos | Flow Chile (sandbox / mock) | `Flow__UseMock=true` | Variables de entorno + URLs de retorno públicas |

**Restricciones detectadas en el código** (condicionan la elección de proveedor):

1. `backend/Domain/Services/GeoService.cs` usa **PostGIS `ST_DWithin`** en SQL crudo → el proveedor de base de datos debe soportar PostGIS. Descarta hostings de Postgres sin extensiones.
2. `backend/Seed/DatabaseSeeder.cs:11` tiene `ImageBaseUrl = "http://localhost:9000/inklink-images"` **hardcodeado** → las imágenes del portafolio no cargarán en producción sin cambio (§5.1).
3. `backend/Program.cs:92` fija CORS a `http://localhost:4200` **hardcodeado** (§5.2).
4. `backend/Dockerfile:11` fija `ASPNETCORE_URLS=http://+:5000`; Render y Cloud Run inyectan un puerto por variable `PORT` (§5.3).
5. Las migraciones + `CREATE EXTENSION postgis` + seed solo se ejecutan con el argumento `--seed` (`Program.cs:99`) → hay que lanzarlo una vez contra la base de datos productiva (§6.3).
6. `frontend/src/environments/environment.production.ts` apunta a `apiUrl: '/api'` (ruta relativa) → funciona sin cambios **si** el hosting del frontend hace proxy hacia la API (opción A). Si el frontend llama directo a otro dominio, hay que poner la URL absoluta y abrir CORS.

---

## 3. Opciones de despliegue comparadas

### Opción A — PaaS gratuito repartido (**recomendada**)

Netlify (frontend) + Render (API) + Neon (Postgres) + Cloudflare R2 (imágenes).

- **Coste**: US$ 0/mes + dominio (~US$ 10/año).
- **A favor**: cero administración de servidores, deploy automático en cada `push`, HTTPS y certificados automáticos, el proxy de Netlify elimina el problema de CORS, todos los planes son gratuitos *permanentes* (no son pruebas de 30 días).
- **En contra**: la API se duerme a los 15 min (~50 s de arranque en frío); Neon gratuito da 0,5 GB y 100 CU-horas/mes; Render gratuito da 750 horas-instancia/mes por workspace (suficiente para **un** servicio encendido de forma continua).
- **Para quién**: demo académica, portafolio, MVP con tráfico bajo. **Es la opción por defecto de esta guía.**

> ⚠️ La base de datos gratuita de **Render** caduca a los 30 días — por eso la base de datos va en **Neon**, cuyo plan gratuito no expira.

### Opción B — Google Cloud Run + Neon + Cloudflare Pages

- **Coste**: US$ 0/mes dentro del *always free* (2 M peticiones, 360.000 GB-s, 180.000 vCPU-s al mes) + dominio.
- **A favor**: escala a cero pero con arranque en frío mucho más rápido que Render; el contenedor `backend/Dockerfile` sirve tal cual; límites generosos.
- **En contra**: exige tarjeta de crédito y cuenta de facturación, `gcloud` CLI y algo más de configuración; hay que desplegar en `us-central1`, `us-east1` o `us-west1` para el tier gratuito; si te pasas del límite, se cobra.
- **Para quién**: quieres gratis pero sin los 50 s de espera de Render, y no te molesta configurar GCP.

### Opción C — Un VPS único con el `docker-compose.yml` existente

Hetzner CX22 (~€3,8/mes), Oracle Cloud *Always Free* ARM (US$ 0) o similar, con Caddy o Traefik para TLS automático.

- **Coste**: US$ 0-5/mes + dominio.
- **A favor**: **el stack completo funciona sin cambios de arquitectura**, incluido MinIO y PostGIS; ya tienes `docker-compose.yml` con perfil `full`; sin cold starts; un solo lugar para todo.
- **En contra**: tú administras el servidor (actualizaciones, backups, seguridad, TLS); la capa *Always Free* de Oracle es difícil de conseguir por falta de capacidad ARM; el perfil `full` compila las imágenes en el servidor y necesita ≥ 2 GB de RAM.
- **Para quién**: quieres el entorno más parecido al local, te sientes cómodo con Linux y Docker, o quieres evitar los 7 ajustes de código (bastan 2 o 3).

### Opción D — Azure App Service / Azure for Students

- **Coste**: F1 gratuito, pero **F1 no admite dominios personalizados** (hace falta B1, ~US$ 13/mes). Con *Azure for Students* recibes US$ 100 de crédito y podrías cubrir ~7 meses.
- **A favor**: soporte nativo de .NET, despliegue directo desde Visual Studio / GitHub Actions.
- **En contra**: sin crédito educativo, no es viable como opción de bajo coste; además Azure Database for PostgreSQL no tiene capa gratuita permanente.
- **Para quién**: solo si ya tienes crédito educativo o de MSDN.

### Tabla resumen

| | A · PaaS gratuito | B · Cloud Run | C · VPS único | D · Azure |
|---|---|---|---|---|
| Coste/mes | US$ 0 | US$ 0 (hasta límite) | US$ 0-5 | US$ 0-13 |
| Dominio `.com` propio | ✅ | ✅ | ✅ | ❌ en F1 |
| Arranque en frío | ~50 s | ~1-3 s | ninguno | ninguno |
| Administración de servidor | ninguna | ninguna | tuya | ninguna |
| Tarjeta de crédito | no | **sí** | sí | sí |
| Cambios de código | 7 | 7 | 2-3 | 7 |
| Dificultad | baja | media | media-alta | media |

---

## 4. El dominio `.com` (única partida obligatoria)

No hay `.com` gratuitos: el registro cuesta dinero incluso al precio de coste. Precios de referencia a julio 2026 (renovación anual, no promoción del primer año):

| Registrador | Registro | Renovación | Notas |
|---|---|---|---|
| **Cloudflare Registrar** | ~US$ 10,44 | ~US$ 9,77 | Vende a precio de coste, sin margen. DNS gratuito e integración directa con Pages/R2. **Recomendado.** |
| Spaceship | ~US$ 9,08 | variable | El registro más barato del mercado hoy. |
| Porkbun | ~US$ 11 | ~US$ 11 | Precio estable, buena interfaz, WHOIS privado incluido. |
| Dynadot | ~US$ 10,88 | ~US$ 10,88 | Mismo precio en registro, renovación y transferencia. |

**Estrategia más barata a 5 años**: registrar en Spaceship o Porkbun y transferir a Cloudflare Registrar pasados 60 días (bloqueo ICANN) para renovar siempre a precio de coste.

**Si el objetivo es coste cero absoluto** y el `.com` es negociable: un `.xyz` cuesta ~US$ 1-2/año, y los subdominios que regalan los propios proveedores (`inkspire.netlify.app`, `inkspire-api.onrender.com`) son gratuitos y ya incluyen HTTPS.

---

## 5. Cambios de código previos al despliegue

Checklist obligatorio antes del primer deploy en las opciones A, B y D. En la opción C solo hacen falta 5.1 (parcial), 5.2 y 5.6.

### 5.1 URL base de las imágenes (bloqueante)

`backend/Seed/DatabaseSeeder.cs:11` — sustituir la constante por configuración:

```csharp
// Antes
private const string ImageBaseUrl = "http://localhost:9000/inklink-images";

// Después: leer de configuración con el valor local como fallback
private readonly string _imageBaseUrl;
// en el constructor:
//   _imageBaseUrl = configuration["Storage:PublicBaseUrl"]
//       ?? "http://localhost:9000/inklink-images";
```

Y definir en producción `Storage__PublicBaseUrl=https://images.tudominio.com` (Cloudflare R2 con dominio público) o el endpoint público del bucket.

### 5.2 CORS configurable

`backend/Program.cs:88-95` — leer los orígenes permitidos de configuración en lugar de fijar `http://localhost:4200`:

```csharp
var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"]?.Split(',')
    ?? ["http://localhost:4200"];
policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
```

Variable de entorno: `Cors__AllowedOrigins=https://tudominio.com,https://www.tudominio.com`.

> Con el proxy de Netlify de la opción A las peticiones son del mismo origen y CORS ni siquiera interviene, pero el ajuste sigue siendo necesario para pruebas directas contra `api.tudominio.com`.

### 5.3 Puerto dinámico

Render y Cloud Run indican el puerto por la variable `PORT`. Dos alternativas:

- **Simple**: dejar el `Dockerfile` como está y declarar en el panel del proveedor `PORT=5000` (Render) o `--port 5000` (Cloud Run).
- **Robusta**: quitar `ENV ASPNETCORE_URLS` del `Dockerfile` y en `Program.cs` usar `builder.WebHost.UseUrls($"http://+:{Environment.GetEnvironmentVariable("PORT") ?? "5000"}")`.

### 5.4 Secreto JWT

Nunca usar el valor de `backend/appsettings.json`. En producción: `Jwt__Secret=<cadena aleatoria ≥ 32 caracteres>`.

```bash
openssl rand -base64 48   # generar el secreto
```

### 5.5 URLs de Flow

`Flow__ApiBaseUrl=https://api.tudominio.com` y `Flow__FrontendBaseUrl=https://tudominio.com`. Para una demo, mantener `Flow__UseMock=true` evita depender del sandbox.

### 5.6 Cadena de conexión de Neon en formato Npgsql

Neon entrega una URI (`postgresql://...`); Npgsql necesita el formato de palabras clave **con SSL**. Estos son los pares que hay que componer:

| Clave | Valor |
|---|---|
| `Host` | `ep-xxx-pooler.us-east-2.aws.neon.tech` |
| `Port` | `5432` |
| `Database` | `neondb` |
| `Username` | el usuario que entrega Neon |
| `Password` | la contraseña que entrega Neon |
| `SSL Mode` | `Require` |
| `Trust Server Certificate` | `true` |

Se unen con `;` en una sola línea y el resultado va **únicamente** en la variable de entorno `ConnectionStrings__DefaultConnection` del proveedor — nunca en un archivo del repositorio.

Usa siempre el endpoint **`-pooler`** (pgBouncer) para no agotar conexiones.

### 5.7 Migraciones en producción

Hoy solo se ejecutan con `dotnet run --seed`. Se lanzan una única vez desde tu máquina apuntando a Neon (§6.3), o se automatizan añadiendo `await context.Database.MigrateAsync()` al arranque cuando la variable `RUN_MIGRATIONS=true`.

---

## 6. Paso a paso — Opción A (recomendada)

Resultado final:

```
https://tudominio.com        → Netlify (SPA Angular)
https://tudominio.com/api/*  → proxy Netlify → Render (.NET API)
                                              → Neon (PostgreSQL + PostGIS)
https://images.tudominio.com → Cloudflare R2 (imágenes del portafolio)
```

Tiempo estimado: 60-90 minutos.

### 6.1 Preparar el repositorio

```bash
git checkout -b feat/despliegue-produccion
```

Aplica los cambios de §5.1 a §5.5 y añade el proxy del frontend creando `frontend/public/_redirects` (Angular copia `public/` al directorio de salida):

```
/api/*  https://inkspire-api.onrender.com/api/:splat  200
/*      /index.html                                   200
```

La primera línea evita CORS por completo; la segunda es el *fallback* de la SPA (equivalente al `try_files` de `nginx.conf`). Verifica la compilación y sube los cambios:

```bash
cd frontend && npm ci && npm run build   # debe generar dist/frontend/browser
git add -A && git commit -m "feat(despliegue): configuración para produccion" && git push -u origin feat/despliegue-produccion
```

### 6.2 Crear la base de datos en Neon

1. Regístrate en <https://neon.com> (plan Free, sin tarjeta) y crea el proyecto `inkspire` con **PostgreSQL 16** en la región más cercana.
2. En el **SQL Editor**, habilita la extensión geoespacial:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   SELECT postgis_version();
   ```
3. Copia la cadena de conexión del endpoint **pooled** y conviértela al formato Npgsql de §5.6. Guárdala: es el secreto más sensible del despliegue.

### 6.3 Aplicar migraciones y datos semilla

Desde tu máquina, una sola vez:

```bash
cd backend
export ConnectionStrings__DefaultConnection="Host=ep-xxx-pooler...;SSL Mode=Require;Trust Server Certificate=true"
export Storage__PublicBaseUrl="https://images.tudominio.com"
dotnet run --seed
```

Esto ejecuta migraciones, crea la extensión PostGIS y carga artistas, certificaciones, premios y auspicios. Comprueba en el SQL Editor de Neon que hay filas en `artist_profiles`.

### 6.4 Publicar las imágenes en Cloudflare R2

R2 ofrece 10 GB de almacenamiento y **egreso gratuito** (sin coste por tráfico de salida).

1. En el panel de Cloudflare → **R2** → crear el bucket `inkspire-images`.
2. Activar el **acceso público** del bucket y asociarle el subdominio `images.tudominio.com`.
3. Subir las imágenes que hoy genera el perfil `seed-images` del `docker-compose.yml`. Si ya las tienes en el MinIO local:
   ```bash
   docker compose up -d storage
   mc alias set local  http://localhost:9000 minioadmin minioadmin
   mc alias set r2     https://<account-id>.r2.cloudflarestorage.com <access-key> <secret-key> --api S3v4
   mc mirror local/inklink-images r2/inkspire-images
   ```
4. Verifica que `https://images.tudominio.com/matias-herrera/work-01.jpg` se abre en el navegador.

> **Atajo para una demo**: si no quieres montar R2, apunta `Storage__PublicBaseUrl` a las mismas URLs deterministas de `picsum.photos` que usa el seed. Es gratis, pero depende de un servicio de terceros y no sirve para subir imágenes reales.

### 6.5 Desplegar la API en Render

1. Regístrate en <https://render.com> y conecta el repositorio de GitHub.
2. **New → Web Service**, selecciona el repositorio y configura:
   - **Runtime**: Docker
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Instance Type**: Free / Hobby
   - **Health Check Path**: `/api/health` (el endpoint ya existe en `HealthController.cs`)
3. Variables de entorno:

   | Clave | Valor |
   |---|---|
   | `PORT` | `5000` |
   | `ASPNETCORE_ENVIRONMENT` | `Production` |
   | `ConnectionStrings__DefaultConnection` | cadena Npgsql de Neon |
   | `Jwt__Secret` | secreto generado en §5.4 |
   | `Jwt__Issuer` / `Jwt__Audience` | `inklink-api` / `inklink-web` |
   | `Cors__AllowedOrigins` | `https://tudominio.com,https://www.tudominio.com` |
   | `Storage__PublicBaseUrl` | `https://images.tudominio.com` |
   | `Flow__UseMock` | `true` (o `false` + `Flow__ApiKey`, `Flow__SecretKey`) |
   | `Flow__ApiBaseUrl` | `https://api.tudominio.com` |
   | `Flow__FrontendBaseUrl` | `https://tudominio.com` |

4. Despliega y comprueba: `curl https://inkspire-api.onrender.com/api/health` → `{"status":"healthy"}`.

### 6.6 Desplegar el frontend en Netlify

1. Regístrate en <https://netlify.com> → **Add new site → Import an existing project** → repositorio de GitHub.
2. Configuración de build:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist/frontend/browser`
3. Despliega y verifica que `https://<sitio>.netlify.app` carga y que la SPA obtiene datos (el `_redirects` ya enruta `/api/*` hacia Render).

### 6.7 Registrar el dominio y configurar DNS

1. Registra `tudominio.com` (§4) y, si no lo compraste allí, apunta sus *nameservers* a Cloudflare.
2. En Netlify: **Domain settings → Add custom domain** → `tudominio.com` y `www.tudominio.com`. Netlify indica los registros DNS a crear.
3. En el DNS de Cloudflare:

   | Tipo | Nombre | Valor | Proxy |
   |---|---|---|---|
   | CNAME | `@` (o A/ALIAS según indique Netlify) | `<sitio>.netlify.app` | DNS only |
   | CNAME | `www` | `<sitio>.netlify.app` | DNS only |
   | CNAME | `api` | `inkspire-api.onrender.com` | **DNS only** (nube gris) |
   | CNAME | `images` | el que indique R2 | Proxied |

   > La nube gris en `api` es importante: con el proxy naranja activado, Render puede fallar al validar el certificado TLS.
4. En Render: **Settings → Custom Domains** → `api.tudominio.com` (el plan Hobby incluye 2 dominios personalizados; TLS se emite y renueva solo).
5. Espera la propagación (minutos a 24 h) y confirma que los tres dominios responden por HTTPS.

### 6.8 Verificación final

```bash
curl -I https://tudominio.com                    # 200, servido por Netlify
curl https://tudominio.com/api/health            # {"status":"healthy"} vía proxy
curl https://api.tudominio.com/api/health        # {"status":"healthy"} directo
curl "https://tudominio.com/api/artists?page=1"  # datos del seed
```

En el navegador: el mapa carga con marcadores, las fotos del portafolio se ven (R2) y el login funciona con los usuarios de `login-samples.md`.

### 6.9 Mitigar el arranque en frío

La API se duerme tras 15 minutos sin tráfico. Opciones:

- **Ping externo gratuito**: UptimeRobot o Cron-job.org llamando a `https://api.tudominio.com/api/health` cada 10 minutos. Un servicio encendido de forma continua consume ~730 h/mes, dentro de las 750 h gratuitas del workspace — pero **solo alcanza para un servicio**.
- **Pagar** el plan Starter de Render (~US$ 7/mes) y eliminar el problema.
- **Asumirlo**: para una demo académica, avisar en el README de que la primera carga tarda ~1 minuto es perfectamente aceptable.

---

## 7. Paso a paso resumido — Opción C (VPS único)

Cuando quieres el mismo entorno que en local y sin cold starts.

```bash
# 1. Crear el servidor (Ubuntu 24.04, ≥ 2 GB RAM) e instalar Docker
ssh root@<ip-del-servidor>
curl -fsSL https://get.docker.com | sh

# 2. Clonar el proyecto y configurar secretos
git clone https://github.com/rchamycruz/AI4Devs-finalproject.git
cd AI4Devs-finalproject
cp .env.example .env && nano .env      # FLOW_*, credenciales

# 3. Levantar el stack completo (API + web + Postgres + MinIO)
docker compose --profile full up -d --build
docker compose --profile seed-images up seed-images     # imágenes del portafolio
docker compose run --rm api dotnet backend.dll --seed   # migraciones + datos

# 4. TLS automático con Caddy delante del contenedor web
docker run -d --name caddy --network host \
  -v caddy_data:/data \
  caddy caddy reverse-proxy --from tudominio.com --to localhost:4200
```

Ajustes necesarios: `Storage__PublicBaseUrl` apuntando a `https://tudominio.com/images` (o a un subdominio servido por MinIO), CORS al dominio real, y contraseñas de PostgreSQL y MinIO distintas de las de desarrollo. DNS: un registro `A` de `tudominio.com` y `www` a la IP del servidor.

**Pendientes que asumes tú**: copias de seguridad (`pg_dump` programado), actualizaciones del sistema, monitorización y endurecimiento del SSH.

---

## 8. Riesgos y puntos de atención

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Neon: 0,5 GB y 100 CU-horas/mes | La base se suspende al superar el límite | El seed ocupa pocos MB; vigila el panel de uso |
| Render: 750 h-instancia/mes por workspace | El servicio se suspende hasta el mes siguiente | Un solo servicio encendido; no dupliques entornos en el mismo workspace |
| Base de datos gratuita de Render caduca a 30 días | Pérdida de datos | No usarla: la base va en Neon |
| Secretos en el repositorio | Compromiso de credenciales | Todo por variables de entorno; `.env` está en `.gitignore` |
| `Trust Server Certificate=true` | Debilita la validación TLS con la base de datos | Aceptable con Neon; para mayor rigor, usa `SSL Mode=VerifyFull` con el certificado raíz |
| Extensión PostGIS no disponible | La búsqueda geoespacial falla en tiempo de ejecución | Verificar `SELECT postgis_version();` antes de desplegar |
| Cold start de ~50 s | Mala primera impresión en una demo | Ping cada 10 min o avisar en el README |
| Límites de Cloud Run superados (opción B) | Cargos inesperados | Configurar presupuesto y alertas de facturación en GCP |

---

## 9. Recomendación final

- **Demo académica o portafolio** → **Opción A**. Coste total: el dominio, ~US$ 10 al año.
- **Necesitas respuesta inmediata sin pagar hosting** → **Opción B** (Cloud Run), asumiendo la configuración de GCP y la tarjeta asociada.
- **Quieres el stack completo tal cual, incluido MinIO, y no te importa administrar** → **Opción C**, ~US$ 5/mes.

---

## 10. Referencias

- [Render — planes y capa gratuita](https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026) · [Dominios personalizados en Render](https://render.com/docs/custom-domains)
- [Neon — precios y límites del plan Free](https://neon.com/pricing) · [Cómo aprovechar el plan gratuito de Neon](https://neon.com/blog/how-to-make-the-most-of-neons-free-plan)
- [Netlify — rewrites y proxies](https://docs.netlify.com/routing/redirects/rewrites-proxies/)
- [Google Cloud Run — precios y capa gratuita](https://cloud.google.com/run/pricing) · [Google Cloud Free Tier](https://cloud.google.com/free)
- [Comparativa de registradores de dominios más baratos (2026)](https://domaindetails.com/registrars/cheapest)
- Documentación interna: `ARCHITECTURE.md`, `docs/development_guide.md`, `docs/documentacion.md`, `docker-compose.yml`
