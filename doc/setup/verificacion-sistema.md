# 🔍 Sistema de Verificación del Proyecto

## Scripts Disponibles

### 1. `verify-infra.sh` - Verificación Rápida de Infraestructura

**Propósito:** Verificar que los servicios base estén funcionando.

**Verifica:**
- PostgreSQL (puerto 5434)
- Keycloak (puerto 8080)
- Redis (puerto 6379)
- Mailhog (puertos 8025/1025)

**Cuándo usar:**
- Después de ejecutar `./scripts/dev-infra.sh`
- Antes de levantar microservicios
- Debug rápido de infraestructura
- Al empezar el día de desarrollo

**Ejemplo de salida:**
```
🔍 Verificando estado de la infraestructura...

📊 PostgreSQL: ✅ OK (puerto 5434)
🔐 Keycloak: ✅ OK (http://localhost:8080)
🗄️  Redis: ✅ OK (puerto 6379)
📧 Mailhog: ✅ OK (http://localhost:8025)

📋 Contenedores activos:
covoituraje_keycloak    Up 5 minutes
covoituraje_redis       Up 5 minutes
covoituraje_db          Up 5 minutes (healthy)
covoituraje_mailhog     Up 5 minutes
```

---

### 2. `verify-all.sh` - Verificación Completa del Sistema

**Propósito:** Ver el estado completo de toda la aplicación.

**Verifica:**
- ✅ Toda la infraestructura (igual que verify-infra.sh)
- ✅ Microservicios (trips, users, booking, matching)
- ✅ Frontend (React app)

**Cuándo usar:**
- Después de levantar microservicios
- Para diagnóstico completo
- Antes de hacer pruebas end-to-end
- Para verificar que todo está listo

**Ejemplo de salida:**
```
🔍 Verificando estado completo del sistema...

📦 INFRAESTRUCTURA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PostgreSQL: ✅ OK (puerto 5434)
🔐 Keycloak: ✅ OK (http://localhost:8080)
🗄️  Redis: ✅ OK (puerto 6379)
📧 Mailhog: ✅ OK (http://localhost:8025)

🔧 MICROSERVICIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚗 Trips Service: ✅ OK (puerto 8081)
👤 Users Service: ✅ OK (puerto 8082)
📅 Booking Service: ⚠️  Arrancando... (puerto 8083)
🎯 Matching Service: ✅ OK (puerto 8084)

🌐 FRONTEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚛️  React App: ✅ OK (http://localhost:3000)

📋 CONTENEDORES ACTIVOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Lista de todos los contenedores activos]
```

---

## Estados de Servicios

| Estado | Descripción | Qué Hacer |
|--------|-------------|-----------|
| ✅ OK | Servicio funcionando correctamente | Nada, todo bien |
| ⚠️ Arrancando | Contenedor iniciado pero aún no responde | Esperar 10-30s y verificar de nuevo |
| ⏸️ No iniciado | Servicio no levantado | Levantar con docker-compose |
| ❌ NO DISPONIBLE | Servicio con error o no responde | Ver logs con `docker logs` |

---

## Flujo de Trabajo Típico

### Escenario 1: Inicio del Día

```bash
# 1. Verificar si algo está corriendo
./scripts/verify-all.sh

# 2. Si no hay nada, levantar infraestructura
./scripts/dev-infra.sh

# 3. Verificar infraestructura
./scripts/verify-infra.sh

# 4. Levantar servicios necesarios
docker-compose --profile services up -d trips-service users-service

# 5. Verificar todo
./scripts/verify-all.sh
```

### Escenario 2: Debug de un Servicio

```bash
# 1. Ver estado general
./scripts/verify-all.sh

# 2. Si un servicio muestra ❌, ver sus logs
docker logs covoituraje_trips_service

# 3. Reiniciar el servicio problemático
docker-compose restart trips-service

# 4. Esperar y verificar de nuevo
sleep 10 && ./scripts/verify-all.sh
```

### Escenario 3: Antes de una Demo

```bash
# 1. Verificación completa
./scripts/verify-all.sh

# 2. Asegurar que TODO está ✅
# Si algo falta, levantarlo:
docker-compose --profile services up -d

# 3. Verificación final
./scripts/verify-all.sh
```

---

## Integración con Otros Scripts

```
setup-dev.sh
    │
    ├─> dev-infra.sh ──> verify-infra.sh (automático)
    ├─> migrate.sh
    └─> setup-keycloak.sh

                         verify-all.sh (manual)
                              │
                              ├─> Verifica infra
                              ├─> Verifica microservicios
                              └─> Verifica frontend
```

---

## Tips y Trucos

### 🎯 Alias Útiles

Añade estos a tu `~/.zshrc` o `~/.bashrc`:

```bash
# Navegación rápida
alias cov='cd /Users/admin/Documents/AI4Devs-finalproject'

# Scripts comunes
alias cov-check='cd /Users/admin/Documents/AI4Devs-finalproject && ./scripts/verify-all.sh'
alias cov-infra='cd /Users/admin/Documents/AI4Devs-finalproject && ./scripts/verify-infra.sh'
alias cov-up='cd /Users/admin/Documents/AI4Devs-finalproject && docker-compose --profile services up -d'
alias cov-down='cd /Users/admin/Documents/AI4Devs-finalproject && docker-compose --profile services down'
alias cov-logs='cd /Users/admin/Documents/AI4Devs-finalproject && docker-compose logs -f'
```

### 🔄 Watch Mode

Para monitorear continuamente el estado:

```bash
# macOS/Linux
watch -n 5 './scripts/verify-all.sh'

# O con un loop simple
while true; do clear; ./scripts/verify-all.sh; sleep 5; done
```

### 📊 Log específico de un servicio

```bash
# Ver últimas 50 líneas
docker logs --tail 50 covoituraje_trips_service

# Seguir logs en tiempo real
docker logs -f covoituraje_trips_service

# Ver logs con timestamps
docker logs -t covoituraje_trips_service
```

---

## Troubleshooting

### "Keycloak muestra ⚠️ Arrancando por mucho tiempo"

Keycloak tarda ~30-60 segundos en arrancar completamente. Si tarda más:

```bash
docker logs covoituraje_keycloak --tail 100
```

### "Microservicio muestra ❌ NO DISPONIBLE"

1. Verificar que está corriendo: `docker ps | grep nombre-servicio`
2. Ver logs: `docker logs covoituraje_nombre_service`
3. Verificar que la BD está lista: `./scripts/verify-infra.sh`
4. Reiniciar: `docker-compose restart nombre-service`

### "Frontend muestra ⏸️ No iniciado pero debería estar"

```bash
# Verificar si el contenedor existe
docker ps -a | grep frontend

# Levantarlo explícitamente
docker-compose --profile services up frontend -d

# Ver logs de build/inicio
docker logs covoituraje_frontend -f
```

---

## Automatización

### Pre-commit Hook

Puedes crear un pre-commit hook que verifique el estado:

```bash
# .git/hooks/pre-commit
#!/bin/bash
./scripts/verify-infra.sh || {
    echo "⚠️  Infraestructura no está lista"
    exit 0  # No bloquear el commit
}
```

### Script de CI/CD

```yaml
# Ejemplo para GitHub Actions
- name: Verify Infrastructure
  run: |
    ./scripts/dev-infra.sh
    sleep 60
    ./scripts/verify-all.sh
```

---

## Siguientes Pasos

- [ ] Agregar health checks más sofisticados a cada microservicio
- [ ] Crear script de monitoring con Prometheus
- [ ] Añadir notificaciones cuando un servicio falla
- [ ] Dashboard web con estado en tiempo real

