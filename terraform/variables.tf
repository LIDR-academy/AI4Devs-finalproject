# ===================================
# MINIMAL VARIABLES - Only essentials!
# ===================================

variable "aws_region" {
  description = "AWS region for infrastructure deployment"
  type        = string
  default     = "us-east-1"
}

variable "db_password" {
  description = "Password for the RDS PostgreSQL database"
  type        = string
  sensitive   = true
  default     = ""
}

 