# RunMarket — Runbook de despliegue (paso a paso)

Guía práctica para desplegar RunMarket en AWS. El razonamiento y las
alternativas de diseño están en
[`docs/DEPLOYMENT-STRATEGY.md`](DEPLOYMENT-STRATEGY.md); el detalle de
implementación en [`docs/backlog/US-018.md`](backlog/US-018.md).

**Todo pasa por el pipeline de GitHub Actions, incluida la primera vez** —
con credenciales IAM estáticas previo que hacer a mano.
Antes de la primera ejecución solo hace falta una configuración de cuenta
puntual (usuario IAM, bucket de estado, key pair, secrets) — ver "Guía
rápida" más abajo.

---

## Prerrequisitos

- Cuenta de AWS con permisos para crear usuarios IAM y buckets S3 (para el
  setup inicial de esta sección — no hace falta tenerlo instalado en tu
  portátil salvo que también quieras usar el camino manual de depuración).
- `gh` (GitHub CLI) autenticado, o acceso a la web de GitHub, para configurar
  secrets y lanzar el workflow.
- Docker instalado localmente solo si vas a usar el camino manual de
  depuración (no hace falta para el camino recomendado — el pipeline
  construye las imágenes en el runner).

---

## Guía rápida (primera vez)

Secuencia completa, en orden — el detalle de cada paso está más abajo:

1. **Bootstrap de cuenta AWS** (crea usuario IAM, bucket de estado, key pair; edita `infra/provider.tf` en local):
   ```bash
   bash infra/scripts/bootstrap-account.sh
   ```
   Copia la `AccessKeyId`/`SecretAccessKey` que imprime — no se vuelven a mostrar.

2. **Configurar los 4 secrets en GitHub** — sin esto, el job `deploy` falla en el step de autenticación AWS:
   ```bash
   gh secret set AWS_ACCESS_KEY_ID
   gh secret set AWS_SECRET_ACCESS_KEY
   gh secret set TF_VAR_DB_PASSWORD
   gh secret set EC2_SSH_PRIVATE_KEY   # contenido de ~/.ssh/runmarket-deploy-key.pem
   ```

3. **Commit + push** de la rama de trabajo — incluye el cambio que el nombre del bucket s3 que el script hizo en `infra/provider.tf`.

4. **Lanzar el pipeline**, apuntando a tu rama de trabajo (no hace falta haberla fusionado):
   ```bash
   gh workflow run ci-cd.yml --ref <tu-rama>
   gh run watch                     # sigue el progreso en vivo
   gh run view --log                # logs completos de la última ejecución
   ```
   El trigger es `workflow_dispatch` — nunca se lanza solo al hacer `push` o
   abrir una PR, solo cuando lo ejecutas explícitamente. También puedes
   lanzarlo desde la web (Actions → CI/CD → Run workflow).

---

**Qué pasa en esta primera ejecución:**
1. Job `test`: lint + build + tests backend/frontend contra una Postgres
   efímera del propio runner.
2. Job `deploy`: construye y publica las imágenes en GHCR, aplica Terraform
   (crea la EC2 + IP elástica + Security Group + roles IAM + bucket de
   artefactos — todo lo que no creaste a mano en la sección anterior), y por
   SSH ejecuta `redeploy.sh` en la instancia.
3. Health-check final contra `GET /api/health`.

**Aviso de primera vez:** GHCR crea el paquete como privado la primera vez
que se publica una imagen, y el `GITHUB_TOKEN` del workflow no tiene permiso
para cambiar su visibilidad — así que es esperable que esta primera
ejecución falle en el health-check (`docker compose pull` en la EC2 sin
credenciales de registro). Si pasa:

1. GitHub → tu perfil → **Packages** → `runmarket-backend` → *Package
   settings* → *Change visibility* → **Public** (repite para
   `runmarket-frontend`).
2. Vuelve a lanzar el workflow (paso anterior). Esta vez debería completar
   en verde.

A partir de ahí no hace falta repetir este paso — un paquete ya existente
conserva su visibilidad en los pushes siguientes.

**Redeploys posteriores** (tras cualquier cambio de código) son exactamente
el mismo "lanzar el pipeline" de arriba — no hay un camino "primera vez"
distinto del camino "enésima vez".

---

## Rotación de la access key (opcional)

La access key del usuario IAM (`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`)
es válida indefinidamente mientras exista. Para minimizar la
ventana en la que esa credencial podría usarse (por ejemplo, por una filtración),
se puede borrar entre despliegues y recrearla justo antes de cada uno:

**Borrar la access key** (después de un despliegue, para no dejarla activa sin usar):
```bash
aws iam list-access-keys --user-name runmarket-github-actions-deploy \
  --query 'AccessKeyMetadata[].AccessKeyId' --output text
# por cada AccessKeyId que devuelva:
aws iam delete-access-key --user-name runmarket-github-actions-deploy \
  --access-key-id <AccessKeyId>
```

**Crear una nueva y actualizar los secrets** (antes del siguiente despliegue):
```bash
aws iam create-access-key --user-name runmarket-github-actions-deploy
# copia AccessKeyId/SecretAccessKey de la salida y actualiza los secrets:
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
```

El usuario IAM y su policy no se tocan al borrar/crear access keys — solo
rotas la credencial. Puede tener hasta 2 activas a la vez, así que no hace
falta borrar la anterior antes de crear la siguiente. Es un paso manual
extra en cada despliegue; para el ritmo de este proyecto (despliegues
puntuales, no continuos) es un trade-off razonable si quieres ese margen de
seguridad, pero no es obligatorio — con la access key siempre activa el
riesgo ya está acotado por la policy restringida a `runmarket-*` y a
`t3.micro`.

---

## Qué actualiza cada vez que lo lanzas

| Job | Paso | Qué hace | Qué NO hace |
|---|---|---|---|
| `test` | lint, build, tests backend+frontend | Valida el código del commit de la rama elegida contra una Postgres efímera del propio runner | No toca AWS ni la EC2 en ningún momento |
| `deploy` | build + push a GHCR | Reconstruye las imágenes `runmarket-backend`/`-frontend` desde el código actual y las publica con tag `:latest` y `:<sha-del-commit>` | No sobreescribe tags anteriores por SHA — cada commit deja su propia imagen trazable |
| `deploy` | `terraform apply` | Reconcilia `infra/*.tf` contra el estado real (guardado en el bucket S3 del paso 2): si cambiaste algo en Terraform (p. ej. el Security Group), lo aplica aquí | Es idempotente: si no hay cambios en `infra/*.tf`, no recrea ni modifica la EC2 (`lifecycle.ignore_changes` + IP elástica estable, ver `docs/backlog/US-018.md` tarea 11). El `concurrency` group del workflow evita que dos ejecuciones se pisen |
| `deploy` | SSH + `redeploy.sh` | En la EC2 ya existente: `docker compose pull` (baja las imágenes recién publicadas) + `up -d` (reinicia los contenedores con la imagen nueva) + `prisma migrate deploy` (aplica migraciones pendientes del schema) | **No** vuelve a ejecutar el seed de los 13 productos — eso solo pasa una vez, en el primer arranque (`user_data.sh.tpl`). Los pedidos y cambios de stock ya existentes en la base de datos no se tocan |
| `deploy` | health-check | `curl` con reintentos contra `GET /api/health` tras el redeploy | Si falla, el job queda en rojo pero **no revierte** el redeploy — la EC2 se queda con lo último que se desplegó, hay que investigar por SSH |

En resumen: cada ejecución del pipeline **reconstruye y redespliega la
aplicación** (backend + frontend) sobre la misma EC2, aplicando cualquier
cambio de infraestructura pendiente por el camino — pero no crea una EC2
nueva ni reinicia la base de datos, salvo que hayas cambiado algo en
`infra/*.tf` que fuerce explícitamente ese reemplazo.

---

## Ver la app / depurar

```bash
# Necesitas AWS CLI configurado localmente para esto (no es obligatorio si
# solo usas el pipeline; útil para consultar sin pasar por Actions)
cd infra && terraform init && terraform output app_url
curl "$(terraform output -raw app_url)/api/health"
```

Abre la URL de `app_url` en el navegador — el catálogo de RunMarket debe
cargar con los 13 productos.

**Si algo no arranca**, conéctate por SSH y revisa los logs:

```bash
ssh -i ~/.ssh/runmarket-deploy-key.pem ec2-user@$(terraform output -raw instance_public_ip)
tail -f /var/log/user-data.log      # primer arranque
tail -f /var/log/redeploy.log       # deploys posteriores
docker compose -f /opt/runmarket/docker-compose.prod.yml logs -f
```

---

## Alternativa — Terraform manual desde el portátil (depuración)

Sigue disponible, pero deja de ser un requisito previo al pipeline — es solo
para depurar sin pasar por CI. Con AWS CLI configurado (`aws configure`, con
las credenciales del usuario IAM de la sección anterior o cualquier otra con
permisos suficientes) y Terraform instalado:

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Editar con los valores reales: key_name, db_password, github_repository_owner
terraform init
terraform plan
terraform apply
```

Usa el **mismo backend S3** que el pipeline — no son dos infraestructuras
paralelas, es el mismo estado compartido. Un `apply` desde aquí es visible
para el pipeline en su siguiente ejecución, y viceversa.

> **Aviso de concurrencia:** el `concurrency` group de `ci-cd.yml` serializa
> ejecuciones del *workflow* entre sí, pero no te protege a ti si lanzas
> `terraform apply` desde el portátil justo cuando el pipeline está
> corriendo — ahí sí podríais pisaros el estado. Para un solo desarrollador
> el riesgo es bajo, pero evita solapar ambos: si vas a depurar por este
> camino, comprueba antes que no hay una ejecución del pipeline en curso
> (`gh run list --workflow=ci-cd.yml --status=in_progress`).

### Sobre la seguridad de tener el `.tfstate` en S3

El estado de Terraform contiene `db_password` **en texto plano** —
`sensitive = true` solo oculta el valor en la salida de consola, no lo cifra
dentro del fichero. El bucket de estado (sección "Configuración de cuenta",
paso 2) lo protege con cifrado en reposo (SSE-S3), bloqueo de acceso público
y versionado. El locking usa `use_lockfile` (nativo de S3, sin tabla
DynamoDB aparte). Detalle completo en `docs/backlog/US-018.md`.

**Para una versión profesional**, lo correcto sería sacar `db_password` del
flujo de Terraform y gestionarlo con **AWS Secrets Manager** (rotación,
auditoría de acceso vía CloudTrail, sin depender de proteger un fichero de
estado) — es el enfoque de la Opción B en `docs/INFRASTRUCTURE.md`, fuera de
alcance de esta opción académica.

**Alternativa más ligera evaluada — SSM Parameter Store (`SecureString`).**
En vez de que `db_password` viaje como variable de Terraform (y por tanto
como atributo de `aws_instance.app` en el estado), se crearía a mano un
parámetro SSM con el valor, y la EC2 lo leería en tiempo de arranque con su
propio rol IAM (`aws ssm get-parameter --with-decryption`) — Terraform solo
gestionaría el *nombre* del parámetro, no secreto. Elimina la contraseña
tanto de `user_data` como del `.tfstate`, sin la maquinaria de rotación de
Secrets Manager. Se descarta para este MVP: el riesgo real que mitiga (una
contraseña de un Postgres de pruebas académicas, ya protegida por el
cifrado + bucket policy del bucket de estado) no compensa el coste de tocar
`iam.tf`, `ec2.tf`, `user_data.sh.tpl` y `redeploy.sh` para pasar a
resolución en runtime. Queda anotado como mejora disponible si este
despliegue evoluciona más allá del alcance académico.

---

## Destruir la infraestructura

Si es solo una prueba y no quieres dejar nada corriendo (ni facturando
cuando expire el Free Tier):

```bash
cd infra
terraform destroy
```

Esto elimina la EC2, la IP elástica, el Security Group, el bucket de
artefactos y el rol IAM de instancia — los datos de PostgreSQL (dentro del
volumen de la EC2) se pierden.

**Lo que `terraform destroy` no toca** son los tres recursos que
`bootstrap-account.sh` creó a mano, fuera de Terraform — se quedan ahí
indefinidamente (y el usuario IAM sigue teniendo permisos válidos) a menos
que los borres aparte. Solo hazlo si no vas a volver a desplegar:

```bash
# Bucket de estado
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws s3 rb "s3://runmarket-terraform-state-${ACCOUNT_ID}" --force

# Usuario IAM: primero la access key y la policy, luego el usuario
# (IAM no deja borrar un usuario que todavía tiene access keys o policies)
AKID=$(aws iam list-access-keys --user-name runmarket-github-actions-deploy \
  --query 'AccessKeyMetadata[0].AccessKeyId' --output text)
aws iam delete-access-key --user-name runmarket-github-actions-deploy --access-key-id "$AKID"
aws iam delete-user-policy --user-name runmarket-github-actions-deploy --policy-name runmarket-deploy-policy
aws iam delete-user --user-name runmarket-github-actions-deploy

# Key pair EC2 (borra también el .pem local, AWS no lo necesita ya)
aws ec2 delete-key-pair --key-name runmarket-deploy-key --region eu-west-1
rm -f ~/.ssh/runmarket-deploy-key.pem
```

Y, ya que no quedará nada en AWS, recuerda también borrar los secrets de
GitHub (`gh secret delete AWS_ACCESS_KEY_ID`, etc.) si no vas a reutilizarlos.

---

## Referencias

- [`docs/DEPLOYMENT-STRATEGY.md`](DEPLOYMENT-STRATEGY.md) — diseño completo y justificación de cada decisión
- [`docs/backlog/US-018.md`](backlog/US-018.md) — detalle de implementación, verificaciones ejecutadas y checklist de seguridad de infraestructura
- [`docs/INFRASTRUCTURE.md`](INFRASTRUCTURE.md) — comparativa de opciones de infraestructura (académica vs profesional)
