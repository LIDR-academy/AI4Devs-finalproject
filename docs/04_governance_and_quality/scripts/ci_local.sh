#!/usr/bin/env bash

# TK-063: Orquestador que reproduce localmente los 3 jobs reales de
# .github/workflows/ci.yml, en el mismo orden y con los mismos comandos — para detectar
# fallos antes de hacer push, en vez de enterarse recién en GitHub Actions. No reemplaza
# el pipeline real (algunos pasos, como gitleaks/trivy/oasdiff/tofu, se auto-descargan
# a una carpeta local cacheada si no están instalados, en vez de fallar duro), pero cubre
# el mismo terreno: lint/tipos/OpenAPI/gobernanza .agents/, seguridad/CVEs/secretos, y
# tests/build. No es portable verbatim a otro stack sin revisar los pasos (está acoplado
# a pnpm/Docker/OpenTofu, igual que el resto de docs/04_governance_and_quality/scripts/).
#
# Uso:
#   bash docs/04_governance_and_quality/scripts/ci_local.sh              # todo excepto mutation testing
#   bash docs/04_governance_and_quality/scripts/ci_local.sh --quick      # salta el job de seguridad (Docker+trivy+gitleaks, el más lento)
#   bash docs/04_governance_and_quality/scripts/ci_local.sh --with-mutation  # incluye mutation testing (lento, informativo en CI)

set -uo pipefail

QUICK=0
WITH_MUTATION=0
for arg in "$@"; do
  case "$arg" in
    --quick) QUICK=1 ;;
    --with-mutation) WITH_MUTATION=1 ;;
    *) echo "⚠️  Argumento desconocido: $arg (ignorado)" ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$REPO_ROOT" || exit 1

TOOLS_DIR="$REPO_ROOT/.ci-local-tools"
mkdir -p "$TOOLS_DIR"
export PATH="$TOOLS_DIR:$PATH"

# Mismas versiones pineadas que .github/workflows/ci.yml — mantener sincronizado a mano
# si el workflow real cambia de versión.
TOFU_VERSION="1.6.0"
OASDIFF_VERSION="1.29.1"
GITLEAKS_VERSION="8.30.1"

FAILED_STEPS=()
SKIPPED_STEPS=()

# --- Helpers de reporte ---------------------------------------------------

run_step() {
  local label="$1"
  shift
  echo ""
  echo "▶ $label"
  if "$@"; then
    echo "✅ $label"
  else
    echo "❌ $label"
    FAILED_STEPS+=("$label")
  fi
}

run_step_soft() {
  # Igual que run_step, pero informativo (continue-on-error en el CI real) — nunca cuenta
  # como fallo bloqueante, solo se reporta.
  local label="$1"
  shift
  echo ""
  echo "▶ $label (informativo, no bloqueante)"
  if "$@"; then
    echo "✅ $label"
  else
    echo "⚠️  $label (no bloqueante, revisar igual)"
  fi
}

skip_step() {
  local label="$1"
  local reason="$2"
  echo ""
  echo "⏭️  $label — omitido: $reason"
  SKIPPED_STEPS+=("$label ($reason)")
}

# --- Auto-bootstrap de binarios externos (misma version que CI) ----------

ensure_tofu() {
  command -v tofu >/dev/null 2>&1 && return 0
  echo "   Descargando OpenTofu v$TOFU_VERSION a $TOOLS_DIR (no instalado)..."
  local url="https://github.com/opentofu/opentofu/releases/download/v${TOFU_VERSION}/tofu_${TOFU_VERSION}_linux_amd64.zip"
  curl -sL "$url" -o /tmp/tofu_local.zip 2>/dev/null || return 1
  unzip -oq /tmp/tofu_local.zip tofu -d "$TOOLS_DIR" 2>/dev/null || return 1
  chmod +x "$TOOLS_DIR/tofu"
  rm -f /tmp/tofu_local.zip
}

ensure_oasdiff() {
  command -v oasdiff >/dev/null 2>&1 && return 0
  echo "   Descargando oasdiff v$OASDIFF_VERSION a $TOOLS_DIR (no instalado)..."
  local url="https://github.com/oasdiff/oasdiff/releases/download/v${OASDIFF_VERSION}/oasdiff_${OASDIFF_VERSION}_linux_amd64.tar.gz"
  curl -sL "$url" | tar -xz -C "$TOOLS_DIR" oasdiff 2>/dev/null || return 1
}

ensure_gitleaks() {
  command -v gitleaks >/dev/null 2>&1 && return 0
  echo "   Descargando gitleaks v$GITLEAKS_VERSION a $TOOLS_DIR (no instalado)..."
  local url="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
  curl -sL "$url" | tar -xz -C "$TOOLS_DIR" gitleaks 2>/dev/null || return 1
}

echo "════════════════════════════════════════════════════════════════"
echo "  CI Local — reproduce .github/workflows/ci.yml antes del push"
echo "════════════════════════════════════════════════════════════════"

# ═══════════════════════════════════════════════════════════════════
# JOB 1: Lint, Types, OpenAPI & Agents Governance
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "── JOB 1/3: Lint, Types, OpenAPI & Agents Governance ──────────────"

run_step "Install dependencies (pnpm install --frozen-lockfile)" \
  pnpm install --frozen-lockfile

run_step "Generate Prisma Client" \
  pnpm --filter @restostock/backend exec prisma generate --schema=prisma/schema.prisma

run_step "Run Code Linter" \
  pnpm run lint

run_step "Check Code Duplication (jscpd)" \
  pnpm run duplication

run_step "Validate OpenAPI Contract (spectral)" \
  npx -y @stoplight/spectral-cli lint docs/03_persistence_and_api/openapi.yaml

run_step "Validate Agents Framework Integrity" \
  bash .agents/scripts/validate_agents.sh

if ensure_tofu; then
  run_step "Validate OpenTofu HCL Syntax" \
    bash docs/04_governance_and_quality/scripts/check_iac_syntax.sh
else
  skip_step "Validate OpenTofu HCL Syntax" "no se pudo descargar tofu (¿sin red?) — instalar manualmente: https://opentofu.org/docs/intro/install/"
fi

if ensure_oasdiff; then
  run_step "Check OpenAPI/Zod Contract Drift (+ Breaking Changes)" \
    bash docs/04_governance_and_quality/scripts/check_contract_drift.sh
else
  skip_step "Check OpenAPI/Zod Contract Drift" "no se pudo descargar oasdiff (¿sin red?)"
fi

run_step "Check Environment Variable Usage (Antipatrón A)" \
  bash docs/04_governance_and_quality/scripts/check_env_usage.sh

run_step_soft "Check DevSecOps Manifest Coverage" \
  bash docs/04_governance_and_quality/scripts/check_devsecops_manifest_coverage.sh

run_step_soft "Check Dynamic Rules Freshness" \
  bash .agents/scripts/check_rules_freshness.sh

run_step "Validate DESIGN.md Spec" \
  npx -y @google/design.md lint DESIGN.md

# ═══════════════════════════════════════════════════════════════════
# JOB 2: Security & Dependency Audit
# ═══════════════════════════════════════════════════════════════════
if [ "$QUICK" -eq 1 ]; then
  skip_step "JOB 2/3: Security & Dependency Audit (completo)" "--quick"
else
  echo ""
  echo "── JOB 2/3: Security & Dependency Audit ────────────────────────────"

  if ensure_gitleaks; then
    run_step "Scan for hardcoded secrets (gitleaks)" \
      gitleaks detect --source . --no-banner
  else
    skip_step "Scan for hardcoded secrets (gitleaks)" "no se pudo descargar gitleaks (¿sin red?)"
  fi

  run_step "Dependency Vulnerability Audit" \
    bash docs/04_governance_and_quality/scripts/check_dependency_audit.sh

  run_step "Build backend image for CVE scan" \
    docker build -f apps/backend/Dockerfile -t restostock-backend:ci-local .

  run_step "Build frontend image for CVE scan" \
    docker build -f apps/frontend/Dockerfile -t restostock-frontend:ci-local .

  run_step "Scan backend image for CVEs (trivy)" \
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ci-local-trivy-cache:/root/.cache/ \
      aquasec/trivy image --severity CRITICAL,HIGH --exit-code 1 restostock-backend:ci-local

  run_step "Scan frontend image for CVEs (trivy)" \
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v ci-local-trivy-cache:/root/.cache/ \
      aquasec/trivy image --severity CRITICAL,HIGH --exit-code 1 restostock-frontend:ci-local

  docker rmi restostock-backend:ci-local restostock-frontend:ci-local >/dev/null 2>&1
fi

# ═══════════════════════════════════════════════════════════════════
# JOB 3: Unit/Integration Tests & Production Build
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "── JOB 3/3: Unit/Integration Tests & Production Build ─────────────"

run_step "Validate DB Schema" \
  pnpm --filter @restostock/backend exec prisma validate --schema=prisma/schema.prisma

run_step "Run Test Suite (Vitest)" \
  pnpm run test

run_step "Run Production Build" \
  pnpm run build

if [ "$WITH_MUTATION" -eq 1 ]; then
  run_step_soft "Mutation Testing — Domain & Application (target 70%)" \
    pnpm --filter @restostock/backend run test:mutation
else
  skip_step "Mutation Testing" "usar --with-mutation para incluirlo (lento, informativo en CI)"
fi

# --- Resumen ---------------------------------------------------------

echo ""
echo "════════════════════════════════════════════════════════════════"
if [ "${#SKIPPED_STEPS[@]}" -gt 0 ]; then
  echo "⏭️  Omitidos (${#SKIPPED_STEPS[@]}):"
  for s in "${SKIPPED_STEPS[@]}"; do echo "   - $s"; done
fi
if [ "${#FAILED_STEPS[@]}" -eq 0 ]; then
  echo "✨ Todo en verde — equivalente local de ci.yml sin fallos bloqueantes."
  echo "════════════════════════════════════════════════════════════════"
  exit 0
else
  echo "❌ Fallaron ${#FAILED_STEPS[@]} paso(s):"
  for s in "${FAILED_STEPS[@]}"; do echo "   - $s"; done
  echo "════════════════════════════════════════════════════════════════"
  exit 1
fi
