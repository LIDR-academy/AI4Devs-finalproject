variable "aws_region" {
  description = "AWS region for prod resources"
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Project slug"
  type        = string
  default     = "RealSaveFooding"
}

variable "admin_cidr" {
  description = "CIDR allowed to SSH into the EC2 instance (your current public IP, as x.x.x.x/32)"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type (free tier: t3.micro / t2.micro)"
  type        = string
  default     = "t3.micro"
}

variable "ec2_key_name" {
  description = "Name of an existing EC2 key pair to allow SSH access"
  type        = string
}

variable "rds_instance_class" {
  description = "RDS instance class (free tier: db.t3.micro / db.t4g.micro)"
  type        = string
  default     = "db.t4g.micro"
}

variable "rds_engine_version" {
  description = "PostgreSQL engine version (matches local docker-compose's postgres:16-alpine major version); check `aws rds describe-db-engine-versions --engine postgres` for currently available versions if this becomes outdated"
  type        = string
  default     = "16.14"
}

variable "rds_allocated_storage" {
  description = "RDS storage in GB (free tier: up to 20GB)"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "RealSaveFooding"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "realsavefooding"
}

variable "db_password" {
  description = "Database master password (supply via terraform.tfvars or TF_VAR_db_password, never commit it)"
  type        = string
  sensitive   = true
}

variable "backend_port" {
  description = "Port the backend container listens on"
  type        = number
  default     = 3000
}

variable "frontend_port" {
  description = "Port the frontend container listens on"
  type        = number
  default     = 4173
}
