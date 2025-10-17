output "ec2_public_ip" {
  description = "Dirección IP pública de la instancia EC2 Buscadoc"
  value       = aws_instance.buscadoc_ec2.public_ip
}

output "ssh_private_key_path" {
  description = "Ruta local del archivo de clave privada SSH generada"
  value       = local_file.private_key_pem.filename
}

output "ssh_command" {
  description = "Comando SSH para conectarse a la instancia EC2"
  value       = "ssh -i ${local_file.private_key_pem.filename} ubuntu@${aws_instance.buscadoc_ec2.public_ip}"
}