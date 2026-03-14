#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOY_DIR="$ROOT_DIR/deployment"
LOG_DIR="$DEPLOY_DIR/logs"
mkdir -p "$LOG_DIR"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/deploy-${TIMESTAMP}.log"

CURRENT_ENV="development"
DRY_RUN=false
REGISTRY_URL="${DOCKER_REGISTRY_URL:-}"
IMAGE_NAMESPACE="${DOCKER_IMAGE_NAMESPACE:-ipfs-gateway}"
VERSION_TAG="${DOCKER_IMAGE_TAG:-latest}"

# Service image build metadata
SERVICES=("backend" "frontend" "celery" "nginx")
SERVICE_CONTEXT_backend="$ROOT_DIR/backend"
SERVICE_CONTEXT_frontend="$ROOT_DIR/frontend"
SERVICE_CONTEXT_celery="$ROOT_DIR/backend"
SERVICE_CONTEXT_nginx="$DEPLOY_DIR/docker/nginx"
SERVICE_DOCKERFILE_backend="$DEPLOY_DIR/docker/backend/Dockerfile"
SERVICE_DOCKERFILE_frontend="$DEPLOY_DIR/docker/frontend/Dockerfile"
SERVICE_DOCKERFILE_celery="$DEPLOY_DIR/docker/celery/Dockerfile"
SERVICE_DOCKERFILE_nginx="$DEPLOY_DIR/docker/nginx/Dockerfile"

CLR_RESET="\033[0m"
CLR_INFO="\033[1;34m"
CLR_OK="\033[1;32m"
CLR_WARN="\033[1;33m"
CLR_ERR="\033[1;31m"

log_line() {
  local level="$1"
  local msg="$2"
  printf "[%s] [%s] %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$level" "$msg" | tee -a "$LOG_FILE"
}

info() { printf "%b%s%b\n" "$CLR_INFO" "$1" "$CLR_RESET"; log_line INFO "$1"; }
success() { printf "%b%s%b\n" "$CLR_OK" "$1" "$CLR_RESET"; log_line OK "$1"; }
warn() { printf "%b%s%b\n" "$CLR_WARN" "$1" "$CLR_RESET"; log_line WARN "$1"; }
error() { printf "%b%s%b\n" "$CLR_ERR" "$1" "$CLR_RESET"; log_line ERROR "$1"; }

usage() {
  cat <<'EOF'
Usage: deployment/scripts/deploy.sh [--dry-run] [--env development|staging|production] [--registry REGISTRY]

Options:
  --dry-run      Print commands without executing
  --env          Select initial environment
  --registry     Default registry prefix (e.g., ghcr.io/org)
  -h, --help     Show help
EOF
}

trap_ctrl_c() {
  warn "Interrupted by user (Ctrl+C). Exiting safely."
  exit 130
}
trap trap_ctrl_c INT

run_cmd() {
  local cmd="$1"
  if [[ "$DRY_RUN" == true ]]; then
    warn "[DRY-RUN] $cmd"
    return 0
  fi

  info "Running: $cmd"
  set +e
  bash -c "$cmd" >>"$LOG_FILE" 2>&1
  local status=$?
  set -e

  if [[ $status -ne 0 ]]; then
    error "Command failed (exit $status): $cmd"
    return $status
  fi
  success "Command succeeded"
}

require_commands() {
  local missing=()
  command -v docker >/dev/null 2>&1 || missing+=("docker")
  docker compose version >/dev/null 2>&1 || missing+=("docker compose")

  if [[ ${#missing[@]} -gt 0 ]]; then
    error "Missing required command(s): ${missing[*]}"
    exit 2
  fi
}

get_compose_file() {
  case "$CURRENT_ENV" in
    development) echo "$DEPLOY_DIR/docker-compose.dev.yml" ;;
    staging) echo "$DEPLOY_DIR/docker-compose.prod.yml" ;;
    production) echo "$DEPLOY_DIR/docker-compose.prod.yml" ;;
    *) echo "$DEPLOY_DIR/docker-compose.dev.yml" ;;
  esac
}

compose_project_name() {
  case "$CURRENT_ENV" in
    development) echo "ipfs-gateway-dev" ;;
    staging) echo "ipfs-gateway-staging" ;;
    production) echo "ipfs-gateway-prod" ;;
    *) echo "ipfs-gateway-dev" ;;
  esac
}

image_ref() {
  local service="$1"
  local tag="$2"
  local base="${IMAGE_NAMESPACE}/${service}:${tag}"
  if [[ -n "$REGISTRY_URL" ]]; then
    echo "${REGISTRY_URL}/${base}"
  else
    echo "$base"
  fi
}

validate_env_file() {
  if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
    warn "deployment/.env not found. Compose actions may fail. Copy deployment/.env.example to deployment/.env first."
  fi
}

select_environment() {
  echo
  echo "Select environment:"
  echo "1) development"
  echo "2) staging"
  echo "3) production"
  read -r -p "Choice [1-3]: " env_choice

  case "$env_choice" in
    1) CURRENT_ENV="development" ;;
    2) CURRENT_ENV="staging" ;;
    3) CURRENT_ENV="production" ;;
    *) error "Invalid environment choice."; return 1 ;;
  esac
  success "Environment set to: $CURRENT_ENV"
}

list_images() {
  run_cmd "docker images"
}

build_images() {
  local tag
  read -r -p "Enter image version tag [${VERSION_TAG}]: " tag
  tag="${tag:-$VERSION_TAG}"

  for service in "${SERVICES[@]}"; do
    local ctx_var="SERVICE_CONTEXT_${service}"
    local df_var="SERVICE_DOCKERFILE_${service}"
    local context="${!ctx_var}"
    local dockerfile="${!df_var}"
    local target
    target="$(image_ref "$service" "$tag")"

    run_cmd "docker build -t '$target' -f '$dockerfile' '$context'"
  done

  VERSION_TAG="$tag"
  success "Build complete with tag: $VERSION_TAG"
}

retag_image() {
  local source target
  read -r -p "Source image (name:tag): " source
  read -r -p "Target image (name:tag): " target

  if [[ -z "$source" || -z "$target" ]]; then
    error "Source and target image are required."
    return 1
  fi

  run_cmd "docker image inspect '$source' >/dev/null"
  run_cmd "docker tag '$source' '$target'"
}

push_registry() {
  local image
  read -r -p "Image to push (name:tag): " image
  if [[ -z "$image" ]]; then
    error "Image is required."
    return 1
  fi

  run_cmd "docker push '$image'"
}

deploy_application() {
  validate_env_file
  local compose_file project
  compose_file="$(get_compose_file)"
  project="$(compose_project_name)"

  run_cmd "COMPOSE_PROJECT_NAME='$project' docker compose -f '$compose_file' up --build -d"
}

run_single_container() {
  local image_name container_name port_map env_file
  read -r -p "Image (name:tag): " image_name
  read -r -p "Container name: " container_name
  read -r -p "Port mapping (e.g. 8080:80) [optional]: " port_map
  read -r -p "Env file path [optional]: " env_file

  if [[ -z "$image_name" || -z "$container_name" ]]; then
    error "Image and container name are required."
    return 1
  fi

  local cmd="docker run -d --name '$container_name'"
  [[ -n "$port_map" ]] && cmd+=" -p '$port_map'"
  [[ -n "$env_file" ]] && cmd+=" --env-file '$env_file'"
  cmd+=" '$image_name'"

  run_cmd "$cmd"
}

view_logs() {
  local mode
  local compose_file project
  compose_file="$(get_compose_file)"
  project="$(compose_project_name)"

  echo "1) Full stack logs"
  echo "2) Single service logs"
  read -r -p "Choice [1-2]: " mode

  case "$mode" in
    1)
      run_cmd "COMPOSE_PROJECT_NAME='$project' docker compose -f '$compose_file' logs --tail=200"
      ;;
    2)
      local service
      read -r -p "Service name: " service
      [[ -z "$service" ]] && { error "Service name is required."; return 1; }
      run_cmd "COMPOSE_PROJECT_NAME='$project' docker compose -f '$compose_file' logs --tail=200 '$service'"
      ;;
    *)
      error "Invalid log mode."
      return 1
      ;;
  esac
}

stop_services() {
  local compose_file project
  compose_file="$(get_compose_file)"
  project="$(compose_project_name)"
  run_cmd "COMPOSE_PROJECT_NAME='$project' docker compose -f '$compose_file' down"
}

restart_services() {
  local compose_file project
  compose_file="$(get_compose_file)"
  project="$(compose_project_name)"

  local service
  read -r -p "Service to restart (leave empty for all): " service

  if [[ -z "$service" ]]; then
    run_cmd "COMPOSE_PROJECT_NAME='$project' docker compose -f '$compose_file' restart"
  else
    run_cmd "COMPOSE_PROJECT_NAME='$project' docker compose -f '$compose_file' restart '$service'"
  fi
}

show_menu() {
  clear || true
  cat <<EOF
===========================================
  IPFS Gateway Deployment CLI
===========================================

Current Environment: ${CURRENT_ENV}
Dry-Run Mode: ${DRY_RUN}
Registry: ${REGISTRY_URL:-<none>}
Log File: ${LOG_FILE}

1. Select Environment
2. List Images
3. Build Images
4. Tag/Rename Image
5. Push to Registry
6. Deploy Application
7. Run Single Container
8. View Logs
9. Stop Services
10. Restart Services
11. Toggle Dry-Run
12. Set Registry URL
0. Exit

Enter choice:
EOF
}

toggle_dry_run() {
  if [[ "$DRY_RUN" == true ]]; then
    DRY_RUN=false
  else
    DRY_RUN=true
  fi
  success "Dry-run mode is now: $DRY_RUN"
}

set_registry_url() {
  local reg
  read -r -p "Registry URL (empty to clear): " reg
  REGISTRY_URL="$reg"
  success "Registry URL updated: ${REGISTRY_URL:-<none>}"
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --env)
        [[ $# -lt 2 ]] && { error "--env requires a value"; exit 2; }
        case "$2" in
          development|staging|production) CURRENT_ENV="$2" ;;
          *) error "Invalid --env value: $2"; exit 2 ;;
        esac
        shift 2
        ;;
      --registry)
        [[ $# -lt 2 ]] && { error "--registry requires a value"; exit 2; }
        REGISTRY_URL="$2"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        error "Unknown argument: $1"
        usage
        exit 2
        ;;
    esac
  done
}

main() {
  parse_args "$@"
  require_commands

  while true; do
    show_menu
    read -r choice
    case "$choice" in
      1) select_environment ;;
      2) list_images ;;
      3) build_images ;;
      4) retag_image ;;
      5) push_registry ;;
      6) deploy_application ;;
      7) run_single_container ;;
      8) view_logs ;;
      9) stop_services ;;
      10) restart_services ;;
      11) toggle_dry_run ;;
      12) set_registry_url ;;
      0) success "Exiting deployment CLI."; break ;;
      *) error "Invalid choice. Please enter a number from 0 to 12." ;;
    esac

    read -r -p "Press Enter to continue..." _
  done
}

main "$@"
