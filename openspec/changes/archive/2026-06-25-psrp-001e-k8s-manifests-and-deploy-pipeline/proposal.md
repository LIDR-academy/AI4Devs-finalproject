## Why

PSRP-001 bundles K8s manifests and CI/CD deployment alongside all other scaffolding concerns. This change isolates infrastructure-as-code so it can be validated independently. K8s manifests require Docker images (PSRP-001D) to exist first — this change runs after containerization is complete and validates that the full stack deploys to a local Rancher Desktop (k3s) cluster.

## What Changes

- Creates K8s base manifests: namespace, API deployment + service, frontend deployment + service, PostgreSQL StatefulSet + service + PVC, Dragonfly StatefulSet + service + PVC, MinIO StatefulSet + service + PVC
- Creates Kustomize overlays: local (Rancher Desktop — reduced resources, 1 replica, local image tags) and production (full resources, multiple replicas)
- Creates deploy workflow: manual trigger or main push, kubectl apply to cluster
- CI pipeline adds `kustomize build --validate` step
- Validates end-to-end: `kubectl apply -k k8s/overlays/local` brings up full stack locally
- Does NOT include: ingress/TLS (can work without it locally), HPA, PDB, NetworkPolicy, secrets management (use plain K8s Secrets for local, document production strategy)

## Capabilities

### New Capabilities
- `k8s-manifests`: Kubernetes base manifests for all Aura Planning services (API, frontend, 3 workers, PostgreSQL, Dragonfly, MinIO) using Deployments and StatefulSets.
- `kustomize-overlays`: Environment-specific Kustomize overlays for local (Rancher Desktop) and production with resource patches, replica scaling, and image tag management.
- `deploy-pipeline`: GitHub Actions workflow for deploying to Kubernetes via kubectl apply, triggered manually or on main branch push.
- `local-development`: Rancher Desktop (k3s) local development setup with data tier (PostgreSQL, Dragonfly, MinIO) in K8s and API/frontend running locally with hot reload.

### Modified Capabilities
- `ci-pipeline`: Adds kustomize build validation step to the CI workflow.

## Impact

- **New directory**: `k8s/` with base manifests, overlays (local + production)
- **CI**: Adds kustomize validation and optional deploy steps to GitHub Actions
- **Dependencies**: Completes PSRP-001 decomposition. All 22 downstream tickets now have a working foundation.
- **No breaking changes**: Purely additive
