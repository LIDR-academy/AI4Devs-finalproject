## PSRP-001E: chore(infra): k8s-manifests-and-deploy-pipeline

**Type:** chore
**Priority:** P0 (Must)
**Estimated Effort:** M (1.5d)
**Sprint Week:** W1
**Dependencies:** PSRP-001A, PSRP-001D

## Resumen de Funcionalidad

Crear manifiestos base de Kubernetes para todos los servicios (API, frontend, 3 workers, PostgreSQL, Dragonfly, MinIO), overlays Kustomize para local (Rancher Desktop) y producción, y el workflow de deploy de GitHub Actions. Esta es la fase final de PSRP-001 — completa la foundation para los 22 tickets siguientes.

## Requisitos

- [ ] Crear `k8s/base/` con manifiestos: namespace, API deployment + service, frontend deployment + service, 3 worker deployments, PostgreSQL StatefulSet + service + PVC, Dragonfly StatefulSet + service + PVC, MinIO StatefulSet + service + PVC
- [ ] Crear `k8s/overlays/local/` con patches: recursos reducidos (250m CPU / 128Mi memory), 1 replica, imagePullPolicy: Never
- [ ] Crear `k8s/overlays/production/` con patches: recursos completos (500m CPU / 256Mi memory), 2+ replicas API
- [ ] Todos los kustomization.yaml usan API v1beta1 — sin campos deprecated (commonLabels, patchesStrategicMerge, vars)
- [ ] Usar `labels` transformer con `includeSelectors: false` en lugar de `commonLabels`
- [ ] Crear `.github/workflows/deploy.yml` con trigger manual (workflow_dispatch) y push a main
- [ ] Añadir job `kustomize-validate` al CI: setup kustomize, validar ambos overlays
- [ ] Verificar local: `kubectl apply -k k8s/overlays/local/` en Rancher Desktop — pods de PostgreSQL, Dragonfly, MinIO alcanzan estado Ready

## Notas Técnicas

- **K8s:** Rancher Desktop (k3s) para local. StatefulSets para data tier (PostgreSQL, Dragonfly, MinIO), Deployments para stateless (API, frontend, workers).
- **Kustomize:** v5 API only. Base genérico, overlays patchean recursos. Sin templates — declarativo.
- **Secrets:** K8s Secret manifests con valores placeholder base64 para local. Estrategia de producción (sealed-secrets/SOPS) documentada pero no implementada.
- **Sin ingress/TLS:** Funciona sin ingress localmente (port-forward). Ingress como Kustomize component opcional.
- **Local dev pattern:** Data tier en K8s, API con `dotnet run`, frontend con `ng serve` — hot reload sin reiniciar pods.

## Criterios de Aceptación

- [ ] AC1: Dado los manifiestos base, cuando se ejecuta `kustomize build k8s/base/`, entonces se produce YAML válido para todos los recursos
- [ ] AC2: Dado el overlay local, cuando se ejecuta `kustomize build k8s/overlays/local/`, entonces los recursos tienen patches aplicados (1 replica, recursos reducidos)
- [ ] AC3: Dado el overlay production, cuando se ejecuta `kustomize build k8s/overlays/production/`, entonces los recursos tienen patches de producción (2+ replicas, recursos completos)
- [ ] AC4: Dado un push a main, cuando el CI corre, entonces el job `kustomize-validate` completa con éxito
- [ ] AC5: Dado un cluster Rancher Desktop corriendo, cuando se ejecuta `kubectl apply -k k8s/overlays/local/`, entonces PostgreSQL, Dragonfly, y MinIO pods alcanzan estado Ready

## Elementos Relacionados

- **Architecture:** 04-infrastructure-deployment.md (K8s manifests, Kustomize overlays)
- **Skills:** loom-kustomize

## Bloqueadores

Bloqueado por: PSRP-001D

## Branch Name

`feature/PSRP-001E-k8s-manifests`
