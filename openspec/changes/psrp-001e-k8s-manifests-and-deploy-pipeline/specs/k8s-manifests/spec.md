## ADDED Requirements

### Requirement: K8s base manifests for all services
The `k8s/base/` directory SHALL contain Kubernetes manifests for all Aura Planning services: API Deployment + Service, frontend Deployment + Service, 3 worker Deployments, PostgreSQL StatefulSet + Service + PVC, Dragonfly StatefulSet + Service + PVC, MinIO StatefulSet + Service + PVC, and namespace.

#### Scenario: Base manifests build with kustomize
- **WHEN** `kustomize build k8s/base/` is executed
- **THEN** valid YAML is output for all resources

#### Scenario: Base includes namespace
- **WHEN** kustomize build output is inspected
- **THEN** it includes a Namespace resource named `aura`

#### Scenario: Base includes PostgreSQL StatefulSet
- **WHEN** kustomize build output is inspected
- **THEN** it includes a StatefulSet for PostgreSQL with a PVC

#### Scenario: Base includes Dragonfly StatefulSet
- **WHEN** kustomize build output is inspected
- **THEN** it includes a StatefulSet for Dragonfly with a PVC

#### Scenario: Base includes MinIO StatefulSet
- **WHEN** kustomize build output is inspected
- **THEN** it includes a StatefulSet for MinIO with a PVC

### Requirement: All manifests use current Kustomize v1 API
All kustomization.yaml files SHALL use `apiVersion: kustomize.config.k8s.io/v1beta1`. No deprecated fields (commonLabels, patchesStrategicMerge, patchesJson6902, vars) SHALL be used.

#### Scenario: Base kustomization uses v1beta1 API
- **WHEN** k8s/base/kustomization.yaml is inspected
- **THEN** it has `apiVersion: kustomize.config.k8s.io/v1beta1`

#### Scenario: No deprecated fields in any kustomization
- **WHEN** all kustomization.yaml files are searched
- **THEN** none contain: commonLabels, patchesStrategicMerge, patchesJson6902, or vars

### Requirement: Labels transformer used instead of commonLabels
All kustomization files SHALL use the `labels` transformer with `includeSelectors: false` instead of the deprecated `commonLabels`.

#### Scenario: Labels transformer is configured correctly
- **WHEN** k8s/base/kustomization.yaml is inspected
- **THEN** it uses `labels` with `includeSelectors: false` and `includeTemplates: true`
