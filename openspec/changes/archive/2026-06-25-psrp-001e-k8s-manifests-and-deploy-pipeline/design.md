## Context

K8s manifests and the deploy pipeline do not exist. The architecture docs define a full Kubernetes deployment with StatefulSets for PostgreSQL, Dragonfly, and MinIO, plus Deployments for the API, frontend, and 3 workers. Kustomize overlays manage local (Rancher Desktop) vs production configurations. This is the final phase of PSRP-001 decomposition.

## Goals / Non-Goals

**Goals:**
- Create K8s base manifests for all services (API, frontend, 3 workers, PostgreSQL, Dragonfly, MinIO)
- Create Kustomize overlays for local (Rancher Desktop) and production
- Validate manifests with `kustomize build --validate`
- Create deploy workflow for GitHub Actions
- Verify full stack deploys to local Rancher Desktop cluster
- Document local development pattern: data tier in K8s, API/frontend running locally with hot reload

**Non-Goals:**
- No ingress/TLS configuration (works without it locally via port-forward or localhost)
- No HPA, PDB, NetworkPolicy (post-MVP)
- No sealed-secrets or external-secrets-operator (use plain K8s Secrets for local, document production strategy)
- No cert-manager configuration
- No Cloudflare CDN integration

## Decisions

### 1. Kustomize base + overlay structure
Base contains generic manifests with placeholder values. Overlays patch resources (replicas, CPU/memory, image tags) per environment. This follows the `loom-kustomize` skill's multi-service structure pattern.

### 2. StatefulSets for data tier only
PostgreSQL, Dragonfly, and MinIO use StatefulSets with PVCs for persistent storage. API, frontend, and workers use Deployments (stateless). This matches the architecture docs.

### 3. Local overlay: minimal resources
Rancher Desktop has limited resources. Local overlay uses: 1 replica for all services, reduced CPU/memory requests (250m CPU / 128Mi memory for API), and `imagePullPolicy: Never` for locally-built images.

### 4. Production overlay: HA-ready
Production overlay uses: 2+ API replicas, full resource requests/limits, readiness/liveness probes, and proper image tags from GHCR.

### 5. Secrets as plain K8s Secret manifests (for now)
For local development, secrets (DB password, JWT key, MinIO credentials) are plain K8s Secret manifests with base64-encoded placeholder values. Production strategy (sealed-secrets, SOPS, or external-secrets) is documented but not implemented — deferred to a separate change.

### 6. No ingress in base
Ingress is added as a Kustomize component that can be selectively included in overlays. Local development doesn't need it (port-forward or localhost works). Production overlay includes the ingress component.

### 7. Kustomize v5 API only
All manifests use the current Kustomize v1 API (`apiVersion: kustomize.config.k8s.io/v1beta1`). No deprecated fields (`commonLabels`, `patchesStrategicMerge`, `patchesJson6902`, `vars`). Uses `labels` transformer with `includeSelectors: false`, unified `patches` field, and `replacements` for dynamic references.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| StatefulSets with PVCs on Rancher Desktop can fail | Test locally before committing; use `hostPath` storage class for local |
| Dragonfly image may not be available on Docker Hub | Use `docker.dragonflydb.io/dragonflydb/dragonfly` registry; verify CI access |
| 3 StatefulSets + 5 Deployments may overwhelm local machine | Local overlay uses minimal resources; can disable workers locally |
| Plain K8s Secrets in git are a security risk | Placeholder values only; production uses sealed-secrets (separate change) |
| Kustomize version mismatch between dev and CI | Pin kustomize version in CI; document required version in readme |
