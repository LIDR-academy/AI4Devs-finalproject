terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  # Backend remoto de estado en S3 — necesario para que el estado persista
  # entre ejecuciones del pipeline (cada runner de GitHub Actions es una VM
  # efimera nueva; un estado local no sobreviviria de una ejecucion a la
  # siguiente). El locking usa `use_lockfile` (nativo de S3, Terraform >=
  # 1.10) en vez de una tabla DynamoDB aparte - mas simple, sin recurso extra
  # que mantener.
  #
  # El bloque `backend` no admite variables ni interpolacion (se resuelve
  # antes que el resto de la configuracion), asi que 800075447418 hay que
  # sustituirlo a mano por el valor real (`aws sts get-caller-identity
  # --query Account`) la primera vez, tras crear el bucket a mano (ver
  # docs/DEPLOYMENT-RUNBOOK.md - es el unico recurso de este proyecto que no
  # gestiona Terraform, porque el propio backend no puede crear el sitio
  # donde va a guardar su estado).
  backend "s3" {
    bucket       = "runmarket-terraform-state-800075447418"
    key          = "runmarket/terraform.tfstate"
    region       = "eu-west-1"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region = var.aws_region
}
