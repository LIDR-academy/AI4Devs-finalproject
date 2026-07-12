# Rol de instancia EC2 — de mínimo privilegio: únicamente lectura del bucket
# de artefactos de despliegue. GHCR no requiere IAM (autenticación propia del
# registro de contenedores).

data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2" {
  name               = "runmarket-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  tags = {
    Project = "runmarket"
  }
}

data "aws_iam_policy_document" "ec2_artifacts_read" {
  statement {
    sid       = "ReadDeployArtifacts"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.artifacts.arn}/*"]
  }

  statement {
    sid       = "ListArtifactsBucket"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.artifacts.arn]
  }
}

resource "aws_iam_role_policy" "ec2_artifacts_read" {
  name   = "runmarket-ec2-artifacts-read"
  role   = aws_iam_role.ec2.id
  policy = data.aws_iam_policy_document.ec2_artifacts_read.json
}

resource "aws_iam_instance_profile" "ec2" {
  name = "runmarket-ec2-profile"
  role = aws_iam_role.ec2.name
}
