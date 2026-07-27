#!/usr/bin/env bash
###############################################################################
# update.sh — Actualiza BPMN Modeler desde la rama 'dev' de GitHub
#
# Uso:
#   sudo /opt/bpmn-modeler/update.sh             # actualiza desde 'dev' (default)
#   sudo /opt/bpmn-modeler/update.sh main        # otra rama si la quieres
#   sudo BRANCH=staging /opt/bpmn-modeler/update.sh
#
# Qué hace:
#   1. git fetch + reset a la rama indicada (descarta cambios locales)
#   2. Reinstala dependencias backend si requirements.txt cambió
#   3. Rebuild del frontend si cambió package.json o el src/
#   4. Ajusta permisos a ubuntu (mismo user que supervisor)
#   5. Reinicia el backend con supervisor
#   6. Recarga nginx
###############################################################################
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/bpmn-modeler}"
BRANCH="${1:-${BRANCH:-dev}}"
SUPERVISOR_PROGRAM="${SUPERVISOR_PROGRAM:-bpmn-backend}"
NGINX_RELOAD="${NGINX_RELOAD:-1}"  # 0 para saltar nginx

# ----- Helpers -----
GREEN="\033[0;32m"; YELLOW="\033[1;33m"; RED="\033[0;31m"; CYAN="\033[0;36m"; NC="\033[0m"
info()    { echo -e "${CYAN}▶${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠${NC} $*"; }
fail()    { echo -e "${RED}✗${NC} $*" >&2; exit 1; }

[ "$EUID" -eq 0 ] || fail "Ejecuta con sudo: sudo $0"
[ -d "$APP_DIR/.git" ] || fail "$APP_DIR no es un repo git"

START_TS=$(date +%s)
cd "$APP_DIR"

# ----- 0. Git credentials -----
# Solo sobrescribe la remote si se pasa GITHUB_TOKEN por entorno.
# En producción la URL de origin ya lleva el token configurado.
GITHUB_USER="${GITHUB_USER:-thorpette}"
GITHUB_REPO="${GITHUB_REPO:-thorpette/bpmnoo}"
if [ -n "${GITHUB_TOKEN:-}" ]; then
    git remote set-url origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git" 2>/dev/null || true
fi

# ----- 1. Git pull -----
info "Actualizando rama '$BRANCH' en $APP_DIR…"
PREV_HEAD=$(git rev-parse HEAD 2>/dev/null || echo "none")

# Stash cambios locales por si los hubiera
if ! git diff-index --quiet HEAD --; then
    warn "Hay cambios locales — los guardo en stash"
    git stash push -u -m "auto-stash-$(date +%s)"
fi

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"
NEW_HEAD=$(git rev-parse HEAD)

if [ "$PREV_HEAD" = "$NEW_HEAD" ]; then
    success "Ya estabas en el último commit ($(git rev-parse --short HEAD))"
    NO_CODE_CHANGES=1
else
    success "Actualizado: $(git rev-parse --short "$PREV_HEAD") → $(git rev-parse --short "$NEW_HEAD")"
    NO_CODE_CHANGES=0
fi

# Detect change scope
CHANGED_FILES=$(git diff --name-only "$PREV_HEAD" "$NEW_HEAD" 2>/dev/null || echo "")
NEEDS_BACKEND_DEPS=0
NEEDS_FRONTEND_BUILD=0

if [ "$NO_CODE_CHANGES" -eq 1 ]; then
    # First run after deploy — force a full rebuild
    NEEDS_BACKEND_DEPS=1
    NEEDS_FRONTEND_BUILD=1
else
    echo "$CHANGED_FILES" | grep -q "backend/requirements.txt"     && NEEDS_BACKEND_DEPS=1 || true
    echo "$CHANGED_FILES" | grep -qE "frontend/(package\.json|yarn\.lock|src/|public/|craco\.config|tailwind\.config)" && NEEDS_FRONTEND_BUILD=1 || true
    echo "$CHANGED_FILES" | grep -qE "frontend/\.env"              && NEEDS_FRONTEND_BUILD=1 || true
fi

# ----- 2. Backend deps -----
if [ "$NEEDS_BACKEND_DEPS" -eq 1 ] && [ -f "$APP_DIR/.venv/bin/activate" ]; then
    info "Instalando dependencias del backend…"
    # shellcheck disable=SC1091
    source "$APP_DIR/.venv/bin/activate"
    pip install --quiet --upgrade pip
    pip install --quiet -r "$APP_DIR/backend/requirements.txt"
    deactivate
    success "Dependencias backend OK"
else
    info "Sin cambios en requirements.txt — skip"
fi

# ----- 3. Frontend build -----
if [ "$NEEDS_FRONTEND_BUILD" -eq 1 ]; then
    info "Reconstruyendo el frontend (puede tardar 1-2 min)…"
    cd "$APP_DIR/frontend"

    # Resolve yarn binary (sudo strips PATH, so search common locations)
    YARN=""
    # 1) Same dir as node (nvm, global installs)
    if NODE_PATH=$(command -v node 2>/dev/null); then
        YARN="$(dirname "$NODE_PATH")/yarn"
    fi
    # 2) nvm — scan all installed versions, pick latest
    if [ ! -x "$YARN" ] && [ -d "$HOME/.nvm/versions/node" ]; then
        for v in $(ls "$HOME/.nvm/versions/node/" 2>/dev/null | sort -Vr); do
            if [ -x "$HOME/.nvm/versions/node/$v/bin/yarn" ]; then
                YARN="$HOME/.nvm/versions/node/$v/bin/yarn"
                break
            fi
        done
    fi
    # 3) Common system paths
    if [ ! -x "$YARN" ]; then
        for p in "/usr/local/bin/yarn" "/usr/bin/yarn" "/opt/yarn/bin/yarn"; do
            if [ -x "$p" ]; then YARN="$p"; break; fi
        done
    fi
    # 4) Fallback — try plain "yarn" (may still be in PATH)
    if [ ! -x "$YARN" ]; then
        if command -v yarn >/dev/null 2>&1; then
            YARN="yarn"
        fi
    fi
    if [ -z "$YARN" ] || [ ! -x "$YARN" ]; then
        fail "No se encontró yarn. Instalalo con: npm install -g yarn"
    fi

    if echo "$CHANGED_FILES" | grep -q "frontend/package.json"; then
        $YARN install --frozen-lockfile
    fi
    $YARN build
    cd "$APP_DIR"
    success "Build frontend OK"
else
    info "Sin cambios en frontend — skip"
fi

# ----- 3b. Restore .env secrets (git reset --hard overwrites them) -----
ENV_FILE="$APP_DIR/backend/.env"
if [ -f "$ENV_FILE" ]; then
    # Read MONGO_URL from supervisor (source of truth)
    SUPERVISOR_CONF="/etc/supervisor/conf.d/bpmn-backend.conf"
    if [ -f "$SUPERVISOR_CONF" ]; then
        SV_MONGO=$(grep -oP 'MONGO_URL="\K[^"]+' "$SUPERVISOR_CONF" 2>/dev/null || true)
        if [ -n "$SV_MONGO" ]; then
            # Escape & for sed replacement
            SV_MONGO_ESC=$(printf '%s\n' "$SV_MONGO" | sed 's/[&/\]/\\&/g')
            sed -i "s|^MONGO_URL=.*|MONGO_URL=\"${SV_MONGO_ESC}\"|" "$ENV_FILE"
        fi
    fi
    # Fix ADMIN_EMAILS (notifications go here)
    sed -i 's|^ADMIN_EMAILS=.*|ADMIN_EMAILS="oscar.hidalgo.puertas@gmail.com,support@sdd-ia.com"|' "$ENV_FILE"
fi

# ----- 4. Permisos -----
info "Ajustando permisos a ubuntu…"
mkdir -p "$APP_DIR/backend/logs"
touch "$APP_DIR/backend/logs/app.log"
chown -R ubuntu:ubuntu "$APP_DIR"

# ----- 5. Reinicio backend -----
info "Reiniciando backend ($SUPERVISOR_PROGRAM)…"
if supervisorctl status "$SUPERVISOR_PROGRAM" >/dev/null 2>&1; then
    supervisorctl restart "$SUPERVISOR_PROGRAM"
    sleep 2
    if supervisorctl status "$SUPERVISOR_PROGRAM" | grep -q RUNNING; then
        success "Backend RUNNING"
    else
        warn "Backend no está en RUNNING — revisa logs:"
        warn "  sudo tail -n 80 /var/log/bpmn-backend.err.log"
        exit 2
    fi
else
    warn "Programa supervisor '$SUPERVISOR_PROGRAM' no encontrado — saltado"
fi

# ----- 6. Recarga nginx -----
if [ "$NGINX_RELOAD" -eq 1 ] && command -v nginx >/dev/null; then
    info "Verificando configuración nginx…"
    if nginx -t 2>/dev/null; then
        systemctl reload nginx
        success "Nginx recargado"
    else
        warn "nginx -t falló — no se recargó"
    fi
fi

# ----- Fin -----
ELAPSED=$(( $(date +%s) - START_TS ))
echo
success "Deploy completo en ${ELAPSED}s — commit $(git rev-parse --short HEAD) ($BRANCH)"

# ----- Health check -----
if command -v curl >/dev/null; then
    sleep 1
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8001/api/ || echo "000")
    if [ "$HEALTH" = "200" ]; then
        success "Health check OK (200)"
    else
        warn "Health check devolvió HTTP $HEALTH"
    fi
fi
