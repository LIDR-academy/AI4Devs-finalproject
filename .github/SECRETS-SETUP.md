# 🔐 Configuración de GitHub Secrets - Guía Paso a Paso

## ⚠️ ACCIÓN REQUERIDA ANTES DE MERGE

El pipeline CI/CD **NO FUNCIONARÁ** hasta que configures estos 3 secrets en GitHub.

---

## 📋 Secrets Necesarios

| Secret Name | Descripción | Valor del Proyecto |
|-------------|-------------|-------------------|
| `SUPABASE_URL` | URL del proyecto Supabase | `https://ebqapsoyjmdkhdxnkikz.supabase.co` |
| `SUPABASE_KEY` | Service role key (⚠️ NO anon key) | Ver `.env` local |
| `SUPABASE_DATABASE_URL` | Connection string PostgreSQL | Ver `.env` local |

---

## 🛠️ Pasos de Configuración

### 1. Acceder a GitHub Secrets

```
Tu Repositorio en GitHub
  ↓
Settings (tab superior)
  ↓
Secrets and variables (menú izquierdo)
  ↓
Actions
  ↓
New repository secret (botón verde)
```

**URL directa**: `https://github.com/[TU-USUARIO]/[TU-REPO]/settings/secrets/actions`

---

### 2. Agregar Secret #1: SUPABASE_URL

**Click en:** "New repository secret"

```
┌─────────────────────────────────────┐
│ Name*                               │
│ SUPABASE_URL                        │
├─────────────────────────────────────┤
│ Secret*                             │
│ https://ebqapsoyjmdkhdxnkikz.supabase.co │
└─────────────────────────────────────┘

[Add secret]
```

✅ **Verificación**: Debe aparecer en la lista como "SUPABASE_URL" con fecha de creación.

---

### 3. Agregar Secret #2: SUPABASE_KEY

**Click en:** "New repository secret"

```
┌─────────────────────────────────────┐
│ Name*                               │
│ SUPABASE_KEY                        │
├─────────────────────────────────────┤
│ Secret*                             │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
│ (pegar COMPLETO desde .env local)   │
└─────────────────────────────────────┘

[Add secret]
```

**Cómo obtenerlo**:
1. Abre tu archivo `.env` local (⚠️ NUNCA hagas commit de este archivo)
2. Copia el valor COMPLETO de `SUPABASE_KEY=...`
3. Pega en el campo "Secret"

**Verificación**: El secret debe tener ~400+ caracteres

⚠️ **IMPORTANTE**: Usa la key `service_role`, NO `anon`:
- ✅ Correcto: `service_role` (bypassa Row Level Security para tests)
- ❌ Incorrecto: `anon` (tests fallarán por permisos)

---

### 4. Agregar Secret #3: SUPABASE_DATABASE_URL

**Click en:** "New repository secret"

```
┌─────────────────────────────────────┐
│ Name*                               │
│ SUPABASE_DATABASE_URL               │
├─────────────────────────────────────┤
│ Secret*                             │
│ postgresql://postgres.ebqapsoyjmdkhdxnkikz:Farolina-14-Supabase@aws-1-eu-central-1.pooler.supabase.com:6543/postgres │
└─────────────────────────────────────┘

[Add secret]
```

**Cómo obtenerlo**:
1. Abre tu archivo `.env` local
2. Copia el valor COMPLETO de `SUPABASE_DATABASE_URL=...`
3. Pega en el campo "Secret"

**Formato esperado**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[HOST]:6543/postgres`

---

## ✅ Verificación de Configuración

Después de agregar los 3 secrets, debes ver:

```
Repository secrets

SUPABASE_DATABASE_URL    Updated 1 minute ago
SUPABASE_KEY             Updated 2 minutes ago
SUPABASE_URL             Updated 3 minutes ago
```

---

## 🧪 Probar el CI/CD

### Opción 1: Re-run Failed Workflow

Si ya hiciste push y el CI falló:

1. Ve a la pestaña "Actions"
2. Click en el workflow fallido
3. Click en "Re-run all jobs" (botón superior derecho)
4. Espera ~2-3 minutos

**Resultado esperado**:
- ✅ backend-tests (7 tests passing)
- ✅ frontend-tests (4 tests passing)
- ✅ docker-validation
- ✅ lint-and-format
- ✅ security-scan

---

### Opción 2: Push Nuevo Commit

```bash
# Hacer un cambio trivial
echo "# CI/CD configured" >> .github/SECRETS-CONFIGURED.txt

# Commit y push
git add .github/SECRETS-CONFIGURED.txt
git commit -m "chore: mark CI/CD secrets as configured"
git push origin main
```

Luego verifica en Actions → CI workflow

---

## 🚨 Troubleshooting

### Error: "SUPABASE_URL variable is not set"

**Causa**: Secret no configurado o nombre incorrecto.

**Solución**:
1. Verifica que el nombre sea EXACTAMENTE `SUPABASE_URL` (case-sensitive)
2. Verifica que esté en "Repository secrets", NO en "Environment secrets"
3. Re-run workflow después de agregar

---

### Error: "pytest.skip - credentials must be configured"

**Causa**: Secret configurado pero valor está vacío o es incorrecto.

**Solución**:
1. Ve a Settings → Secrets → Actions
2. Click en el secret problemático
3. Click en "Update"
4. Pega el valor correcto desde `.env` local
5. Click "Update secret"

---

### Error: "Database connection failed"

**Causa**: `SUPABASE_DATABASE_URL` incorrecto o password cambió.

**Solución**:
1. Ve a Supabase Dashboard → Settings → Database
2. Connection string → URI mode
3. Copia el connection string completo
4. Actualiza el secret `SUPABASE_DATABASE_URL` en GitHub

---

### Tests Passing Localmente Pero Fallando en CI

**Diagnóstico**:
```bash
# Comparar valores locales vs CI
cat .env | grep SUPABASE

# Verificar que sean los mismos valores que pusiste en GitHub Secrets
```

**Causa común**: Copiaste el valor de `.env.example` en lugar de `.env`

---

## 🔒 Seguridad - Best Practices

### ✅ DO (Hacer)
- ✅ Usa secrets de GitHub para credenciales sensibles
- ✅ Rota las keys periódicamente (cada 90 días)
- ✅ Usa `service_role` key solo en CI/CD (nunca en frontend público)
- ✅ Mantén `.env` en `.gitignore`
- ✅ Usa secrets diferentes para staging/production si tienes ambientes

### ❌ DON'T (No Hacer)
- ❌ NUNCA hagas commit de `.env` al repositorio
- ❌ NUNCA pongas credenciales hardcodeadas en el código
- ❌ NUNCA compartas secrets en Slack/Discord/Email
- ❌ NUNCA uses secrets de producción en desarrollo local
- ❌ NUNCA uses `anon` key en tests (usa `service_role`)

---

## 📞 Soporte

**Si los tests siguen fallando después de configurar los secrets:**

1. Consulta [.github/CI-CD-GUIDE.md](.github/CI-CD-GUIDE.md) sección Troubleshooting
2. Revisa los logs del workflow en Actions tab
3. Verifica localmente que `make test` pasa (7/7 tests)
4. Compara valores de `.env` local con los secrets de GitHub

---

**Última actualización**: 2026-02-09  
**Configuración requerida para**: Pipeline CI/CD  
**Estados**: ⏸️ Pending initial configuration
