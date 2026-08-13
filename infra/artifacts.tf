# El zip de artefactos de despliegue se genera con el provider `archive`
# directamente durante `terraform plan`/`apply`, sin depender de un script
# externo ni de que un fichero generado exista de antemano en disco (ver nota
# de re-scoping en docs/backlog/US-018.md, US-018-TASK-06/07: un enfoque
# `null_resource` + `local-exec` + `filemd5()` sobre el zip fallaria en
# `terraform validate`/`plan` en cualquier checkout limpio, porque esas
# funciones se evaluan de forma inmediata, antes de que el provisioner corra).
#
# Contenido identico al que produce infra/scripts/generar-zip.sh (usado en el
# flujo manual) - misma lista de ficheros, mecanismo distinto.
data "archive_file" "app" {
  type        = "zip"
  output_path = "${path.module}/app.zip"

  source {
    content  = file("${path.module}/../docker-compose.prod.yml")
    filename = "docker-compose.prod.yml"
  }

  source {
    content  = file("${path.module}/../nginx/nginx.conf")
    filename = "nginx/nginx.conf"
  }

  source {
    content  = file("${path.module}/scripts/redeploy.sh")
    filename = "redeploy.sh"
  }
}

resource "aws_s3_object" "app_zip" {
  bucket = aws_s3_bucket.artifacts.id
  key    = "app.zip"
  source = data.archive_file.app.output_path
  etag   = data.archive_file.app.output_md5
}
