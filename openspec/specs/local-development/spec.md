## ADDED Requirements

### Requirement: Data tier runs in K8s, API and frontend run locally with hot reload
The local development pattern SHALL run PostgreSQL, Dragonfly, and MinIO as StatefulSets in Rancher Desktop (k3s), while the .NET API runs via `dotnet run` and Angular runs via `ng serve` on the host machine.

#### Scenario: Data tier deploys to local K8s
- **WHEN** `kubectl apply -k k8s/overlays/local/` is executed on Rancher Desktop
- **THEN** PostgreSQL, Dragonfly, and MinIO pods reach Ready state

#### Scenario: API connects to K8s-hosted PostgreSQL
- **WHEN** `dotnet run --project backend/src/Aura.Api` is executed with development settings
- **THEN** it connects to PostgreSQL at `localhost:5432` (port-forwarded from K8s)

#### Scenario: Angular connects to local API
- **WHEN** `ng serve` is executed in the frontend directory
- **THEN** it connects to the API at `http://localhost:5000/api`

### Requirement: Port-forwarding documented for local data tier access
The local development setup SHALL support `kubectl port-forward` to expose K8s services on localhost ports.

#### Scenario: PostgreSQL is accessible via port-forward
- **WHEN** `kubectl port-forward svc/postgres 5432:5432` is executed
- **THEN** PostgreSQL is accessible at `localhost:5432`

#### Scenario: Dragonfly is accessible via port-forward
- **WHEN** `kubectl port-forward svc/dragonfly 6379:6379` is executed
- **THEN** Dragonfly is accessible at `localhost:6379`

#### Scenario: MinIO is accessible via port-forward
- **WHEN** `kubectl port-forward svc/minio 9000:9000` is executed
- **THEN** MinIO console is accessible at `localhost:9000`
