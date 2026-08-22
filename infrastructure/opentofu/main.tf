# RestoStock IaC Specification - OpenTofu 1.6+ (MPL-2.0 Open Source)
# Aprovisionamiento Declarativo de Infraestructura Cloud y Contenedores

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
  }
}

provider "docker" {}

variable "jwt_secret" {
  description = "JWT signing secret — inyectado vía TF_VAR_jwt_secret desde el runner de CI (OIDC), nunca hardcodeado (Guard 23/25)."
  type        = string
  sensitive   = true
}

variable "postgres_user" {
  description = "Usuario de PostgreSQL — inyectado vía TF_VAR_postgres_user, nunca hardcodeado (Guard 23/25)."
  type        = string
  sensitive   = true
}

variable "postgres_password" {
  description = "Password de PostgreSQL — inyectado vía TF_VAR_postgres_password, nunca hardcodeado (Guard 23/25)."
  type        = string
  sensitive   = true
}

variable "postgres_db" {
  description = "Nombre de la base de datos RestoStock."
  type        = string
  default     = "restostock"
}

variable "cors_allowed_origins" {
  description = "Orígenes CORS permitidos en producción — Guard 14 aborta el arranque del backend (Fail-Fast) si está vacío o es '*'."
  type        = string
}

variable "rate_limit_window_ms" {
  description = "Ventana (ms) del rate limiter global de /api/v1/* (Guard 16). El login mantiene su propio límite fijo, más estricto."
  type        = number
  default     = 900000
}

variable "rate_limit_max_requests" {
  description = "Máximo de requests por IP dentro de rate_limit_window_ms (Guard 16)."
  type        = number
  default     = 100
}

variable "seed_admin_pin" {
  description = "PIN del administrador inicial (bootstrap idempotente, TK-051) — inyectado vía TF_VAR_seed_admin_pin. Sin el, una base de datos nueva no tiene forma de crear usuarios via la API."
  type        = string
  sensitive   = true
}

variable "seed_admin_name" {
  description = "Nombre del administrador inicial."
  type        = string
  default     = "Administrador"
}

# Red aislada para arquitectura de microservicios / monolito modular
resource "docker_network" "restostock_net" {
  name = "restostock_internal_network"
}

resource "docker_volume" "postgres_data" {
  name = "restostock_postgres_data"
}

# ---- PostgreSQL (TK-045: faltaba por completo en este modulo — el backend no tenia base
# de datos a la que conectarse fuera de docker-compose.yml) ----
resource "docker_image" "postgres_img" {
  name = "postgres:15-alpine"
}

resource "docker_container" "postgres" {
  name    = "restostock-postgres-service"
  image   = docker_image.postgres_img.image_id
  restart = "unless-stopped"

  networks_advanced {
    name    = docker_network.restostock_net.name
    aliases = ["postgres"]
  }

  env = [
    "POSTGRES_USER=${var.postgres_user}",
    "POSTGRES_PASSWORD=${var.postgres_password}",
    "POSTGRES_DB=${var.postgres_db}",
  ]

  volumes {
    volume_name    = docker_volume.postgres_data.name
    container_path = "/var/lib/postgresql/data"
  }

  healthcheck {
    test     = ["CMD-SHELL", "pg_isready -U ${var.postgres_user}"]
    interval = "10s"
    timeout  = "5s"
    retries  = 5
  }
}

# Imagen Backend Node.js / Express
resource "docker_image" "restostock_backend_img" {
  name = "restostock-backend:production"
  build {
    context    = "../../"
    dockerfile = "apps/backend/Dockerfile"
  }
}

# Imagen Frontend React / Vite (Nginx Static Host)
resource "docker_image" "restostock_frontend_img" {
  name = "restostock-frontend:production"
  build {
    context    = "../../"
    dockerfile = "apps/frontend/Dockerfile"
  }
}

# Contenedor Backend
resource "docker_container" "backend" {
  name    = "restostock-backend-service"
  image   = docker_image.restostock_backend_img.image_id
  restart = "unless-stopped"

  # alias "backend" (no solo el nombre del contenedor): coincide con el alias implícito
  # que docker-compose.yml genera por nombre de servicio — el nginx.conf del frontend
  # proxya /api/ a http://backend:3000 y debe resolver igual en ambos despliegues.
  networks_advanced {
    name    = docker_network.restostock_net.name
    aliases = ["backend"]
  }

  # DATABASE_URL/CORS_ALLOWED_ORIGINS faltaban (TK-045): sin DATABASE_URL Zod lanza al
  # arrancar (obligatorio, sin default); sin CORS_ALLOWED_ORIGINS, Guard 14 aborta el
  # arranque en produccion (Fail-Fast, prohibido el comodin "*"). El contenedor nunca
  # habria llegado a servir trafico con el `env` anterior.
  env = [
    "NODE_ENV=production",
    "PORT=3000",
    "JWT_SECRET=${var.jwt_secret}",
    "DATABASE_URL=postgresql://${var.postgres_user}:${var.postgres_password}@postgres:5432/${var.postgres_db}?schema=public",
    "CORS_ALLOWED_ORIGINS=${var.cors_allowed_origins}",
    "RATE_LIMIT_WINDOW_MS=${var.rate_limit_window_ms}",
    "RATE_LIMIT_MAX_REQUESTS=${var.rate_limit_max_requests}",
    "SEED_ADMIN_PIN=${var.seed_admin_pin}",
    "SEED_ADMIN_NAME=${var.seed_admin_name}",
  ]

  ports {
    internal = 3000
    external = 3000
  }

  # El provider docker no espera a que el healthcheck de postgres este "healthy" antes de
  # crear este contenedor (sin equivalente nativo a `depends_on: condition: service_healthy`
  # de docker-compose) — solo garantiza orden de creacion. El Fail-Fast del propio
  # docker-entrypoint.sh (`prisma migrate deploy`) + `restart = "unless-stopped"` son el
  # mecanismo real de resiliencia ante ese arranque en carrera.
  depends_on = [docker_container.postgres]
}

# Contenedor Frontend Nginx Proxy
resource "docker_container" "frontend" {
  name    = "restostock-frontend-service"
  image   = docker_image.restostock_frontend_img.image_id
  restart = "unless-stopped"

  networks_advanced {
    name = docker_network.restostock_net.name
  }

  # internal = 8080, NO 80 (TK-045): el Dockerfile del frontend corre nginx como usuario
  # no-root, que no puede bindear el puerto privilegiado 80 — escucha en 8080. Con
  # internal = 80 este contenedor era inalcanzable, nada escuchaba ahi dentro.
  ports {
    internal = 8080
    external = 80
  }

  depends_on = [docker_container.backend]
}
