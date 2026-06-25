## ADDED Requirements

### Requirement: Local overlay configures minimal resources for Rancher Desktop
The `k8s/overlays/local/` overlay SHALL reduce resource requests/limits, set 1 replica for all services, and use `imagePullPolicy: Never` for locally-built images.

#### Scenario: Local overlay builds with kustomize
- **WHEN** `kustomize build k8s/overlays/local/` is executed
- **THEN** valid YAML is output with patched resources

#### Scenario: Local overlay sets 1 replica
- **WHEN** local overlay output is inspected
- **THEN** all Deployments and StatefulSets have `replicas: 1`

#### Scenario: Local overlay reduces API resources
- **WHEN** local overlay output for aura-api Deployment is inspected
- **THEN** CPU request is 250m and memory request is 128Mi

#### Scenario: Local overlay uses imagePullPolicy Never
- **WHEN** local overlay output is inspected
- **THEN** all containers have `imagePullPolicy: Never`

### Requirement: Production overlay configures HA-ready resources
The `k8s/overlays/production/` overlay SHALL set 2+ API replicas, full resource requests/limits, and proper image tags from GHCR.

#### Scenario: Production overlay builds with kustomize
- **WHEN** `kustomize build k8s/overlays/production/` is executed
- **THEN** valid YAML is output with patched resources

#### Scenario: Production overlay sets 2+ API replicas
- **WHEN** production overlay output for aura-api Deployment is inspected
- **THEN** it has `replicas: 2` or more

#### Scenario: Production overlay sets full resources
- **WHEN** production overlay output for aura-api Deployment is inspected
- **THEN** CPU request is 500m and memory request is 256Mi

### Requirement: Overlays reference base correctly
Both overlays SHALL reference `../../base` as their base kustomization.

#### Scenario: Local overlay references base
- **WHEN** k8s/overlays/local/kustomization.yaml is inspected
- **THEN** it has `resources: [../../base]`

#### Scenario: Production overlay references base
- **WHEN** k8s/overlays/production/kustomization.yaml is inspected
- **THEN** it has `resources: [../../base]`
