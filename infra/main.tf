# Punto de entrada del módulo raíz. Los recursos concretos viven en ficheros
# dedicados por dominio (security_groups.tf, iam.tf, s3.tf, ec2.tf...); este
# fichero solo agrupa data sources transversales que varios de ellos consumen.

data "aws_caller_identity" "current" {}

data "aws_vpc" "default" {
  default = true
}
