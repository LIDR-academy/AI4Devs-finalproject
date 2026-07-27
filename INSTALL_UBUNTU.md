# BPMN Modeler — Instalación en Ubuntu 22.04 / 24.04

Guía completa para desplegar la app en un VPS/servidor propio (ej. `sdd-ia.com`).

Stack: FastAPI (Python 3.11) + React (build estático) + MongoDB + Nginx + Supervisor + Certbot.

---

## 0. Requisitos previos

- Servidor Ubuntu 22.04 o 24.04 con acceso root/sudo
- Dominio DNS apuntando a la IP pública del servidor (A record para `sdd-ia.com` y `www.sdd-ia.com`)
- Puertos 80 y 443 abiertos en el firewall
- Repositorio Git con el código (usa "Save to GitHub" desde Emergent)

---

## 1. Preparar el sistema

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Herramientas base
sudo apt install -y curl wget git build-essential software-properties-common \
    ca-certificates gnupg lsb-release ufw supervisor nginx

# Firewall (opcional pero recomendado)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

---

## 2. Instalar Python 3.11

```bash
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
python3.11 --version    # debe decir 3.11.x
```

---

## 3. Instalar Node.js 20 + Yarn

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn
node -v   # v20.x.x
yarn -v   # 1.22.x
```

---

## 4. Instalar MongoDB 7.0

```bash
# Importar la clave pública de MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Añadir el repo (ajusta jammy→noble si usas 24.04)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
    sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org

# Arrancar y dejar en autostart
sudo systemctl enable --now mongod
sudo systemctl status mongod    # debe decir "active (running)"
```

Si prefieres MongoDB Atlas (en la nube, gratis hasta 512 MB), sáltate este paso y usa la connection string de Atlas en el `.env` (paso 6).

---

## 5. Clonar el repositorio

```bash
sudo mkdir -p /opt/bpmn-modeler
sudo chown $USER:$USER /opt/bpmn-modeler

# Reemplaza con tu URL del repo (privado o público)
git clone https://github.com/TU_USUARIO/TU_REPO.git /opt/bpmn-modeler

# Si es privado usa un deploy key o HTTPS con PAT:
# git clone https://TU_PAT@github.com/TU_USUARIO/TU_REPO.git /opt/bpmn-modeler

cd /opt/bpmn-modeler
```

---

## 6. Backend (FastAPI)

```bash
# Virtualenv aislado
python3.11 -m venv /opt/bpmn-modeler/.venv
source /opt/bpmn-modeler/.venv/bin/activate

# Dependencias
pip install --upgrade pip
pip install -r /opt/bpmn-modeler/backend/requirements.txt

# SDK propietario de Emergent (integración LLM)
pip install emergentintegrations \
    --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

deactivate
```

### 6.1 Archivo `backend/.env`

```bash
cat > /opt/bpmn-modeler/backend/.env <<'EOF'
MONGO_URL="mongodb://localhost:27017"
DB_NAME="bpmn_modeler_prod"

# LLM keys (cópialas del preview de Emergent — Profile → Universal Key)
# NOTA: EMERGENT_LLM_KEY requiere plan de pago de Emergent para uso en deployments
# externos a la plataforma. En self-hosted usa DEFAULT_LLM_PROVIDER=minimax para
# bypass-ear ese límite (MiniMax y MiMo funcionan directo sin pasar por Emergent).
EMERGENT_LLM_KEY="sk-emergent-XXXXXXXXXXXXXXXXXXXX"
MINIMAX_API_KEY="TU_CLAVE_MINIMAX"
MIMO_API_KEY="TU_CLAVE_MIMO"
DEFAULT_LLM_PROVIDER="minimax"   # opciones: gemini (requiere plan pago), minimax, mimo

# Admin (cualquier email listado aquí obtiene rol admin al login)
ADMIN_EMAILS="tu-email@gmail.com"

# CORS — pon aquí TODOS los dominios desde los que va a llamar el frontend
CORS_ORIGINS="https://sdd-ia.com,https://www.sdd-ia.com"

# Demo account
DEMO_EMAIL="demo@bpmnmodeler.app"
DEMO_PASSWORD="demo"

# Stripe (Subscriptions + Webhook signature)
# Si NO usas Stripe deja STRIPE_API_KEY vacio. Para test: usa la sk_test_... de tu cuenta Stripe (https://dashboard.stripe.com/test/apikeys).
# Para produccion: usa sk_live_... del modo Live.
STRIPE_API_KEY="sk_test_xxx_or_sk_live_xxx"
# Secreto firmado del webhook — OBLIGATORIO en produccion. Vease seccion 6.3.
STRIPE_WEBHOOK_SECRET=""
# Modo de la app — cuando es "production" el webhook RECHAZA eventos sin firma valida (fail-fast).
APP_ENV="production"
EOF

chmod 600 /opt/bpmn-modeler/backend/.env
```

### 6.3 Configurar Stripe (suscripciones + webhook firmado)

> Solo necesario si vas a cobrar. Si dejas `STRIPE_API_KEY` vacio, la pagina `/pricing` sigue funcionando pero los botones "Empezar Pro/Team" daran 500.

**Paso 1 — Crear el endpoint del webhook en Stripe Dashboard**

1. Inicia sesion en https://dashboard.stripe.com/webhooks (modo Live o Test segun corresponda).
2. Click en **"Add endpoint"**.
3. **Endpoint URL**: `https://sdd-ia.com/api/webhook/stripe` (sustituye por tu dominio real).
4. **Events to send** — selecciona estos 4 como minimo:
   - `checkout.session.completed`           ← upgrade del usuario al completar el checkout
   - `customer.subscription.deleted`        ← downgrade a free al cancelar
   - `customer.subscription.updated`        ← downgrade a free si pasa a `canceled/unpaid/incomplete_expired`
   - `invoice.payment_failed`               ← (opcional) deja un registro para alertas
5. Click **"Add endpoint"**.
6. En la vista del endpoint recien creado, click en **"Reveal"** bajo **"Signing secret"** y copia el valor (formato `whsec_…`).

**Paso 2 — Pegar el secreto en `backend/.env`**

```bash
sudo nano /opt/bpmn-modeler/backend/.env
# Sustituye:
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
APP_ENV="production"
# Guarda y cierra
sudo supervisorctl restart bpmn-backend
```

**Paso 3 — Verificar que el secreto esta cargado (sin exponerlo)**

```bash
curl -s https://sdd-ia.com/api/payments/webhook/health | jq
# Debe devolver:
# {
#   "app_env": "production",
#   "stripe_api_key_configured": true,
#   "stripe_api_key_mode": "live",        // o "test"
#   "stripe_webhook_secret_configured": true,
#   "stripe_webhook_secret_prefix": "whsec_",
#   "stripe_webhook_secret_length": 38,
#   "signature_required": true,
#   "ok": true
# }
```

Si `ok: false` revisa el archivo `.env`, supervisor logs (`sudo tail -f /var/log/supervisor/bpmn-backend.err.log`) y reinicia el backend.

**Paso 4 — Probar el webhook end-to-end**

Desde Stripe Dashboard → tu webhook → **"Send test webhook"** → elige `checkout.session.completed` → **"Send test event"**.
Luego revisa los logs del backend: deberias ver una linea `[webhook] event=checkout.session.completed id=evt_…`. Si en su lugar ves `Stripe webhook validation failed: No signatures found matching…` significa que el secreto del `.env` no coincide con el del Dashboard — revisa que copiaste el correcto (whsec_… del **mismo modo** Live/Test que la `STRIPE_API_KEY`).

**Paso 5 (opcional) — Webhook local en desarrollo con Stripe CLI**

Para probar el webhook firmado en local sin desplegar:

```bash
# Instala stripe CLI
brew install stripe/stripe-cli/stripe   # mac
# o descarga binario para linux: https://github.com/stripe/stripe-cli/releases

stripe login
stripe listen --forward-to localhost:8001/api/webhook/stripe
# La CLI imprime: > Ready! Your webhook signing secret is whsec_xxx (^C to quit)
# Copia ese whsec_xxx en backend/.env como STRIPE_WEBHOOK_SECRET y reinicia el backend.
```

> ⚠️ **Importante**: en `APP_ENV=production` SIN `STRIPE_WEBHOOK_SECRET` el endpoint `/api/webhook/stripe` devolvera **503**. Esto es intencional — fail-fast para evitar aceptar eventos forjados.

### 6.2 Test manual del backend (antes de meterlo en supervisor)

```bash
cd /opt/bpmn-modeler/backend
source /opt/bpmn-modeler/.venv/bin/activate
uvicorn server:app --host 127.0.0.1 --port 8001
# En otra terminal:
curl http://127.0.0.1:8001/api/health
# debe devolver {"status":"healthy"}
# Ctrl+C para parar
deactivate
```

---

## 7. Frontend (React build estático)

### 7.1 Archivo `frontend/.env`

```bash
cat > /opt/bpmn-modeler/frontend/.env <<'EOF'
REACT_APP_BACKEND_URL=
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
EOF
```

**Importante:** `REACT_APP_BACKEND_URL` debe quedarse **vacío** → el frontend usará rutas relativas (`/api/...`) que Nginx enrutará al backend local. Evita CORS.

### 7.2 Build

```bash
cd /opt/bpmn-modeler/frontend
yarn install --frozen-lockfile
yarn build
# Se genera /opt/bpmn-modeler/frontend/build con el HTML/JS/CSS estático
```

---

## 8. Supervisor (proceso del backend)

```bash
sudo tee /etc/supervisor/conf.d/bpmn-backend.conf > /dev/null <<'EOF'
[program:bpmn-backend]
command=/opt/bpmn-modeler/.venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2
directory=/opt/bpmn-modeler/backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=false
stdout_logfile=/var/log/bpmn-backend.out.log
stderr_logfile=/var/log/bpmn-backend.err.log
environment=PYTHONUNBUFFERED="1"
stopasgroup=true
killasgroup=true
EOF

# Permisos para el usuario www-data
sudo chown -R www-data:www-data /opt/bpmn-modeler

# Cargar y arrancar
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start bpmn-backend
sudo supervisorctl status bpmn-backend   # debe decir RUNNING
```

---

## 9. Nginx (reverse proxy + SSL + WebSocket)

### 9.1 Config del site

```bash
sudo tee /etc/nginx/sites-available/sdd-ia.com > /dev/null <<'EOF'
# HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name sdd-ia.com www.sdd-ia.com;
    return 301 https://$host$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name sdd-ia.com www.sdd-ia.com;

    # SSL lo añade certbot (paso 9.3)

    # Límite para subir .bpmn/JSONs grandes
    client_max_body_size 25M;

    # Frontend estático
    root /opt/bpmn-modeler/frontend/build;
    index index.html;

    # SPA fallback: rutas de React → index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # WebSocket colaboración BPMN (CRÍTICO — antes que /api/)
    location /api/ws/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Endpoints de IA — timeouts largos (MiniMax/MiMo son más lentos que Gemini)
    location /api/ai/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_connect_timeout 60s;
        proxy_buffering off;
    }

    # API REST
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # Cache estático agresivo
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/sdd-ia.access.log;
    error_log  /var/log/nginx/sdd-ia.error.log;
}
EOF
```

### 9.2 Activar y recargar

```bash
sudo ln -sf /etc/nginx/sites-available/sdd-ia.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t    # debe decir "syntax is ok" + "test is successful"
sudo systemctl reload nginx
```

### 9.3 SSL gratis (Let's Encrypt)

```bash
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d sdd-ia.com -d www.sdd-ia.com \
    --agree-tos -m tu-email@gmail.com --redirect
# Se renueva solo cada 60 días vía cron
```

---

## 10. Verificación final

```bash
# Backend vivo
curl https://www.sdd-ia.com/api/health
# → {"status":"healthy"}

# LLM key configurada (no debe dar 503 por API_KEY_INVALID)
curl -X POST https://www.sdd-ia.com/api/auth/dev-login

# WebSocket (debe responder HTTP 101 Switching Protocols)
curl -i --http1.1 \
  -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  "https://www.sdd-ia.com/api/ws/diagram/test123"

# Frontend carga
curl -I https://www.sdd-ia.com/    # 200 OK, content-type: text/html
```

Abre `https://www.sdd-ia.com` en el navegador. Deberías ver el home.

---

## 11. Actualizar la app cuando haya cambios

```bash
cd /opt/bpmn-modeler
git pull

# Dependencias nuevas (si las hay)
source .venv/bin/activate
pip install -r backend/requirements.txt
deactivate

# Rebuild frontend
cd frontend
yarn install --frozen-lockfile
yarn build
cd ..

# Ajustar permisos (por si git deja cosas de tu user)
sudo chown -R www-data:www-data /opt/bpmn-modeler

# Reiniciar backend (no hace falta reiniciar nginx)
sudo supervisorctl restart bpmn-backend
```

---

## 12. Troubleshooting

### 503 "API key not valid" o "FREE_USER_EXTERNAL_ACCESS_DENIED" en /api/ai/...

**Causa:** La Emergent Universal Key solo funciona gratis dentro de la plataforma Emergent. En un server propio (como `sdd-ia.com`) Google/OpenAI rechazan la llamada con `FREE_USER_EXTERNAL_ACCESS_DENIED`.

**Fix:** cambia a MiniMax o MiMo como provider por defecto en el `.env` del backend:
```bash
echo 'DEFAULT_LLM_PROVIDER=minimax' >> /opt/bpmn-modeler/backend/.env
sudo supervisorctl restart bpmn-backend
```
Verifica que `MINIMAX_API_KEY` esté configurado. MiMo es otra alternativa (`DEFAULT_LLM_PROVIDER=mimo`).

Los endpoints que aceptan `llm_provider` desde el frontend (process-prompt, generate-project) también caerán automáticamente a MiniMax si el usuario selecciona Gemini/GPT y la llamada Emergent falla por este bloqueo.

### 502 Bad Gateway
- Backend caído: `sudo supervisorctl status bpmn-backend`
- Logs: `sudo tail -n 100 /var/log/bpmn-backend.err.log`

### WebSocket no conecta (colaboración)
- Verifica que el bloque `location /api/ws/` va ANTES de `location /api/` en el nginx
- `sudo nginx -t && sudo systemctl reload nginx`

### CORS errors
- Añade el origen al `CORS_ORIGINS` en `backend/.env` y reinicia backend
- Si el frontend está en el MISMO dominio que el backend (lo normal tras esta guía), CORS no debe dispararse

### "se queda en Autenticando..."
- Abre devtools → Network → mira `/api/auth/session`: ¿qué status devuelve?
- Si 401 con "Invalid session" → session_id de Emergent caducó, vuelve a hacer login desde el botón de Google
- Si timeout → outbound firewall puede estar bloqueando `demobackend.emergentagent.com`. Prueba: `curl -I https://demobackend.emergentagent.com/`

### MongoDB no arranca
- `sudo journalctl -u mongod -n 50`
- Si da error de memoria: `sudo sysctl vm.swappiness=10`

---

## 13. Opcional: instalación automática (`install.sh`)

Guarda este script y ejecútalo como root. Reemplaza las variables al principio.

```bash
#!/usr/bin/env bash
set -euo pipefail

DOMAIN="sdd-ia.com"
EMAIL="tu-email@gmail.com"
REPO_URL="https://github.com/TU_USUARIO/TU_REPO.git"
EMERGENT_LLM_KEY="sk-emergent-XXXXX"
APP_DIR="/opt/bpmn-modeler"

# Ver INSTALL_UBUNTU.md para el resto del script manual
echo "Usa INSTALL_UBUNTU.md para la instalación paso a paso."
```

---

## Credenciales de prueba tras la instalación

- **Dev login** (sin OAuth, útil para testear): `POST /api/auth/dev-login`
- **Demo login**: email `demo@bpmnmodeler.app` / password `demo`
- **Admin**: el email que pusiste en `ADMIN_EMAILS` tras loguearse vía Google

---

¿Dudas? Revisa los logs en `/var/log/bpmn-backend.*.log` y `/var/log/nginx/sdd-ia.error.log`.
