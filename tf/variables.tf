variable "aws_region" {
  description = "Región de AWS donde se desplegará la infraestructura"
  default     = "us-west-1"
}

variable "instance_type" {
  description = "Tipo de instancia EC2"
  default     = "t3.small"
}

variable "key_name" {
  description = "Nombre de la clave SSH para acceso a la instancia"
  default     = "buscadoc-key"
}