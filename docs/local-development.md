# Local Development

## Prerequisites

- .NET SDK 10.
- Node.js 22.
- Docker Desktop.
- PowerShell.

## Option 1: Full Docker Stack

Copy the local Docker environment file:

```powershell
Copy-Item deploy/docker/.env.example deploy/docker/.env
```

Start frontend, API, and SQL Server:

```powershell
docker compose --env-file deploy/docker/.env -f deploy/docker/docker-compose.yml up -d --build
```

Open:

```text
http://localhost:8080
```

Local API URL:

```text
http://localhost:5298/api
```

Health check:

```powershell
Invoke-RestMethod http://localhost:5298/api/health
```

Stop the stack:

```powershell
docker compose --env-file deploy/docker/.env -f deploy/docker/docker-compose.yml down
```

## Option 2: Development Servers

Use this mode when editing backend/frontend code directly.

### 1. Start SQL Server

```powershell
.\deploy\docker\start-local-sqlserver.ps1
```

This starts SQL Server on:

```text
localhost:1433
```

It also applies EF Core migrations and seed data.

### 2. Configure Backend Connection

For the current PowerShell session:

```powershell
$env:ConnectionStrings__TejaFlowDb="Server=localhost,1433;Database=TejaFlow;User Id=sa;Password=Change_This_Local_Password_123!;TrustServerCertificate=True;Encrypt=True"
```

Use the same password configured in `deploy/docker/.env`.

### 3. Run Backend

```powershell
dotnet run --project backend/TejaFlow.WebApi/TejaFlow.WebApi.csproj --launch-profile http
```

Backend URL:

```text
http://localhost:5298
```

OpenAPI document in development:

```text
http://localhost:5298/openapi/v1.json
```

### 4. Configure Frontend

```powershell
Copy-Item frontend/.env.example frontend/.env
```

The frontend will use:

```text
VITE_API_BASE_URL=http://localhost:5298/api
```

### 5. Run Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Seed Users

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@tejaflow.test` | `Admin123!` |
| Vendedor | `ventas@tejaflow.test` | `Ventas123!` |
| Almacenista | `almacen@tejaflow.test` | `Almacen123!` |

## Useful Checks

Run backend tests:

```powershell
dotnet test backend/TejaFlow.slnx
```

Run frontend production build:

```powershell
cd frontend
npm run build
```

Validate Docker Compose:

```powershell
docker compose --env-file deploy/docker/.env.example -f deploy/docker/docker-compose.yml config
```
