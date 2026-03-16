# ===================================
# MINIMAL OUTPUTS - Only what matters!
# ===================================

output "web_public_ip" {
  description = "Public IP address of the web server"
  value       = aws_eip.web.public_ip
}

output "ssh_command" {
  description = "SSH command to connect to the server"
  value       = "ssh -i ${aws_key_pair.main.key_name}.pem ubuntu@${aws_eip.web.public_ip}"
}

output "database_host" {
  description = "RDS instance host"
  value       = split(":", aws_db_instance.postgres.endpoint)[0]
  sensitive   = true
}

output "database_password" {
  description = "Database password"
  value       = var.db_password != "" ? var.db_password : random_password.db_password.result
  sensitive   = true
}

output "database_url" {
  description = "Complete database URL"
  value       = "postgresql://shopmefy:${var.db_password != "" ? var.db_password : random_password.db_password.result}@${split(":", aws_db_instance.postgres.endpoint)[0]}:5432/shopmefy"
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket name for deployments"
  value       = aws_s3_bucket.deployments.bucket
}

output "ssh_private_key" {
  description = "SSH private key for connecting to the server"
  value       = tls_private_key.main.private_key_pem
  sensitive   = true
} 