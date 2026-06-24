## ADDED Requirements

### Requirement: Deploy workflow triggers manually or on main push
The deploy workflow (`.github/workflows/deploy.yml`) SHALL trigger on manual dispatch (`workflow_dispatch`) and optionally on push to `main` branch.

#### Scenario: Manual trigger works
- **WHEN** the workflow is triggered via GitHub Actions UI
- **THEN** it executes the deploy job

#### Scenario: Push to main triggers deploy
- **WHEN** a commit is pushed to `main`
- **THEN** the deploy workflow executes

### Requirement: Deploy workflow applies K8s manifests to cluster
The deploy workflow SHALL use `kubectl apply -k k8s/overlays/<environment>` to deploy to the target Kubernetes cluster.

#### Scenario: Deploy applies local overlay
- **WHEN** the deploy workflow runs with environment=local
- **THEN** it executes `kubectl apply -k k8s/overlays/local/`

#### Scenario: Deploy applies production overlay
- **WHEN** the deploy workflow runs with environment=production
- **THEN** it executes `kubectl apply -k k8s/overlays/production/`

### Requirement: Deploy workflow requires kubeconfig secret
The deploy workflow SHALL read the Kubernetes configuration from a GitHub secret named `KUBE_CONFIG`.

#### Scenario: Deploy uses KUBE_CONFIG secret
- **WHEN** the deploy workflow is inspected
- **THEN** it writes `${{ secrets.KUBE_CONFIG }}` to a kubeconfig file and sets KUBECONFIG env var
