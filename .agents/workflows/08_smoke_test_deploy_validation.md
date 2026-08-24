---
name: 08_smoke_test_deploy_validation
description: "Workflow de validación post-despliegue: ejecuta smoke tests de contratos HTTP, health checks y verificación de infraestructura OpenTofu para confirmar que el sistema en producción está operativo después de cada deploy."
version: "1.0.0"
category: "workflows/deployment"
---

# 🚀 Workflow 08: Smoke Test & Deploy Validation (v1.0.0)

> **DIRECTIVA PARA EL AGENTE:**  
> Actúa como un **Site Reliability Engineer (SRE)** y **DevSecOps Validator**.  
> Este workflow se ejecuta **inmediatamente después** de cada `tofu apply` o despliegue a producción.  
> Su misión es confirmar en menos de 5 minutos que el sistema desplegado es funcional, seguro y cumple el contrato de API definido en `docs/03_persistence_and_api/openapi.yaml`.
>
> **FASE 0 OBLIGATORIA (Guard 24):** Lee `docs/00_stack_manifest.md` antes de ejecutar ningún paso para inferir las URLs base, comandos y herramientas del proyecto.

---

## ⚡ Paso 1 — Health Check de Infraestructura (≤1 min)

Verifica que los servicios críticos de infraestructura estén respondiendo:

1. **Lectura del entorno:** Inferir la URL base del backend desde las variables de entorno del proyecto (`BACKEND_URL` o equivalente declarado en `docs/00_stack_manifest.md`).
2. **Health Check del Backend:**
   ```bash
   curl -sf "${BACKEND_URL}/health" | jq '.status == "ok"'
   ```
   - Si falla → **ABORT. Emitir alerta crítica e iniciar rollback con `tofu plan -destroy`.**
3. **Verificación de Conectividad de Base de Datos:** Comprobar que el health check del backend incluya el estado de la conexión a PostgreSQL.
4. **Verificación de Infraestructura IaC:**
   ```bash
   tofu show -json | jq '.values.root_module.resources | length > 0'
   ```

---

## 🔗 Paso 2 — Smoke Tests de Contratos HTTP (≤3 min)

Ejecuta un subconjunto mínimo y representativo de los contratos de API declarados en `docs/03_persistence_and_api/openapi.yaml` para confirmar que los endpoints críticos responden correctamente:

### 2.1. Leer el Contrato OpenAPI
1. Parsear `docs/03_persistence_and_api/openapi.yaml`.
2. Identificar los **3-5 endpoints más críticos de negocio** (los que bloquean el uso del sistema si fallan).
3. Para cada endpoint crítico, ejecutar una llamada de smoke con el payload mínimo válido.

### 2.2. Tabla de Oráculos de Smoke Test

Para cada endpoint, verificar los 3 Oráculos obligatorios:

| Oráculo | Verificación |
|:--------|:------------|
| `// ORACULO HTTP:` | El código de respuesta HTTP coincide con el esperado en OpenAPI (200, 201, 401...) |
| `// ORACULO SCHEMA:` | El body de respuesta contiene los campos declarados en el schema OpenAPI |
| `// ORACULO LATENCIA:` | La respuesta llega en menos de 2000ms (umbral configurable) |

### 2.3. Ejemplo de Smoke Test para RestoStock

> Ejemplo concreto para ESTE proyecto — las rutas exactas viven en `docs/03_persistence_and_api/openapi.yaml` y cambian con el contrato (verificadas por última vez tras `TK-047`, que sincronizó el spec con la API real). Antes de reutilizar este ejemplo, confírmalas contra el spec vigente en vez de asumir que siguen igual — es precisamente el Antipatrón C de [`.agents/rules/04_verified_implementation_standard.md`](../rules/04_verified_implementation_standard.md).

```bash
# ORACULO HTTP: POST /api/v1/auth/login-pin con usuario inexistente → 404
# (userId no vacio no dispara 401 aqui: la validacion Zod pasa igual, el 401 solo
# aparece si el usuario SI existe y el PIN es incorrecto — verificado contra el
# codigo real, no asumido: el 404 confirma que la ruta existe y el UseCase corre)
curl -sf -o /dev/null -w "%{http_code}" \
  -X POST "${BACKEND_URL}/api/v1/auth/login-pin" \
  -H "Content-Type: application/json" \
  -d '{"userId":"00000000-0000-0000-0000-000000000000","pin":"0000"}' | grep -q "404"

# ORACULO HTTP: GET /api/v1/kitchen/remanentes-activos sin token → 401 (ruta protegida responde)
curl -sf -o /dev/null -w "%{http_code}" \
  "${BACKEND_URL}/api/v1/kitchen/remanentes-activos" | grep -q "401"

# ORACULO SCHEMA: Verificar que el error de validacion sigue el formato RFC 7807.
# SIN -f/--fail aqui: esa flag suprime el body de la respuesta en codigos 4xx — con -f
# este oraculo devuelve silenciosamente vacio en vez de fallar con un error legible
# (bug real detectado corriendo este ejemplo contra el servidor real, no leyendo el codigo).
curl -s -X POST "${BACKEND_URL}/api/v1/auth/login-pin" \
  -H "Content-Type: application/json" \
  -d '{"userId":"usr-test","pin":""}' | jq 'has("type") and has("status") and has("title")'
```

---

## 📊 Paso 3 — Verificación de Métricas y Seguridad (≤1 min)

1. **Cabeceras de Seguridad HTTP:** Verificar que las cabeceras obligatorias estén presentes en las respuestas:
   ```bash
   curl -sI "${BACKEND_URL}/health" | grep -E "Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options"
   ```
2. **CORS:** Verificar que el header `Access-Control-Allow-Origin` no sea `*` en producción.
3. **Rate Limiting:** Verificar que el endpoint de autenticación responda con `429` tras múltiples intentos fallidos (si está configurado).

---

## 🎯 Paso 4 — Veredicto y Acción

### Veredicto PASS ✅
Si los 3 pasos anteriores no emiten errores:
```text
✅ DEPLOY VALIDADO — Sistema operativo y contratos HTTP confirmados.
Registrar en docs/05_agile_planning/15_history.md:
  Deploy: [fecha UTC] | Commit: [sha] | Smoke Tests: PASS | Latencia: [ms]
```

### Veredicto FAIL 🚨
Si cualquier smoke test falla:
```text
🚨 DEPLOY FALLIDO — Iniciar protocolo de rollback:
1. Ejecutar: tofu apply -target=[recurso_anterior]
2. Notificar al equipo con el stacktrace del smoke test fallido.
3. Abrir ticket de regresión invocando [07_production_observability_workflow.md](07_production_observability_workflow.md).
4. Registrar en docs/05_agile_planning/15_history.md como incidencia.
```

---

## 🔄 Integración en el Pipeline CI/CD

Este workflow se añade como **Job 5** al pipeline de `SK-10`:

```yaml
# .github/workflows/ci.yml — Job 5 (solo en rama main)
smoke-test:
  needs: [build]
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - name: Wait for deploy stabilization
      run: sleep 15
    - name: Run Smoke Tests
      run: bash .agents/scripts/smoke_test.sh
      env:
        BACKEND_URL: ${{ secrets.PRODUCTION_BACKEND_URL }}
```

---

## 📁 Script Asociado

Este workflow genera el script de automatización en `.agents/scripts/smoke_test.sh`.  
Invoca [05_test_runner_workflow.md](05_test_runner_workflow.md) si se detectan regresiones.  
Invoca [07_production_observability_workflow.md](07_production_observability_workflow.md) si hay fallos en producción.
