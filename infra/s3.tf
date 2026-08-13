# Bucket de artefactos de despliegue (docker-compose.prod.yml + nginx.conf +
# redeploy.sh empaquetados en app.zip). Vacío en esta tarea — la subida del
# zip es US-018-TASK-07 (infra/artifacts.tf), que necesita el contenido real
# de redeploy.sh para poder empaquetarlo.

resource "aws_s3_bucket" "artifacts" {
  bucket = "runmarket-deploy-artifacts-${data.aws_caller_identity.current.account_id}"

  tags = {
    Project = "runmarket"
  }
}

resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
