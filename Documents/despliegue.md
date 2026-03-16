# Infraestructura y Despliegue de **Gamy**

> Documento operativo para implementar, desplegar y operar el MVP de Gamy sobre **Django + PostgreSQL** con enfoque **mobile-first**, cumpliendo objetivos de **performance** y **seguridad** definidos en el PRD.
> Stack y arquitectura base: **Django (Python)**, **PostgreSQL**, **Django Templates + HTMX** (con opción futura a SPA), hosting recomendado: **Heroku o DigitalOcean**. &#x20;

---

## 1. Arquitectura Lógica

```
[Cliente (Web, mobile-responsive)]
            │ HTTPS
            ▼
[Frontend (Django Templates + HTMX)]
            │ WSGI/HTTP
            ▼
[Backend Django (Views/Services)]
            │ ORM / SQL
            ▼
[PostgreSQL]
            │
            ├── [Static Files] (CSS/JS/Imágenes)
            ├── [Admin Panel]
            └── [Data Migration Tools]
```

* Esta vista corresponde al bloque definido en el PRD.&#x20;

---

## 2. Ambientes

* **Local Dev**: ejecución con `runserver`, BD local (Docker o Postgres local).
* **Staging**: entorno espejo de producción para pruebas de regresión, smoke tests y validación de contenidos.
* **Producción**: alta disponibilidad objetivo **99%** y capacidad para \~**100 usuarios concurrentes** (MVP).&#x20;

---

## 3. Opciones de Hosting (recomendadas por PRD)

* **Heroku**: despliegue simple, addon **Heroku Postgres**, pipelines, release phase para migraciones.&#x20;
* **DigitalOcean (App Platform / Droplet)**: control granular, Postgres gestionado, Nginx opcional para estáticos.&#x20;

> El PRD sugiere **Heroku o DigitalOcean** para facilitar el deployment del MVP.&#x20;

---

## 4. Componentes Técnicos

* **Backend**: Django (Python).&#x20;
* **Base de datos**: PostgreSQL.&#x20;
* **Frontend**: Django Templates + HTMX.&#x20;
* **Versionado**: Git + GitHub (requerido en PRD).&#x20;

---

## 5. Seguridad y Cumplimiento

* **Autenticación** con Django Auth, **validación de entradas**, **CSRF**, **hash de contraseñas**.&#x20;
* **RGPD básico** (políticas de privacidad y términos).&#x20;

### Cabeceras y ajustes recomendados

* `SECURE_SSL_REDIRECT=True` (prod), `SESSION_COOKIE_SECURE=True`, `CSRF_COOKIE_SECURE=True`.
* `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: same-origin`.
* `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS` configurados al dominio productivo.

---

## 6. Performance y Disponibilidad

* **Objetivos**: Tiempos de carga **< 3 s**, **\~100 usuarios concurrentes**, **99% uptime**.&#x20;
* **Estrategias**:

  * **Paginación** en listados, **select\_related/prefetch\_related**, **índices** en Postgres. (Mitigación de riesgo de performance mencionada en PRD).&#x20;
  * **Compresión** y **caché de estáticos**.
  * **WhiteNoise** (Heroku/App Platform) o CDN para servir estáticos.

---

## 7. Variables de Entorno (mínimas)

```
DJANGO_SETTINGS_MODULE=project.settings.production
SECRET_KEY=<secure>
DEBUG=False
ALLOWED_HOSTS=<dominio_prod>
CSRF_TRUSTED_ORIGINS=https://<dominio_prod>
DATABASE_URL=postgres://user:pass@host:5432/db
TIME_ZONE=America/Bogota
LANGUAGE_CODE=es
STATIC_ROOT=/app/staticfiles
MEDIA_ROOT=/app/media
```

> Mantén secretos en **config vars** (Heroku) o **Variables/Secrets** (DO App Platform). El PRD pide seguridad básica; esto la refuerza.&#x20;

---

## 8. Proceso de Despliegue (CI/CD)

El PRD incluye **deployment pipeline** como entregable inicial.&#x20;

### 8.1 Pipeline (genérico)

1. **Build**

   * Instalar dependencias (`pip install -r requirements.txt`).
   * Ejecutar linters/tests (`pytest`, `flake8`, etc.).
2. **Release**

   * Aplicar migraciones: `python manage.py migrate`.
   * Recolectar estáticos: `python manage.py collectstatic --noinput`.
3. **Run**

   * Levantar `gunicorn project.wsgi`.

### 8.2 Heroku (ejemplo)

* **Procfile**

  ```
  web: gunicorn project.wsgi --log-file -
  release: python manage.py migrate && python manage.py collectstatic --noinput
  ```
* **Addons**: `heroku-postgresql`.
* **Pipelines**: `staging` → `production` con **Promote**.
* **Logs**: `heroku logs --tail`.

### 8.3 DigitalOcean App Platform (ejemplo)

* **Servicios**:

  * App **Python** (buildpack/imagen), comando de run `gunicorn project.wsgi`.
  * **DO Managed Postgres** (conexión por `DATABASE_URL`).
* **Release Command**: `python manage.py migrate && python manage.py collectstatic --noinput`.
* **Escalado**: 1–2 contenedores (mínimo) + autoescalado en horas pico (si aplica a presupuesto).

---

## 9. Base de Datos

* Esquema **core** (Users, Games, UserGameLibrary, GameRequests) según PRD.&#x20;
* **Migraciones de datos** (carga inicial de \~50–100 juegos) previstas en roadmap. &#x20;

---

## 10. Gestión de Estáticos y Media

* **WhiteNoise** para servir **staticfiles** en PaaS.
* Alternativa: **Nginx + CDN** (DigitalOcean Spaces/CloudFront) para producción, si crece el tráfico.

---

## 11. Monitoreo, Alertas y Backups

* **Disponibilidad objetivo**: 99%+.&#x20;
* **Monitoreo**: Health checks (`/healthz`), métricas app, errores (Sentry u opción equivalente).
* **Logs**: centralizados por plataforma (Heroku/DO) + retención mínima 14–30 días.
* **Backups Postgres**: diarios + restauración probada (Heroku PG/DO Managed PG incluyen snapshots).
* **KPIs y criterios Go-Live** (del PRD: performance, responsive, bugs): usar como checklist de aceptación.&#x20;

---

## 12. Seguridad Operativa

* **Principio de mínimos privilegios** en accesos a BD y panel.
* **2FA** en GitHub y en la plataforma de hosting.
* **Rotación** de `SECRET_KEY`/tokens si hay incidentes.
* **Políticas de privacidad** (RGPD) y términos publicados (el PRD lo contempla).&#x20;

---

## 13. Runbook de Despliegue (checklist)

1. `git push` a rama principal / tag de release.
2. Pipeline ejecuta **tests** ✅.
3. **Provisionar Postgres** (si no existe).
4. Definir **env vars** (ver §7).
5. **Deploy** → ejecutar **migraciones** y **collectstatic**.
6. **Smoke tests** en **/**, **/catalog/**, **/admin/**, login.
7. Verificar **tiempos de carga** (< 3 s) y funcionalidades clave.&#x20;
8. Activar **monitoreo** y **backups**.

---

## 14. Roadmap Operativo (MVP)

* **Fase 1**: Proyecto Django, modelos, auth, admin, **deployment pipeline** listo.&#x20;
* **Fase 2**: Catálogo, búsqueda, **carga inicial de datos**.&#x20;
* **Fase 3**: Registro/login, biblioteca/wishlist, solicitudes.&#x20;
* **Fase 4**: Optimización, testing integral, hardening y documentación.&#x20;

---

## 15. Apéndice: Comandos Útiles

```bash
# Migraciones
python manage.py makemigrations
python manage.py migrate

# Superusuario (admin panel)
python manage.py createsuperuser

# Carga de datos (ETL inicial): comando de management sugerido
python manage.py load_seed_games --file data/seed_games.csv

# Recolectar estáticos
python manage.py collectstatic --noinput

# Comprobar salud (implementar una vista /healthz simple)
curl -sSf https://<dominio>/healthz
```

---

### Criterios de Go-Live (resumen del PRD)

* **50 juegos** catalogados completos, **responsive** correcto, **<3 s** de carga, **0 bugs críticos**, **admin** operativo.&#x20;

---

¿Quieres que lo convierta en un **README.md** listo para tu repo con variables de entorno y ejemplos para **Heroku** y **DigitalOcean**?
