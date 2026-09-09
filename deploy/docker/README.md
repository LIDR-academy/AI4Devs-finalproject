# TejaFlow Docker

## Full Local Stack

This mode runs frontend, API, and SQL Server in containers.

1. Copy the example environment file:

```powershell
Copy-Item deploy/docker/.env.example deploy/docker/.env
```

2. Start frontend, API, and SQL Server:

```powershell
docker compose --env-file deploy/docker/.env -f deploy/docker/docker-compose.yml up -d --build
```

3. Open the app:

```text
http://localhost:8080
```

The API is also exposed for local testing at:

```text
http://localhost:5298
```

SQL Server is only available inside the Docker network in the full stack.

The API applies EF Core migrations on startup when:

```text
TEJAFLOW_RUN_MIGRATIONS=true
```

## SQL Server Only

Use this when running the API directly from `dotnet run` on Windows:

```powershell
.\deploy\docker\start-local-sqlserver.ps1
```

This starts SQL Server on `localhost:1433` and applies EF Core migrations.

The local backend session must use a SQL authentication connection string:

```powershell
$env:ConnectionStrings__TejaFlowDb="Server=localhost,1433;Database=TejaFlow;User Id=sa;Password=Change_This_Local_Password_123!;TrustServerCertificate=True;Encrypt=True"
```

Use the same password configured in `deploy/docker/.env`.
