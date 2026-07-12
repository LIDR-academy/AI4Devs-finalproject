#!/usr/bin/env bash
set -euo pipefail

# Bootstrap de cuenta AWS para RunMarket (US-018) - se ejecuta UNA VEZ, antes
# de lanzar el pipeline de GitHub Actions por primera vez. Detalle completo
# de cada paso en docs/DEPLOYMENT-RUNBOOK.md, seccion "Configuracion de
# cuenta".
#
# Crea deliberadamente los unicos recursos de esta infraestructura que NO
# gestiona Terraform (usuario IAM del pipeline, bucket de estado, key pair
# EC2) - un backend no puede crear el sitio donde va a guardar su propio
# estado, y un usuario IAM no puede crearse a si mismo para autenticar el
# apply que lo crearia. Ver razonamiento en docs/DEPLOYMENT-STRATEGY.md.
#
# Requiere: AWS CLI configurado (`aws configure`) con permisos para crear
# usuarios/policies IAM, buckets S3 y key pairs EC2. Es idempotente: si algo
# ya existe, lo detecta y lo salta en vez de fallar.

REGION="eu-west-1"
IAM_USER="runmarket-github-actions-deploy"
POLICY_NAME="runmarket-deploy-policy"
KEY_PAIR_NAME="runmarket-deploy-key"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
POLICY_FILE="$SCRIPT_DIR/runmarket-deploy-policy.json"
PROVIDER_FILE="$INFRA_DIR/provider.tf"

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"

# ~/.ssh es la ubicacion estandar de claves privadas SSH en macOS/Linux -
# fuera del repositorio a proposito, para no depender solo del .gitignore
# como unica proteccion (evita backups/sync de la carpeta del proyecto,
# `git add -A` distraidos, indexado de IDE, etc.).
mkdir -p "$HOME/.ssh"
PEM_FILE="$HOME/.ssh/${KEY_PAIR_NAME}.pem"

echo "=== 1/3 - Usuario IAM para el pipeline ==="

if aws iam get-user --user-name "$IAM_USER" >/dev/null 2>&1; then
  echo "Ya existe: $IAM_USER (omitiendo creacion de usuario)"
else
  aws iam create-user --user-name "$IAM_USER"
  echo "Creado: $IAM_USER"
fi

cat > "$POLICY_FILE" <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Ec2RunInstancesT3MicroOnly",
      "Effect": "Allow",
      "Action": "ec2:RunInstances",
      "Resource": "arn:aws:ec2:*:*:instance/*",
      "Condition": {
        "StringEquals": { "ec2:InstanceType": "t3.micro" }
      }
    },
    {
      "Sid": "Ec2RunInstancesSupportingResources",
      "Effect": "Allow",
      "Action": "ec2:RunInstances",
      "Resource": [
        "arn:aws:ec2:*:*:image/*",
        "arn:aws:ec2:*:*:key-pair/*",
        "arn:aws:ec2:*:*:network-interface/*",
        "arn:aws:ec2:*:*:security-group/*",
        "arn:aws:ec2:*:*:subnet/*",
        "arn:aws:ec2:*:*:volume/*"
      ]
    },
    {
      "Sid": "Ec2Manage",
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "ec2:TerminateInstances",
        "ec2:StopInstances",
        "ec2:StartInstances",
        "ec2:CreateTags",
        "ec2:DeleteTags",
        "ec2:CreateSecurityGroup",
        "ec2:DeleteSecurityGroup",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:AuthorizeSecurityGroupEgress",
        "ec2:RevokeSecurityGroupIngress",
        "ec2:RevokeSecurityGroupEgress",
        "ec2:ModifyInstanceAttribute",
        "ec2:AllocateAddress",
        "ec2:ReleaseAddress",
        "ec2:AssociateAddress",
        "ec2:DisassociateAddress"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3RunmarketBuckets",
      "Effect": "Allow",
      "Action": ["s3:Get*", "s3:List*", "s3:Put*", "s3:Delete*", "s3:CreateBucket"],
      "Resource": ["arn:aws:s3:::runmarket-*", "arn:aws:s3:::runmarket-*/*"]
    },
    {
      "Sid": "IamRunmarketRolesOnly",
      "Effect": "Allow",
      "Action": [
        "iam:GetRole",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "iam:TagRole",
        "iam:CreateInstanceProfile",
        "iam:DeleteInstanceProfile",
        "iam:GetInstanceProfile",
        "iam:AddRoleToInstanceProfile",
        "iam:RemoveRoleFromInstanceProfile",
        "iam:TagInstanceProfile"
      ],
      "Resource": [
        "arn:aws:iam::*:role/runmarket-*",
        "arn:aws:iam::*:instance-profile/runmarket-*"
      ]
    },
    {
      "Sid": "PassEc2InstanceRole",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::*:role/runmarket-ec2-role",
      "Condition": {
        "StringEquals": { "iam:PassedToService": "ec2.amazonaws.com" }
      }
    },
    {
      "Sid": "StsIdentity",
      "Effect": "Allow",
      "Action": "sts:GetCallerIdentity",
      "Resource": "*"
    }
  ]
}
EOF

# Politica gestionada (customer-managed), no inline: una inline de usuario
# (put-user-policy) tope a 2048 bytes, y esta politica ya lo supera. Las
# gestionadas admiten hasta 6144 bytes y son versionadas.
if aws iam get-policy --policy-arn "$POLICY_ARN" >/dev/null 2>&1; then
  # create-policy-version falla si ya hay 5 versiones (limite de IAM) - se
  # borra la version no-default mas antigua antes de crear la nueva.
  VERSION_COUNT=$(aws iam list-policy-versions --policy-arn "$POLICY_ARN" \
    --query 'length(Versions)' --output text)
  if [ "$VERSION_COUNT" -ge 5 ]; then
    OLDEST_VERSION=$(aws iam list-policy-versions --policy-arn "$POLICY_ARN" \
      --query 'Versions[?IsDefaultVersion==`false`]|sort_by(@, &CreateDate)[0].VersionId' \
      --output text)
    aws iam delete-policy-version --policy-arn "$POLICY_ARN" --version-id "$OLDEST_VERSION"
  fi
  aws iam create-policy-version --policy-arn "$POLICY_ARN" \
    --policy-document "file://$POLICY_FILE" --set-as-default
  echo "Actualizada nueva version de: $POLICY_NAME"
else
  aws iam create-policy --policy-name "$POLICY_NAME" --policy-document "file://$POLICY_FILE"
  echo "Creada: $POLICY_NAME"
fi
rm -f "$POLICY_FILE"

aws iam attach-user-policy --user-name "$IAM_USER" --policy-arn "$POLICY_ARN"

# Restos de una version anterior de este script que usaba una inline policy
# del mismo nombre - se retira para no dejar permisos duplicados/obsoletos.
if aws iam get-user-policy --user-name "$IAM_USER" --policy-name "$POLICY_NAME" >/dev/null 2>&1; then
  aws iam delete-user-policy --user-name "$IAM_USER" --policy-name "$POLICY_NAME"
  echo "Retirada policy inline obsoleta de $IAM_USER (sustituida por la gestionada)"
fi

echo ""
echo ">>> Access key para $IAM_USER (el SecretAccessKey solo se muestra AHORA):"
aws iam create-access-key --user-name "$IAM_USER"
echo ">>> Copia AccessKeyId/SecretAccessKey de arriba - los necesitas en el paso 4 del runbook."

echo ""
echo "=== 2/3 - Bucket de estado de Terraform ==="

BUCKET="runmarket-terraform-state-${ACCOUNT_ID}"

if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  echo "Ya existe: $BUCKET (omitiendo creacion de bucket)"
else
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION"
  echo "Creado: $BUCKET"
fi

aws s3api put-bucket-versioning --bucket "$BUCKET" \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption --bucket "$BUCKET" \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

echo "Versionado, cifrado y bloqueo de acceso publico aplicados a $BUCKET"

if grep -q "<ACCOUNT_ID>" "$PROVIDER_FILE"; then
  sed -i.bak "s/<ACCOUNT_ID>/${ACCOUNT_ID}/" "$PROVIDER_FILE"
  rm -f "${PROVIDER_FILE}.bak"
  echo "Actualizado infra/provider.tf con el Account ID real - revisa el diff y commitealo."
else
  echo "infra/provider.tf ya no tiene el placeholder <ACCOUNT_ID> - sin cambios."
fi

echo ""
echo "=== 3/3 - Key pair EC2 ==="

if aws ec2 describe-key-pairs --key-names "$KEY_PAIR_NAME" --region "$REGION" >/dev/null 2>&1; then
  echo "Ya existe: $KEY_PAIR_NAME (omitiendo creacion - el .pem no se puede volver a descargar de AWS)"
else
  aws ec2 create-key-pair --key-name "$KEY_PAIR_NAME" \
    --region "$REGION" --query 'KeyMaterial' --output text > "$PEM_FILE"
  chmod 400 "$PEM_FILE"
  echo "Creado: $KEY_PAIR_NAME -> guardado en $PEM_FILE"
fi

echo ""
echo "=== Configuracion de cuenta completada ==="
echo "Pendiente (manual): generar una contraseña fuerte para TF_VAR_DB_PASSWORD"
echo "y configurar los 4 secrets en GitHub - ver docs/DEPLOYMENT-RUNBOOK.md, paso 4."
