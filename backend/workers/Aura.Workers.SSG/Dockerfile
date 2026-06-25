FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY backend/AuraPlanning.sln backend/
COPY backend/src/Aura.Api/Aura.Api.csproj backend/src/Aura.Api/
COPY backend/src/Aura.Core/Aura.Core.csproj backend/src/Aura.Core/
COPY backend/src/Aura.Infrastructure/Aura.Infrastructure.csproj backend/src/Aura.Infrastructure/
COPY backend/tests/Aura.Core.Tests/Aura.Core.Tests.csproj backend/tests/Aura.Core.Tests/
COPY backend/workers/Aura.Workers.Email/Aura.Workers.Email.csproj backend/workers/Aura.Workers.Email/
COPY backend/workers/Aura.Workers.WhatsApp/Aura.Workers.WhatsApp.csproj backend/workers/Aura.Workers.WhatsApp/
COPY backend/workers/Aura.Workers.SSG/Aura.Workers.SSG.csproj backend/workers/Aura.Workers.SSG/

RUN dotnet restore backend/AuraPlanning.sln

COPY backend/ backend/
WORKDIR /app/backend/workers/Aura.Workers.SSG
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Aura.Workers.SSG.dll"]
