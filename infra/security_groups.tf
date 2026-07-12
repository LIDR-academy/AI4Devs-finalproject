# Security Group restringido a los puertos 22 (SSH de despliegue), 80 (HTTP)
# y 443 (HTTPS, extension TLS opcional via Certbot) - ver
# docs/DEPLOYMENT-STRATEGY.md, seccion Seguridad.
#
# Nota: las descripciones de las reglas usan solo ASCII (sin tildes ni
# guiones largos) porque AWS valida "ingress/egress.N.description" contra un
# charset restringido (^[0-9A-Za-z_ .:/()#,@[]+=&;{}!$*-]*$) y rechaza el
# resto con un error de terraform validate.

resource "aws_security_group" "app" {
  name        = "runmarket-app-sg"
  description = "RunMarket - SSH (22), HTTP (80) y HTTPS (443) unicamente."
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH - despliegue (restringir a la IP de despliegue cuando se conozca)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS (Certbot, extension TLS opcional)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Salida sin restricciones (pull de imagenes GHCR, actualizaciones del sistema, etc.)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Project = "runmarket"
  }
}
