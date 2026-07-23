## 1. Domain and Interface Setup

- [x] 1.1 Add `IDataRetentionService` interface to `Aura.Core.Interfaces.Services` to define the deletion method logic.
- [x] 1.2 Implement `DataRetentionService` inside `Aura.Core.Services` containing the atomic deletion logic using `ExecuteDeleteAsync()` inside a database transaction.
- [x] 1.3 Update `DependencyInjection.cs` in `Aura.Core` (or `Aura.Infrastructure`) to register the `IDataRetentionService`.

## 2. Background Worker Setup

- [x] 2.1 Scaffold a new worker project `Aura.Workers.DataRetention`.
- [x] 2.2 Create the `DataRetentionWorker` class that loops over events scheduled for deletion.
- [x] 2.3 Implement querying for `DataRetentionJobs` where `ScheduledDeleteAt <= NOW` and `Status = 'scheduled'` in the worker loop.
- [x] 2.4 Add exception handling inside the worker to log errors and set the job `Status = 'failed'`, and retry logic (retry if failures < 3).

## 3. Infrastructure & Deployment

- [x] 3.1 Create `Dockerfile` for the `Aura.Workers.DataRetention` project.
- [x] 3.2 Add the new worker to the docker compose configuration (if used locally for full suite).
- [x] 3.3 Create a Kubernetes CronJob manifest (`k8s/base/workers/data-retention-cronjob.yaml`) with schedule `0 2 * * *` and `concurrencyPolicy: Forbid`.
- [x] 3.4 Update `k8s/base/kustomization.yaml` to include the new data-retention CronJob.
