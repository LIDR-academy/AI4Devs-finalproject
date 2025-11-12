# Gamy — README

Plataforma web para **descubrir y gestionar juegos de mesa** (MVP).
Arquitectura: **Django (Python) + PostgreSQL + Templates/HTMX**. Diseño **mobile-first**.

---

## 1) Visión general

* **Frontend:** Django Templates + **HTMX** (MVP), listo para evolucionar a SPA.
* **Backend:** Django (Views/Services), seguridad (CSRF, sesiones), autenticación.
* **Datos:** PostgreSQL (Users, Games, UserGameLibrary, GameRequests; extensiones sugeridas: RuleSet, RuleVariant, TrainingVideo).
* **Admin:** Django Admin para curación del catálogo y aprobación de solicitudes.
* **Estáticos:** CSS/JS/Imágenes (pipeline de `collectstatic`).

---

## 2) Arquitectura lógica

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

---

## 3) Stack técnico

* **Python** 3.11+ (recomendado 3.12)
* **Django** 4.x/5.x
* **PostgreSQL** 14+
* **HTMX** 1.x
* **Gunicorn** (producción)
* **WhiteNoise** (estáticos en PaaS) o **OpenLiteSpeed/Nginx** con caché/CDN
* **pytest** (tests), **black/ruff** (formato/lint)

---

## 4) Requisitos

* Python 3.11+ y `pip`
* PostgreSQL 14+ (local o Docker)
* (Opcional) `make`, `pipx`

---

## 5) Configuración local (Quick Start)

```bash
# 1) Crear entorno
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

# 2) Instalar dependencias
pip install -r requirements.txt

# 3) Variables de entorno (.env)
cp .env.sample .env
# Edita valores (SECRET_KEY, DATABASE_URL, etc.)

# 4) Migraciones y datos
python manage.py migrate
python manage.py createsuperuser
# (Opcional) Semilla de datos:
# python manage.py load_seed_games --file data/seed_games.csv

# 5) Ejecutar en dev
python manage.py runserver 0.0.0.0:8000
```

> Acceso admin: `/admin/` (usa el superusuario creado).

---

## 6) Variables de entorno

Archivo: `.env` (o variables del sistema).

```ini
# Django
DJANGO_SETTINGS_MODULE=project.settings.local
SECRET_KEY=change-me
DEBUG=True

# Sitio
TIME_ZONE=America/Bogota
LANGUAGE_CODE=es

# Hosts/CSRF (producción)
ALLOWED_HOSTS=localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=http://localhost

# Base de datos
# Ejemplo local:
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gamy

# Estáticos/Media
STATIC_ROOT=/app/staticfiles
MEDIA_ROOT=/app/media
```

En producción ajusta:

* `DEBUG=False`
* `SECURE_SSL_REDIRECT=True`, `SESSION_COOKIE_SECURE=True`, `CSRF_COOKIE_SECURE=True`
* `ALLOWED_HOSTS` / `CSRF_TRUSTED_ORIGINS` al dominio productivo

---

## 7) Base de datos

**Tablas núcleo (MVP):** `Users`, `Games`, `UserGameLibrary`, `GameRequests`.
**Extensiones propuestas:** `RuleSet`, `RuleVariant`, `TrainingVideo` para versionado de reglas, variantes y videos de entrenamiento.

Migraciones:

```bash
python manage.py makemigrations
python.manage.py migrate
```

Semilla de datos (opcional):

```bash
python manage.py load_seed_games --file data/seed_games.csv
```

Índices recomendados:

* `Games(name)`, `Games(category)`
* `UserGameLibrary(user_id, game_id)` único
* `GameRequests(status, created_at)`

---

## 8) Estáticos y media

```bash
# Producción
python manage.py collectstatic --noinput
```

* PaaS (Heroku/DO App Platform): usar **WhiteNoise**.
* VPS/Servidor: servir con OpenLiteSpeed/Nginx + caché/CDN.

---

## 9) Tests y calidad

```bash
pytest
ruff check .
black --check .
```

(Agrega `pre-commit` si se desea).

---

## 10) Despliegue

### 10.1 Heroku (ejemplo rápido)

**Procfile**

```procfile
web: gunicorn project.wsgi --log-file -
release: python manage.py migrate && python manage.py collectstatic --noinput
```

**Pasos**

1. Crear app y addon: `heroku create` + `heroku addons:create heroku-postgresql`
2. Config vars (`SECRET_KEY`, `DATABASE_URL`, etc.)
3. `git push heroku main`
4. Ver logs: `heroku logs --tail`

---

### 10.2 DigitalOcean App Platform

* Servicio **Python** con comando de run: `gunicorn project.wsgi`
* Base de datos gestionada **DO Managed Postgres**
* Release Command: `python manage.py migrate && python manage.py collectstatic --noinput`
* Configurar variables de entorno y dominios

---

### 10.3 OpenLiteSpeed (Hostinger u OLS genérico) vía **reverse proxy** a Gunicorn

1. **Servicio systemd para Gunicorn** (escuchando en `127.0.0.1:8001` o unix socket):

```ini
# /etc/systemd/system/gamy.service
[Unit]
Description=Gamy Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/gamy
Environment="DJANGO_SETTINGS_MODULE=project.settings.production"
EnvironmentFile=/var/www/gamy/.env
ExecStart=/var/www/gamy/.venv/bin/gunicorn project.wsgi:application --bind 127.0.0.1:8001 --workers 3
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now gamy
```

2. En **OpenLiteSpeed**, crear un **proxy context** apuntando a `127.0.0.1:8001` (Route `/` → backend gunicorn).
3. Habilitar **HTTPS** con certificado (LetsEncrypt).
4. Configurar caché para **estáticos** y mapear `/static/` → directorio `STATIC_ROOT`.
5. En cada despliegue:

```bash
git pull
. .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gamy
```

> Alternativa OLS: usar su **WSGI App** nativa; si optas por esa ruta, apunta al `wsgi.py` del proyecto y define el entorno/virtualenv en la consola de OLS. Para entornos compartidos suele ser más simple el **reverse proxy**.

---

## 11) Operación y monitoreo

* **Healthcheck** `/healthz` (implementar vista simple que devuelva 200).
* **Logs** centralizados por plataforma (Heroku/DO/Servidor).
* **Backups** de Postgres diarios (snapshots gestionados por el proveedor o `pg_dump`).
* Errores: Sentry (o similar).

---

## 12) Seguridad

* Mínimos privilegios en DB/servidor.
* Rotación de claves ante incidentes.
* CSRF y cookies seguras en producción.
* Políticas de privacidad y Términos publicados (RGPD básico).

---

## 13) Estructura de proyecto (sugerida)

```
project/
  ├─ project/
  │   ├─ settings/
  │   │   ├─ __init__.py
  │   │   ├─ base.py
  │   │   ├─ local.py
  │   │   └─ production.py
  │   ├─ urls.py
  │   └─ wsgi.py
  ├─ apps/
  │   ├─ catalog/
  │   ├─ accounts/
  │   ├─ library/
  │   ├─ requests/
  │   └─ rules/ (RuleSet, Variant, TrainingVideo)  # opcional
  ├─ templates/
  ├─ static/
  ├─ data/ (seed_games.csv)
  ├─ manage.py
  ├─ requirements.txt
  └─ .env.sample
```

---

## 14) Roadmap (MVP)

1. Pipeline de deploy y base de proyecto lista.
2. Catálogo + búsqueda + carga inicial (50–100 juegos).
3. Auth + biblioteca/wishlist + solicitudes.
4. Optimización, hardening y documentación adicional.

---

## 15) Licencia

MIT (o la que se defina para el proyecto).

---

## 16) Autores

Equipo Gamy (Producto, Desarrollo, Operaciones).

---

¿Quieres que además genere un **`.env.sample`** y un **`Procfile`** listos para pegar en tu repo?
