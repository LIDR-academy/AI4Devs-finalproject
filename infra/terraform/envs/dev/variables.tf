variable "aws_region" {
  description = "AWS region for dev resources"
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Project slug"
  type        = string
  default     = "consumesmart"
}
