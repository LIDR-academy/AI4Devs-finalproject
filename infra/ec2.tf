data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# IP elastica: la EC2 no conoce su propia IP publica antes de crearse, y
# `user_data` necesita CORS_ORIGIN/ASSETS_BASE_URL en el momento del primer
# arranque. Asignar una IP elastica ANTES de la instancia resuelve el
# problema (su valor se conoce dentro del mismo apply) y de paso da una IP
# estable entre reemplazos de instancia — refuerza el criterio de
# idempotencia de US-018-TASK-11 (un `apply` posterior no cambia la URL
# publica aunque la instancia se recreara).
resource "aws_eip" "app" {
  domain = "vpc"

  tags = {
    Name    = "runmarket-app"
    Project = "runmarket"
  }
}

locals {
  # Si no se aporta un dominio propio via var.cors_origin, se usa la IP
  # elastica automaticamente.
  cors_origin = var.cors_origin != "" ? var.cors_origin : "http://${aws_eip.app.public_ip}"
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  # Sin esto, el provider actualiza user_data con ModifyInstanceAttribute
  # sobre la instancia existente en lugar de recrearla - pero cloud-init solo
  # ejecuta user_data una vez por instance-id, asi que un cambio de script
  # nunca llegaria a correr en una instancia ya arrancada.
  user_data_replace_on_change = true

  user_data = templatefile("${path.module}/scripts/user_data.sh.tpl", {
    aws_region       = var.aws_region
    artifacts_bucket = aws_s3_bucket.artifacts.bucket
    db_user          = var.db_user
    # Docker Compose interpola $VAR/${VAR} tambien dentro del propio fichero
    # .env (no solo en docker-compose.prod.yml) - un "$" literal en la
    # contraseña generada se interpreta como referencia a otra variable y se
    # sustituye por vacio en silencio. "$$" es como Compose escapa un "$"
    # literal en un .env.
    db_password = replace(var.db_password, "$", "$$")
    db_name     = var.db_name
    ghcr_owner  = var.github_repository_owner
    image_tag   = "latest"
    cors_origin = local.cors_origin
  })

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  tags = {
    Name    = "runmarket-app"
    Project = "runmarket"
  }

  lifecycle {
    # Evita recrear la instancia si `data.aws_ami.al2023` resuelve a una AMI
    # más reciente en un apply posterior — la actualización de aplicación va
    # por redeploy.sh (SSH), no por reemplazo de instancia. Ver criterio de
    # idempotencia de US-018-TASK-11.
    ignore_changes = [ami]
  }
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}
