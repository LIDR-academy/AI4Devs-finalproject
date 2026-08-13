output "app_url" {
  description = "URL pública de la aplicación desplegada (IP elástica — estable entre reemplazos de instancia)."
  value       = "http://${aws_eip.app.public_ip}"
}

output "instance_public_ip" {
  description = "IP elástica asociada a la instancia EC2."
  value       = aws_eip.app.public_ip
}

output "artifacts_bucket" {
  description = "Nombre del bucket S3 de artefactos de despliegue."
  value       = aws_s3_bucket.artifacts.bucket
}
