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

# Red aislada para arquitectura de microservicios / monolito modular
resource "docker_network" "restostock_net" {
  name = "restostock_internal_network"
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
  name  = "restostock-backend-service"
  image = docker_image.restostock_backend_img.image_id

  networks_advanced {
    name = docker_network.restostock_net.name
  }

  env = [
    "NODE_ENV=production",
    "PORT=3000",
    "JWT_SECRET=restostock-prod-jwt-secret-key-2026-sota-32chars"
  ]

  ports {
    internal = 3000
    external = 3000
  }
}

# Contenedor Frontend Nginx Proxy
resource "docker_container" "frontend" {
  name  = "restostock-frontend-service"
  image = docker_image.restostock_frontend_img.image_id

  networks_advanced {
    name = docker_network.restostock_net.name
  }

  ports {
    internal = 80
    external = 80
  }
}
