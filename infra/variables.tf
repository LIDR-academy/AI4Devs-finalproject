variable "aws_region" {
  description = "Región AWS donde se provisiona la infraestructura."
  type        = string
  default     = "eu-west-1"
}

variable "instance_type" {
  description = "Tipo de instancia EC2."
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Nombre del key pair EC2 ya creado en AWS (consola → EC2 → Key Pairs), usado para el acceso SSH de despliegue. No es secreto (solo el nombre) — el material privado va en el GitHub Secret EC2_SSH_PRIVATE_KEY, nunca aquí."
  type        = string
  default     = "runmarket-deploy-key"
}

variable "db_user" {
  description = "Usuario de PostgreSQL para el contenedor de base de datos."
  type        = string
  default     = "runmarket"
}

variable "db_password" {
  description = "Contraseña de PostgreSQL. Nunca se versiona; se inyecta vía TF_VAR_db_password (GitHub Secret TF_VAR_DB_PASSWORD)."
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Nombre de la base de datos PostgreSQL."
  type        = string
  default     = "runmarket"
}

variable "cors_origin" {
  description = "Origen permitido por CORS en el backend (dominio propio, si se dispone de uno). Si se deja vacío (por defecto), infra/ec2.tf usa automáticamente http://<ip-elástica> — ver local.cors_origin."
  type        = string
  default     = ""
}

variable "github_repository_owner" {
  description = "Owner (usuario u organización) del repositorio en GitHub. Usado para construir la referencia de imagen GHCR (GHCR_OWNER en el .env de la EC2). En CI se deriva automáticamente del contexto de GitHub Actions (github.repository_owner), sin configuración manual."
  type        = string
}
