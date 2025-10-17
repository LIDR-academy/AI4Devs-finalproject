provider "aws" {
  region = var.aws_region
}

resource "aws_key_pair" "buscadoc_key" {
  key_name   = var.key_name
  public_key = tls_private_key.buscadoc_key.public_key_openssh
}

resource "tls_private_key" "buscadoc_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "local_file" "private_key_pem" {
  content  = tls_private_key.buscadoc_key.private_key_pem
  filename = "${path.module}/buscadoc_key.pem"
  file_permission = "0600"
}

resource "aws_security_group" "buscadoc_sg" {
  name        = "buscadoc_sg"
  description = "Permitir SSH, frontend y backend para Buscadoc"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Backend"
    from_port   = 3010
    to_port     = 3010
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_vpc" "default" {
  default = true
}

resource "aws_instance" "buscadoc_ec2" {
  # Ya estás usando un AMI ID específico, así que no hay problema
  ami                         = "ami-0ddac4b9aed8d5d46" 
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.buscadoc_key.key_name
  vpc_security_group_ids      = [aws_security_group.buscadoc_sg.id]
  associate_public_ip_address = true

  tags = {
    Name = "Buscadoc-Dev"
    Project = "Buscadoc"
    Environment = "development"
  }

  user_data = file("${path.module}/provision.sh")
}