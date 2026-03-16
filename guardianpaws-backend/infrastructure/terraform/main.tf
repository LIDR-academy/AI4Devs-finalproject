# Configurar el proveedor de AWS
provider "aws" {
  region     = var.region
  access_key = var.access_key
  secret_key = var.secret_key
}

# Crear un Security Group para la base de datos
resource "aws_security_group" "rds_sg" {
  name        = "guardianpaws-rds-sg"
  description = "Permitir acceso solo desde IPs autorizadas"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]//["203.0.113.50/32"]  # Cambia esto a tu IP o usa "0.0.0.0/0" solo para pruebas
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Crear una instancia de base de datos en AWS RDS
resource "aws_db_instance" "guardianpaws_db" {
  identifier           = "guardianpaws-db"
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  username             = "guardianpaws_admin"
  password             = var.db_password  # Usamos una variable en vez de exponerlo en el código
  publicly_accessible  = true  # Ahora la BD no es pública
  vpc_security_group_ids = [aws_security_group.rds_sg.id]  # Asociamos el Security Group
  skip_final_snapshot  = true
  db_name              = "guardianpaws"
}


# Crear un bucket de S3 para almacenamiento de imágenes
resource "aws_s3_bucket" "guardianpaws_s3" {
  bucket = "guardianpaws-bucket1"
}

# Crear un usuario IAM para el backend con permisos mínimos
# resource "aws_iam_user" "backend_user" {
#   name = "guardianpaws-backend-user"
# }

# Crear una clave de acceso para el usuario IAM
# resource "aws_iam_access_key" "backend_access_key" {
#   user = aws_iam_user.backend_user.name
# }

# # Definir una política personalizada para acceso a S3 (solo lectura y escritura en un bucket específico)
# resource "aws_iam_policy" "s3_policy" {
#   name        = "guardianpaws_s3_policy"
#   description = "Permisos restringidos para acceso a S3"
#   policy      = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Action   = ["s3:PutObject", "s3:GetObject"]
#         Effect   = "Allow"
#         Resource = ["arn:aws:s3:::guardianpaws-bucket1/*"]
#       }
#     ]
#   })
# }

# # Adjuntar la política al usuario IAM
# resource "aws_iam_user_policy_attachment" "attach_s3_policy" {
#   user       = aws_iam_user.backend_user.name
#   policy_arn = aws_iam_policy.s3_policy.arn
# }
