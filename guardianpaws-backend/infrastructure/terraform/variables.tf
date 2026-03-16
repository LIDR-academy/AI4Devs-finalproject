variable "access_key" {
  description = "AWS Access Key"
  type        = string
  sensitive   = true
}

variable "secret_key" {
  description = "AWS Secret Access Key"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# Definir la variable db_password para ocultar la contraseña
variable "db_password" {
  description = "Contraseña de la base de datos"
  type        = string
  sensitive   = true
}
