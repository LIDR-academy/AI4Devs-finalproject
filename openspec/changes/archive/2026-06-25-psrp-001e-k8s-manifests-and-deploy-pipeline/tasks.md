## 1. K8s Base Manifests

- [x] 1.1 Create `k8s/base/kustomization.yaml` with v1beta1 API, labels transformer, namespace: aura
- [x] 1.2 Create `k8s/base/namespace.yaml`
- [x] 1.3 Create `k8s/base/api/deployment.yaml` (Aura.Api, port 8080, health probes) and `service.yaml` (ClusterIP)
- [x] 1.4 Create `k8s/base/frontend/deployment.yaml` (nginx, port 80) and `service.yaml` (ClusterIP)
- [x] 1.5 Create `k8s/base/workers/email-deployment.yaml`, `whatsapp-deployment.yaml`, `ssg-deployment.yaml`
- [x] 1.6 Create `k8s/base/database/postgres-statefulset.yaml` (PostgreSQL 16, port 5432), `service.yaml`, `pvc.yaml`
- [x] 1.7 Create `k8s/base/dragonfly/statefulset.yaml`, `service.yaml` (port 6379), `pvc.yaml`
- [x] 1.8 Create `k8s/base/minio/statefulset.yaml`, `service.yaml` (port 9000), `pvc.yaml`
- [x] 1.9 Create K8s Secret manifests for postgres credentials, minio credentials, JWT key (base64 placeholder values)
- [x] 1.10 Verify `kustomize build k8s/base/` produces valid YAML for all resources

## 2. Local Overlay (Rancher Desktop)

- [x] 2.1 Create `k8s/overlays/local/kustomization.yaml` referencing ../../base
- [x] 2.2 Create `k8s/overlays/local/patch-resources.yaml` (reduced CPU/memory: 250m/128Mi for API)
- [x] 2.3 Create `k8s/overlays/local/patch-replicas.yaml` (1 replica for all services)
- [x] 2.4 Create `k8s/overlays/local/patch-image-policy.yaml` (imagePullPolicy: Never)
- [x] 2.5 Verify `kustomize build k8s/overlays/local/` produces valid patched YAML

## 3. Production Overlay

- [x] 3.1 Create `k8s/overlays/production/kustomization.yaml` referencing ../../base
- [x] 3.2 Create `k8s/overlays/production/patch-resources.yaml` (full resources: 500m/256Mi for API)
- [x] 3.3 Create `k8s/overlays/production/patch-replicas.yaml` (2+ replicas for API)
- [x] 3.4 Verify `kustomize build k8s/overlays/production/` produces valid patched YAML

## 4. Deploy Workflow

- [x] 4.1 Create `.github/workflows/deploy.yml` with workflow_dispatch and push-to-main triggers
- [x] 4.2 Add kubectl apply step reading KUBE_CONFIG from GitHub secrets
- [x] 4.3 Add environment input (local vs production)

## 5. CI Pipeline Update

- [x] 5.1 Add `kustomize-validate` job to `.github/workflows/ci.yml`: setup kustomize, validate both overlays
- [ ] 5.2 Verify CI passes with all steps: dotnet + angular + docker + kustomize

## 6. Local Validation

- [x] 6.1 Deploy data tier to Rancher Desktop: `kubectl apply -k k8s/overlays/local/`
- [x] 6.2 Verify PostgreSQL, Dragonfly, MinIO pods reach Ready state
- [x] 6.3 Verify port-forward works for all 3 data services
