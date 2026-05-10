# Infraestructura — MotoCiudad

> Entornos, deployment, CI/CD, secretos, costes estimados y operación del día a día.

**Versión**: 0.1
**Última actualización**: Mayo 2026

---

## 1. Entornos

| Entorno | Propósito | Supabase project | App build |
|---|---|---|---|
| **local** | Desarrollo en máquina del dev | Supabase CLI (Docker) | Expo dev client |
| **preview** | Builds de PR para QA | `motociudad-preview` (cloud) | EAS preview channel |
| **production** | App en App Store / Play Store | `motociudad-prod` (cloud) | EAS production channel |

No hay staging dedicado en MVP: el flujo PR → preview → producción es suficiente para el volumen actual. Cuando crezca el equipo, se introduce staging entre preview y prod.

---

## 2. Hosting y servicios

### 2.1 Supabase Cloud

**Plan recomendado**: Pro (~25 €/mes) por proyecto. Necesario porque:

- El plan gratuito pausa proyectos sin actividad — inaceptable en producción.
- Pro incluye 8 GB DB, 100 GB bandwidth, 100 GB storage, point-in-time recovery, soporte por email.
- Edge Functions con cuota suficiente para el volumen MVP.

Región objetivo: **Frankfurt** (`eu-central-1`) por proximidad a usuarios españoles y cumplimiento RGPD.

### 2.2 EAS (Expo Application Services)

**Plan recomendado**: Production (~99 $/mes) cuando estemos cerca de release.

- Builds iOS / Android en la nube sin Mac propio.
- Submit automático a App Store Connect y Google Play Console.
- OTA updates con `eas update`.
- Plan gratuito sirve para empezar pero limita builds concurrentes.

### 2.3 Servicios complementarios

| Servicio | Plan | Coste | Uso |
|---|---|---|---|
| **Sentry** | Developer (free hasta 5k events/mes) | 0 € → 26 €/mes | Errores cliente y edge |
| **PostHog** | Free hasta 1M events/mes (cloud EU) | 0 € | Analytics, funnels |
| **GitHub** | Free | 0 € | Repo, CI/CD |
| **Cloudflare** | Free | 0 € | Dominio, DNS, SSL |
| **Apple Developer** | — | 99 $/año | Publicar en App Store |
| **Google Play** | — | 25 $ una vez | Publicar en Play Store |

---

## 3. Estimación de costes mensuales

### 3.1 MVP (0–500 MAU)

| Línea | Coste |
|---|---|
| Supabase Pro (prod) | 25 € |
| Supabase Free (preview) | 0 € |
| EAS Production | 80 € (~99 $) |
| Sentry | 0 € |
| PostHog | 0 € |
| Apple Developer | 9 € (99 $/año prorrateado) |
| Google Play | 1 € (25 $ una vez prorrateado) |
| **Total mensual** | **≈ 115 €/mes** |

### 3.2 Escalado moderado (5k–10k MAU)

| Línea | Coste |
|---|---|
| Supabase Pro + add-ons (compute, storage extra) | ~80 € |
| EAS Production | 80 € |
| Sentry Team | 26 € |
| PostHog (free tier alcanza) | 0 € |
| **Total mensual** | **≈ 195 €/mes** |

### 3.3 Notas de coste

- Mapas: `react-native-maps` con providers nativos no añade coste hasta volúmenes altos. Si en el futuro se migra a Mapbox, presupuestar ~5 €/mes por cada 50k MAU.
- Apple/Google notificaciones push: gratis (APNs y FCM).

---

## 4. Gestión de secretos

### 4.1 Categorías

| Tipo | Lugar |
|---|---|
| Anon key Supabase (cliente) | `app.config.ts` con variables de entorno; ok que sea pública |
| Service role key Supabase | **Solo en Edge Functions y CI**. Nunca en cliente. |
| Sentry DSN | `app.config.ts` |
| PostHog API key | `app.config.ts` |
| App Store / Play credentials | EAS Secrets |
| GitHub Actions secrets | Repo settings |

### 4.2 Inventario de secretos

```
# GitHub Actions (Settings → Secrets)
SUPABASE_ACCESS_TOKEN          # CLI deploy
SUPABASE_DB_PASSWORD            # migraciones
SUPABASE_PROD_PROJECT_REF
SUPABASE_PREVIEW_PROJECT_REF
EXPO_TOKEN                       # EAS

# EAS Secrets (eas.json)
SENTRY_AUTH_TOKEN                # source maps upload
APP_STORE_CONNECT_API_KEY
GOOGLE_SERVICE_ACCOUNT_JSON

# Supabase Edge Functions (Settings → Edge Functions secrets)
SERVICE_ROLE_KEY                 # auto-disponible
POSTHOG_API_KEY
SENTRY_DSN
```

---

## 5. CI/CD

### 5.1 Flujo end-to-end

```
PR abierta
  ↓
GitHub Actions:
  - mobile-ci.yml         (lint + typecheck + tests + coverage)
  - supabase-ci.yml       (migraciones aplicables + pgTAP + tests Edge Fn)
  ↓
Si verde y aprobada → merge a main
  ↓
Workflows en main:
  - supabase-deploy.yml   (aplica migraciones a preview + deploy edge fn)
  - eas-build.yml         (build canal preview, distribución TestFlight + internal track)
  ↓
QA manual sobre preview
  ↓
Release manual (tag vX.Y.Z):
  - workflow release.yml  (deploy a producción + EAS build production + submit a stores)
```

### 5.2 Workflows clave

#### `supabase-deploy.yml`

```yaml
name: Supabase Deploy
on:
  push:
    branches: [main]
    paths: ['supabase/**']

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PREVIEW_PROJECT_REF }}
      - run: supabase db push
      - run: supabase functions deploy --project-ref ${{ secrets.SUPABASE_PREVIEW_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

#### `eas-build.yml`

```yaml
name: EAS Build
on:
  push:
    branches: [main]
    paths: ['apps/mobile/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: cd apps/mobile && eas build --platform all --profile preview --non-interactive
```

#### `release.yml`

Disparado manualmente con `workflow_dispatch` indicando version tag. Aplica migraciones a producción, build EAS production, y submit a stores.

### 5.3 OTA updates (EAS Update)

Para fixes que solo tocan JavaScript (no nativo):

```bash
eas update --branch production --message "Fix: badge counter formatting"
```

Push del bundle a usuarios sin pasar por revisión de stores. Ideal para correcciones rápidas.

---

## 6. Migraciones de DB

### 6.1 Flujo recomendado

```bash
# 1. Crear migración local
supabase migration new add_parkings_district_index

# 2. Editar el archivo .sql generado en supabase/migrations/

# 3. Probar en local
supabase db reset       # aplica todas las migraciones desde cero
supabase test db        # corre pgTAP

# 4. Commit + PR
# CI valida que las migraciones aplican limpiamente

# 5. Merge → workflow aplica a preview → QA → tag → producción
```

### 6.2 Reglas de oro

- **Migraciones forward-only**: nunca DROP de columnas con datos sin estrategia documentada.
- **Cada migración es atómica**: una idea por archivo.
- **No editar migraciones ya mergeadas**. Si hay error, nueva migración correctiva.
- **Datos seed solo en `seed.sql`**, no en migraciones.

---

## 7. Backup y disaster recovery

### 7.1 Backups automáticos

Supabase Pro incluye:

- Daily backups con retención de 7 días.
- Point-in-time recovery (PITR) en plan Pro+.

### 7.2 Plan de recovery

| Escenario | Acción |
|---|---|
| Borrado accidental de fila | Restore desde backup, copiar fila, descartar resto |
| Migración rota en producción | Rollback con migración correctiva (forward-only) |
| Storage corrupto (poco probable) | Re-sincronizar desde backup |
| Caída completa de Supabase | Esperar (managed service); preparar plan B en v1.x |

### 7.3 Recomendación adicional

Configurar export semanal del schema y datos críticos a un bucket S3/R2 externo, automatizado vía cron en GitHub Actions. Defensa contra fallo total del proveedor.

---

## 8. Monitoring y alertas

### 8.1 Sentry

- **Frontend**: capturar todas las excepciones no manejadas.
- **Backend (Edge)**: capturar errores en cada función.
- **Alertas**: email + Slack al promotor cuando crash-free rate baje del 99% en 1h o haya un nuevo issue con > 10 ocurrencias en 5 minutos.

### 8.2 PostHog

- Dashboard de funnels: `app_opened → registration_completed → first_parking_proposed`.
- Alertas: si `parking_verified` cae a la mitad de la mediana semanal, notificar.

### 8.3 Supabase Logs

- Revisar cada lunes:
  - Top 10 queries lentas.
  - Errores RLS (intentos rechazados).
  - Errores de Edge Functions.

### 8.4 Health checks

- Endpoint sintético de health en Edge Function: `/health` que verifica DB, Storage, y devuelve 200/500.
- Monitorización externa con UptimeRobot o BetterStack (free tier suficiente).

---

## 9. Push notifications

### 9.1 Stack

- **Expo Notifications** en cliente (token registrado tras login).
- **Expo Push API** desde Edge Functions: `https://exp.host/--/api/v2/push/send`.
- En Production con EAS: APNs y FCM gestionados por Expo.

### 9.2 Tipos de push transaccionales

| Trigger | Mensaje | Cuándo |
|---|---|---|
| Subida de nivel | "¡Subiste a {nivel}!" | Al cruzar umbral |
| Insignia desbloqueada | "Nueva insignia: {nombre}" | Al cumplir condición |
| Tu parking ha sido verificado | "Tu propuesta '{nombre}' es ahora oficial. +30 Octanos" | Al verificarse |
| Tu reporte fue confirmado | "Has mantenido limpio el dataset. +20 Octanos" | Al validarse el report |

**Nada de marketing en MVP** (`prd.md` §7.2).

### 9.3 Permisos

Solicitar permiso de push tras cerrar el onboarding (no en el primer launch — peor conversión).

---

## 10. Distribución en stores

### 10.1 Apple App Store

- Apple Developer Program activo.
- App Store Connect: ficha completa con:
  - 5+ screenshots por tamaño (6.7", 6.5", 5.5", iPad si soportado).
  - Vídeo de presentación opcional (preview de 30s).
  - Política de privacidad enlazada.
  - Política de eliminación de cuenta enlazada (obligatorio desde 2022).
- TestFlight para builds de preview.
- Builds enviados automáticamente vía `eas submit`.

### 10.2 Google Play Store

- Cuenta Google Play Developer.
- Internal testing track para builds de preview.
- Closed beta antes de producción.
- Open beta opcional.

### 10.3 Métricas para approval

- Cumplir con guidelines de privacidad (data safety form).
- Nunca pedir permiso de ubicación en background sin justificación clara.
- Cumplir con el rating PEGI / ESRB sin polémicas.

---

## 11. Dominio y branding online

- Dominio: `motociudad.app` (verificar disponibilidad y registrar).
- Web pública: landing simple con info, política de privacidad, términos, soporte. Hostable en Cloudflare Pages — gratis.
- Email de soporte: `hola@motociudad.app`.

---

## 12. Operación del día a día

### 12.1 Rutina semanal recomendada

1. **Lunes**: revisar Sentry (errores nuevos), PostHog (KPIs), Supabase Logs (queries lentas).
2. **Miércoles**: revisar feedback en stores, responder reseñas.
3. **Viernes**: si hay PRs en cola, mergear y desplegar a preview para QA del fin de semana.

### 12.2 Soporte a usuarios

MVP: email de contacto con SLA de 72h. No se construye sistema de tickets — overkill al inicio.

---

## 13. Checklist pre-launch

Antes del primer release público:

- [ ] Migraciones aplicadas a producción y verificadas.
- [ ] Datos seed mínimos cargados (~50 parkings reales en Madrid + Barcelona).
- [ ] Crash-free > 99% en builds de preview durante 14 días.
- [ ] E2E flows pasando consistentemente.
- [ ] Política de privacidad publicada y enlazada.
- [ ] Política de eliminación de cuenta funcional.
- [ ] App Store y Play Store: fichas completas, screenshots, descripción.
- [ ] Sentry y PostHog conectados y reportando.
- [ ] Backups automáticos verificados (probar un restore en preview).
- [ ] Documentación al día (PRDs reflejan el estado real).
- [ ] Plan de soporte para los primeros 30 días (quién responde emails).

---

## 14. Decisiones cerradas

- ✅ Supabase Cloud región Frankfurt.
- ✅ EAS para builds y distribución.
- ✅ GitHub Actions como CI.
- ✅ Sentry + PostHog para observabilidad.

## 15. Decisiones pendientes

- ⏳ Confirmar dominio definitivo (depende de naming final).
- ⏳ Cuenta de empresa en Apple/Google (¿personal o LLC?).
- ⏳ Decisión sobre staging dedicado: revisitar al pasar de 5k MAU.
- ⏳ Política de retención de logs (PostHog y Sentry tienen retenciones diferentes).

---

## 16. Documentos relacionados

- `prd.md`, `arquitectura.md`, `testing.md`, `CLAUDE.md`.
